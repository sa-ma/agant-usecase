<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\ReserveSnapshot;
use App\Models\User;
use App\Models\WhitelistedAddress;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $adminPlainToken = env('SEED_ADMIN_TOKEN', Str::random(60));

        $admin = User::updateOrCreate(
            ['email' => 'admin@issuer.test'],
            [
                'name' => 'Issuer Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'api_token' => hash('sha256', $adminPlainToken),
            ]
        );

        echo "Admin API token: {$adminPlainToken}\n";

        User::updateOrCreate(
            ['email' => 'approver@issuer.test'],
            [
                'name' => 'Approver',
                'password' => Hash::make('password'),
                'role' => 'approver',
            ]
        );

        User::updateOrCreate(
            ['email' => 'viewer@issuer.test'],
            [
                'name' => 'Viewer',
                'password' => Hash::make('password'),
                'role' => 'viewer',
            ]
        );

        $customer = Customer::updateOrCreate(
            ['name' => 'Acme Treasury Ltd'],
            ['kyb_status' => 'approved']
        );

        WhitelistedAddress::updateOrCreate(
            ['customer_id' => $customer->id, 'address' => '0x1111111111111111111111111111111111111111'],
            ['status' => 'active']
        );

        if (! ReserveSnapshot::first()) {
            ReserveSnapshot::create([
                'cash_gbp' => 25000000.00,
                'gov_securities_gbp' => 15000000.00,
                'total_reserves_gbp' => 40000000.00,
                'circulating_supply_gbp' => 0.00,
                'created_at' => now(),
            ]);
        }
    }
}
