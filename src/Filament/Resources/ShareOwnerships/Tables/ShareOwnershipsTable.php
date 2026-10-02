<?php

namespace NepseAlpha\LaganiVitz\Filament\Resources\ShareOwnerships\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use NepseAlpha\LaganiVitz\Models\ShareOwnership;

class ShareOwnershipsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('symbol')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('fy')
                    ->label('FY')
                    ->sortable(),

                TextColumn::make('shareholder_type')
                    ->label('Shareholders')
                    ->searchable()
                    ->weight(fn ($record) => $record->is_total ? 'bold' : null),

                TextColumn::make('percent_holding')
                    ->label('% Holding')
                    ->suffix('%')
                    ->sortable(),

                IconColumn::make('is_total')
                    ->label('Total')
                    ->boolean()
                    ->sortable(),
            ])
            ->defaultSort('symbol')
            ->filters([
                SelectFilter::make('symbol')
                    ->options(fn () => ShareOwnership::query()
                        ->distinct()
                        ->orderBy('symbol')
                        ->pluck('symbol', 'symbol')
                        ->all()),
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
