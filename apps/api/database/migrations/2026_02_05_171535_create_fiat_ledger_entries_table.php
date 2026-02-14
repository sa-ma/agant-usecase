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
        Schema::create('fiat_ledger_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_id')->constrained('mint_redeem_requests')->cascadeOnDelete();
            $table->string('direction');
            $table->decimal('amount_gbp', 20, 2);
            $table->string('ref');
            $table->timestamp('created_at')->useCurrent();
            $table->index(['direction']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fiat_ledger_entries');
    }
};
