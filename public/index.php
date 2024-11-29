<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
(require_once __DIR__.'/../bootstrap/app.php')
    ->handleRequest(Request::capture());


/*========================================================================================
 * Kernel.php is replaced with the Bootstrap app.php                                    |
 ========================================================================================
 *
 * The app.php file is the entry point for the Laravel application. It is responsible for loading the Laravel 
 * framework and handling the incoming HTTP requests.
 * All middleware and service providers are registered in the bootstrap/app.php file.
 * The app.php file is the first file that is loaded when the Laravel application is started.
*/

// Just handles the kernal


