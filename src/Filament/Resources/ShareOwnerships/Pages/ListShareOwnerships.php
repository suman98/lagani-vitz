<?php

namespace NepseAlpha\LaganiViz\Filament\Resources\ShareOwnerships\Pages;

use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;
use NepseAlpha\LaganiViz\Filament\Resources\ShareOwnerships\ShareOwnershipResource;

class ListShareOwnerships extends ListRecords
{
    protected static string $resource = ShareOwnershipResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
