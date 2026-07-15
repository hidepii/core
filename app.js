/**
 * Pascal Site Security - Application Core (UI & Events)
 */

let customKeywordsArray = [];
let sessionDetectedItems = []; // সেশনে ডিটেক্ট হওয়া সমস্ত ইউনিক আইটেম

// DOM Elements
const mainTextarea = document.getElementById('main-textarea');
const wordCharCount = document.getElementById('word-char-count');
const customFilterInput = document.getElementById('custom-filter-input');
const customTagsHolder = document.getElementById('custom-tags');
const detectedContainer = document.getElementById('detected-container');
const detectedCountBadge = document.getElementById('detected-count');

const filterBtn = document.getElementById('filter-btn');
const downloadBtn = document.getElementById('download-btn');
const copyBtn = document.getElementById('copy-btn');
const copyText = document.getElementById('copy-text');
const resetBtn = document.getElementById('reset-btn');

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');

// --- ১. কাস্টম কিওয়ার্ড ট্যাগ ম্যানেজমেন্ট ---

customFilterInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        addCustomKeyword(customFilterInput.value);
    }
});

function addCustomKeyword(value) {
    let cleanValue = value.trim().replace(/,$/, '');
    if (cleanValue && !customKeywordsArray.includes(cleanValue)) {
        customKeywordsArray.push(cleanValue);
        renderTags();
    }
    customFilterInput.value = '';
}

function renderTags() {
    customTagsHolder.innerHTML = '';
    customKeywordsArray.forEach((keyword, index) => {
        const tag = document.createElement('div');
        tag.className = 'tag';
        tag.innerHTML = `
            <span>${keyword}</span>
            <button onclick="removeTag(${index})">&times;</button>
        `;
        customTagsHolder.appendChild(tag);
    });
}

window.removeTag = function(index) {
    customKeywordsArray.splice(index, 1);
    renderTags();
};

// --- ২. ফাইল আপলোড ও ড্র্যাগ অ্যান্ড ড্রপ ---

dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--primary)';
    dropZone.style.backgroundColor = '#eff6ff';
});

dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = '#cbd5e1';
    dropZone.style.backgroundColor = '#f8fafc';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#cbd5e1';
    dropZone.style.backgroundColor = '#f8fafc';
    if (e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

function handleFile(file) {
    if (file.type !== 'text/plain' && !file.name.endsWith('.txt')) {
        alert('Please upload a valid .txt file.');
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        mainTextarea.value = e.target.result;
        updateCounts();
    };
    reader.readAsText(file);
}

// --- ৩. টেক্সট কাউন্টার ---

mainTextarea.addEventListener('input', updateCounts);

function updateCounts() {
    const text = mainTextarea.value;
    const chars = text.length;
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    wordCharCount.textContent = `${words} words | ${chars} chars`;
}

// --- ৪. অ্যাকশন বাটন ইভেন্টস ---

// FILTER PII BUTTON
filterBtn.addEventListener('click', () => {
    if (customFilterInput.value.trim() !== '') {
        addCustomKeyword(customFilterInput.value);
    }

    const text = mainTextarea.value;
    if (!text.trim()) return;

    const result = redactPII(text, customKeywordsArray);

    // বাগ ফিক্স: শুধুমাত্র ইউনিক আইটেমগুলোকে সেশনে পুশ করা হচ্ছে (ডুপ্লিকেট রিমুভ)
    result.detectedItems.forEach(newItem => {
        const isDuplicate = sessionDetectedItems.some(
            item => item.type === newItem.type && item.value.toLowerCase() === newItem.value.toLowerCase()
        );
        if (!isDuplicate) {
            sessionDetectedItems.push(newItem);
        }
    });

    mainTextarea.value = result.redactedText;
    updateCounts();
    renderDetectedItems(sessionDetectedItems); 
});

// DOWNLOAD BUTTON
downloadBtn.addEventListener('click', () => {
    const text = mainTextarea.value;
    if (!text.trim()) return;
    
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'redacted_text.txt';
    a.click();
    URL.revokeObjectURL(url);
});

// COPY ALL BUTTON
copyBtn.addEventListener('click', () => {
    const text = mainTextarea.value;
    if (!text.trim()) return;

    navigator.clipboard.writeText(text).then(() => {
        const originalText = copyText.textContent;
        copyText.textContent = 'Copied!';
        setTimeout(() => {
            copyText.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
});

// RESET BUTTON
resetBtn.addEventListener('click', () => {
    mainTextarea.value = '';
    customFilterInput.value = '';
    customKeywordsArray = [];
    sessionDetectedItems = []; 
    
    renderTags();
    updateCounts();
    
    detectedCountBadge.textContent = '0';
    detectedContainer.innerHTML = `
        <div class="empty-state">
            <svg class="empty-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"></path></svg>
            <span>No PII items detected yet.</span>
        </div>
    `;
});

// --- ৫. ডিটেক্টেড আইটেম রেন্ডারিং (ইউনিক গ্লোবাল রিপ্লেসমেন্ট ও স্মার্ট স্পেসিং সহ) ---

function renderDetectedItems(items) {
    detectedCountBadge.textContent = items.length;
    
    if (items.length === 0) {
        detectedContainer.innerHTML = `
            <div class="empty-state">
                <svg class="empty-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"></path></svg>
                <span>No PII items detected yet.</span>
            </div>
        `;
        return;
    }

    detectedContainer.innerHTML = ''; 
    
    items.forEach((item) => {
        const pill = document.createElement('div');
        pill.className = 'pii-pill';
        
        let typeClass = 'type-custom';
        let placeholderText = '[REDACTED]';
        
        if (item.type === 'email') { typeClass = 'type-email'; placeholderText = '[EMAIL]'; }
        else if (item.type === 'phone') { typeClass = 'type-phone'; placeholderText = '[PHONE]'; }
        else if (item.type === 'ip') { typeClass = 'type-ip'; placeholderText = '[IP_ADDRESS]'; }
        else if (item.type === 'card') { typeClass = 'type-card'; placeholderText = '[CARD_NUMBER]'; }

        pill.innerHTML = `
            <div class="pill-info">
                <span class="type-tag ${typeClass}">${item.type}</span>
                <span class="pill-value" title="${item.value}">${item.value}</span>
            </div>
        `;
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'pill-close';
        closeBtn.innerHTML = '&times;';
        
        closeBtn.addEventListener('click', () => {
            let currentText = mainTextarea.value;
            
            if (item.type === 'custom') {
                // কাস্টম কিওয়ার্ডের ক্ষেত্রে টেক্সটের সব জায়গায় একসাথে গ্লোবাল আনহাইড করা হচ্ছে
                mainTextarea.value = currentText.replaceAll(placeholderText, (match, offset) => {
                    let replacement = item.value;
                    
                    // স্মার্ট লেফট স্পেসিং চেক
                    if (offset > 0) {
                        let charBefore = currentText.charAt(offset - 1);
                        if (charBefore !== ' ' && charBefore !== '\n' && charBefore !== '\t') {
                            replacement = ' ' + replacement;
                        }
                    }
                    // স্মার্ট রাইট স্পেসিং চেক
                    let nextIndex = offset + match.length;
                    if (nextIndex < currentText.length) {
                        let charAfter = currentText.charAt(nextIndex);
                        if (charAfter !== ' ' && charAfter !== '\n' && charAfter !== '\t') {
                            replacement = replacement + ' ';
                        }
                    }
                    return replacement;
                });
            } else {
                // অন্যান্য PII (ইমেইল/ফোন)-এর জন্য পূর্বের নিখুঁত N-th পজিশন ভিত্তিক সিঙ্গেল আনহাইড মেথড
                let targetIndex = currentText.indexOf(placeholderText);
                if (targetIndex !== -1) {
                    let replacement = item.value;
                    
                    if (targetIndex > 0) {
                        let charBefore = currentText.charAt(targetIndex - 1);
                        if (charBefore !== ' ' && charBefore !== '\n' && charBefore !== '\t') {
                            replacement = ' ' + replacement;
                        }
                    }
                    let nextIndex = targetIndex + placeholderText.length;
                    if (nextIndex < currentText.length) {
                        let charAfter = currentText.charAt(nextIndex);
                        if (charAfter !== ' ' && charAfter !== '\n' && charAfter !== '\t') {
                            replacement = replacement + ' ';
                        }
                    }
                    
                    mainTextarea.value = currentText.substring(0, targetIndex) + replacement + currentText.substring(nextIndex);
                }
            }
            
            // সেশন ট্র্যাকার থেকে আইটেমটি রিমুভ করা
            const itemIndex = sessionDetectedItems.indexOf(item);
            if (itemIndex !== -1) {
                sessionDetectedItems.splice(itemIndex, 1);
            }
            
            renderDetectedItems(sessionDetectedItems);
            updateCounts();
        });
        
        pill.appendChild(closeBtn);
        detectedContainer.appendChild(pill);
    });
}
