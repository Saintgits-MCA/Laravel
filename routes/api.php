<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AuthController;


Route::get('/dashboard', [DashboardController::class, 'index']);

Route::apiResource('categories', CategoryController::class);

Route::apiResource('products', ProductController::class);

Route::apiResource('/users', UserController::class);

Route::post('/login', [AuthController::class, 'login']);

// Protect all these routes so only logged-in users can access them
Route::middleware('auth:sanctum')->group(function () {
Route::get('/user', function (Request $request) {
    return $request->user();
});
Route::post('/logout', [AuthController::class, 'logout']);
});