<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('plans', function (Blueprint $table) {
            // Add missing columns
            if (!Schema::hasColumn('plans', 'maxUsers')) {
                $table->integer('maxUsers')->default(1)->after('planType');
            }
            if (!Schema::hasColumn('plans', 'duration')) {
                $table->integer('duration')->nullable()->after('maxUsers');
            }
        });
    }

    public function down()
    {
        Schema::table('plans', function (Blueprint $table) {
            if (Schema::hasColumn('plans', 'maxUsers')) {
                $table->dropColumn('maxUsers');
            }
            if (Schema::hasColumn('plans', 'duration')) {
                $table->dropColumn('duration');
            }
        });
    }
};