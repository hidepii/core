// core.js - Advanced High-Precision Metadata Processing Engine (JPG, PNG, PDF)

function processTargetFiles(file, callback) {
    const fileName = file.name.toLowerCase();
    const fileType = file.type || '';
    let logs = [];

    logs.push(`File Name: <strong>${file.name}</strong>`);
    logs.push(`File Size: <strong>${formatBytes(file.size)}</strong>`);
    logs.push(`File Type: <strong>${fileType || 'Unknown'}</strong>`);

    // 1. JPG / PNG / WebP Images (Advanced Canvas Rasterization & Deep Color Profile Stripping)
    if (fileType.startsWith('image/') || fileName.match(/\.(jpg|jpeg|png|webp)$/i)) {
        logs.push(`Advanced Rasterization: <strong>Stripping EXIF, GPS, IPTC, XMP, ICC Profiles & Ancillary Chunks</strong>`);

        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
                
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);

                let targetMime = fileType;
                if (!['image/jpeg', 'image/png', 'image/webp'].includes(targetMime)) {
                    targetMime = fileName.endsWith('.png') ? 'image/png' : 'image/jpeg';
                }

                canvas.toBlob(function(blob) {
                    if (!blob) {
                        logs.push(`Rasterization Fallback: Using raw stream bypass.`);
                        proceedFallback(file, logs, callback);
                        return;
                    }
                    logs.push(`Deep Image Scrub: <strong>100% Sanitized Bitmap Generated</strong>`);
                    const cleanedUrl = URL.createObjectURL(blob);
                    callback(logs, cleanedUrl);
                }, targetMime, 1.0);
            };
            img.onerror = function() {
                logs.push(`Image Decode Error: Corrupted or unsupported image structure.`);
                proceedFallback(file, logs, callback);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    } 
    // 2. PDF Documents (Deep Structural Trailer, Info Dictionary & XMP Stream Decoupling)
    else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        logs.push(`Deep PDF Forensic Engine: <strong>Targeting Trailer, Info Dictionary & XMP Streams</strong>`);

        const reader = new FileReader();
        reader.onload = function(event) {
            const arrayBuffer = event.target.result;
            const decoder = new TextDecoder('latin1');
            let pdfText = decoder.decode(arrayBuffer);

            let scrubbedCount = 0;

            // Neutralize Info Dictionary Fields (both standard text and hex-encoded strings)
            const fieldsToClean = ['Author', 'Creator', 'Producer', 'Title', 'Subject', 'Keywords', 'CreationDate', 'ModDate', 'Trapped'];
            fieldsToClean.forEach(field => {
                const regex = new RegExp(`\\/${field}\\s*\\([^)]*\\)`, 'g');
                if (regex.test(pdfText)) {
                    pdfText = pdfText.replace(regex, `/${field} ()`);
                    scrubbedCount++;
                }
                const hexRegex = new RegExp(`\\/${field}\\s*<[0-9a-fA-F]*>`, 'g');
                if (hexRegex.test(pdfText)) {
                    pdfText = pdfText.replace(hexRegex, `/${field} <>`);
                    scrubbedCount++;
                }
            });

            // Neutralize XMP metadata packets completely by replacing with whitespace blocks (preserving byte lengths)
            const xmpRegex = /<\?xpacket begin[\s\S]*?\?>(?:[\s\S]*?)<\?xpacket end=['"][wW]['"]\?>/g;
            pdfText = pdfText.replace(xmpRegex, (match) => {
                scrubbedCount++;
                return ' '.repeat(match.length);
            });

            // Decouple PDF /Info and /Metadata pointer references in catalogs and trailers
            const infoPointerRegex = /\/Info\s+\d+\s+\d+\s+R/g;
            if (infoPointerRegex.test(pdfText)) {
                pdfText = pdfText.replace(infoPointerRegex, '/Info 0 0 R');
                scrubbedCount++;
            }

            const metadataPointerRegex = /\/Metadata\s+\d+\s+\d+\s+R/g;
            if (metadataPointerRegex.test(pdfText)) {
                pdfText = pdfText.replace(metadataPointerRegex, '/Metadata 0 0 R');
                scrubbedCount++;
            }

            logs.push(`PDF Deep Structural Scrub: <strong>Neutralized ${scrubbedCount} Metadata Nodes, Streams & Pointers</strong>`);

            const encoder = new TextEncoder();
            const cleanBuffer = encoder.encode(pdfText).buffer;
            const blob = new Blob([cleanBuffer], { type: 'application/pdf' });
            const cleanedUrl = URL.createObjectURL(blob);
            callback(logs, cleanedUrl);
        };
        reader.readAsArrayBuffer(file);
    } 
    // 3. Fallback for other files
    else {
        logs.push(`Notice: File format outside primary focus. Performing standard stream bypass.`);
        proceedFallback(file, logs, callback);
    }
}

function proceedFallback(file, logs, callback) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const blob = new Blob([event.target.result], { type: file.type });
        const cleanedUrl = URL.createObjectURL(blob);
        callback(logs, cleanedUrl);
    };
    reader.readAsArrayBuffer(file);
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
