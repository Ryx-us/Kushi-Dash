<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->string('icon')->nullable();
            $table->string('image')->nullable();
            $table->json('resources')->nullable();
            $table->decimal('discount', 8, 2)->default(0);
            $table->boolean('visibility')->default(true);
            $table->string('redirect')->nullable();
            $table->integer('perCustomer')->default(1);
            $table->string('planType')->default('lifetime');
            $table->boolean('perPerson')->default(false);
            $table->integer('stock')->nullable();
            $table->json('kushiConfig')->nullable();
        });
    }

    public function down()
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn([
                'icon', 'image', 'resources', 'discount',
                'visibility', 'redirect', 'perCustomer',
                'planType', 'perPerson', 'stock', 'kushiConfig'
            ]);
        });
    }
};