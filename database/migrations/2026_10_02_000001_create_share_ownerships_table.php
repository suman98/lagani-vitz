<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use NepseAlpha\LaganiViz\Support\OwnDatabase;

return new class extends Migration
{
    public function getConnection(): ?string
    {
        return OwnDatabase::connection();
    }

    public function up(): void
    {
        Schema::create(config('lagani-viz.database.own.tables.share_ownerships', 'share_ownerships'), function (Blueprint $table) {
            $table->id();
            $table->string('symbol')->index();
            $table->string('fy');
            $table->string('shareholder_type');
            $table->decimal('percent_holding', 6, 2);
            $table->boolean('is_total')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(config('lagani-viz.database.own.tables.share_ownerships', 'share_ownerships'));
    }
};
