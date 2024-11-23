<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Link extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = ['url', 'title', 'user_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
