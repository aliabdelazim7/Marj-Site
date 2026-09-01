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

        // Run git pull and optimization commands
        $output = [];
        $returnVar = 0;

        $projectRoot = base_path();
        $command = "cd {$projectRoot} && git pull origin main 2>&1 && php artisan optimize:clear 2>&1";

        exec($command, $output, $returnVar);

        Log::info('[AutoDeploy] Executed deployment: ' . implode("\n", $output));

        return response()->json([
            'success' => $returnVar === 0,
            'output' => $output,
            'message' => 'Deployment executed successfully'
        ]);
    }
}
