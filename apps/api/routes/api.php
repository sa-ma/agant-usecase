<?php

use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\RequestController;
use App\Http\Controllers\ReservesController;
use App\Http\Controllers\TokenControlController;
use App\Http\Controllers\TransactionsController;
use App\Http\Controllers\WhitelistController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

Route::middleware('auth.token')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/customers', [CustomerController::class, 'index'])->middleware('role:admin,approver,viewer');
    Route::post('/customers', [CustomerController::class, 'store'])->middleware('role:admin,approver');
    Route::patch('/customers/{customer}/kyb', [CustomerController::class, 'updateKyb'])->middleware('role:admin,approver');

    Route::get('/customers/{customer}/addresses', [WhitelistController::class, 'index'])->middleware('role:admin,approver,viewer');
    Route::post('/customers/{customer}/addresses', [WhitelistController::class, 'store'])->middleware('role:admin,approver');
    Route::patch('/addresses/{address}/revoke', [WhitelistController::class, 'revoke'])->middleware('role:admin,approver');

    Route::get('/requests', [RequestController::class, 'index'])->middleware('role:admin,approver,viewer');
    Route::post('/requests', [RequestController::class, 'store'])->middleware('role:admin,approver');
    Route::post('/requests/{mintRedeemRequest}/approve', [RequestController::class, 'approve'])->middleware('role:admin,approver');
    Route::post('/requests/{mintRedeemRequest}/submit', [RequestController::class, 'submit'])->middleware('role:admin,approver');
    Route::post('/requests/{mintRedeemRequest}/settle', [RequestController::class, 'settle'])->middleware('role:admin');
    Route::post('/requests/{mintRedeemRequest}/fail', [RequestController::class, 'fail'])->middleware('role:admin');

    Route::post('/token/pause', [TokenControlController::class, 'pause'])->middleware('role:admin,approver');
    Route::post('/token/unpause', [TokenControlController::class, 'unpause'])->middleware('role:admin,approver');
    Route::post('/token/freeze', [TokenControlController::class, 'freeze'])->middleware('role:admin,approver');
    Route::post('/token/unfreeze', [TokenControlController::class, 'unfreeze'])->middleware('role:admin,approver');
    Route::get('/token/status', [TokenControlController::class, 'status'])->middleware('role:admin,approver,viewer');

    Route::get('/transactions', [TransactionsController::class, 'index'])->middleware('role:admin,approver,viewer');
    Route::get('/transactions/export.csv', [TransactionsController::class, 'export'])->middleware('role:admin,approver,viewer');

    Route::get('/audit-logs', [AuditLogController::class, 'index'])->middleware('role:admin,approver,viewer');
    Route::get('/audit-logs/export.csv', [AuditLogController::class, 'export'])->middleware('role:admin,approver,viewer');

    Route::get('/reserves/snapshot', [ReservesController::class, 'show'])->middleware('role:admin,approver,viewer');
});
