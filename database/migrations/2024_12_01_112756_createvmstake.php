<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('v_m_s', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->string('egg_id');
            $table->string('nest_id');
            $table->string('image_url')->nullable();
            $table->string('icon')->nullable();
            $table->json('minimum_requirements')->nullable();
            $table->boolean('is_enabled')->default(true);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('v_m_s');
    }
};