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
        if (!Schema::hasTable('demo_servers')) {
            Schema::create('demo_servers', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('server_id');
                $table->unsignedBigInteger('user_id');
                $table->timestamp('expires_at');
                $table->string('server_identifier');
                $table->boolean('is_suspended')->default(false);
                $table->timestamps();
                
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('demo_servers');
    }
};