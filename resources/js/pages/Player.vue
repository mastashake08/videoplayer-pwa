<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/vue3';
import { ref } from 'vue';
import VideoPlayer from '@/components/VideoPlayer.vue';
import VideoSourceSelector from '@/components/VideoSourceSelector.vue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-vue-next';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Video Player',
        href: '/player',
    },
];

const videoSource = ref<string | null>(null);
const sourceType = ref<'local' | 'upload' | 'magnet' | 'remote' | null>(null);
const videoPlayer = ref<InstanceType<typeof VideoPlayer> | null>(null);

const handleSourceSelected = (url: string, type: 'local' | 'upload' | 'magnet' | 'remote') => {
    videoSource.value = url;
    sourceType.value = type;
};

const getSourceTypeLabel = () => {
    const labels = {
        local: 'Local File (File System API)',
        upload: 'Uploaded File',
        magnet: 'Magnet Link (WebTorrent)',
        remote: 'Remote URL',
    };
    return sourceType.value ? labels[sourceType.value] : '';
};
</script>

<template>
    <Head title="Video Player" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
            <!-- Header -->
            <div>
                <h1 class="text-3xl font-bold tracking-tight">Video Player</h1>
                <p class="text-muted-foreground">
                    Play videos from multiple sources with offline support
                </p>
            </div>

            <div class="grid gap-6 lg:grid-cols-3">
                <!-- Video Player -->
                <div class="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Player</CardTitle>
                            <CardDescription v-if="sourceType">
                                Source: {{ getSourceTypeLabel() }}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div v-if="videoSource" class="space-y-4">
                                <VideoPlayer
                                    ref="videoPlayer"
                                    :src="videoSource"
                                    :controls="true"
                                    :autoplay="false"
                                    :fluid="true"
                                />
                            </div>
                            <div v-else class="flex items-center justify-center rounded-lg border border-dashed border-sidebar-border/70 p-12 dark:border-sidebar-border">
                                <div class="text-center">
                                    <Info class="mx-auto h-12 w-12 text-muted-foreground" />
                                    <p class="mt-4 text-sm text-muted-foreground">
                                        Select a video source to start playing
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <!-- Source Selector -->
                <div class="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Video Source</CardTitle>
                            <CardDescription>
                                Choose how to load your video
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <VideoSourceSelector @source-selected="handleSourceSelected" />
                        </CardContent>
                    </Card>

                    <!-- Info Alert -->
                    <Alert class="mt-4">
                        <Info class="h-4 w-4" />
                        <AlertDescription>
                            <strong>PWA Features:</strong> This app works offline and can be installed on your device. Videos are cached for offline playback.
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        </div>
    </AppLayout>
</template>
