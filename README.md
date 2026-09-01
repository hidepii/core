hidePII

Privacy-First Tools for the Web

hidePII is a free, open-source collection of browser-based privacy and security tools designed to help people detect, redact, anonymize, and remove sensitive information before sharing or publishing it.

No backend processing. No unnecessary uploads. Client-side by design.

---

🔐 Privacy by Design

hidePII is built around a simple principle:

«Your sensitive data should stay with you.»

Where technically possible, hidePII processes user-provided content directly inside the web browser rather than sending it to a remote application server.

This architecture helps reduce unnecessary data exposure and makes privacy a fundamental part of the product rather than an optional feature.

Key principles

- Client-side processing
- No application backend
- No required data uploads
- No account required for basic tools
- Open-source implementation
- Privacy-first architecture
- Minimal external dependencies

---

🛠️ Privacy & Security Tools

hidePII provides a growing collection of browser-based tools.

PII & Text

- PII Detector & Redactor — Detect and redact personally identifiable information from text.
- Data Masking Tool — Mask confidential strings and sensitive identifiers.
- Text Anonymizer — Anonymize identifiable information in text.

Metadata & EXIF

- Metadata Remover — Remove supported metadata from files locally.
- EXIF Remover — Remove image metadata such as GPS information, camera details, and timestamps.

Security Scanners

- API Key Scanner — Detect potentially exposed API keys, credentials, tokens, and secrets.
- Document Privacy Scanner — Check documents for common privacy leakage risks.
- AI Privacy Scanner — Check text and prompts for sensitive information before sharing them with external AI services.

Utilities

- URL Tracking Cleaner — Remove common tracking parameters such as UTM tags.
- Secure Data Generator — Generate passwords and privacy-friendly mock data locally.

---

⚙️ How It Works

hidePII is designed primarily as a static, client-side web application.

A simplified architecture looks like this:

User
  │
  ▼
Web Browser
  │
  ├── Input
  │
  ├── Local Processing
  │
  └── Output

For supported tools, the user's content is processed by JavaScript running in the browser.

There is no requirement for the sensitive content to travel through a hidePII application server.

---

🌐 Architecture

The website uses a simple static structure:

hidepii.com/
│
├── index.html
├── style.css
├── script.js
├── favicon.png
├── robots.txt
├── sitemap.xml
├── README.md
│
├── about/
│   └── index.html
│
├── pii-detector/
│   └── index.html
│
├── metadata-remover/
│   └── index.html
│
├── exif-remover/
│   └── index.html
│
├── api-key-scanner/
│   └── index.html
│
├── document-privacy-scanner/
│   └── index.html
│
├── ai-privacy-scanner/
│   └── index.html
│
├── data-masking-tool/
│   └── index.html
│
├── text-anonymizer/
│   └── index.html
│
├── url-tracking-cleaner/
│   └── index.html
│
└── secure-generator/
    └── index.html

The project does not require a traditional application server for its core browser-based functionality.

---

🚀 Technology

hidePII is intentionally built with lightweight web technologies:

- HTML5
- CSS3
- JavaScript
- Web APIs
- Font Awesome for interface icons

The project is designed to remain lightweight, accessible, and easy to inspect.

---

📦 Deployment

The project can be deployed as a static website using a suitable static hosting platform or CDN.

The source code is maintained on GitHub and the production website is served through a CDN/serverless hosting architecture.

No traditional backend application server is required for the core tools.

---

🔎 SEO & Accessibility

hidePII includes several technical foundations for discoverability and accessibility:

- Semantic HTML
- Descriptive page titles
- Meta descriptions
- Canonical URLs
- Open Graph metadata
- Social sharing metadata
- Structured data
- XML sitemap
- "robots.txt"
- Accessible labels
- ARIA attributes where appropriate
- Mobile-responsive design

Each public tool is intended to have its own indexable URL.

---

🔒 Security & Privacy Disclaimer

hidePII is designed to process supported data locally in the browser.

However, users should understand that client-side processing does not automatically guarantee complete privacy or security in every situation.

For example:

- Browser extensions may have access to page content.
- Compromised devices may expose sensitive information.
- Third-party resources loaded by a page may have their own privacy implications.
- Browser and operating-system security remain important.

Users should always review the implementation and security characteristics of a tool before processing highly sensitive information.

---

🧑‍💻 Open Source

hidePII is open source.

The source code is publicly available so users and developers can inspect how the tools work, identify potential issues, and contribute improvements.

GitHub:

https://github.com/hidepii

---

🤝 Contributing

Contributions are welcome.

If you find a bug, privacy issue, security concern, or improvement opportunity:

1. Review the existing issues.
2. Open an issue describing the problem or proposed improvement.
3. For code changes, create a pull request with a clear description of the change.
4. Keep contributions focused and easy to review.

Privacy and security-related improvements are especially valuable.

---

🐛 Reporting Security Issues

If you discover a potential security or privacy vulnerability, please avoid publicly exposing sensitive details before the issue can be investigated.

Provide enough technical information to reproduce and understand the issue without including real credentials, API keys, personal information, or other sensitive data.

---

📄 License

This project is released under the MIT License.

You are free to use, modify, distribute, and build upon the software in accordance with the license terms.

---

🎯 Project Philosophy

hidePII aims to make privacy tools simple, transparent, and accessible.

Instead of assuming that sensitive information should be uploaded to a remote service for processing, hidePII explores a different approach:

Process locally whenever practical.

The long-term goal is to build a useful ecosystem of privacy-first utilities that minimize unnecessary data collection while remaining simple enough for anyone to use.

---

🌍 Website

hidePII

https://hidepii.com/

Privacy-first tools for detecting, masking, anonymizing, and cleaning sensitive information directly in your browser.

---

Built with privacy in mind.