<?php
// config/shop.php
return [
    'prices' => [
        'cpu' => [
            'amount' => env('PRICE_CPU_AMOUNT', 10),
            'cost' => env('PRICE_CPU_COST', 150),
            'enabled' => env('PRICE_CPU_ENABLED', false),
        ],
        'memory' => [
            'amount' => env('PRICE_MEMORY_AMOUNT', 1024),
            'cost' => env('PRICE_MEMORY_COST', 100),
            'enabled' => env('PRICE_MEMORY_ENABLED', false),
        ],
        'disk' => [
            'amount' => env('PRICE_DISK_AMOUNT', 10240),
            'cost' => env('PRICE_DISK_COST', 50),
            'enabled' => env('PRICE_DISK_ENABLED', false),
        ],
        'databases' => [
            'amount' => env('PRICE_DATABASE_AMOUNT', 1),
            'cost' => env('PRICE_DATABASE_COST', 750),
            'enabled' => env('PRICE_DATABASE_ENABLED', false),
        ],
        'allocations' => [
            'amount' => env('PRICE_ALLOCATION_AMOUNT', 1),
            'cost' => env('PRICE_ALLOCATION_COST', 500),
            'enabled' => env('PRICE_ALLOCATION_ENABLED', false),
        ],
        'backups' => [
            'amount' => env('PRICE_BACKUP_AMOUNT', 1),
            'cost' => env('PRICE_BACKUP_COST', 1000),
            'enabled' => env('PRICE_BACKUP_ENABLED', false),
        ],
        'servers' => [
            'amount' => env('PRICE_SERVER_SLOTS_AMOUNT', 1),
            'cost' => env('PRICE_SERVER_SLOTS_COST', 2000),
            'enabled' => env('PRICE_SERVER_SLOTS_ENABLED', false),
        ],
    ],
    'max_cpu' => env('MAX_CPU_PURCHASE', 100),
    'max_memory' => env('MAX_MEMORY_PURCHASE', 4096),
    'max_disk' => env('MAX_DISK_PURCHASE', 10240),
    'max_databases' => env('MAX_DATABASE_PURCHASE', 5),
    'max_allocations' => env('MAX_ALLOCATION_PURCHASE', 10),
    'max_backups' => env('MAX_BACKUP_PURCHASE', 10),
    'max_servers' => env('MAX_SERVER_SLOTS_PURCHASE', 10),
];