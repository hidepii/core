// --- Core PII Detection Engine ---
window.PIIDetector = {
    // সংবেদনশীল তথ্যের রেগুলার এক্সপ্রেশন রুলস (ফিক্সড ফোন নম্বর রেঞ্জ)
    types: [
        { type: 'email', name: 'Email', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
        { type: 'phone', name: 'Phone', regex: /(?:\+880|880|0)?1[3-9]\d{8}\b|\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g },
        { type: 'ip',    name: 'IP',    regex: /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g },
        { type: 'card',  name: 'Card',  regex: /\b\d{4}[-.\s]?\d{4}[-.\s]?\d{4}[-.\s]?\d{4}\b/g }
    ],

    // টেক্সট থেকে PII ম্যাচ খুঁজে বের করার মেকানিজম
    scan: function(text) {
        let results = [];
        if (!text) return results;
        
        this.types.forEach(pii => {
            let matches = text.match(pii.regex);
            if (matches) {
                // ডুপ্লিকেট বাদ দিয়ে ইউনিক অবজেক্ট অ্যারে তৈরি
                let uniqueMatches = [...new Set(matches)];
                uniqueMatches.forEach(match => {
                    results.push({
                        match: match,
                        type: pii.type,
                        name: pii.name
                    });
                });
            }
        });
        return results;
    }
};
