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
        Schema::create(config('lagani-viz.database.own.tables.plans', 'lagani_plans'), function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('summary')->nullable();
            $table->longText('body')->nullable();
            $table->string('risk_level', 16)->default('medium'); // low | medium | high
            $table->decimal('min_amount', 14, 2)->nullable();
            $table->decimal('expected_return_pct', 6, 2)->nullable();
            $table->unsignedSmallInteger('duration_months')->nullable();
            $table->boolean('is_published')->default(false)->index();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(config('lagani-viz.database.own.tables.plans', 'lagani_plans'));
    }
};
