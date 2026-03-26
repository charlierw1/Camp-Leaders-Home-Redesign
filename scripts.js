const desktopProfileToggle = document.getElementById('profile-menu-toggle-desktop');
const mobileProfileToggle = document.getElementById('profile-menu-toggle-mobile');
const profileToggleBreakpoint = window.matchMedia('(max-width: 600px)');

function syncProfileToggles(sourceToggle) {
    if (!desktopProfileToggle || !mobileProfileToggle || !sourceToggle) {
        return;
    }

    const isChecked = sourceToggle.checked;
    desktopProfileToggle.checked = isChecked;
    mobileProfileToggle.checked = isChecked;
}

function resetProfileToggles() {
    if (desktopProfileToggle) {
        desktopProfileToggle.checked = false;
    }

    if (mobileProfileToggle) {
        mobileProfileToggle.checked = false;
    }
}

if (desktopProfileToggle && mobileProfileToggle) {
    desktopProfileToggle.addEventListener('change', () => syncProfileToggles(desktopProfileToggle));
    mobileProfileToggle.addEventListener('change', () => syncProfileToggles(mobileProfileToggle));
    profileToggleBreakpoint.addEventListener('change', resetProfileToggles);
}

const basicTabs = Array.from(document.querySelectorAll('.basic-tab'));
const basicTabPanels = Array.from(document.querySelectorAll('.basic-tab-panel'));
const basicDetailsForm = document.getElementById('basic-details-form');
const uploadPhotoForm = document.getElementById('upload-photo-form');
const contactDetailsForm = document.getElementById('contact-details-form');
const quickCarousel = document.querySelector('.checklist-quick-carousel');
const dropZone = document.getElementById('drop-zone');
const photoInput = document.getElementById('profile-photo-input');
const photoPreview = document.getElementById('photo-preview');

function activateTab(tab) {
    if (!tab) {
        return;
    }

    const targetId = tab.dataset.target;

    basicTabs.forEach((button) => {
        const isActive = button === tab;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-selected', String(isActive));
        button.tabIndex = isActive ? 0 : -1;
    });

    basicTabPanels.forEach((panel) => {
        panel.hidden = panel.id !== targetId;
    });
}

if (basicTabs.length && basicTabPanels.length) {
    basicTabs.forEach((tab, index) => {
        tab.tabIndex = tab.classList.contains('active') ? 0 : -1;

        tab.addEventListener('click', () => activateTab(tab));
        tab.addEventListener('keydown', (event) => {
            const currentIndex = basicTabs.indexOf(tab);
            let nextIndex = currentIndex;

            if (event.key === 'ArrowRight') {
                nextIndex = (currentIndex + 1) % basicTabs.length;
            } else if (event.key === 'ArrowLeft') {
                nextIndex = (currentIndex - 1 + basicTabs.length) % basicTabs.length;
            } else if (event.key === 'Home') {
                nextIndex = 0;
            } else if (event.key === 'End') {
                nextIndex = basicTabs.length - 1;
            } else {
                return;
            }

            event.preventDefault();
            basicTabs[nextIndex].focus();
            activateTab(basicTabs[nextIndex]);
        });
    });

    const activeTab = basicTabs.find((tab) => tab.classList.contains('active')) || basicTabs[0];
    activateTab(activeTab);
}

if (basicDetailsForm) {
    basicDetailsForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (basicDetailsForm.reportValidity()) {
            const uploadPhotoTab = basicTabs.find((tab) => tab.dataset.target === 'panel-upload-photo');
            activateTab(uploadPhotoTab);
        }
    });
}

if (uploadPhotoForm) {
    uploadPhotoForm.addEventListener('submit', (event) => {
        event.preventDefault();

        if (photoInput?.files?.length) {
            const contactDetailsTab = basicTabs.find((tab) => tab.dataset.target === 'panel-contact-details');
            activateTab(contactDetailsTab);
            return;
        }

        photoInput?.reportValidity();
    });
}

if (contactDetailsForm) {
    contactDetailsForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (contactDetailsForm.reportValidity()) {
            window.location.href = 'index.html';
        }
    });
}

if (quickCarousel) {
    const quickViewport = quickCarousel.querySelector('.checklist-quick-viewport');
    const quickTrack = quickCarousel.querySelector('.checklist-quick-track');
    const quickItems = Array.from(quickCarousel.querySelectorAll('.checklist-quick-item'));
    const prevButton = quickCarousel.querySelector('.checklist-quick-nav-prev');
    const nextButton = quickCarousel.querySelector('.checklist-quick-nav-next');
    let quickIndex = 0;
    const isMobileQuickCarousel = () => window.innerWidth <= 700;

    const getItemsPerView = () => {
        if (window.innerWidth <= 700) {
            return 1;
        }
        if (window.innerWidth <= 900) {
            return 2;
        }
        return 3;
    };

    const maxQuickIndex = () => Math.max(0, quickItems.length - getItemsPerView());

    const updateQuickCarousel = () => {
        if (!quickTrack || !quickItems.length) {
            return;
        }

        if (isMobileQuickCarousel()) {
            quickTrack.style.transform = 'none';

            if (prevButton) {
                prevButton.disabled = true;
            }

            if (nextButton) {
                nextButton.disabled = true;
            }

            return;
        }

        const clampedIndex = Math.max(0, Math.min(quickIndex, maxQuickIndex()));
        quickIndex = clampedIndex;
        const offsetLeft = quickItems[quickIndex].offsetLeft;
        quickTrack.style.transform = `translateX(-${offsetLeft}px)`;

        if (prevButton) {
            prevButton.disabled = quickIndex === 0;
        }

        if (nextButton) {
            nextButton.disabled = quickIndex >= maxQuickIndex();
        }
    };

    prevButton?.addEventListener('click', () => {
        if (isMobileQuickCarousel()) {
            return;
        }

        quickIndex -= 1;
        updateQuickCarousel();
    });

    nextButton?.addEventListener('click', () => {
        if (isMobileQuickCarousel()) {
            return;
        }

        quickIndex += 1;
        updateQuickCarousel();
    });

    quickItems.forEach((item, index) => {
        item.addEventListener('focus', () => {
            if (isMobileQuickCarousel()) {
                item.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
                return;
            }

            const itemsPerView = getItemsPerView();
            if (index < quickIndex || index >= quickIndex + itemsPerView) {
                quickIndex = Math.min(index, maxQuickIndex());
                updateQuickCarousel();
            }
        });
    });

    window.addEventListener('resize', () => {
        if (!isMobileQuickCarousel() && quickViewport) {
            quickViewport.scrollLeft = 0;
        }

        updateQuickCarousel();
    });
    updateQuickCarousel();
}

function updatePhotoPreview(file) {
    if (!file || !photoPreview || !dropZone) {
        return;
    }

    const objectUrl = URL.createObjectURL(file);
    photoPreview.src = objectUrl;
    photoPreview.hidden = false;
    dropZone.classList.add('has-preview');

    photoPreview.onload = () => {
        URL.revokeObjectURL(objectUrl);
    };
}

if (dropZone && photoInput) {
    dropZone.addEventListener('click', () => photoInput.click());

    dropZone.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            photoInput.click();
        }
    });

    ['dragenter', 'dragover'].forEach((eventName) => {
        dropZone.addEventListener(eventName, (event) => {
            event.preventDefault();
            dropZone.classList.add('drag-over');
        });
    });

    ['dragleave', 'dragend', 'drop'].forEach((eventName) => {
        dropZone.addEventListener(eventName, (event) => {
            event.preventDefault();
            dropZone.classList.remove('drag-over');
        });
    });

    dropZone.addEventListener('drop', (event) => {
        const [file] = event.dataTransfer?.files || [];
        if (!file) {
            return;
        }

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        photoInput.files = dataTransfer.files;
        updatePhotoPreview(file);
    });

    photoInput.addEventListener('change', () => {
        const [file] = photoInput.files || [];
        if (file) {
            updatePhotoPreview(file);
        }
    });
}
