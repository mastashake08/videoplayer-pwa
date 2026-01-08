<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/vue3';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, ExternalLink, Magnet } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import { destroy as favoritesDestroy } from '@/routes/favorites';

interface Favorite {
    id: number;
    video_type: 'magnet' | 'url';
    video_identifier: string;
    title: string | null;
    thumbnail_url: string | null;
    metadata: Record<string, any> | null;
    created_at: string;
}

interface Props {
    favorites: Favorite[];
}

const props = defineProps<Props>();

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Favorites',
    },
];

const playVideo = (favorite: Favorite) => {
    // Navigate to player with the video source
    router.get('/player', {
        source: favorite.video_identifier,
        type: favorite.video_type,
    });
};

const removeFavorite = (id: number) => {
    router.delete(favoritesDestroy(id).url, {
        preserveScroll: true,
        onSuccess: () => {
            toast.success('Removed from favorites');
        },
    });
};

const getVideoIcon = (type: 'magnet' | 'url') => {
    return type === 'magnet' ? Magnet : ExternalLink;
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};
</script>

<template>
    <Head title="Favorites" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
            <!-- Header -->
            <div>
                <h1 class="text-3xl font-bold tracking-tight">Favorites</h1>
                <p class="text-muted-foreground">
                    Your saved videos for quick access
                </p>
            </div>

            <!-- Favorites Grid -->
            <div v-if="favorites.length > 0" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card v-for="favorite in favorites" :key="favorite.id" class="overflow-hidden">
                    <CardHeader class="p-0">
                        <div
                            v-if="favorite.thumbnail_url"
                            class="aspect-video w-full overflow-hidden bg-muted"
                        >
                            <img
                                :src="favorite.thumbnail_url"
                                :alt="favorite.title || 'Video thumbnail'"
                                class="h-full w-full object-cover"
                            />
                        </div>
                        <div
                            v-else
                            class="flex aspect-video w-full items-center justify-center bg-muted"
                        >
                            <component
                                :is="getVideoIcon(favorite.video_type)"
                                class="h-12 w-12 text-muted-foreground"
                            />
                        </div>
                    </CardHeader>
                    <CardContent class="p-4">
                        <div class="space-y-2">
                            <CardTitle class="line-clamp-2 text-lg">
                                {{ favorite.title || 'Untitled Video' }}
                            </CardTitle>
                            <CardDescription class="flex items-center gap-2">
                                <component
                                    :is="getVideoIcon(favorite.video_type)"
                                    class="h-4 w-4"
                                />
                                <span class="capitalize">{{ favorite.video_type }}</span>
                                <span>•</span>
                                <span>{{ formatDate(favorite.created_at) }}</span>
                            </CardDescription>
                            <p class="line-clamp-1 text-xs text-muted-foreground">
                                {{ favorite.video_identifier }}
                            </p>
                        </div>
                        <div class="mt-4 flex gap-2">
                            <Button
                                class="flex-1"
                                @click="playVideo(favorite)"
                            >
                                Play Video
                            </Button>
                            <Button
                                variant="destructive"
                                size="icon"
                                @click="removeFavorite(favorite.id)"
                            >
                                <Trash2 class="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <!-- Empty State -->
            <Card v-else>
                <CardContent class="flex flex-col items-center justify-center p-12">
                    <div class="text-center">
                        <component
                            :is="Magnet"
                            class="mx-auto h-12 w-12 text-muted-foreground"
                        />
                        <h3 class="mt-4 text-lg font-semibold">No favorites yet</h3>
                        <p class="mt-2 text-sm text-muted-foreground">
                            Start adding videos to your favorites for quick access
                        </p>
                        <Button class="mt-6" @click="router.visit('/dashboard')">
                            Go to Dashboard
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    </AppLayout>
</template>
