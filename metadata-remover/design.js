// design.js - UI Management & Event Handlers

document.addEventListener('DOMContentLoaded', () => {

    // Automated Dynamic Copyright Year
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        const currentYear = new Date().getFullYear();
        yearSpan.textContent = currentYear > 2024 ? `2024 - ${currentYear}` : '2024';
    }

    // FAQ Accordion
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(button => {
        button.addEventListener('click', () => {
            const currentItem = button.parentElement;
            const isAlreadyActive = currentItem.classList.contains('active');

            document.querySelectorAll('.faq-item').forEach(faq => {
                faq.classList.remove('active');
                const questionButton = faq.querySelector('.faq-question');
                if (questionButton) {
                    questionButton.setAttribute('aria-expanded', 'false');
                }
            });

            if (!isAlreadyActive) {
                currentItem.classList.add('active');
                button.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // File Input & UI Triggers
    const fileInput = document.getElementById('fileInput');
    const statusDiv = document.getElementById('status');
    const resultBox = document.getElementById('resultBox');
    const logList = document.getElementById('logList');
    const downloadBtn = document.getElementById('downloadBtn');

    const filePreviewContainer = document.getElementById('filePreviewContainer');
    const previewThumb = document.getElementById('previewThumb');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const fileSizeDisplay = document.getElementById('fileSizeDisplay');

    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            fileNameDisplay.textContent = file.name;
            fileSizeDisplay.textContent = formatBytes(file.size);
            
            if (file.type.startsWith('image/')) {
                const readerThumb = new FileReader();
                readerThumb.onload = function(evt) {
                    previewThumb.src = evt.target.result;
                    previewThumb.style.display = 'block';
                }
                readerThumb.readAsDataURL(file);
            } else {
                previewThumb.style.display = 'none';
            }
            filePreviewContainer.style.display = 'block';

            statusDiv.innerHTML = `<div class="spinner"></div> Executing high-precision metadata purge...`;
            resultBox.style.display = 'none';
            downloadBtn.style.display = 'none';
            logList.innerHTML = '';

            setTimeout(() => {
                processTargetFiles(file, (logs, url) => {
                    showResults(logs, url, file.name, statusDiv, resultBox, logList, downloadBtn);
                });
            }, 400);
        });
    }
});

function showResults(logs, url, fileName, statusDiv, resultBox, logList, downloadBtn) {
    statusDiv.innerHTML = `<span style="color: var(--primary-color); font-weight: 600;">High-precision metadata purge completed!</span>`;
    
    logs.forEach(log => {
        const li = document.createElement('li');
        li.innerHTML = log;
        logList.appendChild(li);
    });

    resultBox.style.display = 'block';
    
    downloadBtn.href = url;
    downloadBtn.download = `hidepii_clean_${fileName}`;
    downloadBtn.style.display = 'block';
}
