<?php

use Illuminate\Support\Facades\Route;
use NepseAlpha\LaganiViz\Http\Controllers\FrontendController;

// Catch-all for the Next.js static export. `api/...` is excluded so an unknown
// API path 404s instead of returning the HTML shell.
Route::get('/{path?}', FrontendController::class)
    ->where('path', '(?!api(?:/|$)).*')
    ->name('frontend');
