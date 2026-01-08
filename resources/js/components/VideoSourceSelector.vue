<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFileSystem } from '@/composables/useFileSystem';
import { useWebTorrent } from '@/composables/useWebTorrent';
import { FileVideo, Link, Magnet, Upload } from 'lucide-vue-next';
import { ref } from 'vue';

interface Emits {
    (e: 'sourceSelected', url: string, type: 'local' | 'upload' | 'magnet' | 'remote'): void;
}

const emit = defineEmits<Emits>();

const { isSupported: isFileSystemSupported, openFilePicker, createFileURL } = useFileSystem();
const { loadMagnet, isLoading: isTorrentLoading, error: torrentError } = useWebTorrent();

const magnetInput = ref('');
const remoteUrlInput = ref('');
const uploadInput = ref<HTMLInputElement | null>(null);
const isLoading = ref(false);

// Handle File System API
const handleFileSystemPicker = async () => {
    isLoading.value = true;
    try {
        const files = await openFilePicker({ multiple: false });
        if (files.length > 0) {
            const url = createFileURL(files[0]);
            emit('sourceSelected', url, 'local');
        }
    } finally {
        isLoading.value = false;
    }
};

// Handle file upload
const handleFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
        const url = URL.createObjectURL(file);
        emit('sourceSelected', url, 'upload');
    }
};

// Handle magnet link
const handleMagnetLink = async () => {
    if (!magnetInput.value.trim()) return;

    const url = await loadMagnet(magnetInput.value);
    if (url) {
        emit('sourceSelected', url, 'magnet');
    }
};

// Handle remote URL
const handleRemoteUrl = () => {
    if (!remoteUrlInput.value.trim()) return;

    // Basic URL validation
    try {
        new URL(remoteUrlInput.value);
        emit('sourceSelected', remoteUrlInput.value, 'remote');
    } catch {
        alert('Please enter a valid URL');
    }
};
</script>

<template>
    <div class="w-full space-y-4">
        <Tabs default-value="filesystem" class="w-full">
            <TabsList class="grid w-full grid-cols-2 gap-2 md:grid-cols-4">
                <TabsTrigger value="filesystem" :disabled="!isFileSystemSupported" class="gap-1">
                    <FileVideo class="h-4 w-4" />
                    <span class="hidden sm:inline">Local Files</span>
                </TabsTrigger>
                <TabsTrigger value="upload" class="gap-1">
                    <Upload class="h-4 w-4" />
                    <span class="hidden sm:inline">Upload</span>
                </TabsTrigger>
                <TabsTrigger value="magnet" class="gap-1">
                    <Magnet class="h-4 w-4" />
                    <span class="hidden sm:inline">Magnet</span>
                </TabsTrigger>
                <TabsTrigger value="remote" class="gap-1">
                    <Link class="h-4 w-4" />
                    <span class="hidden sm:inline">URL</span>
                </TabsTrigger>
            </TabsList>

            <!-- File System API -->
            <TabsContent value="filesystem" class="space-y-4">
                <div class="space-y-2">
                    <Label>Select video from your device</Label>
                    <p class="text-sm text-muted-foreground">
                        Access videos directly without uploading (supported browsers only)
                    </p>
                    <Button
                        @click="handleFileSystemPicker"
                        :disabled="isLoading"
                        class="w-full"
                    >
                        <FileVideo class="mr-2 h-4 w-4" />
                        {{ isLoading ? 'Loading...' : 'Choose Video File' }}
                    </Button>
                </div>
            </TabsContent>

            <!-- Upload -->
            <TabsContent value="upload" class="space-y-4">
                <div class="space-y-2">
                    <Label for="upload-input">Upload video file</Label>
                    <p class="text-sm text-muted-foreground">
                        Upload a video file from your device
                    </p>
                    <Input
                        id="upload-input"
                        ref="uploadInput"
                        type="file"
                        accept="video/*"
                        @change="handleFileUpload"
                        class="cursor-pointer"
                    />
                </div>
            </TabsContent>

            <!-- Magnet Link -->
            <TabsContent value="magnet" class="space-y-4">
                <div class="space-y-2">
                    <Label for="magnet-input">Magnet URI</Label>
                    <p class="text-sm text-muted-foreground">
                        Stream video via WebTorrent (P2P)
                    </p>
                    <div class="flex gap-2">
                        <Input
                            id="magnet-input"
                            v-model="magnetInput"
                            type="text"
                            placeholder="magnet:?xt=urn:btih:..."
                            class="flex-1"
                        />
                        <Button
                            @click="handleMagnetLink"
                            :disabled="!magnetInput.trim() || isTorrentLoading"
                        >
                            <Magnet class="mr-2 h-4 w-4" />
                            {{ isTorrentLoading ? 'Loading...' : 'Load' }}
                        </Button>
                    </div>
                    <p v-if="torrentError" class="text-sm text-destructive">
                        {{ torrentError }}
                    </p>
                </div>
            </TabsContent>

            <!-- Remote URL -->
            <TabsContent value="remote" class="space-y-4">
                <div class="space-y-2">
                    <Label for="url-input">Video URL</Label>
                    <p class="text-sm text-muted-foreground">
                        Stream video from a remote server
                    </p>
                    <div class="flex gap-2">
                        <Input
                            id="url-input"
                            v-model="remoteUrlInput"
                            type="url"
                            placeholder="https://example.com/video.mp4"
                            class="flex-1"
                        />
                        <Button @click="handleRemoteUrl" :disabled="!remoteUrlInput.trim()">
                            <Link class="mr-2 h-4 w-4" />
                            Load
                        </Button>
                    </div>
                </div>
            </TabsContent>
        </Tabs>
    </div>
</template>
