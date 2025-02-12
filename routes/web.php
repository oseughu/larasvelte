<?php

use App\Http\Controllers\LinkController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::inertia('/', 'Home', [
    'canLogin' => true,
    'canRegister' => true,
    'laravelVersion' => Application::VERSION,
    'phpVersion' => PHP_VERSION,
])->name('home');

require __DIR__ . '/auth.php';

Route::inertia('/dashboard', 'Dashboard')->middleware(['auth', 'verified'])->name('dashboard');

Route::inertia('/about', 'About')->middleware(['auth', 'verified'])->name('about');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'index'])->name('profile.index');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.edit');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/links', [LinkController::class, 'index'])
        ->name('links.index');

    Route::post('/links', [LinkController::class, 'store'])
        ->name('links.store');

    Route::delete('/links/{link}', [LinkController::class, 'destroy'])
        ->name('links.destroy');
});
