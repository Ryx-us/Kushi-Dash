<!DOCTYPE html>
<!-- Copyright, Nadhi.dev -->
<!--
  _   _           _ _     _      _            
 | \ | |         | | |   (_)    | |           
 |  \| | __ _  __| | |__  _   __| | _____   __
 | . ` |/ _` |/ _` | '_ \| | / _` |/ _ \ \ / /
 | |\  | (_| | (_| | | | | || (_| |  __/\ V / 
 |_| \_|\__,_|\__,_|_| |_|_(_)__,_|\___| \_/  
-->
<!-- If this instance is running on something shady, Please notify -->
 
<!-- Huge thanks to Shadow's dash for the inspiration -->
<!--Please note Nadhi.dev is not responsible for anything done via an instance as an instance is provided to an Entity, All coustmer details will be present below-->
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <!-- Laravel configuruing Head / etc  -->

        <title inertia>{{ config('app.name', 'Laravel') }}</title>
        <link rel="icon" href="{{ config('app.company_logo_url') }}" type="image/svg+xml">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
        
        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Doto:wght@100..900&display=swap" rel="stylesheet">

        <!-- Kushi Data Script - Make all Inertia data available globally -->
        <script>
            window.KushiData = @json(\Inertia\Inertia::getShared());
            window.KushiData.timestamp = new Date().toISOString();
            
            // Easy access functions
            window.getAuth = () => window.KushiData.auth;
            window.getUser = () => window.KushiData.auth?.user;
            window.getShop = () => window.KushiData.shop;
            window.getResources = () => window.KushiData.totalResources;
            window.getDebug = () => window.KushiData.debug;
            window.getFlash = () => window.KushiData.flash;
            window.getVmsConfig = () => window.KushiData.vmsConfig;
            
            @if(app()->environment('local', 'staging'))
            // Console log for development
            console.group('🚀 Kushi Data Available');
            console.log('Full Data:', window.KushiData);
            console.log('Auth:', window.getAuth());
            console.log('User:', window.getUser());
            console.log('Resources:', window.getResources());
            console.log('Debug:', window.getDebug());
            console.groupEnd();
            @endif
        </script>

        <!-- API Helpers Script - Make CSRF token and API utilities available globally -->
        <script>
            // Initialize auth.api namespace
            window.auth = window.auth || {};
            // Api Data is sent to the frontend via a blade variable
            window.auth.api = {
                // CSRF token from meta tag
                csrfToken: "{{ csrf_token() }}",
                
                // Base URL for API requests
                baseUrl: "{{ url('/api') }}",
                
                // Headers to use for API requests
                getHeaders: function(includeJson = true) {
                    const headers = {
                        'X-CSRF-TOKEN': this.csrfToken,
                        'X-Requested-With': 'XMLHttpRequest'
                    };
                    
                    if (includeJson) {
                        headers['Content-Type'] = 'application/json';
                        headers['Accept'] = 'application/json';
                    }
                    
                    return headers;
                },
                
                // Helper for making fetch requests to the API
                fetch: async function(endpoint, options = {}) {
                    const url = endpoint.startsWith('/') 
                        ? `${this.baseUrl}${endpoint}`
                        : `${this.baseUrl}/${endpoint}`;
                        
                    const defaultOptions = {
                        headers: this.getHeaders(),
                        credentials: 'same-origin'
                    };
                    
                    const fetchOptions = { ...defaultOptions, ...options };
                    
                    if (fetchOptions.body && typeof fetchOptions.body === 'object' && !(fetchOptions.body instanceof FormData)) {
                        fetchOptions.body = JSON.stringify(fetchOptions.body);
                    }
                    
                    try {
                        const response = await fetch(url, fetchOptions);
                        const data = await response.json();
                        
                        if (!response.ok) {
                            throw { 
                                status: response.status,
                                data: data,
                                message: data.message || 'API request failed'
                            };
                        }
                        
                        return data;
                    } catch (error) {
                        console.error('API Request Error:', error);
                        throw error;
                    }
                },
                
                // Shorthand methods for common HTTP verbs
                get: function(endpoint, options = {}) {
                    return this.fetch(endpoint, { method: 'GET', ...options });
                },
                
                post: function(endpoint, data = {}, options = {}) {
                    return this.fetch(endpoint, { 
                        method: 'POST',
                        body: data,
                        ...options
                    });
                },
                
                put: function(endpoint, data = {}, options = {}) {
                    return this.fetch(endpoint, { 
                        method: 'PUT',
                        body: data,
                        ...options
                    });
                },
                
                delete: function(endpoint, options = {}) {
                    return this.fetch(endpoint, { method: 'DELETE', ...options });
                }
            };
            
            // Log API information in development
            @if(app()->environment('local', 'staging'))
            console.group('🔑 API Helpers Available');
            console.log('CSRF Token:', window.auth.api.csrfToken);
            console.log('API Base URL:', window.auth.api.baseUrl);
            console.log('Usage: window.auth.api.get/post/put/delete()');
            console.groupEnd();
            @endif
        </script>

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        <!-- Interia App with react render -->
        @inertia
    </body>
</html>