<?php

namespace App\Http\Controllers;

use App\Services\FavoriteService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FavoriteController extends Controller
{
    public function __construct(
        private FavoriteService $favoriteService
    ) {}

    public function index(Request $request): Response
    {
        $favorites = $this->favoriteService->getFavorites($request->user());

        return Inertia::render('Favorites', [
            'favorites' => $favorites,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'video_type' => 'required|in:magnet,url',
            'video_identifier' => 'required|string',
            'title' => 'nullable|string|max:255',
            'thumbnail_url' => 'nullable|url',
            'metadata' => 'nullable|array',
        ]);

        $this->favoriteService->addFavorite(
            $request->user(),
            $validated['video_type'],
            $validated['video_identifier'],
            $validated['title'] ?? null,
            $validated['thumbnail_url'] ?? null,
            $validated['metadata'] ?? null
        );

        return back()->with('success', 'Added to favorites');
    }

    public function destroy(Request $request, int $id): RedirectResponse
    {
        $this->favoriteService->removeFavorite($request->user(), $id);

        return back()->with('success', 'Removed from favorites');
    }

    public function toggle(Request $request)
    {
        $validated = $request->validate([
            'video_type' => 'required|in:magnet,url',
            'video_identifier' => 'required|string',
            'title' => 'nullable|string|max:255',
            'thumbnail_url' => 'nullable|url',
            'metadata' => 'nullable|array',
        ]);

        $result = $this->favoriteService->toggleFavorite(
            $request->user(),
            $validated['video_type'],
            $validated['video_identifier'],
            $validated['title'] ?? null,
            $validated['thumbnail_url'] ?? null,
            $validated['metadata'] ?? null
        );

        return back()->with('success', $result['message']);
    }

    public function check(Request $request)
    {
        $validated = $request->validate([
            'video_identifier' => 'required|string',
        ]);

        $isFavorited = $this->favoriteService->isFavorited(
            $request->user(),
            $validated['video_identifier']
        );

        return response()->json(['favorited' => $isFavorited]);
    }
}
