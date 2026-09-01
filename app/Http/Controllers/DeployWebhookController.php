<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DeployWebhookController extends Controller {
    public function deploy(Request $request) {
        $secret = env('DEPLOY_SECRET', 'marj_deploy_secret_2026');
        $providedSecret = $request->query('secret') ?: $request->header('X-Hub-Signature-256') ?: $request->input('secret');

        if (!$providedSecret || ($request->query('secret') !== $secret && $request->input('secret') !== $secret)) {
            Log::warning('[AutoDeploy] Unauthorized webhook attempt from IP: ' . $request->ip());
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        try {
            $output = [];
            $returnVar = 0;
            $projectRoot = base_path();

            if (function_exists('exec')) {
                @exec("cd {$projectRoot} && git pull origin main 2>&1", $output, $returnVar);
            } elseif (function_exists('shell_exec')) {
                $raw = @shell_exec("cd {$projectRoot} && git pull origin main 2>&1");
                $output[] = $raw;
            } else {
                $output[] = 'Shell execution functions are disabled in PHP configuration.';
            }

            // Clear cache natively using Artisan
            \Illuminate\Support\Facades\Artisan::call('optimize:clear');
            $output[] = \Illuminate\Support\Facades\Artisan::output();

            Log::info('[AutoDeploy] Executed deployment: ' . implode("\n", (array)$output));

            return response()->json([
                'success' => true,
                'output' => $output,
                'message' => 'Deployment executed successfully'
            ]);
        } catch (\Throwable $e) {
            Log::error('[AutoDeploy] Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
