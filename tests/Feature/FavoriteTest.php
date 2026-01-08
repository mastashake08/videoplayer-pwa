<?php

use App\Models\User;
use App\Models\Favorite;

use function Pest\Laravel\{actingAs, assertDatabaseHas};

beforeEach(function () {
    $this->user = User::factory()->create();
});

test('user can view favorites page', function () {
    actingAs($this->user)
        ->get('/favorites')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Favorites'));
});

test('user can add video to favorites', function () {
    $videoData = [
        'video_type' => 'magnet',
        'video_identifier' => 'magnet:?xt=urn:btih:example',
        'title' => 'Test Video',
    ];

    actingAs($this->user)
        ->post('/favorites', $videoData)
        ->assertRedirect();

    assertDatabaseHas('favorites', [
        'user_id' => $this->user->id,
        'video_type' => 'magnet',
        'video_identifier' => 'magnet:?xt=urn:btih:example',
        'title' => 'Test Video',
    ]);
});

test('user can toggle favorite', function () {
    $videoData = [
        'video_type' => 'url',
        'video_identifier' => 'https://example.com/video.mp4',
        'title' => 'Test Video',
    ];

    // Add to favorites
    actingAs($this->user)
        ->post('/favorites/toggle', $videoData)
        ->assertRedirect();

    assertDatabaseHas('favorites', [
        'user_id' => $this->user->id,
        'video_identifier' => 'https://example.com/video.mp4',
    ]);

    // Remove from favorites
    actingAs($this->user)
        ->post('/favorites/toggle', $videoData)
        ->assertRedirect();

    expect($this->user->favorites()->count())->toBe(0);
});

test('user can remove favorite', function () {
    $favorite = Favorite::create([
        'user_id' => $this->user->id,
        'video_type' => 'magnet',
        'video_identifier' => 'magnet:?xt=urn:btih:example',
        'title' => 'Test Video',
    ]);

    actingAs($this->user)
        ->delete("/favorites/{$favorite->id}")
        ->assertRedirect();

    expect($this->user->favorites()->count())->toBe(0);
});

test('user cannot delete another users favorite', function () {
    $otherUser = User::factory()->create();
    $favorite = Favorite::create([
        'user_id' => $otherUser->id,
        'video_type' => 'magnet',
        'video_identifier' => 'magnet:?xt=urn:btih:example',
        'title' => 'Test Video',
    ]);

    actingAs($this->user)
        ->delete("/favorites/{$favorite->id}")
        ->assertRedirect();

    // Favorite should still exist
    expect(Favorite::find($favorite->id))->not->toBeNull();
});

test('duplicate favorites are prevented', function () {
    $videoData = [
        'video_type' => 'url',
        'video_identifier' => 'https://example.com/video.mp4',
        'title' => 'Test Video',
    ];

    // Add favorite twice
    actingAs($this->user)
        ->post('/favorites', $videoData);

    actingAs($this->user)
        ->post('/favorites', $videoData);

    // Should only have one favorite
    expect($this->user->favorites()->count())->toBe(1);
});

test('favorites are deleted when user is deleted', function () {
    $favorite = Favorite::create([
        'user_id' => $this->user->id,
        'video_type' => 'magnet',
        'video_identifier' => 'magnet:?xt=urn:btih:example',
        'title' => 'Test Video',
    ]);

    $this->user->delete();

    expect(Favorite::find($favorite->id))->toBeNull();
});

test('can check if video is favorited', function () {
    Favorite::create([
        'user_id' => $this->user->id,
        'video_type' => 'url',
        'video_identifier' => 'https://example.com/video.mp4',
        'title' => 'Test Video',
    ]);

    actingAs($this->user)
        ->post('/favorites/check', [
            'video_identifier' => 'https://example.com/video.mp4',
        ])
        ->assertOk()
        ->assertJson(['favorited' => true]);

    actingAs($this->user)
        ->post('/favorites/check', [
            'video_identifier' => 'https://example.com/other.mp4',
        ])
        ->assertOk()
        ->assertJson(['favorited' => false]);
});
