<?php

namespace App\Filament\Resources\ClientResource\Pages;

use App\Filament\Resources\ClientResource;
use Filament\Actions;
use Filament\Actions\Modal\Actions\Action;
use Filament\Resources\Pages\CreateRecord;
use Filament\Resources\Pages\Actions\CancelAction;

class CreateClient extends CreateRecord
{
    protected static string $resource = ClientResource::class;

    protected static ?string $title = 'Tạo Khách Hàng';

    protected function getFormActions(): array
    {
        return [
            $this->getCreateFormAction()
                ->label('Lưu'),

            \Filament\Actions\Action::make('resetForm')
                ->label('Tạo Lại')
                ->color('gray')
                ->action(fn() => $this->form->fill()),

            $this->getCancelFormAction()
                ->label('Hủy'),
        ];
    }
}
