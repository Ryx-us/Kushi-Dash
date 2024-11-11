<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class PlanFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->word(),
            'description' => $this->faker->sentence(),
            'price' => $this->faker->randomFloat(2, 10, 100),
            'type' => $this->faker->randomElement(['Basic', 'Premium', 'Enterprise']),
            'resources' => [
                'cpu' => $this->faker->numberBetween(1, 8),    // Number of CPU cores
                'memory' => $this->faker->numberBetween(1, 32), // Memory in GB
                'disk' => $this->faker->numberBetween(10, 500), // Disk in GB
                'swap' => -1,  // Set to -1 to indicate no swap
                'io' => $this->faker->numberBetween(100, 1000), // IO rate
                'threads' => $this->faker->numberBetween(1, 16), // Number of threads
                'allocations' => $this->faker->numberBetween(0, 5),
                'databases' => $this->faker->numberBetween(0, 5),
                'backups' => $this->faker->numberBetween(0, 5),
            ],
            'transferrableTo' => ['UserGroup1', 'UserGroup2'],
            'image' => $this->faker->imageUrl(),
            'icon' => ['icon1.png', 'icon2.png'],
            'invisible' => $this->faker->boolean(),
            'availableIn' => $this->faker->dateTimeThisYear(),  // Random availableIn date
            'availableUntil' => $this->faker->dateTimeThisYear('+1 year'),  // Random availableUntil date
            'billingCycles' => [
                'monthly' => [
                    'cpu' => 10,
                    'memory' => 128,
                    'disk' => 128,
                    'swap' => -1,
                    'io' => 500,
                    'threads' => 4,
                    'allocations' => 1,
                    'databases' => 1,
                    'backups' => 1
                ],
            ],
            'renewable' => $this->faker->boolean(),
            'productContent' => ['feature1' => 'value1', 'feature2' => 'value2'],
            'stock' => $this->faker->numberBetween(1, 100),
            'amountAllowedPerCustomer' => $this->faker->numberBetween(1, 5),
            'purchases' => $this->faker->numberBetween(0, 100),
            'strikeThroughPrice' => $this->faker->randomFloat(2, 20, 50),  // Random strike-through price
        ];
    }
}
