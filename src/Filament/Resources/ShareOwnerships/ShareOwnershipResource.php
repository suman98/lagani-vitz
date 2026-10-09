<?php

namespace NepseAlpha\LaganiViz\Filament\Resources\ShareOwnerships;

use BackedEnum;
use Filament\Panel;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use NepseAlpha\LaganiViz\Filament\Resources\ShareOwnerships\Pages\CreateShareOwnership;
use NepseAlpha\LaganiViz\Filament\Resources\ShareOwnerships\Pages\EditShareOwnership;
use NepseAlpha\LaganiViz\Filament\Resources\ShareOwnerships\Pages\ListShareOwnerships;
use NepseAlpha\LaganiViz\Filament\Resources\ShareOwnerships\Schemas\ShareOwnershipForm;
use NepseAlpha\LaganiViz\Filament\Resources\ShareOwnerships\Tables\ShareOwnershipsTable;
use NepseAlpha\LaganiViz\Models\ShareOwnership;

class ShareOwnershipResource extends Resource
{
    protected static ?string $model = ShareOwnership::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedChartPie;

    protected static ?string $navigationLabel = 'Share Ownership';

    protected static ?string $modelLabel = 'share ownership';

    protected static ?string $recordTitleAttribute = 'symbol';

    /** Mounted below the overview page: `/{panel}/lagani/share-ownerships`. */
    public static function getSlug(?Panel $panel = null): string
    {
        return config('lagani-viz.admin.slug', 'lagani').'/share-ownerships';
    }

    public static function getNavigationGroup(): ?string
    {
        return config('lagani-viz.admin.navigation_group');
    }

    public static function form(Schema $schema): Schema
    {
        return ShareOwnershipForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return ShareOwnershipsTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListShareOwnerships::route('/'),
            'create' => CreateShareOwnership::route('/create'),
            'edit' => EditShareOwnership::route('/{record}/edit'),
        ];
    }
}
