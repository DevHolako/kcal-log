<?php

namespace App\Http\Controllers;

use App\Http\Requests\Reports\StoreExportRequest;
use App\Models\ReportExport;
use App\Models\User;
use App\Services\ExportService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    public function __construct(
        protected ExportService $exportService,
    ) {}

    /**
     * Show reports and data exports management page.
     */
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        $exports = ReportExport::where('user_id', $user->id)
            ->latest()
            ->paginate(15);

        return Inertia::render('reports/index', [
            'exports' => $exports,
        ]);
    }

    /**
     * Request generation of a report or data export.
     */
    public function store(StoreExportRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $this->exportService->requestExport(
            $user,
            (string) $request->input('type'),
            (string) $request->input('date_from'),
            (string) $request->input('date_to'),
            async: ! app()->environment('testing', 'local') && config('queue.default') !== 'sync'
        );

        return back()->with('status', 'Report generated successfully.');
    }

    /**
     * Download completed export file.
     */
    public function download(ReportExport $export, Request $request): StreamedResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($export->user_id !== $user->id) {
            abort(403, 'Unauthorized access to export report.');
        }

        if ($export->status !== 'completed' || ! $export->file_path || ! Storage::disk('local')->exists($export->file_path)) {
            abort(404, 'Export file not found or still processing.');
        }

        $filename = sprintf('kcal-log-%s-%s-to-%s.%s', $export->type, $export->date_from->format('Y-m-d'), $export->date_to->format('Y-m-d'), $export->type);

        $headers = [];
        if ($export->type === 'pdf') {
            $headers['Content-Type'] = 'application/pdf';
        } elseif ($export->type === 'csv') {
            $headers['Content-Type'] = 'text/csv; charset=UTF-8';
        } elseif ($export->type === 'json') {
            $headers['Content-Type'] = 'application/json';
        }

        return Storage::disk('local')->download($export->file_path, $filename, $headers);
    }
}
