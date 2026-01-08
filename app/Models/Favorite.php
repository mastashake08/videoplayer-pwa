<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Favorite extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'video_type',
        'video_identifier',
        'video_identifier_hash',
        'title',
        'thumbnail_url',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($favorite) {
            if (empty($favorite->video_identifier_hash)) {
                $favorite->video_identifier_hash = hash('sha256', $favorite->video_identifier);
            }
        });

        static::updating(function ($favorite) {
            if ($favorite->isDirty('video_identifier')) {
                $favorite->video_identifier_hash = hash('sha256', $favorite->video_identifier);
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isMagnet(): bool
    {
        return $this->video_type === 'magnet';
    }

    public function isUrl(): bool
    {
        return $this->video_type === 'url';
    }
}
