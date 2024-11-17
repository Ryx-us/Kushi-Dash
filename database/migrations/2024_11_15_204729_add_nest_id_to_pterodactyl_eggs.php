<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('pterodactyl_eggs', function (Blueprint $table) {
            $table->string('nestId')->nullable()->after('EggID');
        });
    }

    public function down()
    {
        Schema::table('pterodactyl_eggs', function (Blueprint $table) {
            $table->dropColumn('nestId');
        });
    }
};