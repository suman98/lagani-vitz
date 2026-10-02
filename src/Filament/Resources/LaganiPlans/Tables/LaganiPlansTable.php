<?php

namespace NepseAlpha\LaganiVitz\Filament\Resources\LaganiPlans\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use NepseAlpha\LaganiVitz\Models\LaganiPlan;

class LaganiPlansTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('title')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('risk_level')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => LaganiPlan::RISK_LEVELS[$state] ?? $state)
                    ->color(fn (string $state): string => match ($state) {
                        'low' => 'success',
                        'high' => 'danger',
                        default => 'warning',
                    })
                    ->sortable(),

                TextColumn::make('expected_return_pct')
                    ->label('Return')
                    ->suffix('%')
                    ->sortable(),

                TextColumn::make('min_amount')
                    ->numeric(decimalPlaces: 0)
                    ->sortable(),

                IconColumn::make('is_published')
                    ->label('Published')
                    ->boolean()
                    ->sortable(),

                TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('sort_order')
            ->reorderable('sort_order')
            ->filters([
                SelectFilter::make('risk_level')->options(LaganiPlan::RISK_LEVELS),
                TernaryFilter::make('is_published')->label('Published'),
            ])
            ->recordActions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
