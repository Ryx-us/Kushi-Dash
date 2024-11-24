<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('egg_plan', function (Blueprint $table) {
        $table->id();
        $table->foreignId('egg_id')->constrained('pterodactyl_eggs')->onDelete('cascade');
        $table->foreignId('plan_id')->constrained('plans')->onDelete('cascade');
        $table->timestamps();

        $table->unique(['egg_id', 'plan_id']);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('egg_plan');
    }
};
