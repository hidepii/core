const hiddenDefaultKeywords = ['fuck', 'israel'];
const userKeywords = new Set();

const customKeywordInput = document.getElementById('custom-keyword-input');
const addKeywordBtn = document.getElementById('add-keyword-btn');
const customTagsContainer = document.getElementById('custom-tags-container');

window.getCustomKeywords = () => {
    return [...hiddenDefaultKeywords, ...Array.from(userKeywords)];
};

window.clearCustomKeywords = () => {
    userKeywords.clear();
    customKeywordInput.value = '';
    renderCustomTags();
};

const addCustomKeyword = () => {
    const value = customKeywordInput.value.trim();
    if (!value) return;
    
    if (!userKeywords.has(value.toLowerCase())) {
        userKeywords.add(value.toLowerCase());
        renderCustomTags();
        
        // Encrypt and log to console immediately upon addition
        const encryptedHash = btoa(encodeURIComponent(value.toLowerCase()));
        console.log(`%c[CUSTOM FILTERED]: ${encryptedHash}`, 'color: #00bcd4; font-weight: bold;');
        
        // Reactive text update trigger
        if (typeof window.syncAndRenderText === 'function') {
            window.syncAndRenderText();
        }
    }
    customKeywordInput.value = '';
};

addKeywordBtn.addEventListener('click', addCustomKeyword);
customKeywordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        addCustomKeyword();
    }
});

function renderCustomTags() {
    customTagsContainer.innerHTML = '';
    userKeywords.forEach(keyword => {
        const tagEl = document.createElement('div');
        tagEl.className = 'tag';
        
        const textSpan = document.createElement('span');
        textSpan.textContent = keyword;
        
        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = '&times;';
        removeBtn.addEventListener('click', () => {
            userKeywords.delete(keyword);
            renderCustomTags();
            
            // Log unhide status to console and remove tracking
            console.log(`%c[CUSTOM UNHIDDEN]: ${keyword}`, 'color: #ff9800; font-weight: bold;');
            
            // Instantly unhide from the main textarea layout
            if (typeof window.syncAndRenderText === 'function') {
                window.syncAndRenderText();
            }
        });

        tagEl.appendChild(textSpan);
        tagEl.appendChild(removeBtn);
        customTagsContainer.appendChild(tagEl);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderCustomTags();
});
