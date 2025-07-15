<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    use HasFactory;

    protected $fillable = ['name',  'birth', 'email', 'phone', 'address', 'avatar'];

    public function contractParticipants(): HasMany
    {
        return $this->hasMany(ContractParticipant::class);
    }
}
