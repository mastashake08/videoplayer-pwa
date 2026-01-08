import { onUnmounted, ref } from 'vue';
import type WebTorrent from 'webtorrent';

export interface TorrentFile {
    name: string;
    length: number;
    path: string;
}

export interface TorrentInfo {
    infoHash: string;
    magnetURI: string;
    name: string;
    files: TorrentFile[];
    progress: number;
    downloadSpeed: number;
    uploadSpeed: number;
    numPeers: number;
}

export function useWebTorrent() {
    const client = ref<WebTorrent.Instance | null>(null);
    const currentTorrent = ref<WebTorrent.Torrent | null>(null);
    const torrentInfo = ref<TorrentInfo | null>(null);
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    const videoURL = ref<string | null>(null);

    // Initialize WebTorrent client
    const initClient = async () => {
        if (client.value) return client.value;

        try {
            const WebTorrentLib = (await import('webtorrent')).default;
            client.value = new WebTorrentLib();
            return client.value;
        } catch (err) {
            error.value = 'Failed to initialize WebTorrent';
            throw err;
        }
    };

    // Load torrent from magnet URI
    const loadMagnet = async (magnetURI: string): Promise<string | null> => {
        isLoading.value = true;
        error.value = null;
        videoURL.value = null;

        try {
            const wtClient = await initClient();

            // Remove existing torrent if any
            if (currentTorrent.value) {
                wtClient.remove(currentTorrent.value);
                currentTorrent.value = null;
            }

            return new Promise((resolve, reject) => {
                wtClient.add(magnetURI, (torrent) => {
                    currentTorrent.value = torrent;

                    // Update torrent info
                    const updateInfo = () => {
                        torrentInfo.value = {
                            infoHash: torrent.infoHash,
                            magnetURI: torrent.magnetURI,
                            name: torrent.name,
                            files: torrent.files.map((f) => ({
                                name: f.name,
                                length: f.length,
                                path: f.path,
                            })),
                            progress: torrent.progress,
                            downloadSpeed: torrent.downloadSpeed,
                            uploadSpeed: torrent.uploadSpeed,
                            numPeers: torrent.numPeers,
                        };
                    };

                    // Find first video file
                    const videoFile = torrent.files.find((file) =>
                        /\.(mp4|webm|ogg|mkv|avi|mov)$/i.test(file.name),
                    );

                    if (!videoFile) {
                        error.value = 'No video file found in torrent';
                        isLoading.value = false;
                        reject(new Error('No video file found'));
                        return;
                    }

                    // Render video file to blob URL
                    videoFile.getBlobURL((err, url) => {
                        if (err) {
                            error.value = 'Failed to load video from torrent';
                            isLoading.value = false;
                            reject(err);
                            return;
                        }

                        videoURL.value = url;
                        isLoading.value = false;
                        updateInfo();

                        // Update info periodically
                        const interval = setInterval(updateInfo, 1000);
                        torrent.once('done', () => {
                            clearInterval(interval);
                            updateInfo();
                        });

                        resolve(url);
                    });
                });

                // Handle errors
                wtClient.on('error', (err) => {
                    error.value = err.message;
                    isLoading.value = false;
                    reject(err);
                });
            });
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to load torrent';
            isLoading.value = false;
            return null;
        }
    };

    // Stop current torrent
    const stopTorrent = () => {
        if (currentTorrent.value && client.value) {
            client.value.remove(currentTorrent.value);
            currentTorrent.value = null;
            torrentInfo.value = null;
        }
        if (videoURL.value) {
            URL.revokeObjectURL(videoURL.value);
            videoURL.value = null;
        }
    };

    // Destroy WebTorrent client
    const destroy = () => {
        stopTorrent();
        if (client.value) {
            client.value.destroy();
            client.value = null;
        }
    };

    // Format bytes to human readable
    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    // Format speed
    const formatSpeed = (bytesPerSecond: number): string => {
        return formatBytes(bytesPerSecond) + '/s';
    };

    // Cleanup on unmount
    onUnmounted(() => {
        destroy();
    });

    return {
        currentTorrent,
        torrentInfo,
        isLoading,
        error,
        videoURL,
        loadMagnet,
        stopTorrent,
        destroy,
        formatBytes,
        formatSpeed,
    };
}
