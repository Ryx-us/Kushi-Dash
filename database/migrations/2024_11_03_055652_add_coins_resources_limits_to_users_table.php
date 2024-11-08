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
            Schema::table('users', function (Blueprint $table) {
                $table->integer('coins')->default(0);
                $table->json('resources')->nullable();
                $table->json('limits')->nullable();
            });
        }

    /**
     * Reverse the migrations.
     */
    public function down()
        {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('coins');
                $table->dropColumn('resources');
                $table->dropColumn('limits');
            });
        }
};
