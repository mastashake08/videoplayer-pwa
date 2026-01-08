<script setup lang="ts">
import WelcomeLayout from '@/layouts/WelcomeLayout.vue';
import VideoPlayer from '@/components/VideoPlayer.vue';
import VideoSourceSelector from '@/components/VideoSourceSelector.vue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileVideo, Upload, Magnet, Link as LinkIcon, Download, Play, Wifi } from 'lucide-vue-next';
import { ref } from 'vue';
import { Link } from '@inertiajs/vue3';
import { dashboard, login, register } from '@/routes';

withDefaults(
    defineProps<{
        canRegister: boolean;
    }>(),
    {
        canRegister: true,
    },
);

const videoSource = ref<string | null>(null);
const sourceType = ref<'local' | 'upload' | 'magnet' | 'remote' | null>(null);

const handleSourceSelected = (url: string, type: 'local' | 'upload' | 'magnet' | 'remote') => {
    videoSource.value = url;
    sourceType.value = type;
};

const features = [
    {
        icon: FileVideo,
        title: 'Local Files',
        description: 'Access videos directly from your device using the File System API',
    },
    {
        icon: Upload,
        title: 'Upload',
        description: 'Upload video files from your computer for immediate playback',
    },
    {
        icon: Magnet,
        title: 'Magnet Links',
        description: 'Stream videos via P2P using WebTorrent technology',
    },
    {
        icon: LinkIcon,
        title: 'Remote URLs',
        description: 'Stream videos directly from any HTTP(S) URL',
    },
    {
        icon: Download,
        title: 'Offline Support',
        description: 'Works offline with cached videos and can be installed as a PWA',
    },
    {
        icon: Wifi,
        title: 'Progressive',
        description: 'Install on any device and use like a native application',
    },
];
</script>

<template>
    <WelcomeLayout>
        <!-- Hero Section -->
        <section class="container space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
            <div class="mx-auto flex max-w-[64rem] flex-col items-center gap-4 text-center">
                <Badge variant="secondary" class="text-sm">
                    <Play class="mr-1 h-3 w-3" />
                    Progressive Web App
                </Badge>
                <h1 class="text-3xl font-bold sm:text-5xl md:text-6xl lg:text-7xl">
                    Play Videos
                    <span class="text-primary">Anywhere</span>
                </h1>
                <p class="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                    A modern video player PWA supporting local files, uploads, magnet links, and remote URLs. 
                    Works offline with video.js and WebTorrent.
                </p>
                <div class="flex gap-4">
                    <Button size="lg" as-child v-if="$page.props.auth.user">
                        <Link :href="dashboard()">
                            Go to Dashboard
                        </Link>
                    </Button>
                    <template v-else>
                        <Button size="lg" as-child>
                            <Link :href="register()" v-if="canRegister">
                                Get Started
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" as-child>
                            <Link :href="login()">
                                Log In
                            </Link>
                        </Button>
                    </template>
                </div>
            </div>
        </section>

        <!-- Demo Section -->
        <section class="container space-y-6 py-8 md:py-12 lg:py-24">
            <div class="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
                <h2 class="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-6xl">
                    Try It Now
                </h2>
                <p class="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                    Choose a video source below and start playing immediately. No account required for the demo.
                </p>
            </div>

            <div class="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
                <!-- Video Player -->
                <div class="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Live Demo Player</CardTitle>
                            <CardDescription v-if="sourceType">
                                Current source: {{ sourceType }}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div v-if="videoSource" class="space-y-4">
                                <VideoPlayer
                                    :src="videoSource"
                                    :controls="true"
                                    :autoplay="false"
                                    :fluid="true"
                                />
                            </div>
                            <div v-else class="flex min-h-[300px] items-center justify-center rounded-lg border border-dashed">
                                <div class="text-center">
                                    <Play class="mx-auto h-12 w-12 text-muted-foreground" />
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
                    <Card class="h-full">
                        <CardHeader>
                            <CardTitle>Choose Source</CardTitle>
                            <CardDescription>
                                Test any video source type
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <VideoSourceSelector @source-selected="handleSourceSelected" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>

        <!-- Features Section -->
        <section class="container space-y-6 py-8 md:py-12 lg:py-24">
            <div class="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
                <h2 class="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-6xl">
                    Features
                </h2>
                <p class="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                    Everything you need for a modern video playback experience
                </p>
            </div>

            <div class="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
                <Card v-for="feature in features" :key="feature.title">
                    <CardHeader>
                        <component :is="feature.icon" class="h-10 w-10 text-primary" />
                        <CardTitle>{{ feature.title }}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p class="text-sm text-muted-foreground">
                            {{ feature.description }}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </section>

        <!-- How It Works Section -->
        <section class="container space-y-6 py-8 md:py-12 lg:py-24">
            <div class="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
                <h2 class="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-6xl">
                    How It Works
                </h2>
                <p class="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                    Four simple ways to play your videos
                </p>
            </div>

            <div class="mx-auto max-w-5xl space-y-8">
                <div class="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <div class="flex items-center gap-4">
                                <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    1
                                </div>
                                <CardTitle>Local Files (File System API)</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p class="text-sm text-muted-foreground">
                                On supported browsers (Chrome, Edge), access videos directly from your file system without uploading. 
                                This is the fastest method and doesn't consume storage.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div class="flex items-center gap-4">
                                <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    2
                                </div>
                                <CardTitle>Upload Files</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p class="text-sm text-muted-foreground">
                                Standard file upload for browsers without File System API support. 
                                Select a video file and it will be loaded into memory for playback.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div class="flex items-center gap-4">
                                <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    3
                                </div>
                                <CardTitle>Magnet Links (WebTorrent)</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p class="text-sm text-muted-foreground">
                                Stream videos via P2P using magnet links. WebTorrent handles the torrent protocol 
                                entirely in the browser with no external software needed.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div class="flex items-center gap-4">
                                <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    4
                                </div>
                                <CardTitle>Remote URLs</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p class="text-sm text-muted-foreground">
                                Stream videos directly from any HTTP(S) URL. Perfect for accessing videos 
                                hosted on servers or CDNs. Supports all common video formats.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>

        <!-- CTA Section -->
        <section class="container py-8 md:py-12 lg:py-24">
            <div class="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
                <h2 class="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-6xl">
                    Ready to Get Started?
                </h2>
                <p class="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                    Create an account to unlock the full video player experience with saved preferences and more.
                </p>
                <div class="flex gap-4">
                    <Button size="lg" as-child v-if="!$page.props.auth.user && canRegister">
                        <Link :href="register()">
                            Sign Up Now
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" as-child v-if="$page.props.auth.user">
                        <Link :href="dashboard()">
                            Go to Dashboard
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    </WelcomeLayout>
</template>
