<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   // database/migrations/xxxx_xx_xx_add_pterodactyl_fields_to_users_table.php

   public function up()
   {
       Schema::table('users', function (Blueprint $table) {
           $table->string('pterodactyl_id')->nullable();
           $table->string('pterodactyl_email')->nullable();
       });
   }

   public function down()
   {
       Schema::table('users', function (Blueprint $table) {
           $table->dropColumn(['pterodactyl_id', 'pterodactyl_email']);
       });
   }

};
