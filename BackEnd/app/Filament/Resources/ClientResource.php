<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ClientResource\Pages;
use App\Filament\Resources\ClientResource\RelationManagers;
use App\Models\Client;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class ClientResource extends Resource
{
    protected static ?string $model = Client::class;

    protected static ?string $navigationIcon = 'heroicon-o-users';

    protected static ?string $pluralLabel = 'Khách Hàng';

    protected static ?int $navigationSort = 5;


    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('name')
                    ->required()
                    ->label('Tên Khách Hàng'),
                // Forms\Components\DatePicker::make('birth')
                //     ->required()
                //     ->maxDate(now())
                //     ->label('Ngày Sinh')
                //     ->date()
                //     ->placeholder('YYYY-MM-DD'),
                Forms\Components\Textarea::make('address')
                    ->label('Địa Chỉ'),
                Forms\Components\TextInput::make('phone')
                    ->tel()
                    ->label('Số Điện Thoại'),
                Forms\Components\TextInput::make('email')
                    ->label('Email')
                    ->email()
                    ->required(),
                Forms\Components\FileUpload::make('avatar')
                    ->label('Hình Ảnh')
                    ->image()
                    ->directory('avatars')
                    ->imagePreviewHeight('200')
                    ->preserveFilenames()
                    ->downloadable()
                    ->openable()
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')->label('Họ Tên')->sortable()->searchable(),
                // Tables\Columns\TextColumn::make('birth')->label('Ngày Sinh')->date(),
                Tables\Columns\TextColumn::make('phone')->label('Số Điện Thoại'),
                Tables\Columns\TextColumn::make('address')->label('Địa Chỉ')->limit(50),
                Tables\Columns\TextColumn::make('email')->sortable(),
                Tables\Columns\ImageColumn::make('avatar')->label('Hình Ảnh')->size(100)->circular(),
            ])
            ->filters([])
            ->actions([
                Tables\Actions\ViewAction::make()->label('Xem'),
                Tables\Actions\EditAction::make()->label('Chỉnh sửa'),
                Tables\Actions\DeleteAction::make()->label('Xóa')
                    ->modalHeading('Xóa Khách Hàng')
                    ->modalDescription('Bạn có chắc chắn muốn xóa khách hàng này ?')
                    ->modalButton('Xóa ngay')
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListClients::route('/'),
            'create' => Pages\CreateClient::route('/create'),
            'edit' => Pages\EditClient::route('/{record}/edit'),
        ];
    }

    public static function getNavigationGroup(): ?string
    {
        return 'Hệ Thống';
    }
}
