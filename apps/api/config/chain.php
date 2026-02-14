<?php

return [
    'rpc_url' => env('CHAIN_RPC_URL', 'http://127.0.0.1:8545'),
    'private_key' => env('CHAIN_PRIVATE_KEY'),
    'contract_address' => env('CHAIN_CONTRACT_ADDRESS'),
    'script_path' => env('CHAIN_SCRIPT_PATH', base_path('../../contracts/scripts/chain.mjs')),
];
