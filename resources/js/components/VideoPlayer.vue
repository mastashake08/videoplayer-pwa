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
    };

    playerInstance.value = videojs(videoElement.value, options);
};

const getVideoType = (url: string): string => {
    const extension = url.split('.').pop()?.toLowerCase();
    const typeMap: Record<string, string> = {
        mp4: 'video/mp4',
        webm: 'video/webm',
        ogg: 'video/ogg',
        mkv: 'video/x-matroska',
        avi: 'video/x-msvideo',
        mov: 'video/quicktime',
    };
    return typeMap[extension || ''] || 'video/mp4';
};

const updateSource = (src: string) => {
    if (playerInstance.value) {
        playerInstance.value.src({
            src,
            type: getVideoType(src),
        });
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
