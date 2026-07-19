// Strictly scans only standard auto-PII expressions
window.scanStandardPII = (sourceText) => {
    let detectedItems = [];
    const regexPatterns = {
        email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
        phone: /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
        ip: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g
    };

    Object.entries(regexPatterns).forEach(([type, regex]) => {
        let match;
        regex.lastIndex = 0;
        while ((match = regex.exec(sourceText)) !== null) {
            if (!detectedItems.some(item => item.value === match[0])) {
                detectedItems.push({ type, value: match[0] });
            }
        }
    });
    return detectedItems;
};
