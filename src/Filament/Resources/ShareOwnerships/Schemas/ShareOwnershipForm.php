<?php

namespace NepseAlpha\LaganiVitz\Filament\Resources\ShareOwnerships\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class ShareOwnershipForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(2)
            ->components([
                TextInput::make('symbol')
                    ->required()
                    ->maxLength(32),

                TextInput::make('fy')
                    ->label('Fiscal year')
                    ->required()
                    ->placeholder('2081/82')
                    ->maxLength(16),

                TextInput::make('shareholder_type')
                    ->label('Shareholder type')
                    ->required()
                    ->placeholder('e.g. Domestic ownership, Public, Foreign ownership')
                    ->columnSpanFull()
                    ->maxLength(255),

                TextInput::make('percent_holding')
                    ->label('% Holding')
                    ->required()
                    ->numeric()
                    ->minValue(0)
                    ->maxValue(100)
                    ->suffix('%'),

                Toggle::make('is_total')
                    ->label('Total row')
                    ->helperText('Bold summary row, e.g. "Domestic ownership" or "Foreign ownership".'),
            ]);
    }
}
