<?php

namespace NepseAlpha\LaganiVitz\Filament\Resources\LaganiPlans\Pages;

use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;
use NepseAlpha\LaganiVitz\Filament\Resources\LaganiPlans\LaganiPlanResource;

class ListLaganiPlans extends ListRecords
{
    protected static string $resource = LaganiPlanResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
