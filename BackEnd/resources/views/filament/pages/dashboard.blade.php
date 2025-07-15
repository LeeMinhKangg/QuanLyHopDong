{{-- File: resources/views/filament/pages/dashboard.blade.php --}}
<x-filament-panels::page>
    {{-- Load all CSS files --}}
    <link rel="stylesheet" href="{{ asset('css/modern-dashboard.css') }}">
    <link rel="stylesheet" href="{{ asset('css/enhanced-widgets.css') }}">
    <link rel="stylesheet" href="{{ asset('css/modern-admin-layout.css') }}">
    
    {{-- Modern Welcome Header --}}
    <div class="modern-welcome-section mb-8">
        <div class="welcome-card-modern">
            {{-- Animated background elements --}}
            <div class="bg-animations">
                <div class="floating-particle particle-1"></div>
                <div class="floating-particle particle-2"></div>
                <div class="floating-particle particle-3"></div>
                <div class="floating-particle particle-4"></div>
                <div class="floating-particle particle-5"></div>
            </div>
            
            <div class="welcome-content-modern">
                <div class="welcome-main">
                    <div class="welcome-greeting-modern">
                        <div class="greeting-icon">🌟</div>
                        <h1 class="welcome-title-modern">
                            Chào mừng trở lại, 
                            <span class="user-name-highlight">{{ auth()->user()->name }}</span>!
                        </h1>
                        <p class="welcome-subtitle-modern">
                            <span class="date-badge">📅 {{ now()->format('l, d F Y') }}</span>
                            <span class="separator">•</span>
                            <span class="tagline">Hãy cùng quản lý hợp đồng hiệu quả</span>
                        </p>
                    </div>
                    
                    <div class="quick-actions-modern">
                        <a href="/admin/contracts/create" class="modern-btn primary-btn">
                            <div class="btn-icon">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <span>Tạo hợp đồng mới</span>
                            <div class="btn-shimmer"></div>
                        </a>
                        <a href="/admin/contracts" class="modern-btn secondary-btn">
                            <div class="btn-icon">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <span>Xem tất cả hợp đồng</span>
                            <div class="btn-shimmer"></div>
                        </a>
                    </div>
                </div>
                
                <div class="welcome-visual">
                    <div class="stats-preview">
                        <div class="mini-stat">
                            <div class="mini-stat-icon">📊</div>
                            <div class="mini-stat-value">
                                @php
                                    $totalContracts = \App\Models\Contract::count();
                                    echo $totalContracts;
                                @endphp
                            </div>
                            <div class="mini-stat-label">Hợp đồng</div>
                        </div>
                        <div class="mini-stat">
                            <div class="mini-stat-icon">💰</div>
                            <div class="mini-stat-value">
                                @php
                                    $totalValue = \App\Models\Contract::sum('total_value') ?? 0;
                                    echo number_format($totalValue / 1000000, 1) . 'M';
                                @endphp
                            </div>
                            <div class="mini-stat-label">Tổng giá trị</div>
                        </div>
                        <div class="mini-stat">
                            <div class="mini-stat-icon">✅</div>
                            <div class="mini-stat-value">
                                @php
                                    $activeContracts = \App\Models\Contract::where('end_date', '>=', now())->count();
                                    echo $activeContracts;
                                @endphp
                            </div>
                            <div class="mini-stat-label">Còn hiệu lực</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- Enhanced Stats Section --}}
    <div class="modern-stats-section mb-12">
        <div class="section-header">
            <h2 class="section-title">📊 Thống kê tổng quan</h2>
            <p class="section-subtitle">Cập nhật theo thời gian thực</p>
        </div>
        <livewire:app.filament.widgets.contract-stats-overview />
    </div>

    {{-- Enhanced Charts Section --}}
    <div class="modern-charts-section mb-16">
        <div class="section-header">
            <h2 class="section-title">📈 Phân tích & Báo cáo</h2>
            <p class="section-subtitle">Xu hướng và insights quan trọng</p>
        </div>
        <div class="charts-grid">
            <div class="chart-container-modern trend-chart">
                <livewire:app.filament.widgets.contract-trend-chart />
            </div>
            <div class="chart-container-modern value-chart">
                <livewire:app.filament.widgets.monthly-contract-value-chart />
            </div>
        </div>
    </div>

    {{-- Enhanced Table Section --}}
    <div class="modern-table-section mb-12">
        <div class="section-header">
            <h2 class="section-title">📋 Chi tiết theo phòng ban</h2>
            <p class="section-subtitle">Phân tích hiệu suất từng bộ phận</p>
        </div>
        <div class="table-container-modern">
            <livewire:app.filament.widgets.contract-department-table />
        </div>
    </div>

    {{-- Custom Modern Styles --}}
    <style>
        /* ============ MODERN WELCOME SECTION ============ */
        .modern-welcome-section {
            animation: slideInDown 1s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .welcome-card-modern {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(30px);
            border-radius: 32px;
            padding: 3rem;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 
                0 32px 64px rgba(0, 0, 0, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.2);
            position: relative;
            overflow: hidden;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .welcome-card-modern:hover {
            transform: translateY(-4px);
            box-shadow: 
                0 40px 80px rgba(0, 0, 0, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }
        
        /* Background animations */
        .bg-animations {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            overflow: hidden;
            z-index: 0;
        }
        
        .floating-particle {
            position: absolute;
            background: linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4);
            border-radius: 50%;
            opacity: 0.6;
            animation: floatParticle 6s ease-in-out infinite;
        }
        
        .particle-1 {
            width: 60px;
            height: 60px;
            top: 10%;
            left: 10%;
            animation-delay: 0s;
        }
        
        .particle-2 {
            width: 40px;
            height: 40px;
            top: 20%;
            right: 15%;
            animation-delay: 1s;
        }
        
        .particle-3 {
            width: 80px;
            height: 80px;
            bottom: 15%;
            left: 20%;
            animation-delay: 2s;
        }
        
        .particle-4 {
            width: 50px;
            height: 50px;
            bottom: 25%;
            right: 10%;
            animation-delay: 3s;
        }
        
        .particle-5 {
            width: 30px;
            height: 30px;
            top: 50%;
            left: 50%;
            animation-delay: 4s;
        }
        
        @keyframes floatParticle {
            0%, 100% {
                transform: translateY(0px) scale(1);
                opacity: 0.6;
            }
            33% {
                transform: translateY(-20px) scale(1.1);
                opacity: 0.8;
            }
            66% {
                transform: translateY(20px) scale(0.9);
                opacity: 0.4;
            }
        }
        
        .welcome-content-modern {
            position: relative;
            z-index: 1;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 3rem;
        }
        
        .welcome-greeting-modern {
            text-align: left;
        }
        
        .greeting-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
            animation: bounce 2s infinite;
        }
        
        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
                transform: translateY(0);
            }
            40% {
                transform: translateY(-10px);
            }
            60% {
                transform: translateY(-5px);
            }
        }
        
        .welcome-title-modern {
            font-size: 3rem;
            font-weight: 900;
            color: rgba(255, 255, 255, 0.95);
            text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            margin-bottom: 1rem;
            line-height: 1.2;
        }
        
        .user-name-highlight {
            background: linear-gradient(135deg, #ff6b6b, #4ecdc4, #45b7d1);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            background-size: 200% 200%;
            animation: gradientShift 3s ease infinite;
        }
        
        @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }
        
        .welcome-subtitle-modern {
            font-size: 1.25rem;
            color: rgba(255, 255, 255, 0.8);
            font-weight: 500;
            margin-bottom: 2rem;
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .date-badge {
            background: rgba(59, 130, 246, 0.3);
            backdrop-filter: blur(10px);
            padding: 0.5rem 1rem;
            border-radius: 12px;
            border: 1px solid rgba(59, 130, 246, 0.4);
        }
        
        .separator {
            color: rgba(255, 255, 255, 0.5);
        }
        
        /* ============ MODERN BUTTONS ============ */
        .quick-actions-modern {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
        }
        
        .modern-btn {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem 2rem;
            border-radius: 16px;
            font-weight: 700;
            font-size: 1rem;
            text-decoration: none;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
            border: none;
            cursor: pointer;
        }
        
        .primary-btn {
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            color: white;
            box-shadow: 0 8px 32px rgba(59, 130, 246, 0.4);
        }
        
        .primary-btn:hover {
            transform: translateY(-4px) scale(1.05);
            box-shadow: 0 16px 48px rgba(59, 130, 246, 0.6);
        }
        
        .secondary-btn {
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            color: rgba(255, 255, 255, 0.9);
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .secondary-btn:hover {
            transform: translateY(-4px) scale(1.05);
            background: rgba(255, 255, 255, 0.25);
            border-color: rgba(255, 255, 255, 0.5);
            box-shadow: 0 16px 48px rgba(255, 255, 255, 0.2);
        }
        
        .btn-icon {
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .btn-shimmer {
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            transition: left 0.5s ease;
        }
        
        .modern-btn:hover .btn-shimmer {
            left: 100%;
        }
        
        /* ============ MINI STATS PREVIEW ============ */
        .welcome-visual {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .stats-preview {
            display: flex;
            gap: 1rem;
            flex-direction: column;
        }
        
        .mini-stat {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border-radius: 16px;
            padding: 1.5rem;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
            min-width: 120px;
        }
        
        .mini-stat:hover {
            transform: scale(1.05);
            background: rgba(255, 255, 255, 0.2);
        }
        
        .mini-stat-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }
        
        .mini-stat-value {
            font-size: 1.5rem;
            font-weight: 800;
            color: rgba(255, 255, 255, 0.95);
            margin-bottom: 0.25rem;
        }
        
        .mini-stat-label {
            font-size: 0.75rem;
            color: rgba(255, 255, 255, 0.7);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        /* ============ SECTION HEADERS ============ */
        .section-header {
            margin-bottom: 2rem;
            text-align: center;
        }
        
        .section-title {
            font-size: 2rem;
            font-weight: 800;
            color: rgba(255, 255, 255, 0.95);
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            margin-bottom: 0.5rem;
        }
        
        .section-subtitle {
            font-size: 1rem;
            color: rgba(255, 255, 255, 0.7);
            font-weight: 500;
        }
        
        /* ============ MODERN SECTIONS ============ */
        .modern-stats-section,
        .modern-charts-section,
        .modern-table-section {
            animation: fadeInUp 0.8s ease-out;
        }
        
        .modern-stats-section {
            animation-delay: 0.3s;
        }
        
        .modern-charts-section {
            animation-delay: 0.6s;
        }
        
        .modern-table-section {
            animation-delay: 0.9s;
        }
        
        .charts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
            gap: 2rem;
        }
        
        .chart-container-modern,
        .table-container-modern {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 16px 32px rgba(0, 0, 0, 0.2);
            transition: all 0.4s ease;
            overflow: hidden;
        }
        
        .chart-container-modern:hover,
        .table-container-modern:hover {
            transform: translateY(-4px);
            box-shadow: 0 24px 48px rgba(0, 0, 0, 0.3);
            border-color: rgba(255, 255, 255, 0.2);
        }
        
        /* ============ ANIMATIONS ============ */
        @keyframes slideInDown {
            from {
                opacity: 0;
                transform: translateY(-50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* ============ RESPONSIVE DESIGN ============ */
        @media (max-width: 1024px) {
            .welcome-content-modern {
                flex-direction: column;
                text-align: center;
                gap: 2rem;
            }
            
            .charts-grid {
                grid-template-columns: 1fr;
            }
            
            .stats-preview {
                flex-direction: row;
                justify-content: center;
            }
        }
        
        @media (max-width: 768px) {
            .welcome-card-modern {
                padding: 2rem;
                border-radius: 24px;
            }
            
            .welcome-title-modern {
                font-size: 2rem;
            }
            
            .quick-actions-modern {
                flex-direction: column;
                width: 100%;
            }
            
            .modern-btn {
                justify-content: center;
                width: 100%;
            }
            
            .stats-preview {
                flex-direction: column;
                gap: 0.75rem;
            }
            
            .mini-stat {
                padding: 1rem;
                min-width: auto;
            }
        }
        
        /* ============ DARK MODE ENHANCEMENTS ============ */
        @media (prefers-color-scheme: dark) {
            .welcome-card-modern {
                background: rgba(15, 23, 42, 0.8);
                border-color: rgba(148, 163, 184, 0.2);
            }
            
            .section-title {
                color: rgba(248, 250, 252, 0.95);
            }
            
            .section-subtitle {
                color: rgba(148, 163, 184, 0.8);
            }
        }
        
        /* ============ PERFORMANCE OPTIMIZATIONS ============ */
        .welcome-card-modern,
        .modern-btn,
        .mini-stat,
        .chart-container-modern,
        .table-container-modern {
            will-change: transform;
        }
        
        /* ============ ACCESSIBILITY ============ */
        .modern-btn:focus {
            outline: 3px solid rgba(59, 130, 246, 0.5);
            outline-offset: 2px;
        }
        
        .mini-stat:focus {
            outline: 2px solid rgba(255, 255, 255, 0.5);
            outline-offset: 2px;
        }
        
        /* ============ LOADING STATES ============ */
        .loading .welcome-card-modern {
            opacity: 0.7;
            pointer-events: none;
        }
        
        .loading .modern-btn {
            opacity: 0.5;
            pointer-events: none;
        }
    </style>
</x-filament-panels::page>