<!DOCTYPE html>
<html lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Nutrition Report - {{ $user->name }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 24px;
            font-size: 12px;
            line-height: 1.5;
        }
        .header {
            border-bottom: 2px solid #0284c7;
            padding-bottom: 12px;
            margin-bottom: 20px;
        }
        .title {
            font-size: 22px;
            font-weight: bold;
            color: #0f172a;
            margin: 0 0 4px 0;
        }
        .subtitle {
            font-size: 11px;
            color: #64748b;
            margin: 0;
        }
        .meta-table {
            width: 100%;
            margin-bottom: 20px;
            border-collapse: collapse;
        }
        .meta-table td {
            padding: 6px 0;
            vertical-align: top;
        }
        .cards-row {
            width: 100%;
            margin-bottom: 20px;
        }
        .card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 10px;
            text-align: center;
        }
        .card-val {
            font-size: 18px;
            font-weight: bold;
            color: #0284c7;
            margin-bottom: 2px;
        }
        .card-lbl {
            font-size: 10px;
            text-transform: uppercase;
            color: #64748b;
            font-weight: 600;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            margin-bottom: 25px;
        }
        .data-table th {
            background-color: #f1f5f9;
            color: #334155;
            font-weight: bold;
            font-size: 10px;
            text-transform: uppercase;
            padding: 8px 6px;
            border: 1px solid #cbd5e1;
            text-align: right;
        }
        .data-table th:first-child {
            text-align: left;
        }
        .data-table td {
            padding: 6px;
            border: 1px solid #e2e8f0;
            font-size: 11px;
            text-align: right;
        }
        .data-table td:first-child {
            text-align: left;
        }
        .data-table tr:nth-child(even) {
            background-color: #f8fafc;
        }
        .footer {
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
            font-size: 9px;
            color: #94a3b8;
            text-align: center;
            margin-top: 30px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">Nutrition & Diary Report</h1>
        <p class="subtitle">kcal-log Open Source Privacy-First Tracker &bull; Confidential Personal Export</p>
    </div>

    <table class="meta-table">
        <tr>
            <td style="width: 50%;">
                <strong>User:</strong> {{ $user->name }} ({{ $user->email }})<br>
                <strong>Report Period:</strong> {{ $dateFrom }} to {{ $dateTo }}
            </td>
            <td style="width: 50%; text-align: right;">
                <strong>Generated:</strong> {{ now()->toFormattedDateString() }}<br>
                <strong>Active Target:</strong> {{ $target ? round($target->target_calories) : '2000' }} kcal / day
            </td>
        </tr>
    </table>

    <!-- Summary KPI cards -->
    <table style="width: 100%; margin-bottom: 20px;" cellspacing="6">
        <tr>
            <td style="width: 25%;">
                <div class="card">
                    <div class="card-val">{{ round($avgCalories) }}</div>
                    <div class="card-lbl">Avg Daily kcal</div>
                </div>
            </td>
            <td style="width: 25%;">
                <div class="card">
                    <div class="card-val" style="color: #059669;">{{ round($avgProtein, 1) }}g</div>
                    <div class="card-lbl">Avg Protein</div>
                </div>
            </td>
            <td style="width: 25%;">
                <div class="card">
                    <div class="card-val" style="color: #2563eb;">{{ round($avgCarbs, 1) }}g</div>
                    <div class="card-lbl">Avg Carbs</div>
                </div>
            </td>
            <td style="width: 25%;">
                <div class="card">
                    <div class="card-val" style="color: #d97706;">{{ round($avgFat, 1) }}g</div>
                    <div class="card-lbl">Avg Fat</div>
                </div>
            </td>
        </tr>
    </table>

    <h3 style="font-size: 14px; margin: 15px 0 5px 0; color: #0f172a;">Daily Intake Breakdown</h3>
    <table class="data-table">
        <thead>
            <tr>
                <th>Date</th>
                <th>Calories</th>
                <th>Target</th>
                <th>Variance</th>
                <th>Protein</th>
                <th>Carbs</th>
                <th>Fat</th>
                <th>Fiber</th>
                <th>Water</th>
                <th>Weight</th>
            </tr>
        </thead>
        <tbody>
            @forelse($dailyRows as $row)
                <tr>
                    <td><strong>{{ $row['date'] }}</strong></td>
                    <td><strong>{{ round($row['calories']) }}</strong></td>
                    <td>{{ round($row['target_calories']) }}</td>
                    <td style="color: {{ $row['variance'] <= 0 ? '#059669' : '#dc2626' }}; font-weight: bold;">
                        {{ $row['variance'] > 0 ? '+'.round($row['variance']) : round($row['variance']) }}
                    </td>
                    <td>{{ round($row['protein'], 1) }}g</td>
                    <td>{{ round($row['carbs'], 1) }}g</td>
                    <td>{{ round($row['fat'], 1) }}g</td>
                    <td>{{ $row['fiber'] !== null ? round($row['fiber'], 1).'g' : '-' }}</td>
                    <td>{{ $row['water_ml'] > 0 ? $row['water_ml'].'ml' : '-' }}</td>
                    <td>{{ $row['weight_kg'] !== null ? $row['weight_kg'].'kg' : '-' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="10" style="text-align: center; padding: 15px; color: #64748b;">
                        No diary entries recorded for this date range.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    @if(count($recentItems) > 0)
        <h3 style="font-size: 14px; margin: 20px 0 5px 0; color: #0f172a;">Top Logged Foods & Servings</h3>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Food Item</th>
                    <th>Brand</th>
                    <th>Times Logged</th>
                    <th>Total Calories</th>
                </tr>
            </thead>
            <tbody>
                @foreach($recentItems as $item)
                    <tr>
                        <td><strong>{{ $item['name'] }}</strong></td>
                        <td>{{ $item['brand'] ?: 'Generic' }}</td>
                        <td>{{ $item['count'] }}</td>
                        <td>{{ round($item['total_calories']) }} kcal</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <div class="footer">
        Generated autonomously by kcal-log &bull; Open Source Privacy-First Fitness & Nutrition &bull; DevHolako/kcal-log
    </div>
</body>
</html>
