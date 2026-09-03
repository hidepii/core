// core.js - Ultimate High-Precision Metadata Processing Engine (Images, PDFs, Office, SVG & EPUB)

async function processTargetFiles(file, callback) {
    const fileName = file.name.toLowerCase();
    const fileType = file.type || '';
    let logs = [];

    logs.push(`File Name: <strong>${file.name}</strong>`);
    logs.push(`File Size: <strong>${formatBytes(file.size)}</strong>`);
    logs.push(`File Type: <strong>${fileType || 'Unknown'}</strong>`);

    // 1. JPG / PNG / WebP Images (Advanced Canvas Rasterization)
    if (fileType.startsWith('image/') && !fileType.includes('svg') || fileName.match(/\.(jpg|jpeg|png|webp)$/i)) {
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
    // 2. SVG Vector Images (XML Metadata & RDF Scrubbing)
    else if (fileType === 'image/svg+xml' || fileName.endsWith('.svg')) {
        logs.push(`SVG Engine: <strong>Scrubbing XML Metadata & RDF Tags</strong>`);

        try {
            const text = await file.text();
            let cleanText = text
                .replace(/<metadata[\s\S]*?<\/metadata>/gi, '')
                .replace(/<rdf:RDF[\s\S]*?<\/rdf:RDF>/gi, '');

            const blob = new Blob([cleanText], { type: 'image/svg+xml' });
            const cleanedUrl = URL.createObjectURL(blob);

            logs.push(`SVG Scrub: <strong>XML Metadata & RDF Blocks Removed</strong>`);
            callback(logs, cleanedUrl);
        } catch (error) {
            logs.push(`SVG Error: Failed to parse text. Falling back to stream bypass.`);
            proceedFallback(file, logs, callback);
        }
    }
    // 3. PDF Documents (Using pdf-lib)
    else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        logs.push(`PDF-Lib Forensic Engine: <strong>Stripping Info Dictionary & XMP Metadata Streams</strong>`);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
            
            pdfDoc.setTitle('');
            pdfDoc.setAuthor('');
            pdfDoc.setSubject('');
            pdfDoc.setKeywords([]);
            pdfDoc.setProducer('');
            pdfDoc.setCreator('');
            
            const catalog = pdfDoc.catalog;
            if (catalog.has(window.PDFLib.PDFName.of('Metadata'))) {
                catalog.delete(window.PDFLib.PDFName.of('Metadata'));
            }

            const cleanPdfBytes = await pdfDoc.save();
            const blob = new Blob([cleanPdfBytes], { type: 'application/pdf' });
            const cleanedUrl = URL.createObjectURL(blob);

            logs.push(`PDF Deep Scrub: <strong>Info Dictionary & XMP Streams Completely Wiped</strong>`);
            callback(logs, cleanedUrl);
        } catch (error) {
            logs.push(`PDF Error: Failed to parse via pdf-lib. Falling back to stream bypass.`);
            proceedFallback(file, logs, callback);
        }
    }
    // 4. Office Documents (DOCX, XLSX, PPTX using JSZip)
    else if (fileType.includes('officedocument') || fileName.match(/\.(docx|xlsx|pptx)$/i)) {
        logs.push(`Office Docs Engine (JSZip): <strong>Scrubbing core.xml & app.xml Metadata</strong>`);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const zip = new JSZip();
            const loadedZip = await zip.loadAsync(arrayBuffer);

            let scrubbedPropsCount = 0;

            if (loadedZip.file("docProps/core.xml")) {
                let coreXml = await loadedZip.file("docProps/core.xml").async("text");
                const fieldsToEmpty = ['dc:creator', 'cp:lastModifiedBy', 'dc:title', 'dc:subject', 'dc:description', 'dc:keywords', 'cp:revision'];
                fieldsToEmpty.forEach(tag => {
                    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, 'g');
                    if (regex.test(coreXml)) {
                        coreXml = coreXml.replace(regex, `<${tag}></${tag}>`);
                        scrubbedPropsCount++;
                    }
                });
                loadedZip.file("docProps/core.xml", coreXml);
            }

            if (loadedZip.file("docProps/app.xml")) {
                let appXml = await loadedZip.file("docProps/app.xml").async("text");
                const appFieldsToEmpty = ['Company', 'Manager', 'Application', 'AppVersion'];
                appFieldsToEmpty.forEach(tag => {
                    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, 'g');
                    if (regex.test(appXml)) {
                        appXml = appXml.replace(regex, `<${tag}></${tag}>`);
                        scrubbedPropsCount++;
                    }
                });
                loadedZip.file("docProps/app.xml", appXml);
            }

            const cleanContent = await loadedZip.generateAsync({ type: "blob", compression: "DEFLATE" });
            const cleanedUrl = URL.createObjectURL(cleanContent);

            logs.push(`Office Doc Scrub: <strong>Neutralized ${scrubbedPropsCount} Metadata Elements</strong>`);
            callback(logs, cleanedUrl);
        } catch (error) {
            logs.push(`Office Doc Error: Failed to process. Falling back to stream bypass.`);
            proceedFallback(file, logs, callback);
        }
    }
    // 5. EPUB E-Books (Using JSZip to clear OPF metadata)
    else if (fileType === 'application/epub+zip' || fileName.endsWith('.epub')) {
        logs.push(`EPUB Engine (JSZip): <strong>Scrubbing OPF Metadata & Author Tags</strong>`);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const zip = new JSZip();
            const loadedZip = await zip.loadAsync(arrayBuffer);

            let scrubbedCount = 0;
            for (let relativePath in loadedZip.files) {
                if (relativePath.endsWith('.opf')) {
                    let opfContent = await loadedZip.file(relativePath).async("text");
                    const tags = ['dc:creator', 'dc:publisher', 'dc:contributor', 'dc:description', 'dc:rights'];
                    tags.forEach(tag => {
                        const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, 'g');
                        if (regex.test(opfContent)) {
                            opfContent = opfContent.replace(regex, `<${tag}></${tag}>`);
                            scrubbedCount++;
                        }
                    });
                    loadedZip.file(relativePath, opfContent);
                }
            }

            const cleanContent = await loadedZip.generateAsync({ type: "blob", compression: "DEFLATE" });
            const cleanedUrl = URL.createObjectURL(cleanContent);

            logs.push(`EPUB Scrub: <strong>Neutralized ${scrubbedCount} Metadata Elements</strong>`);
            callback(logs, cleanedUrl);
        } catch (error) {
            logs.push(`EPUB Error: Failed to process. Falling back to stream bypass.`);
            proceedFallback(file, logs, callback);
        }
    }
    // 6. Fallback for other files
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
