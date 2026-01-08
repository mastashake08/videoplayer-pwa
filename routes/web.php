<?php

use App\Http\Controllers\FavoriteController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('player', function () {
    return Inertia::render('Player');
})->middleware(['auth', 'verified'])->name('player');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('favorites', [FavoriteController::class, 'index'])->name('favorites.index');
    Route::post('favorites', [FavoriteController::class, 'store'])->name('favorites.store');
    Route::post('favorites/toggle', [FavoriteController::class, 'toggle'])->name('favorites.toggle');
    Route::post('favorites/check', [FavoriteController::class, 'check'])->name('favorites.check');
    Route::delete('favorites/{id}', [FavoriteController::class, 'destroy'])->name('favorites.destroy');
});

require __DIR__.'/settings.php';
