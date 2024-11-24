<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddPlansToPterodactylEggsTable extends Migration
{
    public function up()
    {
        Schema::table('pterodactyl_eggs', function (Blueprint $table) {
            $table->json('plans')->nullable()->after('additional_environmental_variables');
        });
    }

    public function down()
    {
        Schema::table('pterodactyl_eggs', function (Blueprint $table) {
            $table->dropColumn('plans');
        });
    }
}