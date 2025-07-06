<x-filament::page>
    <!-- Phần thống kê hợp đồng -->
    <div class="mb-12">
        <livewire:app.filament.widgets.contract-stats-overview />
    </div>

    <!-- Phần biểu đồ -->
    <div class="mb-16">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Biểu đồ xu hướng hợp đồng -->
            <div class="bg-white rounded-xl shadow-sm p-6 dark:bg-gray-800 h-full">
                <livewire:app.filament.widgets.contract-trend-chart />
            </div>
            
            <!-- Biểu đồ giá trị hợp đồng hàng tháng -->
            <div class="bg-white rounded-xl shadow-sm p-6 dark:bg-gray-800 h-full">
                <livewire:app.filament.widgets.monthly-contract-value-chart />
            </div>
        </div>
    </div>

    <!-- Phần bảng phòng ban hợp đồng -->
    <div class="mb-12">
        <div class="bg-white rounded-xl shadow-sm p-6 dark:bg-gray-800 h-full">
            <livewire:app.filament.widgets.contract-department-table />
        </div>
    </div>
</x-filament::page>