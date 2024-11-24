<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>500 - Internal Server Error</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .pixel-text {
            font-family: 'Press Start 2P', cursive;
        }
        @keyframes glitch {
            0% {
                transform: translate(0)
            }
            20% {
                transform: translate(-5px, 5px)
            }
            40% {
                transform: translate(-5px, -5px)
            }
            60% {
                transform: translate(5px, 5px)
            }
            80% {
                transform: translate(5px, -5px)
            }
            to {
                transform: translate(0)
            }
        }
        .glitch {
            animation: glitch 1s linear infinite;
        }
    </style>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const isDark = localStorage.getItem('darkMode') === 'true' || 
                          window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (isDark) {
                document.documentElement.classList.add('dark');
            }
        });
    </script>
</head>
<body class="h-full">
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-black dark:to-black transition-colors duration-300">
        <div class="text-center px-4 space-y-12 max-w-2xl">
            <div class="flex items-center justify-center space-x-4">
                <div class="text-8xl pixel-text text-gray-800 dark:text-white glitch">5</div>
                <div class="relative">
                    <i data-lucide="alert-triangle" class="w-24 h-24 text-yellow-500 dark:text-yellow-400"></i>
                    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <span class="text-2xl"></span>
                    </div>
                </div>
                <div class="text-8xl pixel-text text-gray-800 dark:text-white animate-pulse">0</div>
            </div>

            <div class="space-y-6">
                <h1 class="text-3xl pixel-text text-gray-800 dark:text-gray-200">System Malfunction</h1>
                <p class="text-xl text-gray-600 dark:text-gray-300 pixel-text">😿 Well this is akward</p>
                <p class="text-lg text-gray-500 dark:text-gray-400">
                    Don&apos;t panic! Our team of expert technicians are working on it.
                </p>
                <a href="#" class="inline-block text-blue-500 dark:text-blue-400 hover:underline">
                    Contact Support
                </a>
            </div>

            <div class="flex items-center justify-center space-x-6">
                <a href="/dashboard" 
                   class="inline-flex items-center px-6 py-3 bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-400 dark:text-black dark:hover:bg-blue-300 transition-colors duration-200 rounded-full shadow-lg hover:shadow-xl">
                    <i data-lucide="arrow-left" class="w-5 h-5 mr-2"></i>
                    Return to Safety
                </a>
                
                <button onclick="toggleTheme()" 
                        class="p-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-200 rounded-full shadow-lg hover:shadow-xl">
                    <i data-lucide="sun" class="w-6 h-6 text-yellow-500 dark:hidden"></i>
                    <i data-lucide="moon" class="w-6 h-6 text-blue-300 hidden dark:block"></i>
                    <span class="sr-only">Toggle theme</span>
                </button>
            </div>
        </div>
    </div>

    <script>
        lucide.createIcons();

        function toggleTheme() {
            const isDark = document.documentElement.classList.toggle('dark');
            localStorage.setItem('darkMode', isDark);
        }
    </script>
</body>
</html>