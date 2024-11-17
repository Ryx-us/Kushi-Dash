<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - Page Not Found</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        @font-face {
            font-family: 'Press Start 2P';
            src: url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        }
        .pixel-text {
            font-family: 'Courier New', monospace;
            font-weight: bold;
        }
    </style>
    <script>
        // Check system preference and localStorage on load
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
    <div class="min-h-screen flex items-center justify-center bg-white dark:bg-black transition-colors duration-300">
        <div class="text-center px-4 space-y-8">
            <div class="flex items-center justify-center space-x-4">
                <div class="text-8xl pixel-text text-black dark:text-white">4</div>
                <div class="relative">
                    <i data-lucide="file-x" class="w-24 h-24 text-black dark:text-white"></i>
                    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <span class="text-2xl">×_×</span>
                    </div>
                </div>
                <div class="text-8xl pixel-text text-black dark:text-white">4</div>
            </div>

            <h1 class="text-2xl pixel-text text-black dark:text-white">page not found</h1>

            <div class="flex items-center justify-center space-x-4">
    <a href="javascript:history.back()" class="inline-flex items-center px-4 py-2 border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors duration-200 rounded-md">
        <i data-lucide="arrow-left" class="w-4 h-4 mr-2"></i>
        Go Back
    </a>
    
    <button onclick="toggleTheme()" class="p-2 border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors duration-200 rounded-md">
        <i data-lucide="sun" class="w-4 h-4 dark:hidden"></i>
        <i data-lucide="moon" class="w-4 h-4 hidden dark:block"></i>
        <span class="sr-only">Toggle theme</span>
    </button>
</div>
            </div>
        </div>
    </div>

    <script>
        // Initialize Lucide icons
        lucide.createIcons();

        // Theme toggle function
        function toggleTheme() {
            const isDark = document.documentElement.classList.toggle('dark');
            localStorage.setItem('darkMode', isDark);
        }
    </script>
</body>
</html>