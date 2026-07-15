/**
 * Pascal Site Security - PII Redaction Engine
 */

const PII_RULES = {
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
    phone: /(?:\+880|880|0)?1[3-9]\d{8}\b/g, // বাংলাদেশ ও আন্তর্জাতিক ফরম্যাট ফ্রেন্ডলি ফোন নম্বর
    ip: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
    card: /\b(?:\d[ -]*?){13,16}\b/g // ক্রেডিট/ডেবিট কার্ড
};

/**
 * মূল টেক্সট থেকে PII ফিল্টার করার ফাংশন
 * @param {string} text 
 * @param {Array} customKeywords 
 * @returns {Object} { redactedText, detectedItems }
 */
function redactPII(text, customKeywords = []) {
    let redactedText = text;
    const detectedItems = [];

    // --- ধাপ ১: বিল্ট-ইন গ্লোবাল PII রুলস আগে রান হবে ---
    
    // ১. ইমেইল ফিল্টার
    const emails = redactedText.match(PII_RULES.email);
    if (emails) {
        emails.forEach(item => detectedItems.push({ type: 'email', value: item }));
        redactedText = redactedText.replace(PII_RULES.email, '[EMAIL]');
    }

    // ২. ফোন নম্বর ফিল্টার
    const phones = redactedText.match(PII_RULES.phone);
    if (phones) {
        phones.forEach(item => detectedItems.push({ type: 'phone', value: item }));
        redactedText = redactedText.replace(PII_RULES.phone, '[PHONE]');
    }

    // ৩. আইপি অ্যাড্রেস ফিল্টার
    const ips = redactedText.match(PII_RULES.ip);
    if (ips) {
        ips.forEach(item => detectedItems.push({ type: 'ip', value: item }));
        redactedText = redactedText.replace(PII_RULES.ip, '[IP_ADDRESS]');
    }

    // ৪. কার্ড নম্বর ফিল্টার
    const cards = redactedText.match(PII_RULES.card);
    if (cards) {
        cards.forEach(item => detectedItems.push({ type: 'card', value: item }));
        redactedText = redactedText.replace(PII_RULES.card, '[CARD_NUMBER]');
    }

    // --- ধাপ ২: কাস্টম কিওয়ার্ডস ফিল্টার হবে সবার শেষে ---
    customKeywords.forEach(keyword => {
        if (!keyword.trim()) return;
        
        // স্পেশাল ক্যারেক্টার এস্কেপ করার সেফটি লেয়ার
        const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // \b ব্যবহারের ফলে ইমেইলের ভেতরের পার্টের সাথে কোনো কনফ্লিক্ট হবে না
        const customRegex = new RegExp(`\\b${escapedKeyword}\\b`, 'gi');
        
        const matches = redactedText.match(customRegex);
        if (matches) {
            matches.forEach(item => detectedItems.push({ type: 'custom', value: item }));
            redactedText = redactedText.replace(customRegex, '[REDACTED]');
        }
    });

    return {
        redactedText,
        detectedItems
    };
}
