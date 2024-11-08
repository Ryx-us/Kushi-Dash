<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePterodactylEggsTable extends Migration
{
    public function up()
    {
        Schema::create('pterodactyl_eggs', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('EggID');
            $table->string('imageUrl')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('pterodactyl_eggs');
    }
}
