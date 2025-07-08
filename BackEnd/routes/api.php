<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ClientAuthController;

Route::prefix('customer-portal')->group(function () {
    Route::post('register', [ClientAuthController::class, 'register']);
    Route::post('login', [ClientAuthController::class, 'login']);
    Route::post('logout', [ClientAuthController::class, 'logout'])->middleware('auth:sanctum');
});