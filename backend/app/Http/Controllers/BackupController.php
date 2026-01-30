<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Artisan;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class BackupController extends Controller
{
    protected $backupPath = 'backups';

    /**
     * Get the storage disk for backups (uses storage/app directly, not storage/app/private)
     */
    protected function getBackupDisk()
    {
        return Storage::build([
            'driver' => 'local',
            'root' => storage_path('app'),
        ]);
    }

    /**
     * List all available backups
     */
    public function index(): JsonResponse
    {
        $disk = $this->getBackupDisk();

        if (!$disk->exists($this->backupPath)) {
            $disk->makeDirectory($this->backupPath);
        }

        $files = $disk->files($this->backupPath);
        $backups = [];

        foreach ($files as $file) {
            $filename = basename($file);
            if (str_ends_with($filename, '.sql') || str_ends_with($filename, '.zip')) {
                $backups[] = [
                    'filename' => $filename,
                    'size' => $disk->size($file),
                    'size_formatted' => $this->formatBytes($disk->size($file)),
                    'created_at' => date('Y-m-d H:i:s', $disk->lastModified($file)),
                    'type' => str_ends_with($filename, '.zip') ? 'full' : 'database',
                ];
            }
        }

        // Sort by date descending
        usort($backups, fn($a, $b) => strtotime($b['created_at']) - strtotime($a['created_at']));

        // Calculate total storage used
        $totalSize = array_sum(array_column($backups, 'size'));

        return response()->json([
            'backups' => $backups,
            'total_size' => $totalSize,
            'total_size_formatted' => $this->formatBytes($totalSize),
            'count' => count($backups),
        ]);
    }

    /**
     * Create a new database backup
     */
    public function create(Request $request): JsonResponse
    {
        try {
            $timestamp = now()->format('Y-m-d_His');
            $filename = "backup_{$timestamp}.sql";
            $filepath = storage_path("app/{$this->backupPath}/{$filename}");

            // Ensure backup directory exists
            $disk = $this->getBackupDisk();
            if (!$disk->exists($this->backupPath)) {
                $disk->makeDirectory($this->backupPath);
            }

            // Get database credentials
            $host = config('database.connections.mysql.host');
            $port = config('database.connections.mysql.port', 3306);
            $database = config('database.connections.mysql.database');
            $username = config('database.connections.mysql.username');
            $password = config('database.connections.mysql.password');

            // Try mysqldump first
            $mysqldumpWorked = false;
            if (!empty($password)) {
                $command = sprintf(
                    'mysqldump --host=%s --port=%s --user=%s --password=%s %s > %s 2>&1',
                    escapeshellarg($host),
                    escapeshellarg($port),
                    escapeshellarg($username),
                    escapeshellarg($password),
                    escapeshellarg($database),
                    escapeshellarg($filepath)
                );
            } else {
                $command = sprintf(
                    'mysqldump --host=%s --port=%s --user=%s %s > %s 2>&1',
                    escapeshellarg($host),
                    escapeshellarg($port),
                    escapeshellarg($username),
                    escapeshellarg($database),
                    escapeshellarg($filepath)
                );
            }

            exec($command, $output, $returnCode);

            if ($returnCode === 0 && file_exists($filepath) && filesize($filepath) > 0) {
                $mysqldumpWorked = true;
            }

            if (!$mysqldumpWorked) {
                // Fallback: Create SQL dump manually using Laravel
                $this->createManualBackup($filepath);
            }

            // Log the backup action
            $user = $request->user();
            ActivityLog::create([
                'user_id' => $user?->id,
                'mosque_id' => $user?->mosque_id,
                'action' => 'backup',
                'description' => "Created backup: {$filename}",
                'new_values' => ['filename' => $filename],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now(),
            ]);

            $size = file_exists($filepath) ? filesize($filepath) : 0;

            return response()->json([
                'success' => true,
                'message' => 'Backup berhasil dibuat',
                'filename' => $filename,
                'size' => $size,
                'size_formatted' => $this->formatBytes($size),
            ]);
        } catch (\Exception $e) {
            Log::error('Backup creation failed: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat backup: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Download a backup file
     */
    public function download(string $filename): BinaryFileResponse|JsonResponse
    {
        $filepath = storage_path("app/{$this->backupPath}/{$filename}");

        if (!file_exists($filepath)) {
            return response()->json([
                'success' => false,
                'message' => 'File backup tidak ditemukan',
            ], 404);
        }

        return response()->download($filepath, $filename);
    }

    /**
     * Delete a backup file
     */
    public function destroy(string $filename): JsonResponse
    {
        $disk = $this->getBackupDisk();
        $filepath = "{$this->backupPath}/{$filename}";

        if (!$disk->exists($filepath)) {
            return response()->json([
                'success' => false,
                'message' => 'File backup tidak ditemukan',
            ], 404);
        }

        $disk->delete($filepath);

        return response()->json([
            'success' => true,
            'message' => 'Backup berhasil dihapus',
        ]);
    }

    /**
     * Create manual backup when mysqldump is not available
     */
    protected function createManualBackup(string $filepath): void
    {
        $tables = DB::select('SHOW TABLES');
        $database = config('database.connections.mysql.database');
        $tableKey = "Tables_in_{$database}";

        $content = "-- Database Backup\n";
        $content .= "-- Generated: " . now()->format('Y-m-d H:i:s') . "\n\n";
        $content .= "SET FOREIGN_KEY_CHECKS=0;\n\n";

        foreach ($tables as $table) {
            $tableName = $table->$tableKey;

            // Get create table statement
            $createTable = DB::select("SHOW CREATE TABLE `{$tableName}`");
            $content .= "DROP TABLE IF EXISTS `{$tableName}`;\n";
            $content .= $createTable[0]->{'Create Table'} . ";\n\n";

            // Get data
            $rows = DB::table($tableName)->get();
            foreach ($rows as $row) {
                $values = array_map(function ($value) {
                    if ($value === null) return 'NULL';
                    return "'" . addslashes($value) . "'";
                }, (array) $row);

                $content .= "INSERT INTO `{$tableName}` VALUES (" . implode(', ', $values) . ");\n";
            }
            $content .= "\n";
        }

        $content .= "SET FOREIGN_KEY_CHECKS=1;\n";

        file_put_contents($filepath, $content);
    }

    /**
     * Format bytes to human readable format
     */
    protected function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);

        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
