<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdatePterodactylEggsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // First check if the table exists
        if (Schema::hasTable('pterodactyl_eggs')) {
            Schema::table('pterodactyl_eggs', function (Blueprint $table) {
                // Add nestId column if it doesn't exist
                if (!Schema::hasColumn('pterodactyl_eggs', 'nestId')) {
                    $table->string('nestId')->nullable()->after('EggID');
                }
                
                // Add icon column if it doesn't exist
                if (!Schema::hasColumn('pterodactyl_eggs', 'icon')) {
                    $table->string('icon')->nullable()->after('imageUrl');
                }
                
                // Add additional_environmental_variables column if it doesn't exist
                if (!Schema::hasColumn('pterodactyl_eggs', 'additional_environmental_variables')) {
                    $table->json('additional_environmental_variables')->nullable()->after('icon');
                }
                
                // Add plans column if it doesn't exist
                if (!Schema::hasColumn('pterodactyl_eggs', 'plans')) {
                    $table->json('plans')->nullable()->after('additional_environmental_variables');
                }
            });
        } else {
            // If table doesn't exist (shouldn't happen but just in case)
            Schema::create('pterodactyl_eggs', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->text('description')->nullable();
                $table->string('EggID');
                $table->string('nestId')->nullable();
                $table->string('imageUrl')->nullable();
                $table->string('icon')->nullable();
                $table->json('additional_environmental_variables')->nullable();
                $table->json('plans')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('pterodactyl_eggs', function (Blueprint $table) {
            // Drop only the columns we're adding in this migration
            $columns = ['nestId', 'icon', 'additional_environmental_variables', 'plans'];
            
            foreach ($columns as $column) {
                if (Schema::hasColumn('pterodactyl_eggs', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
}