<?php

namespace NepseAlpha\LaganiViz\Filament\Resources\LaganiPlans;

use BackedEnum;
use Filament\Panel;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use NepseAlpha\LaganiViz\Filament\Resources\LaganiPlans\Pages\CreateLaganiPlan;
use NepseAlpha\LaganiViz\Filament\Resources\LaganiPlans\Pages\EditLaganiPlan;
use NepseAlpha\LaganiViz\Filament\Resources\LaganiPlans\Pages\ListLaganiPlans;
use NepseAlpha\LaganiViz\Filament\Resources\LaganiPlans\Schemas\LaganiPlanForm;
use NepseAlpha\LaganiViz\Filament\Resources\LaganiPlans\Tables\LaganiPlansTable;
use NepseAlpha\LaganiViz\Models\LaganiPlan;

class LaganiPlanResource extends Resource
{
    protected static ?string $model = LaganiPlan::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $navigationLabel = 'Lagani Plans';

    protected static ?string $modelLabel = 'plan';

    protected static ?string $recordTitleAttribute = 'title';

    /** Mounted below the overview page: `/{panel}/lagani/plans`. */
    public static function getSlug(?Panel $panel = null): string
    {
        return config('lagani-viz.admin.slug', 'lagani').'/plans';
    }

    public static function getNavigationGroup(): ?string
    {
        return config('lagani-viz.admin.navigation_group');
    }

    public static function form(Schema $schema): Schema
    {
        return LaganiPlanForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return LaganiPlansTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListLaganiPlans::route('/'),
            'create' => CreateLaganiPlan::route('/create'),
            'edit' => EditLaganiPlan::route('/{record}/edit'),
        ];
    }
}
