window.performCopy = (text) => {
    if (!text.trim()) {
        alert('There is no text to copy.');
        return;
    }
    navigator.clipboard.writeText(text)
        .then(() => alert('Result copied to clipboard!'))
        .catch(() => alert('Failed to copy text.'));
};

window.performDownload = (text) => {
    if (!text.trim()) {
        alert('There is no text to download.');
        return;
    }
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'redacted_output.txt';
    link.click();
    URL.revokeObjectURL(link.href);
};
