<!DOCTYPE html>
<!-- Copyright, Nadhi.dev -->
<!-- If this instance is running on something shady, Please notify -->
<!-- Huge thanks to Shadow's dash for the inspiration -->
<!--Please note Nadhi.dev is not responsible for anything done via an instance as an instance is provided to an Coustmer, All coustmer details will be present below-->
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <!-- Laravel configuruing Head / etc  -->

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

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
