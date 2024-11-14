<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('locations', function (Blueprint $table) {
            // Convert columns to JSON type
            $table->json('requiredSubscriptions')->change();
            $table->json('platform_settings')->nullable()->change();
            $table->json('coinRenewal')->nullable()->change();
            
            // Ensure string type for platform
            $table->string('platform')->default('PTERODACTYL')->change();
        });
    }

    public function down()
    {
        Schema::table('locations', function (Blueprint $table) {
            $table->text('requiredSubscriptions')->change();
            $table->text('platform_settings')->nullable()->change();
            $table->string('coinRenewal')->nullable()->change();
            $table->integer('platform')->change();
        });
    }
};