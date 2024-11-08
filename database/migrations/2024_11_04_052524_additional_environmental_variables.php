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
           Schema::table('pterodactyl_eggs', function (Blueprint $table) {
               $table->json('additional_environmental_variables')->nullable()->after('icon');
           });
       }

    public function down()
       {
           Schema::table('pterodactyl_eggs', function (Blueprint $table) {
               $table->dropColumn('additional_environmental_variables');
           });
       }
};
