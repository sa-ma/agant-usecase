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
        Schema::create('chain_events', function (Blueprint $table) {
            $table->id();
            $table->string('event_type');
            $table->string('tx_hash');
            $table->unsignedBigInteger('block_number')->nullable();
            $table->string('address')->nullable();
            $table->string('amount')->nullable();
            $table->json('raw_json')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['event_type', 'tx_hash']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chain_events');
    }
};
