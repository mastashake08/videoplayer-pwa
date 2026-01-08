<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import videojs from 'video.js';
import type Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';

interface Props {
    src?: string;
    poster?: string;
    autoplay?: boolean;
    controls?: boolean;
    fluid?: boolean;
    aspectRatio?: string;
}

const props = withDefaults(defineProps<Props>(), {
    controls: true,
    fluid: true,
    aspectRatio: '16:9',
});

const videoElement = ref<HTMLVideoElement | null>(null);
const playerInstance = ref<Player | null>(null);

const initPlayer = () => {
    if (!videoElement.value) return;

    const options = {
        controls: props.controls,
        autoplay: props.autoplay,
        fluid: props.fluid,
        aspectRatio: props.aspectRatio,
        sources: props.src ? [{ src: props.src, type: getVideoType(props.src) }] : [],
        poster: props.poster,
        html5: {
            vhs: {
                overrideNative: true,
            },
            nativeVideoTracks: false,
            nativeAudioTracks: false,
            nativeTextTracks: false,
        },
    };

    playerInstance.value = videojs(videoElement.value, options);
    
    // Add error handling
    playerInstance.value.on('error', () => {
        const error = playerInstance.value?.error();
        console.error('[VideoPlayer] Error:', error);
        if (error) {
            console.error('[VideoPlayer] Error code:', error.code);
            console.error('[VideoPlayer] Error message:', error.message);
            
            // Special message for HLS files loaded locally
            if (props.src?.includes('.m3u8') && (props.src?.startsWith('blob:') || props.src?.startsWith('file:'))) {
                console.error('[VideoPlayer] Note: HLS (.m3u8) files cannot be played from local file system. Please use a remote URL instead.');
            }
        }
    });
    
    // Log loaded source
    playerInstance.value.on('loadedmetadata', () => {
        console.log('[VideoPlayer] Video metadata loaded successfully');
    });
};

const getVideoType = (url: string): string => {
    // Check if it's a blob URL
    if (url.startsWith('blob:')) {
        return 'video/mp4'; // Default to mp4 for blob URLs
    }
    
    const extension = url.split('.').pop()?.toLowerCase().split('?')[0]; // Remove query params
    const typeMap: Record<string, string> = {
        mp4: 'video/mp4',
        webm: 'video/webm',
        ogg: 'video/ogg',
        mkv: 'video/x-matroska',
        avi: 'video/x-msvideo',
        mov: 'video/quicktime',
        m3u8: 'application/x-mpegURL', // HLS streams
        m3u: 'application/x-mpegURL',
    };
    return typeMap[extension || ''] || 'video/mp4';
};

const updateSource = (src: string) => {
    if (playerInstance.value) {
        console.log('[VideoPlayer] Updating source to:', src);
        playerInstance.value.src({
            src,
            type: getVideoType(src),
        });
        playerInstance.value.load();
        console.log('[VideoPlayer] Source updated, player loaded');
    }
};

watch(
    () => props.src,
    (newSrc) => {
        if (newSrc && playerInstance.value) {
            updateSource(newSrc);
        }
    },
);

onMounted(() => {
    initPlayer();
});

onBeforeUnmount(() => {
    if (playerInstance.value) {
        playerInstance.value.dispose();
    }
});

defineExpose({
    player: playerInstance,
    updateSource,
});
</script>

<template>
    <div class="video-player-container">
        <div data-vjs-player>
            <video ref="videoElement" class="video-js vjs-big-play-centered" />
        </div>
    </div>
</template>

<style>
.video-player-container {
    width: 100%;
}

.video-js {
    width: 100%;
    height: 100%;
}

/* Dark theme styling */
.dark .video-js {
    background-color: #000;
}

.vjs-big-play-button {
    border-radius: 50%;
}
</style>
