import { ref } from 'vue';

export interface FileSystemHandle {
    kind: 'file' | 'directory';
    name: string;
    isSameEntry(other: FileSystemHandle): Promise<boolean>;
}

export interface FileSystemFileHandle extends FileSystemHandle {
    kind: 'file';
    getFile(): Promise<File>;
}

export interface FileSystemDirectoryHandle extends FileSystemHandle {
    kind: 'directory';
    getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
    getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FileSystemDirectoryHandle>;
    entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
    values(): AsyncIterableIterator<FileSystemHandle>;
}

declare global {
    interface Window {
        showOpenFilePicker?(options?: {
            multiple?: boolean;
            types?: Array<{
                description?: string;
                accept: Record<string, string[]>;
            }>;
            excludeAcceptAllOption?: boolean;
        }): Promise<FileSystemFileHandle[]>;
    }
}

export function useFileSystem() {
    const isSupported = ref(false);
    const error = ref<string | null>(null);

    // Check if File System Access API is supported
    const checkSupport = () => {
        isSupported.value = 'showOpenFilePicker' in window;
        return isSupported.value;
    };

    // Open file picker and return selected files
    const openFilePicker = async (options?: {
        multiple?: boolean;
        accept?: string[];
    }): Promise<File[]> => {
        if (!checkSupport()) {
            error.value = 'File System Access API is not supported in this browser';
            return [];
        }

        try {
            const fileHandles = await window.showOpenFilePicker?.({
                multiple: options?.multiple ?? false,
                types: [
                    {
                        description: 'Video files',
                        accept: {
                            'video/*': options?.accept ?? [
                                '.mp4',
                                '.webm',
                                '.ogg',
                                '.mkv',
                                '.avi',
                                '.mov',
                                '.m3u8',
                                '.m3u',
                            ],
                        },
                    },
                ],
                excludeAcceptAllOption: false,
            });

            if (!fileHandles) {
                return [];
            }

            const files: File[] = [];
            for (const handle of fileHandles) {
                const file = await handle.getFile();
                files.push(file);
            }

            return files;
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                // User cancelled, not an error
                error.value = null;
                return [];
            }
            error.value = err instanceof Error ? err.message : 'Failed to open file picker';
            return [];
        }
    };

    // Create a URL from a file
    const createFileURL = (file: File): string => {
        return URL.createObjectURL(file);
    };

    // Clean up object URL
    const revokeFileURL = (url: string): void => {
        URL.revokeObjectURL(url);
    };

    checkSupport();

    return {
        isSupported,
        error,
        openFilePicker,
        createFileURL,
        revokeFileURL,
    };
}
