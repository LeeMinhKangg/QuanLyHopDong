<?php

namespace Database\Seeders;

use App\Models\ContractStatus;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class add_data_2 extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [
            ['code' => 'choduyet', 'name' => 'Chờ duyệt'],
            ['code' => 'daduyet', 'name' => 'Đã duyệt'],
            ['code' => 'duthao', 'name' => 'Dự thảothảo'],
            ['code' => 'thuongthao', 'name' => 'Thương thảo'],
            ['code' => 'trinhky', 'name' => 'Trình ký'],
            ['code' => 'daky', 'name' => 'Đã ký'],
        ];
        ContractStatus::insert($data);
    }
}
