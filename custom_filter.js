// --- Custom Filter Keyword Logic with Smart Word Boundary ---
document.addEventListener('DOMContentLoaded', () => {
    const customFilterInput = document.getElementById('custom-filter-input');
    const customTagsContainer = document.getElementById('custom-tags');
    const mainTextarea = document.getElementById('main-textarea');

    if (!customFilterInput || !customTagsContainer || !mainTextarea) return;

    customFilterInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault(); 
            
            let keyword = customFilterInput.value.trim();
            if (keyword.endsWith(',')) {
                keyword = keyword.slice(0, -1).trim();
            }
            
            if (keyword === '') return;
            
            let text = mainTextarea.value;
            let escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            
            // --- স্মার্ট রেগুলার এক্সপ্রেশন (Smart Regex) ---
            // ১. Lookbehind (?<=...): শব্দের আগে অবশ্যই স্পেস, ব্র্যাকেট, উদ্ধৃতি চিহ্ন বা বাংলা '।' থাকতে হবে। (কোনো লিংক বা @, #, / থাকা চলবে না)
            // ২. Lookahead (?=...): শব্দের পরে অবশ্যই স্পেস, ব্র্যাকেট, উদ্ধৃতি চিহ্ন থাকতে হবে অথবা পাংচুয়েশন চিহ্নের পরে একটি স্পেস থাকতে হবে। (যেমন: doc.pdf বা doc/index আটকাবে)
            let regexString = `(?<=^|[\\s([\`"'“‘।\\-]+)${escapedKeyword}(?=$|[\\s)\\]\`"'”’।\\-]+|[.,!?;:]+(?:\\s|$))`;
            let regex = new RegExp(regexString, 'gi');
            
            // টেক্সটে এই নির্দিষ্ট রুল অনুযায়ী কোনো ম্যাচ আছে কিনা পরীক্ষা করা
            let matches = text.match(regex);
            if (!matches) {
                customFilterInput.value = '';
                return; // কোনো পারফেক্ট ম্যাচ না পেলে ট্যাগ তৈরি হবে না
            }
            
            let associatedTokens = [];
            
            // শুধুমাত্র নির্দিষ্ট ম্যাচিং শব্দগুলোকে ইউনিক টোকেন দিয়ে পরিবর্তন করা
            text = text.replace(regex, (match) => {
                let token = `[HIDDEN_CUSTOM_${window.AppState.tokenId++}]`;
                window.AppState.tokenMap[token] = { original: match, type: 'custom', name: 'Custom' };
                associatedTokens.push(token);
                return token;
            });
            
            mainTextarea.value = text;
            
            // কাস্টম UI ট্যাগ জেনারেশন
            const tagEl = document.createElement('div');
            tagEl.className = 'tag';
            tagEl.innerHTML = `
                <span>${keyword}</span>
                <button type="button">&times;</button>
            `;
            
            // ক্রসে ক্লিক করলে কাস্টম কিওয়ার্ড আনহাইড হবে
            tagEl.querySelector('button').addEventListener('click', function() {
                associatedTokens.forEach(t => {
                    if (window.AppUtils && typeof window.AppUtils.restoreText === 'function') {
                        window.AppUtils.restoreText(t);
                    }
                });
                tagEl.remove();
            });
            
            customTagsContainer.appendChild(tagEl);
            customFilterInput.value = ''; 
            
            // ওয়ার্ড কাউন্টার আপডেট করা
            if (window.AppUtils && typeof window.AppUtils.updateWordCharCount === 'function') {
                window.AppUtils.updateWordCharCount();
            }
        }
    });
});
