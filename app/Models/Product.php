<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Http\Controllers\Api\Rule;

class Product extends Model
{
     protected $fillable = [
        'name',
        'description',
        'price',
        'quantity',
        'image',
        'category_id',
    ];
     public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
