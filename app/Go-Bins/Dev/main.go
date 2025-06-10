package main

import (
    "encoding/json"
    "fmt"
    "io/ioutil"
    "log"
    "math/rand"
    "net/http"
    "os"
    "path/filepath"
    "strconv"
    "strings"
    "sync"
    "time"

    "github.com/joho/godotenv"
   _ "golang.org/x/net/context"
)

type PterodactylService struct {
    apiURL            string
    apiKey            string
    userUpdateInterval time.Duration
    httpClient        *http.Client
    
    // In-memory cache instead of Redis
    cache             map[string][]byte
    cacheMutex        sync.RWMutex
    cacheExpiry       map[string]time.Time
}

type UserResources struct {
    Memory       int `json:"memory"`
    Swap         int `json:"swap"`
    Disk         int `json:"disk"`
    IO           int `json:"io"`
    CPU          int `json:"cpu"`
    Databases    int `json:"databases"`
    Allocations  int `json:"allocations"`
    Backups      int `json:"backups"`
    Servers      int `json:"servers"`
}

func main() {
    // Initialize random seed
    rand.Seed(time.Now().UnixNano())
    
    // Find and load env file from project root
    loadEnvFile()

    // Create HTTP client with reasonable timeouts
    httpClient := &http.Client{
        Timeout: time.Second * 30,
        Transport: &http.Transport{
            MaxIdleConns:        100,
            MaxIdleConnsPerHost: 20,
            IdleConnTimeout:     90 * time.Second,
        },
    }

    // Parse update interval from env var
    updateInterval := 15 * time.Minute
    if intervalStr := os.Getenv("UPDATE_INTERVAL_MINUTES"); intervalStr != "" {
        if intervalMin, err := strconv.Atoi(intervalStr); err == nil && intervalMin > 0 {
            updateInterval = time.Duration(intervalMin) * time.Minute
        }
    }

    // Create service
    service := &PterodactylService{
        apiURL:   os.Getenv("PTERODACTYL_API_URL"),
        apiKey:   os.Getenv("PTERODACTYL_API_KEY"),
        userUpdateInterval: updateInterval,
        httpClient: httpClient,
        cache:     make(map[string][]byte),
        cacheExpiry: make(map[string]time.Time),
    }

    // Log configuration
    log.Printf("Service initialized with API URL: %s", service.apiURL)
    log.Printf("Update interval set to: %v", service.userUpdateInterval)
    
    // Start maintenance goroutine to clean expired cache entries
    go service.cacheMaintenance()

    // Run the resource update loop in a goroutine if USER_IDS is set
    if os.Getenv("USER_IDS") != "" {
        go service.startResourceUpdateLoop()
    } else {
        log.Printf("No USER_IDS defined, background updates disabled. Only on-demand updates will be processed.")
    }

    // Setup HTTP API
    http.HandleFunc("/update-user/", service.handleUpdateUser)
    http.HandleFunc("/get-resources/", service.handleGetResources)
    http.HandleFunc("/health", service.handleHealth)
    http.HandleFunc("/metrics", service.handleMetrics)
    
    // Start server
    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }
    log.Printf("Starting HTTP server on port %s", port)
    log.Fatal(http.ListenAndServe(":"+port, nil))
}

// Find and load the environment file by searching parent directories
func loadEnvFile() {
    // Try to load directly first
    err := godotenv.Load()
    if err == nil {
        log.Printf("Loaded environment file from current directory")
        return
    }

    // Try to find .env in parent directories
    dir, err := os.Getwd()
    if err != nil {
        log.Printf("Warning: Unable to get current directory: %v", err)
        return
    }

    for i := 0; i < 5; i++ { // Try up to 5 parent directories
        envPath := filepath.Join(dir, ".env")
        if _, err := os.Stat(envPath); err == nil {
            err = godotenv.Load(envPath)
            if err == nil {
                log.Printf("Loaded environment file from: %s", envPath)
                return
            }
        }
        // Move up one directory
        dir = filepath.Dir(dir)
    }

    log.Printf("Warning: Unable to find .env file in parent directories")
}

// Cache maintenance to clean up expired entries
func (s *PterodactylService) cacheMaintenance() {
    for {
        time.Sleep(5 * time.Minute)
        
        s.cacheMutex.Lock()
        now := time.Now()
        for key, expiry := range s.cacheExpiry {
            if now.After(expiry) {
                delete(s.cache, key)
                delete(s.cacheExpiry, key)
            }
        }
        s.cacheMutex.Unlock()
        
        log.Printf("Cache maintenance complete, entries remaining: %d", len(s.cache))
    }
}

// Set a value in the cache with expiration
func (s *PterodactylService) setCacheValue(key string, value []byte, expiration time.Duration) {
    s.cacheMutex.Lock()
    defer s.cacheMutex.Unlock()
    
    s.cache[key] = value
    s.cacheExpiry[key] = time.Now().Add(expiration)
}

// Get a value from the cache
func (s *PterodactylService) getCacheValue(key string) ([]byte, bool) {
    s.cacheMutex.RLock()
    defer s.cacheMutex.RUnlock()
    
    value, exists := s.cache[key]
    if !exists {
        return nil, false
    }
    
    // Check if expired
    expiry, _ := s.cacheExpiry[key]
    if time.Now().After(expiry) {
        return nil, false
    }
    
    return value, true
}

// Health check endpoint
func (s *PterodactylService) handleHealth(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    w.Write([]byte(`{"status":"ok"}`))
}

// Metrics endpoint
func (s *PterodactylService) handleMetrics(w http.ResponseWriter, r *http.Request) {
    s.cacheMutex.RLock()
    cacheCount := len(s.cache)
    s.cacheMutex.RUnlock()
    
    w.Header().Set("Content-Type", "application/json")
    response := map[string]interface{}{
        "cache_entries": cacheCount,
        "uptime": time.Since(startTime).String(),
    }
    
    jsonData, _ := json.Marshal(response)
    w.Write(jsonData)
}

var startTime = time.Now()

func (s *PterodactylService) startResourceUpdateLoop() {
    log.Println("Starting resource update loop")
    
    // Get list of users from environment
    users, err := s.getUsers()
    if err != nil {
        log.Printf("Error getting users: %v", err)
        return
    }
    
    log.Printf("Found %d users to process", len(users))
    
    // Process each user in separate goroutines
    for _, user := range users {
        go func(userId int) {
            // Add initial jitter to prevent all users updating at the same time
            jitter := time.Duration(rand.Intn(60)) * time.Second
            time.Sleep(jitter)
            
            for {
                s.updateUserResources(userId, false) // false = don't include demo servers
                time.Sleep(s.userUpdateInterval)
            }
        }(user.ID)
    }
}

func (s *PterodactylService) updateUserResources(userId int, includeDemos bool) {
    log.Printf("Updating resources for user %d (includeDemos: %v)", userId, includeDemos)
    
    // Get all servers for user
    servers, err := s.getUserServers(userId)
    if err != nil {
        log.Printf("Error fetching servers for user %d: %v", userId, err)
        return
    }
    
    log.Printf("Found %d servers for user %d", len(servers), userId)

    // Calculate resource usage
    resources := s.calculateResources(servers, includeDemos)
    
    // Store in cache with 24hr expiry
    cacheKey := fmt.Sprintf("user_resources_%d", userId)
    
    // Marshal to JSON
    resourceData, _ := json.Marshal(map[string]interface{}{
        "totalResources": resources,
        "serverCount":    resources.Servers,
        "updatedAt":      time.Now().Unix(),
    })
    
    // Store in in-memory cache
    s.setCacheValue(cacheKey, resourceData, 24*time.Hour)
    
    log.Printf("Updated resources in cache for user %d: %+v", userId, resources)
}

// Get resource handler - used by Laravel to fetch resources
func (s *PterodactylService) handleGetResources(w http.ResponseWriter, r *http.Request) {
    parts := strings.Split(r.URL.Path, "/")
    if len(parts) < 3 {
        http.Error(w, "Invalid user ID", http.StatusBadRequest)
        return
    }
    
    userId, err := strconv.Atoi(parts[2])
    if err != nil {
        http.Error(w, "Invalid user ID", http.StatusBadRequest)
        return
    }
    
    // Try to get from cache first
    cacheKey := fmt.Sprintf("user_resources_%d", userId)
    data, found := s.getCacheValue(cacheKey)
    
    // If not in cache, generate it
    if !found {
        includeDemos := r.URL.Query().Get("demo") == "true"
        
        // Update resources synchronously
        s.updateUserResources(userId, includeDemos)
        
        // Get from cache again
        data, found = s.getCacheValue(cacheKey)
        if !found {
            http.Error(w, "Failed to generate resources", http.StatusInternalServerError)
            return
        }
    }
    
    w.Header().Set("Content-Type", "application/json")
    w.Write(data)
}

func (s *PterodactylService) calculateResources(servers []map[string]interface{}, includeDemos bool) UserResources {
    resources := UserResources{}
    demoServersSkipped := 0
    
    for _, server := range servers {
        attributes, ok := server["attributes"].(map[string]interface{})
        if !ok {
            log.Printf("Warning: Server missing attributes")
            continue
        }
        
        // Check if this is a demo server
        name, _ := attributes["name"].(string)
        description, _ := attributes["description"].(string)
        isDemo := strings.Contains(strings.ToLower(name), "demo") || 
                 strings.Contains(strings.ToLower(description), "demo")
        
        // Skip demo servers if includeDemos is false
        if isDemo && !includeDemos {
            demoServersSkipped++
            log.Printf("Skipping demo server: %s", name)
            continue
        }
        
        // Process limits
        if limits, ok := attributes["limits"].(map[string]interface{}); ok {
            resources.Memory += getIntValue(limits, "memory")
            resources.Swap += getIntValue(limits, "swap")
            resources.Disk += getIntValue(limits, "disk")
            resources.IO += getIntValue(limits, "io") 
            resources.CPU += getIntValue(limits, "cpu")
        } else {
            log.Printf("Warning: Server missing limits")
        }
        
        // Process feature limits
        if featureLimits, ok := attributes["feature_limits"].(map[string]interface{}); ok {
            resources.Databases += getIntValue(featureLimits, "databases")
            resources.Allocations += getIntValue(featureLimits, "allocations")
            resources.Backups += getIntValue(featureLimits, "backups")
        } else {
            log.Printf("Warning: Server missing feature_limits")
        }
    }
    
    // Only count non-demo servers unless includeDemos is true
    if !includeDemos {
        resources.Servers = len(servers) - demoServersSkipped
    } else {
        resources.Servers = len(servers)
    }
    
    log.Printf("Resource calculation complete: %+v (demos skipped: %d)", resources, demoServersSkipped)
    return resources
}

func getIntValue(data map[string]interface{}, key string) int {
    if val, ok := data[key]; ok {
        switch v := val.(type) {
        case float64:
            return int(v)
        case int:
            return v
        case string:
            if i, err := strconv.Atoi(v); err == nil {
                return i
            }
        }
    }
    return 0
}

// HTTP handler to manually trigger updates
func (s *PterodactylService) handleUpdateUser(w http.ResponseWriter, r *http.Request) {
    parts := strings.Split(r.URL.Path, "/")
    if len(parts) < 3 {
        http.Error(w, "Invalid user ID", http.StatusBadRequest)
        return
    }
    
    userId, err := strconv.Atoi(parts[2])
    if err != nil {
        http.Error(w, "Invalid user ID", http.StatusBadRequest)
        return
    }
    
    // Check if we should include demo servers
    includeDemos := r.URL.Query().Get("demo") == "true"
    
    // Process immediately if ?wait=true, otherwise process in background
    if r.URL.Query().Get("wait") == "true" {
        s.updateUserResources(userId, includeDemos)
        
        // Return the updated resources
        cacheKey := fmt.Sprintf("user_resources_%d", userId)
        data, found := s.getCacheValue(cacheKey)
        
        if !found {
            http.Error(w, "Error retrieving results", http.StatusInternalServerError)
            return
        }
        
        w.Header().Set("Content-Type", "application/json")
        w.Write(data)
    } else {
        // Process in background
        go s.updateUserResources(userId, includeDemos)
        fmt.Fprintf(w, "Update triggered for user %d (includeDemos: %v)", userId, includeDemos)
    }
}

// API calls to Pterodactyl
func (s *PterodactylService) getUserServers(userId int) ([]map[string]interface{}, error) {
    url := fmt.Sprintf("%s/api/application/users/%d?include=servers", s.apiURL, userId)
    
    req, err := http.NewRequest("GET", url, nil)
    if err != nil {
        return nil, fmt.Errorf("error creating request: %v", err)
    }
    
    req.Header.Set("Authorization", "Bearer "+s.apiKey)
    req.Header.Set("Accept", "application/json")
    req.Header.Set("Content-Type", "application/json")
    
    resp, err := s.httpClient.Do(req)
    if err != nil {
        return nil, fmt.Errorf("error making request: %v", err)
    }
    defer resp.Body.Close()
    
    if resp.StatusCode != 200 {
        body, _ := ioutil.ReadAll(resp.Body)
        return nil, fmt.Errorf("API returned non-200 status: %d - %s", resp.StatusCode, string(body))
    }
    
    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        return nil, fmt.Errorf("error reading response body: %v", err)
    }
    
    var result map[string]interface{}
    if err := json.Unmarshal(body, &result); err != nil {
        return nil, fmt.Errorf("error parsing JSON: %v", err)
    }
    
    // Extract servers from the response
    attributes, ok := result["attributes"].(map[string]interface{})
    if !ok {
        return nil, fmt.Errorf("missing attributes in response")
    }
    
    relationships, ok := attributes["relationships"].(map[string]interface{})
    if !ok {
        return nil, fmt.Errorf("missing relationships in response")
    }
    
    serversData, ok := relationships["servers"].(map[string]interface{})
    if !ok {
        return nil, fmt.Errorf("missing servers in response")
    }
    
    servers, ok := serversData["data"].([]interface{})
    if !ok {
        return nil, fmt.Errorf("servers data is not an array")
    }
    
    // Convert to the expected format
    serverResults := make([]map[string]interface{}, 0, len(servers))
    for _, server := range servers {
        serverMap, ok := server.(map[string]interface{})
        if !ok {
            continue
        }
        serverResults = append(serverResults, serverMap)
    }
    
    return serverResults, nil
}

func (s *PterodactylService) getUsers() ([]struct{ ID int }, error) {
    // Get user IDs from environment variable
    usersEnv := os.Getenv("USER_IDS")
    if usersEnv == "" {
        // Try to read from a file
        data, err := ioutil.ReadFile("users.txt")
        if err != nil {
            return nil, fmt.Errorf("no users defined and couldn't read users.txt: %v", err)
        }
        usersEnv = string(data)
    }
    
    // Parse comma-separated list of user IDs
    userIdStrs := strings.Split(usersEnv, ",")
    users := make([]struct{ ID int }, 0, len(userIdStrs))
    
    for _, idStr := range userIdStrs {
        idStr = strings.TrimSpace(idStr)
        if idStr == "" {
            continue
        }
        
        id, err := strconv.Atoi(idStr)
        if err != nil {
            log.Printf("Warning: Invalid user ID: %s", idStr)
            continue
        }
        
        users = append(users, struct{ ID int }{ID: id})
    }
    
    return users, nil
}