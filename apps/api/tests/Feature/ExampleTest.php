<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_health_endpoint_returns_success(): void
    {
        $response = $this->get('/up');

        $response->assertStatus(200);
    }
}
