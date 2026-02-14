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
        Schema::create('reserve_snapshots', function (Blueprint $table) {
            $table->id();
            $table->decimal('cash_gbp', 20, 2);
            $table->decimal('gov_securities_gbp', 20, 2);
            $table->decimal('total_reserves_gbp', 20, 2);
            $table->decimal('circulating_supply_gbp', 20, 2);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reserve_snapshots');
    }
};
