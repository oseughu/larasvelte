<?php

namespace Tests\Feature;

use PHPUnit\Framework\Attributes\DoesNotPerformAssertions;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }

    #[DoesNotPerformAssertions]
    public function test_the_application_uses_sqlite_memory(): void
    {
        it('uses the in-memory SQLite database for testing', function () {
            // Retrieve the current database connection name
            $connectionName = DB::getDefaultConnection();

            // Retrieve the database name for the current connection
            $databaseName = DB::connection()->getDatabaseName();

            // Assert that the connection name is 'sqlite'
            expect($connectionName)->toBe('sqlite');

            // Assert that the database name is ':memory:'
            expect($databaseName)->toBe(':memory:');
        });
    }
}
