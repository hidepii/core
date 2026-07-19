document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('text-input');
    const wordCharCount = document.getElementById('word-char-count');
    const uploadTrigger = document.getElementById('upload-trigger');
    const hiddenFileInput = document.getElementById('hidden-file-input');
    
    const scanBtn = document.getElementById('scan-btn');
    const detectedItemsContainer = document.getElementById('detected-items-container');
    const detectedCountBadge = document.getElementById('detected-count');
    const emptyStateMsg = document.getElementById('empty-state-msg');
    
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    const resetBtn = document.getElementById('reset-btn');

    // Safe Core State Memory
    let originalText = '';
    let activeDetectedPII = [];
    let whitelistedPII = []; // ইউজার যে PII গুলো ক্রস করে বাদ দিয়েছেন তাদের মেমোরি
    let isFiltered = false;
    let savedReplacements = []; // মাস্কড টোকেনের পজিশন ট্র্যাকিং
    let oldValue = ''; // রিয়েল-টাইম ইনপুট ডেল্টা ট্র্যাকিংয়ের জন্য মেমোরি বাফার

    function updateCounts() {
        const text = textInput.value.trim();
        const chars = textInput.value.length;
        const words = text === '' ? 0 : text.split(/\s+/).length;
        wordCharCount.textContent = `${words} words | ${chars} chars`;
    }

    // ১. প্রোঅ্যাক্টিভ কীবোর্ড শিল্ড (টোকেন মোডে এক ক্লিকে পুরো টোকেন ডিলিট)
    textInput.addEventListener('keydown', (e) => {
        if (!isFiltered) return;

        const start = textInput.selectionStart;
        const end = textInput.selectionEnd;

        if (start === end) {
            if (e.key === 'Backspace') {
                let targetIdx = savedReplacements.findIndex(t => start > t.start && start <= t.end);
                if (targetIdx !== -1) {
                    e.preventDefault();
                    deleteTokenAtIndex(targetIdx);
                }
            } else if (e.key === 'Delete') {
                let targetIdx = savedReplacements.findIndex(t => start >= t.start && start < t.end);
                if (targetIdx !== -1) {
                    e.preventDefault();
                    deleteTokenAtIndex(targetIdx);
                }
            }
        }
    });

    // টোকেন মেমোরি ও স্ক্রিন থেকে একবারে মুছে ফেলার মেথড
    function deleteTokenAtIndex(index) {
        const token = savedReplacements[index];
        
        // ব্যাকএন্ড অরিজিনাল মেমোরি থেকে আসল টেক্সট বাদ দেওয়া
        originalText = originalText.substring(0, token.origStart) + originalText.substring(token.origEnd);
        
        // ফ্রন্টএন্ড ভিউপোর্ট থেকে মাস্ক টোকেনটি রিমুভ করা
        const textBefore = textInput.value.substring(0, token.start);
        const textAfter = textInput.value.substring(token.end);
        textInput.value = textBefore + textAfter;
        
        textInput.setSelectionRange(token.start, token.start);
        
        // গ্লোবাল স্টেট রি-প্রসেস করা
        processGlobalFiltering();
    }

    // ২. শক্তিশালী রিয়েল-টাইম ইনপুট ডেল্টা ট্র্যাকার (বাগ ফিক্স ইঞ্জিন)
    textInput.addEventListener('input', () => {
        const newValue = textInput.value;
        
        if (!isFiltered) {
            originalText = newValue;
            oldValue = newValue;
            updateCounts();
        } else {
            // ফিল্টার থাকা অবস্থায় নতুন টেক্সট লিখলে বা কাটলে তার তফাৎ (Delta) বের করা
            const deltaLen = newValue.length - oldValue.length;
            const changeStart = textInput.selectionStart - (deltaLen > 0 ? deltaLen : 0);

            // মাস্কড পজিশনকে অরিজিনাল টেক্সটের ইনডেক্সের সাথে ম্যাপ করা
            let originalPos = changeStart;
            savedReplacements.forEach(t => {
                if (t.start <= changeStart) {
                    originalPos += (t.value.length - t.mask.length);
                }
            });

            // ব্যাকএন্ড অরিজিনাল টেক্সট মেমোরি রিয়েল-টাইম সিঙ্ক করা
            if (deltaLen > 0) {
                const addedText = newValue.substring(changeStart, changeStart + deltaLen);
                originalText = originalText.substring(0, originalPos) + addedText + originalText.substring(originalPos);
            } else if (deltaLen < 0) {
                const deletedCount = Math.abs(deltaLen);
                originalText = originalText.substring(0, originalPos) + originalText.substring(originalPos + deletedCount);
            }

            // বিদ্যমান মাস্ক টোকেনগুলোর কোঅর্ডিনেট পজিশন ডাইনামিকালি শিফট করা
            savedReplacements.forEach(t => {
                if (t.start >= changeStart) {
                    t.start += deltaLen;
                    t.end += deltaLen;
                    t.origStart += deltaLen;
                    t.origEnd += deltaLen;
                }
            });

            oldValue = newValue;
            updateCounts();
        }
    });

    // ফাইল আপলোড মেকানিজম
    uploadTrigger.addEventListener('click', () => hiddenFileInput.click());
    hiddenFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            originalText = evt.target.result;
            textInput.value = originalText;
            oldValue = originalText;
            isFiltered = false;
            whitelistedPII = [];
            savedReplacements = [];
            updateCounts();
        };
        reader.readAsText(file);
        hiddenFileInput.value = '';
    });

    // ৩. গ্লোবাল বাটন পাইপলাইন ইঞ্জিন (হোয়াইটলিস্ট প্রোটেকশনসহ টু-পাস প্রসেসিং)
    function processGlobalFiltering() {
        // পাস ০: ইউজার যে PII গুলো ক্রস করে দিয়েছেন, অরিজিনাল টেক্সটে তাদের পজিশন বের করে "সেফ জোন" লক করা
        let whitelistZones = [];
        whitelistedPII.forEach(val => {
            const safeValue = val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(safeValue, 'g');
            let match;
            while ((match = regex.exec(originalText)) !== null) {
                whitelistZones.push({
                    index: match.index,
                    endIndex: match.index + match[0].length
                });
            }
        });

        // পাস ১: একটিভ PII (Email, Phone, IP) খোঁজা এবং পজিশন লক করা
        let piiMatches = [];
        activeDetectedPII.forEach(item => {
            const safeValue = item.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(safeValue, 'g');
            let mask = '[REDACTED]';
            if (item.type === 'email') mask = '[EMAIL]';
            else if (item.type === 'phone') mask = '[PHONE]';
            else if (item.type === 'ip') mask = '[IP]';

            let match;
            while ((match = regex.exec(originalText)) !== null) {
                piiMatches.push({
                    index: match.index,
                    endIndex: match.index + match[0].length,
                    value: match[0],
                    mask: mask,
                    type: item.type
                });
            }
        });

        // পাস ২: কাস্টম কিওয়ার্ড ফিল্টারিং (সেফ জোন এবং PII ওভারল্যাপ প্রোটেকশনসহ)
        let customMatches = [];
        if (typeof window.getCustomKeywords === 'function') {
            const customWords = window.getCustomKeywords();
            customWords.forEach(word => {
                if (!word) return;
                const safeWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                
                // খাঁটি ইংরেজি বাউন্ডারি রেগুলার এক্সপ্রেশন
                const regex = new RegExp(`(?<![a-zA-Z0-9])${safeWord}(?![a-zA-Z0-9])`, 'gi');
                let match;
                while ((match = regex.exec(originalText)) !== null) {
                    let matchStart = match.index;
                    let matchEnd = match.index + match[0].length;

                    // চেক ১: কিওয়ার্ডটি কোনো একটিভ PII (যেমন অন্য কোনো ইমেইল)-এর ভেতরে ঢুকে গেছে কি না
                    let overlapsWithPII = piiMatches.some(pii => {
                        return !(matchEnd <= pii.index || matchStart >= pii.endIndex);
                    });

                    // চেক ২: কিওয়ার্ডটি কি ইউজারের ক্রস করে দেওয়া "হোয়াইটলিস্টেড সেফ জোন" এর ভেতরে পড়েছে কি না
                    let overlapsWithWhitelist = whitelistZones.some(w => {
                        return !(matchEnd <= w.index || matchStart >= w.endIndex);
                    });

                    // কোনো প্রকার কনফ্লিক্ট বা ওভারল্যাপ না থাকলেই কেবল এটি মাস্কিং তালিকায় যুক্ত হবে
                    if (!overlapsWithPII && !overlapsWithWhitelist) {
                        customMatches.push({
                            index: matchStart,
                            endIndex: matchEnd,
                            value: match[0],
                            mask: '[REDACTED]',
                            type: 'custom'
                        });
                    }
                }
            });
        }

        // সব একটিভ ম্যাচ একসাথে করে ক্রমানুসারে সাজানো
        let allMatches = [...piiMatches, ...customMatches];
        allMatches.sort((a, b) => a.index - b.index);

        // চূড়ান্ত ওভারল্যাপ ফিল্টারিং
        let filteredMatches = [];
        let lastEndIndex = 0;
        allMatches.forEach(m => {
            if (m.index >= lastEndIndex) {
                filteredMatches.push(m);
                lastEndIndex = m.endIndex;
            }
        });

        // মাস্কড টেক্সট জেনারেশন ও স্ক্রিন কোঅর্ডিনেট ম্যাপিং
        let processedText = '';
        let currentIdx = 0;
        savedReplacements = [];

        filteredMatches.forEach(m => {
            processedText += originalText.substring(currentIdx, m.index);
            
            let startInMasked = processedText.length;
            processedText += m.mask;
            let endInMasked = processedText.length;

            savedReplacements.push({ 
                mask: m.mask, 
                value: m.value, 
                start: startInMasked, 
                end: endInMasked,
                origStart: m.index,
                origEnd: m.endIndex
            });
            
            currentIdx = m.endIndex;
        });
        processedText += originalText.substring(currentIdx);

        // টেক্সটবক্সের ভিউ ও বাফার আপডেট করা
        textInput.value = processedText;
        isFiltered = savedReplacements.length > 0;
        oldValue = processedText;
        updateCounts();
    }

    // `custom_filter.js` যাতে রিঅ্যাক্টিভলি আপডেট করতে পারে তার জন্য গ্লোবাল গেটওয়ে এক্সপোজ করা
    window.syncAndRenderText = processGlobalFiltering;

    // ৪. গ্লোবাল স্ক্যান বাটন ক্লিক অ্যাকশন
    scanBtn.addEventListener('click', () => {
        if (typeof window.scanStandardPII === 'function') {
            whitelistedPII = []; // নতুন করে স্ক্যান করলে আগের হোয়াইটলিস্ট রিসেট হবে
            activeDetectedPII = window.scanStandardPII(originalText);
            updatePillUI();
            processGlobalFiltering();
        }
    });

    // PII পিল UI রেন্ডারার
    function updatePillUI() {
        const pills = detectedItemsContainer.querySelectorAll('.pii-pill');
        pills.forEach(p => p.remove());
        detectedCountBadge.textContent = activeDetectedPII.length;

        if (activeDetectedPII.length === 0) {
            emptyStateMsg.style.display = 'flex';
            return;
        }
        emptyStateMsg.style.display = 'none';

        activeDetectedPII.forEach((item, index) => {
            const pill = document.createElement('div');
            pill.className = 'pii-pill';
            pill.innerHTML = `
                <div class="pill-info">
                    <span class="type-tag type-${item.type}">${item.type}</span>
                    <span class="pill-value" title="${item.value}">${item.value}</span>
                </div>
                <button class="pill-close">&times;</button>
            `;
            
            pill.querySelector('.pill-close').addEventListener('click', () => {
                const removedItem = activeDetectedPII.splice(index, 1)[0];
                if (removedItem) {
                    whitelistedPII.push(removedItem.value);
                }
                updatePillUI();
                processGlobalFiltering();
            });
            
            detectedItemsContainer.appendChild(pill);
        });
    }

    // গ্লোবাল অ্যাকশন বাটনসমূহ (Copy, Download, Reset)
    copyBtn.addEventListener('click', () => {
        if (typeof window.performCopy === 'function') window.performCopy(textInput.value);
    });

    downloadBtn.addEventListener('click', () => {
        if (typeof window.performDownload === 'function') window.performDownload(textInput.value);
    });

    resetBtn.addEventListener('click', () => {
        originalText = '';
        textInput.value = '';
        oldValue = '';
        activeDetectedPII = [];
        whitelistedPII = [];
        isFiltered = false;
        savedReplacements = [];
        updatePillUI();
        updateCounts();
        if (typeof window.clearCustomKeywords === 'function') window.clearCustomKeywords();
    });
});
