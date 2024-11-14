
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('location');
            $table->integer('servers')->default(0);
            $table->string('flag');
            $table->integer('maxservers')->default(0);
            $table->string('latencyurl');
            $table->string('requiredRank');
            $table->boolean('maintenance')->default(false);
            $table->json('requiredSubscriptions');
            $table->json('coinRenewal')->nullable();
            $table->string('platform')->default('PTERODACTYL');
            $table->json('platform_settings')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('locations');
    }
};