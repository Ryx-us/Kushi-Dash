#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <curl/curl.h>
#include <jansson.h>

struct MemoryStruct {
    char *memory;
    size_t size;
};

static size_t WriteMemoryCallback(void *contents, size_t size, size_t nmemb, void *userp) {
    size_t realsize = size * nmemb;
    struct MemoryStruct *mem = (struct MemoryStruct *)userp;

    char *ptr = realloc(mem->memory, mem->size + realsize + 1);
    if (ptr == NULL) {
        printf("Not enough memory (realloc returned NULL)\n");
        return 0;
    }

    mem->memory = ptr;
    memcpy(&(mem->memory[mem->size]), contents, realsize);
    mem->size += realsize;
    mem->memory[mem->size] = 0;

    return realsize;
}

void get_servers(int user_id, const char *api_url, const char *api_key) {
    CURL *curl;
    CURLcode res;
    struct curl_slist *headers = NULL;
    struct MemoryStruct chunk;

    chunk.memory = malloc(1);
    chunk.size = 0;

    curl_global_init(CURL_GLOBAL_ALL);
    curl = curl_easy_init();

    if (curl) {
        headers = curl_slist_append(headers, "Accept: application/json");
        headers = curl_slist_append(headers, "Content-Type: application/json");

        // Construct the authorization header using the provided API key
        char auth_header[256];
        snprintf(auth_header, sizeof(auth_header), "Authorization: Bearer %s", api_key);
        headers = curl_slist_append(headers, auth_header);

        // Construct the full URL
        char full_url[1024];
        snprintf(full_url, sizeof(full_url), "%s/api/application/servers?per_page=1000000000000000000000000000000000000", api_url);

        curl_easy_setopt(curl, CURLOPT_URL, full_url);
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteMemoryCallback);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, (void *)&chunk);

        res = curl_easy_perform(curl);

        if (res != CURLE_OK) {
            fprintf(stderr, "curl_easy_perform() failed: %s\n", curl_easy_strerror(res));
        } else {
            json_t *root;
            json_error_t error;

            root = json_loads(chunk.memory, 0, &error);
            if (!root) {
                fprintf(stderr, "error: on line %d: %s\n", error.line, error.text);
            } else {
                json_t *data = json_object_get(root, "data");
                if (json_is_array(data)) {
                    json_t *result = json_object();
                    json_t *servers = json_object();
                    json_object_set_new(result, "servers", servers);

                    size_t index;
                    json_t *value;

                    json_array_foreach(data, index, value) {
                        json_t *attributes = json_object_get(value, "attributes");

                        // Check if user_id is specified; if it’s not (i.e., user_id <= 0), add all servers
                        if (user_id <= 0 || json_integer_value(json_object_get(attributes, "user")) == user_id) {
                            char key[20];
                            snprintf(key, 20, "%zu", index);
                            json_object_set(servers, key, value);
                        }
                    }

                    json_object_set_new(result, "execution_time_ms", json_real((double)clock() / CLOCKS_PER_SEC * 1000));
                    char *result_str = json_dumps(result, JSON_INDENT(2));
                    printf("%s\n", result_str);
                    free(result_str);
                    json_decref(result);
                }
                json_decref(root);
            }
        }

        curl_easy_cleanup(curl);
        curl_slist_free_all(headers);
        free(chunk.memory);
    }

    curl_global_cleanup();
}

int main(int argc, char *argv[]) {
    if (argc < 3 || argc > 4) {
        fprintf(stderr, "Usage: %s [user_id] <api_url> <api_key>\n", argv[0]);
        return 1;
    }

    int user_id = (argc == 4) ? atoi(argv[1]) : -1;  // If user_id is provided, convert it; otherwise, use -1
    const char *api_url = argv[argc - 2];
    const char *api_key = argv[argc - 1];

    get_servers(user_id, api_url, api_key);
    return 0;
}
