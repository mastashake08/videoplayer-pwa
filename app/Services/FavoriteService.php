<?php

namespace App\Services;

use App\Models\Favorite;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class FavoriteService
{
    public function getFavorites(User $user): Collection
    {
        return $user->favorites()->latest()->get();
    }

    public function addFavorite(
        User $user,
        string $videoType,
        string $videoIdentifier,
        ?string $title = null,
        ?string $thumbnailUrl = null,
        ?array $metadata = null
    ): Favorite {
        return $user->favorites()->updateOrCreate(
            [
                'video_identifier' => $videoIdentifier,
            ],
            [
                'video_type' => $videoType,
                'title' => $title,
                'thumbnail_url' => $thumbnailUrl,
                'metadata' => $metadata,
            ]
        );
    }

    public function removeFavorite(User $user, int $favoriteId): bool
    {
        return $user->favorites()->where('id', $favoriteId)->delete() > 0;
    }

    public function isFavorited(User $user, string $videoIdentifier): bool
    {
        return $user->favorites()
            ->where('video_identifier', $videoIdentifier)
            ->exists();
    }

    public function toggleFavorite(
        User $user,
        string $videoType,
        string $videoIdentifier,
        ?string $title = null,
        ?string $thumbnailUrl = null,
        ?array $metadata = null
    ): array {
        $favorite = $user->favorites()
            ->where('video_identifier', $videoIdentifier)
            ->first();

        if ($favorite) {
            $favorite->delete();

            return ['favorited' => false, 'message' => 'Removed from favorites'];
        }

        $this->addFavorite($user, $videoType, $videoIdentifier, $title, $thumbnailUrl, $metadata);

        return ['favorited' => true, 'message' => 'Added to favorites'];
    }
}
