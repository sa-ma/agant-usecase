<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use RuntimeException;
use Symfony\Component\Process\Process;

class ChainService
{
    private function run(array $args): array
    {
        $script = config('chain.script_path');
        if (! $script || ! file_exists($script)) {
            throw new RuntimeException('Chain script not found: '.$script);
        }
        if (! config('chain.contract_address')) {
            throw new RuntimeException('Missing CHAIN_CONTRACT_ADDRESS.');
        }

        $process = new Process(array_merge(['node', $script], $args));
        $process->setTimeout(30);
        $process->setEnv(array_merge($_SERVER, $_ENV, [
            'CHAIN_RPC_URL' => config('chain.rpc_url'),
            'CHAIN_PRIVATE_KEY' => config('chain.private_key'),
            'CHAIN_CONTRACT_ADDRESS' => config('chain.contract_address'),
        ]));

        $process->run();

        if (! $process->isSuccessful()) {
            Log::error('Chain process failed', [
                'args' => $args,
                'stderr' => $process->getErrorOutput(),
                'stdout' => $process->getOutput(),
                'exit_code' => $process->getExitCode(),
            ]);
            throw new RuntimeException('Chain operation failed.');
        }

        $output = trim($process->getOutput());
        if ($output === '') {
            return [];
        }

        $decoded = json_decode($output, true);
        if ($decoded === null) {
            Log::error('Invalid chain response', [
                'args' => $args,
                'output' => $output,
            ]);
            throw new RuntimeException('Chain operation failed.');
        }

        return $decoded;
    }

    public function mint(string $to, string $amount): array
    {
        return $this->run(['mint', $to, $amount]);
    }

    public function burn(string $from, string $amount): array
    {
        return $this->run(['burn', $from, $amount]);
    }

    public function pause(): array
    {
        return $this->run(['pause']);
    }

    public function unpause(): array
    {
        return $this->run(['unpause']);
    }

    public function freeze(string $user): array
    {
        return $this->run(['freeze', $user]);
    }

    public function unfreeze(string $user): array
    {
        return $this->run(['unfreeze', $user]);
    }

    public function events(int $fromBlock, ?int $toBlock = null): array
    {
        $args = ['events', (string) $fromBlock];
        if ($toBlock !== null) {
            $args[] = (string) $toBlock;
        }

        return $this->run($args);
    }

    public function paused(): bool
    {
        $response = $this->run(['paused']);
        return (bool) ($response['paused'] ?? false);
    }

    public function frozen(string $address): bool
    {
        $response = $this->run(['frozen', $address]);
        return (bool) ($response['frozen'] ?? false);
    }
}
