<?php

namespace NepseAlpha\LaganiViz\Filament\Resources\ShareOwnerships\Pages;

use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;
use NepseAlpha\LaganiViz\Filament\Resources\ShareOwnerships\ShareOwnershipResource;

class EditShareOwnership extends EditRecord
{
    protected static string $resource = ShareOwnershipResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
