<?php

namespace NepseAlpha\LaganiViz\Filament\Resources\LaganiPlans\Schemas;

use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;
use NepseAlpha\LaganiViz\Models\LaganiPlan;

class LaganiPlanForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(2)
            ->components([
                TextInput::make('title')
                    ->required()
                    ->maxLength(255),

                TextInput::make('slug')
                    ->helperText('Leave empty to generate from the title.')
                    ->unique(ignoreRecord: true)
                    ->maxLength(255),

                Textarea::make('summary')
                    ->rows(3)
                    ->maxLength(500)
                    ->columnSpanFull(),

                RichEditor::make('body')
                    ->columnSpanFull(),

                Select::make('risk_level')
                    ->options(LaganiPlan::RISK_LEVELS)
                    ->default('medium')
                    ->required(),

                TextInput::make('min_amount')
                    ->numeric()
                    ->minValue(0)
                    ->prefix('NPR'),

                TextInput::make('expected_return_pct')
                    ->label('Expected return')
                    ->numeric()
                    ->suffix('%'),

                TextInput::make('duration_months')
                    ->numeric()
                    ->integer()
                    ->minValue(1)
                    ->suffix('months'),

                TextInput::make('sort_order')
                    ->numeric()
                    ->integer()
                    ->default(0),

                Toggle::make('is_published')
                    ->label('Published')
                    ->helperText('Only published plans appear on the public frontend and API.'),
            ]);
    }
}
