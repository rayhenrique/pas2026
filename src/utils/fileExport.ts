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
        if ('showSaveFilePicker' in window) {
            const handle = await (window as any).showSaveFilePicker({
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
    } catch (err: any) {
        // If user cancels, stop
        if (err.name === 'AbortError') return;
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
