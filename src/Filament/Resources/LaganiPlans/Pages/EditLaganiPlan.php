<?php

namespace NepseAlpha\LaganiVitz\Filament\Resources\LaganiPlans\Pages;

use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;
use NepseAlpha\LaganiVitz\Filament\Resources\LaganiPlans\LaganiPlanResource;

class EditLaganiPlan extends EditRecord
{
    protected static string $resource = LaganiPlanResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
