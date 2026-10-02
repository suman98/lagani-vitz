<?php

use Illuminate\Support\Facades\Route;
use NepseAlpha\LaganiVitz\Http\Controllers\Api\PlanController;

Route::get('plans', [PlanController::class, 'index'])->name('plans.index');
Route::get('plans/{slug}', [PlanController::class, 'show'])->name('plans.show');
