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
        Schema::table('user_subscriptions', function (Blueprint $table) {
            // Add user_id column
            $table->unsignedBigInteger('user_id')->after('id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            // Add plan_id column
            $table->unsignedBigInteger('plan_id')->after('user_id');
            $table->foreign('plan_id')->references('id')->on('plans')->onDelete('cascade');
            
            // Add status column
            $table->enum('status', ['active', 'expired', 'cancelled'])->default('active')->after('plan_id');
            
            // Add expires_at column
            $table->timestamp('expires_at')->nullable()->after('status');
            
            // Add granted_by column
            $table->unsignedBigInteger('granted_by')->nullable()->after('expires_at');
            $table->foreign('granted_by')->references('id')->on('users')->onDelete('set null');
            
            // Add indexes for performance
            $table->index(['user_id', 'status']);
            $table->index(['expires_at', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_subscriptions', function (Blueprint $table) {
            // Drop foreign keys first
            $table->dropForeign(['user_id']);
            $table->dropForeign(['plan_id']);
            $table->dropForeign(['granted_by']);
            
            // Drop indexes
            $table->dropIndex(['user_id', 'status']);
            $table->dropIndex(['expires_at', 'status']);
            
            // Drop columns
            $table->dropColumn('user_id');
            $table->dropColumn('plan_id');
            $table->dropColumn('status');
            $table->dropColumn('expires_at');
            $table->dropColumn('granted_by');
        });
    }
};