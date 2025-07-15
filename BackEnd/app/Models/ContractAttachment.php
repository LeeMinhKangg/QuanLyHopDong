<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContractAttachment extends Model
{
    protected $fillable = [
        'file_name',
        'file_path',
        'contract_id',
        'uploaded_by'
    ];

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }
}
