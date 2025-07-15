<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContractApiController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Health check endpoint
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'API is working',
        'timestamp' => now()->toISOString(),
        'version' => '1.0.0'
    ]);
});

// Authentication routes (if you have them)
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/user', [AuthController::class, 'user'])->middleware('auth:sanctum');
});

// Contract API routes for customer portal
Route::prefix('contracts')->group(function () {
    // Test endpoint
    Route::get('/test', [ContractApiController::class, 'test']);
    
    // Get contracts by client email
    Route::get('/by-email', [ContractApiController::class, 'getContractsByEmail']);
    
    // Get contract details by ID (with email verification)
    Route::get('/{id}/detail', [ContractApiController::class, 'getContractDetail']);
    
    // Get dashboard statistics
    Route::get('/dashboard-stats', [ContractApiController::class, 'getDashboardStats']);
});

// Optional: Add CORS middleware for API routes
Route::middleware(['api'])->group(function () {
    // Additional API routes can be added here
});

// Optional: Rate limiting for API
Route::middleware(['throttle:api'])->group(function () {
    // Rate-limited routes
});