<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class createvms extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        VMS::create([
            'name' => 'Kushi-Dash Default  ',
            'description' => 'Windows Remote Desktop Environment',
            'egg_id' => 'rdp-123',
            'nest_id' => 'vm-1',
            'minimum_requirements' => [
                'cpu' => 100,
                'memory' => 2048,
                'disk' => 25600
            ],
            'icon' => 'windows-icon-url',
            'image_url' => 'windows-bg-url'
        ]);
       
    }
}
