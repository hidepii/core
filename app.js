// DOM পুরোপুরি রেডি হওয়ার পর কোড এক্সিকিউট হবে
document.addEventListener('DOMContentLoaded', () => {
    
    // --- অ্যাপ্লিকেশন গ্লোবাল স্টেট (উইন্ডো অবজেক্টে এক্সপোজ করা হয়েছে) ---
    window.AppState = {
        tokenMap: {},
        tokenId: 1
    };

    // DOM এলিমেন্ট সিলেকশন
    const mainTextarea = document.getElementById('main-textarea');
    const filterBtn = document.getElementById('filter-btn');
    const detectedContainer = document.getElementById('detected-container');
    const detectedCount = document.getElementById('detected-count');
    const customFilterInput = document.getElementById('custom-filter-input');
    const customTagsContainer = document.getElementById('custom-tags');
    const wordCharCount = document.getElementById('word-char-count');
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const resetBtn = document.getElementById('reset-btn');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');

    // --- ১. বিল্ট-ইন ফিল্টার PII লজিক ---
    filterBtn.addEventListener('click', () => {
        let text = mainTextarea.value;
        if (!text.trim()) return;

        // pii_detector.js থেকে ইঞ্জিন কল করা হচ্ছে
        if (window.PIIDetector && typeof window.PIIDetector.scan === 'function') {
            const detections = window.PIIDetector.scan(text);
            
            detections.forEach(item => {
                // ইউনিক টোকেন জেনারেট
                let token = `[HIDDEN_${item.type.toUpperCase()}_${window.AppState.tokenId++}]`;
                
                // Regex স্পেশাল ক্যারেক্টার নিরাপদে এস্কেপ করা
                let escapedMatch = item.match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                if (text.match(new RegExp(escapedMatch, 'g'))) {
                    window.AppState.tokenMap[token] = { original: item.match, type: item.type, name: item.name };
                    text = text.replace(new RegExp(escapedMatch, 'g'), token);
                }
            });
        }

        mainTextarea.value = text;
        renderDetectedItems();
        updateWordCharCount();
    });

    // --- ২. টোকেন ব্যাজ রেন্ডারিং ও আনহাইড লজিক ---
    function renderDetectedItems() {
        let text = mainTextarea.value;
        detectedContainer.innerHTML = '';
        
        // বর্তমানে টেক্সটবক্সে সক্রিয় বিল্ট-ইন টোকেন ফিল্টারিং
        let activeTokens = Object.keys(window.AppState.tokenMap).filter(token => text.includes(token) && window.AppState.tokenMap[token].type !== 'custom');
        detectedCount.textContent = activeTokens.length;
        
        if (activeTokens.length === 0) {
            detectedContainer.innerHTML = `
                <div class="empty-state">
                    <svg class="empty-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"></path>
                    </svg>
                    <span>No PII items detected yet.</span>
                </div>`;
            return;
        }
        
        activeTokens.forEach(token => {
            const item = window.AppState.tokenMap[token];
            const pill = document.createElement('div');
            pill.className = 'pii-pill';
            pill.innerHTML = `
                <div class="pill-info">
                    <span class="type-tag type-${item.type}">${item.name}</span>
                    <span class="pill-value" title="${item.original}">${item.original}</span>
                </div>
                <button class="pill-close" data-token="${token}">&times;</button>
            `;
            
            pill.querySelector('.pill-close').addEventListener('click', function() {
                let t = this.getAttribute('data-token');
                restoreText(t);
            });
            
            detectedContainer.appendChild(pill);
        });
    }

    // আনহাইড করার মেইন ফাংশন
    function restoreText(token) {
        if (window.AppState.tokenMap[token]) {
            let text = mainTextarea.value;
            text = text.split(token).join(window.AppState.tokenMap[token].original);
            mainTextarea.value = text;
            
            delete window.AppState.tokenMap[token];
            renderDetectedItems();
            updateWordCharCount();
        }
    }

    // কাউন্টার ফাংশন
    function updateWordCharCount() {
        let text = mainTextarea.value;
        let chars = text.length;
        let words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        wordCharCount.textContent = `${words} words | ${chars} chars`;
    }
    mainTextarea.addEventListener('input', updateWordCharCount);

    // --- অন্যান্য ফাইলের জন্য ফাংশনগুলো গ্লোবালি এক্সপোজ করা হলো ---
    window.AppUtils = {
        restoreText: restoreText,
        updateWordCharCount: updateWordCharCount
    };

    // --- ৩. ড্র্যাগ অ্যান্ড ড্রপ এবং ফাইল আপলোড ---
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => { 
        e.preventDefault(); 
        dropZone.style.borderColor = 'var(--brand-primary)'; 
    });
    
    dropZone.addEventListener('dragleave', () => { 
        dropZone.style.borderColor = 'var(--border-color)'; 
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border-color)';
        if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleFile(e.target.files[0]);
    });
    function handleFile(file) {
        if (file.name.endsWith('.txt')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                mainTextarea.value = e.target.result;
                updateWordCharCount();
            };
            reader.readAsText(file);
        }
    }

    // --- ৪. ইউটিলিটি অ্যাকশনস (কপি, ডাউনলোড, রিসেট) ---
    copyBtn.addEventListener('click', () => {
        if (!mainTextarea.value) return;
        mainTextarea.select();
        navigator.clipboard.writeText(mainTextarea.value).then(() => {
            const oldText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(() => { copyBtn.textContent = oldText; }, 2000);
        });
    });

    downloadBtn.addEventListener('click', () => {
        let text = mainTextarea.value;
        if (!text) return;
        let blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        let a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'redacted_text.txt';
        a.click();
    });

    resetBtn.addEventListener('click', () => {
        mainTextarea.value = '';
        customFilterInput.value = '';
        customTagsContainer.innerHTML = '';
        window.AppState.tokenMap = {};
        window.AppState.tokenId = 1;
        renderDetectedItems();
        updateWordCharCount();
    });
});
