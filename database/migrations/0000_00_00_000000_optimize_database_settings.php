<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $db = DB::connection();

        if ($db->getDriverName() !== 'sqlite') {
            return;
        }

        $db->unprepared('PRAGMA journal_mode = WAL;');
        $db->unprepared('PRAGMA page_size = 32768;');
        $db->unprepared('PRAGMA auto_vacuum = INCREMENTAL;');
    }
};
