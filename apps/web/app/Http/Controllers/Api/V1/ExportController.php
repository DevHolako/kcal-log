<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Export\CreateExportAction;
use App\DTOs\Export\CreateExportDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\Reports\StoreExportRequest;
use App\Models\ReportExport;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    public function __construct(
        protected CreateExportAction $createExportAction,
    ) {}

    /**
     * List user's export history.
     */
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $exports = ReportExport::where('user_id', $user->id)
            ->latest()
            ->paginate(15);

        return response()->json($exports);
    }

    /**
     * Request a new PDF report, CSV archive, or JSON export.
     */
    public function store(StoreExportRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $dto = CreateExportDTO::fromRequest($request);
        $export = $this->createExportAction->execute($user, $dto);

        return response()->json([
            'message' => 'Export generated successfully.',
            'data' => $export,
        ], 201);
    }

    /**
     * Get details and status of a specific export.
     */
    public function show(ReportExport $export, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($export->user_id !== $user->id) {
            abort(403, 'Unauthorized access to export report.');
        }

        return response()->json([
            'data' => $export,
        ]);
    }

    /**
     * Download an export file directly via API.
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
