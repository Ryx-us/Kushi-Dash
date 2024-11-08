<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\PterodactylController;

// Pterodactyl API registars

Route::post('/api/pterodactyl/create-user', [PterodactylController::class, 'createUser']);
Route::delete('/api/pterodactyl/delete-user/{id}', [PterodactylController::class, 'deleteUser']);


// Public routes
Route::get('/companies', [CompanyController::class, 'index']); // Get all companies
Route::get('/companies/{id}', [CompanyController::class, 'show']); // Get a specific company

// Protected routes (add middleware if needed for authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/companies', [CompanyController::class, 'store']); // Create a new company
    Route::put('/companies/{id}', [CompanyController::class, 'update']); // Update a company
    Route::delete('/companies/{id}', [CompanyController::class, 'destroy']); // Delete a company
});


