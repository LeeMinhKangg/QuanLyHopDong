<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;  
use Illuminate\Notifications\Notifiable;                
use Laravel\Sanctum\HasApiTokens;    
class Client extends Model
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = ['name',  'birth', 'email', 'phone', 'address', 'avatar','password', 'company_name','company_name','tax_code',];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'birth' => 'date',
        'password' => 'hashed',
    ];

    public function contractParticipants(): HasMany
    {
        return $this->hasMany(ContractParticipant::class);
    }
}
