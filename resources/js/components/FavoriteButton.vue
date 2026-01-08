<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/vue3';
import { Heart } from 'lucide-vue-next';
import { computed, ref, watch } from 'vue';
import { toast } from 'vue-sonner';
import { toggle as favoritesToggle } from '@/routes/favorites';

interface Props {
    videoType: 'magnet' | 'url';
    videoIdentifier: string;
    title?: string;
    thumbnailUrl?: string;
    metadata?: Record<string, any>;
    isFavorited?: boolean;
    variant?: 'default' | 'ghost' | 'outline';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

const props = withDefaults(defineProps<Props>(), {
    isFavorited: false,
    variant: 'outline',
    size: 'default',
});

const favorited = ref(props.isFavorited);

// Watch for prop changes
watch(() => props.isFavorited, (newValue) => {
    favorited.value = newValue;
});

const toggleFavorite = () => {
    router.post(
        favoritesToggle().url,
        {
            video_type: props.videoType,
            video_identifier: props.videoIdentifier,
            title: props.title,
            thumbnail_url: props.thumbnailUrl,
            metadata: props.metadata,
        },
        {
            preserveScroll: true,
            onSuccess: (page) => {
                favorited.value = !favorited.value;
                const message = favorited.value ? 'Added to favorites' : 'Removed from favorites';
                toast.success(message);
            },
            onError: (errors) => {
                toast.error('Failed to update favorites');
            },
        }
    );
};

const buttonClass = computed(() => {
    return favorited.value ? 'text-red-500 hover:text-red-600' : '';
});

const iconClass = computed(() => {
    return favorited.value ? 'fill-current' : '';
});
</script>

<template>
    <Button
        :variant="variant"
        :size="size"
        :class="buttonClass"
        @click="toggleFavorite"
    >
        <Heart :class="['h-4 w-4', iconClass]" />
        <span v-if="size !== 'icon'" class="ml-2">
            {{ favorited ? 'Favorited' : 'Add to Favorites' }}
        </span>
    </Button>
</template>
