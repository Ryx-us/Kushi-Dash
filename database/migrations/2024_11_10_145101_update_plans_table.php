<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            // Add new columns
            if (!Schema::hasColumn('plans', 'name')) {
                $table->string('name')->nullable(false); // Add the name field
            }
            if (!Schema::hasColumn('plans', 'price')) {
                $table->decimal('price', 8, 2)->nullable();
            }
            if (!Schema::hasColumn('plans', 'icon')) {
                $table->string('icon')->nullable();
            }
            if (!Schema::hasColumn('plans', 'image')) {
                $table->string('image')->nullable();
            }
            if (!Schema::hasColumn('plans', 'description')) {
                $table->text('description')->nullable();
            }
            if (!Schema::hasColumn('plans', 'resources')) {
                $table->json('resources')->nullable();
            }
            if (!Schema::hasColumn('plans', 'discount')) {
                $table->decimal('discount', 8, 2)->nullable();
            }
            if (!Schema::hasColumn('plans', 'visibility')) {
                $table->boolean('visibility')->default(true);
            }
            if (!Schema::hasColumn('plans', 'redirect')) {
                $table->json('redirect')->nullable();
            }
            if (!Schema::hasColumn('plans', 'perCustomer')) {
                $table->json('perCustomer')->nullable();
            }
            if (!Schema::hasColumn('plans', 'planType')) {
                $table->string('planType')->default('monthly');
            }
            if (!Schema::hasColumn('plans', 'perPerson')) {
                $table->integer('perPerson')->default(1);
            }
            if (!Schema::hasColumn('plans', 'stock')) {
                $table->integer('stock')->default(0);
            }
            if (!Schema::hasColumn('plans', 'kushiConfig')) {
                $table->json('kushiConfig')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn([
                'name',
                'price',
                'icon',
                'image',
                'description',
                'resources',
                'discount',
                'visibility',
                'redirect',
                'perCustomer',
                'planType',
                'perPerson',
                'stock',
                'kushiConfig',
            ]);
        });
    }
};