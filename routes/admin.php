<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Admin/Home', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/login', function () {
    return response()->json(['message' => 'Login page']);
})->name('admin.login');

Route::get('/register', function () {
    return response()->json(['message' => 'Register page']);
})->name('admin.register');
