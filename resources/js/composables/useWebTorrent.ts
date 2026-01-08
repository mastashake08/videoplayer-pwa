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

// Global client shared across all instances of the composable
let globalClient: WebTorrent.Instance | null = null;
let clientRefCount = 0;

export function useWebTorrent() {
    const currentTorrent = ref<WebTorrent.Torrent | null>(null);
    const torrentInfo = ref<TorrentInfo | null>(null);
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    const videoURL = ref<string | null>(null);

    clientRefCount++;
    console.log('[WebTorrent] useWebTorrent() called, ref count:', clientRefCount);

    // Initialize WebTorrent client (singleton)
    const initClient = async () => {
        if (globalClient) {
            console.log('[WebTorrent] Reusing global client, torrents:', globalClient.torrents.length);
            return globalClient;
        }

        try {
            console.log('[WebTorrent] Creating new global client...');
            const WebTorrentModule = await import('webtorrent');
            const WebTorrentLib = WebTorrentModule.default || WebTorrentModule;
            globalClient = new (WebTorrentLib as any)();
            console.log('[WebTorrent] Global client created successfully');
            return globalClient;
        } catch (err) {
            error.value = 'Failed to initialize WebTorrent';
            console.error('[WebTorrent] Initialization error:', err);
            throw err;
        }
    };

    // Process torrent (shared logic for new and existing torrents)
    const processTorrent = (
        torrent: WebTorrent.Torrent,
        resolve: (value: string | null) => void,
        reject: (reason?: any) => void,
    ) => {
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

        const findAndLoadVideo = () => {
            console.log('Torrent ready:', torrent.name);
            console.log('Files:', torrent.files.map((f) => f.name));

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

            console.log('Found video file:', videoFile.name);

            // Stream video file manually to create blob URL
            console.log('[WebTorrent] Creating blob URL from stream...');
            const stream = videoFile.createReadStream();
            const chunks: Uint8Array[] = [];
            
            stream.on('data', (chunk: Uint8Array) => {
                chunks.push(chunk);
            });
            
            stream.on('end', () => {
                console.log('[WebTorrent] Stream ended, creating blob...');
                const blob = new Blob(chunks, { type: 'video/mp4' });
                const objectURL = URL.createObjectURL(blob);
                console.log('[WebTorrent] Blob URL created:', objectURL);
                
                videoURL.value = objectURL;
                isLoading.value = false;
                updateInfo();

                // Update info periodically
                const interval = setInterval(updateInfo, 1000);
                torrent.once('done', () => {
                    clearInterval(interval);
                    updateInfo();
                });

                resolve(objectURL);
            });
            
            stream.on('error', (streamErr: Error) => {
                console.error('[WebTorrent] Stream error:', streamErr);
                error.value = 'Failed to stream video from torrent';
                isLoading.value = false;
                reject(streamErr);
            });
        };

        // Wait for metadata before accessing files
        if (torrent.ready) {
            findAndLoadVideo();
        } else {
            torrent.on('ready', findAndLoadVideo);
        }

        // Handle errors
        torrent.on('error', (err) => {
            console.error('Torrent error:', err);
            error.value = err.message;
            isLoading.value = false;
            reject(err);
        });
    };

    // Load torrent from magnet URI
    const loadMagnet = async (magnetURI: string): Promise<string | null> => {
        console.log('[WebTorrent] loadMagnet called with:', magnetURI.substring(0, 100));
        isLoading.value = true;
        error.value = null;
        videoURL.value = null;

        try {
            // Destroy existing client completely to avoid duplicates
            if (globalClient) {
                console.log('[WebTorrent] Existing global client found with', globalClient.torrents.length, 'torrents');
                console.log('[WebTorrent] Torrent infoHashes:', globalClient.torrents.map(t => t.infoHash));
                console.log('[WebTorrent] Destroying existing client...');
                try {
                    globalClient.destroy();
                    console.log('[WebTorrent] Client destroyed');
                } catch (e) {
                    console.warn('[WebTorrent] Failed to destroy client:', e);
                }
                globalClient = null;
                currentTorrent.value = null;
            } else {
                console.log('[WebTorrent] No existing global client');
            }

            // Create fresh client
            const wtClient = await initClient();
            console.log('[WebTorrent] About to add torrent, current torrents:', wtClient.torrents.length);

            return new Promise((resolve, reject) => {
                console.log('[WebTorrent] Calling wtClient.add()...');
                
                wtClient.add(magnetURI, (torrent) => {
                    console.log('[WebTorrent] Torrent added successfully:', torrent.infoHash);
                    currentTorrent.value = torrent;
                    processTorrent(torrent, resolve, reject);
                });

                // Handle client errors
                wtClient.on('error', (err) => {
                    console.error('[WebTorrent] Client error:', err);
                    console.error('[WebTorrent] Error type:', err.constructor.name);
                    console.error('[WebTorrent] Error message:', err.message);
                    console.error('[WebTorrent] Error stack:', err.stack);
                    error.value = err.message;
                    isLoading.value = false;
                    reject(err);
                });
            });
        } catch (err) {
            console.error('[WebTorrent] Load magnet error:', err);
            error.value = err instanceof Error ? err.message : 'Failed to load torrent';
            isLoading.value = false;
            return null;
        }
    };

    // Stop current torrent
    const stopTorrent = () => {
        if (currentTorrent.value && globalClient) {
            try {
                globalClient.remove(currentTorrent.value.infoHash);
            } catch (e) {
                console.warn('Failed to stop torrent:', e);
            }
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
        clientRefCount--;
        console.log('[WebTorrent] destroy() called, ref count:', clientRefCount);
        
        // Only destroy global client when no more instances are using it
        if (clientRefCount === 0 && globalClient) {
            console.log('[WebTorrent] Last instance, destroying global client');
            globalClient.destroy();
            globalClient = null;
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
