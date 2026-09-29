interface SaveFilePickerHandle {
    createWritable: () => Promise<{
        write: (blob: Blob) => Promise<void>;
        close: () => Promise<void>;
    }>;
}

interface SaveFilePickerWindow extends Window {
    showSaveFilePicker?: (options: {
        suggestedName: string;
        types: Array<{
            description: string;
            accept: Record<string, string[]>;
        }>;
    }) => Promise<SaveFilePickerHandle>;
}

/**
 * Utility to save files using the File System Access API with a fallback to traditional download.
 */
export async function saveFileWithPicker(
    content: Blob | string,
    defaultFileName: string,
    mimeType: string,
    extensions: string[]
): Promise<void> {
    // Convert string to Blob if necessary
    const blob = typeof content === 'string'
        ? new Blob([content], { type: mimeType })
        : content;

    try {
        // Try using File System Access API
        const saveWindow = window as SaveFilePickerWindow;
        if (saveWindow.showSaveFilePicker) {
            const handle = await saveWindow.showSaveFilePicker({
                suggestedName: defaultFileName,
                types: [{
                    description: 'Exported File',
                    accept: { [mimeType]: extensions },
                }],
            });

            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
            return;
        }
    } catch (err: unknown) {
        // If user cancels, stop
        if (err instanceof Error && err.name === 'AbortError') return;
        // Otherwise propagate error only if critical, but for now we fallback
        console.warn("File System Access API failed or rejected, falling back to download", err);
    }

    // Fallback to traditional download
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = defaultFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
