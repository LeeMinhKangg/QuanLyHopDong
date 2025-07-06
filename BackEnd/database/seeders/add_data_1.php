<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\GeneralConfiguration;
use Illuminate\Support\Facades\DB;

class add_data_1 extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. General Configurations
        DB::table('general_configurations')->insert([
            'alert_anabled' => '1',
            'alert_days_before' => 15,
            'round_total' => '1',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. General Configuration Alert Targets
        DB::table('general_configuration_alert_targets')->insert([
            'role_id' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 3. General Configuration Auto Updates
        DB::table('general_configuration_auto_updates')->insert([
            'key' => 'system_update',
            'enable' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 4. General Configuration Notifications
        DB::table('general_configuration_notifications')->insert([
            [
                'role_id' => 1,
                'status_id' => 1,
                'enable' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'role_id' => 2,
                'status_id' => 1,
                'enable' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 5. Roles
        DB::table('roles')->insert([
            [
                'code' => 'admin',
                'name' => 'Administrator',
                'description' => 'System Administrator',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'user',
                'name' => 'User',
                'description' => 'Regular User',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'manager',
                'name' => 'Manager',
                'description' => 'Department Manager',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 6. Features
        DB::table('features')->insert([
            [
                'code' => 'contract_management',
                'name' => 'Contract Management',
                'description' => 'Manage contracts and related documents',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'user_management',
                'name' => 'User Management',
                'description' => 'Manage system users and permissions',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'reporting',
                'name' => 'Reporting',
                'description' => 'Generate and view reports',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 7. Permissions
        DB::table('permissions')->insert([
            [
                'role_id' => 1,
                'feature_id' => 1,
                'enable' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'role_id' => 1,
                'feature_id' => 2,
                'enable' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'role_id' => 1,
                'feature_id' => 3,
                'enable' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'role_id' => 2,
                'feature_id' => 1,
                'enable' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'role_id' => 2,
                'feature_id' => 3,
                'enable' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}