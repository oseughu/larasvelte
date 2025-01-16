<?php

namespace App\Providers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->sqliteOptimize();
    }

    protected function sqliteOptimize(): void
    {
        $db = DB::connection();

        if ($db->getDriverName() !== 'sqlite') {
            return;
        }

        $db->unprepared('PRAGMA synchronous = NORMAL;');
        $db->unprepared('PRAGMA foreign_keys = ON;');
        $db->unprepared('PRAGMA temp_store = MEMORY;');
        $db->unprepared('PRAGMA busy_timeout = 5000;');
        $db->unprepared('PRAGMA mmap_size = 2147483648;');
        $db->unprepared('PRAGMA cache_size = -20000;');
        $db->unprepared('PRAGMA incremental_vacuum;');
    }
}
