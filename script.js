document.addEventListener('DOMContentLoaded', () => {

    // 1. Dynamic Header Navigation
    const navBtn = document.getElementById('nav-action-btn');

    if (navBtn) {
        const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';

        if (currentPath === '/') {
            // Homepage → About
            navBtn.href = '/about/';
            navBtn.title = 'About hidePII';
            navBtn.setAttribute('aria-label', 'About hidePII');
            navBtn.innerHTML =
                '<i class="fa-solid fa-info" aria-hidden="true"></i>';
        } else {
            // All other pages → Home
            navBtn.href = '/';
            navBtn.title = 'Home';
            navBtn.setAttribute('aria-label', 'Home');
            navBtn.innerHTML =
                '<i class="fa-solid fa-house" aria-hidden="true"></i>';
        }
    }


    // 2. Automated Dynamic Copyright Year
    const yearSpan = document.getElementById('current-year');

    if (yearSpan) {
        const currentYear = new Date().getFullYear();

        yearSpan.textContent =
            currentYear > 2024
                ? `2024 - ${currentYear}`
                : '2024';
    }


    // 3. Category Filtering
    const filtersContainer =
        document.getElementById('categoryFilters');

    const toolCards =
        document.querySelectorAll('.tool-card');

    if (filtersContainer) {

        filtersContainer.addEventListener('click', (event) => {

            const pill =
                event.target.closest('.filter-pill');

            if (!pill || !filtersContainer.contains(pill)) {
                return;
            }

            filtersContainer
                .querySelectorAll('.filter-pill')
                .forEach(button => {
                    button.classList.remove('active');
                });

            pill.classList.add('active');

            const selectedCategory =
                pill.dataset.category;

            toolCards.forEach(card => {

                const cardCategory =
                    card.dataset.category;

                card.style.display =
                    selectedCategory === 'all' ||
                    cardCategory === selectedCategory
                        ? 'flex'
                        : 'none';
            });
        });
    }


    // 4. FAQ Accordion
    const faqQuestions =
        document.querySelectorAll('.faq-question');

    faqQuestions.forEach(button => {

        button.addEventListener('click', () => {

            const currentItem =
                button.parentElement;

            const isAlreadyActive =
                currentItem.classList.contains('active');

            document
                .querySelectorAll('.faq-item')
                .forEach(faq => {

                    faq.classList.remove('active');

                    const questionButton =
                        faq.querySelector('.faq-question');

                    if (questionButton) {
                        questionButton.setAttribute(
                            'aria-expanded',
                            'false'
                        );
                    }
                });

            if (!isAlreadyActive) {

                currentItem.classList.add('active');

                button.setAttribute(
                    'aria-expanded',
                    'true'
                );
            }
        });
    });

});