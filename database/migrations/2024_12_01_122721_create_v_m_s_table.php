<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('v_m_s', function (Blueprint $table) {
            $table->enum('rank', ['user', 'premium', 'admin'])
                  ->default('user')
                  ->after('icon');  // This puts it after the icon column
        });
    }

    public function down()
    {
        Schema::table('v_m_s', function (Blueprint $table) {
            $table->dropColumn('rank');
        });
    }
};