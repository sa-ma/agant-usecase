<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('mint_redeem_requests', function (Blueprint $table) {
            $table->id();
            $table->string('type');
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->string('address');
            $table->decimal('amount_gbp', 20, 2);
            $table->string('status')->default('created');
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->string('chain_tx_hash')->nullable();
            $table->string('fiat_ledger_ref')->nullable();
            $table->text('failure_reason')->nullable();
            $table->timestamps();

            $table->index(['type', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mint_redeem_requests');
    }
};
