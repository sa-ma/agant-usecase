<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\MintRedeemRequest;
use App\Models\User;
use App\Models\WhitelistedAddress;
use App\Services\ChainService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RequestFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->app->instance(ChainService::class, new class extends ChainService {
            public function paused(): bool
            {
                return false;
            }

            public function frozen(string $address): bool
            {
                return false;
            }

            public function mint(string $to, string $amount): array
            {
                return ['hash' => '0xabc'];
            }

            public function burn(string $from, string $amount): array
            {
                return ['hash' => '0xdef'];
            }
        });
    }

    public function test_maker_cannot_approve_own_request(): void
    {
        $user = User::factory()->create([
            'role' => 'approver',
            'api_token' => 'token-maker',
        ]);

        $customer = Customer::create([
            'name' => 'Test Customer',
            'kyb_status' => 'approved',
        ]);

        WhitelistedAddress::create([
            'customer_id' => $customer->id,
            'address' => '0x1111111111111111111111111111111111111111',
            'status' => 'active',
        ]);

        $create = $this->postJson('/api/requests', [
            'type' => 'mint',
            'customer_id' => $customer->id,
            'address' => '0x1111111111111111111111111111111111111111',
            'amount_gbp' => '100.00',
        ], [
            'Authorization' => 'Bearer '.$user->api_token,
        ]);

        $create->assertStatus(201);

        $requestId = $create->json('id');

        $approve = $this->postJson('/api/requests/'.$requestId.'/approve', [], [
            'Authorization' => 'Bearer '.$user->api_token,
        ]);

        $approve->assertStatus(422);
    }

    public function test_idempotency_returns_same_response(): void
    {
        $user = User::factory()->create([
            'role' => 'approver',
            'api_token' => 'token-idempotent',
        ]);

        $customer = Customer::create([
            'name' => 'Idem Customer',
            'kyb_status' => 'approved',
        ]);

        WhitelistedAddress::create([
            'customer_id' => $customer->id,
            'address' => '0x2222222222222222222222222222222222222222',
            'status' => 'active',
        ]);

        $payload = [
            'type' => 'mint',
            'customer_id' => $customer->id,
            'address' => '0x2222222222222222222222222222222222222222',
            'amount_gbp' => '250.00',
        ];

        $headers = [
            'Authorization' => 'Bearer '.$user->api_token,
            'Idempotency-Key' => 'abc-123',
        ];

        $first = $this->postJson('/api/requests', $payload, $headers);
        $first->assertStatus(201);

        $second = $this->postJson('/api/requests', $payload, $headers);
        $second->assertStatus(201);

        $this->assertSame($first->json('id'), $second->json('id'));

        $this->assertCount(1, MintRedeemRequest::all());
    }
}
