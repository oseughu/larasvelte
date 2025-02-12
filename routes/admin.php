<?php

use App\Http\Controllers\Admin\Auth\AuthenticatedSessionController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'Admin/Home', [
    'canLogin' => true,
    'canRegister' => false,
    'laravelVersion' => Application::VERSION,
    'phpVersion' => PHP_VERSION,
])->name('admin.home');

Route::inertia('/dashboard', 'Admin/Dashboard')
    ->middleware(['auth', 'verified'])
    ->name('admin.dashboard');

Route::middleware('guest')->group(function () {
    Route::get('login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');

    Route::post('login', [AuthenticatedSessionController::class, 'store']);
});
