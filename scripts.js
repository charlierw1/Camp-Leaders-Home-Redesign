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
