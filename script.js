// Convert time string (HHMM) to minutes since midnight
function timeToMinutes(timeStr) {
    const hours = parseInt(timeStr.substring(0, timeStr.length - 2));
    const mins = parseInt(timeStr.substring(timeStr.length - 2));
    return hours * 60 + mins;
}

// Format minutes since midnight to readable time (H:MM AM/PM)
function minutesToTimeDisplay(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${mins < 10 ? '0' : ''}${mins} ${period}`;
}

// Update current time and highlight current activity
function updateSchedule() {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    // Update time display
    const timeDisplay = document.getElementById('currentTime');
    const activityDisplay = document.getElementById('currentActivity');
    const header = document.querySelector('.current-time-display');
    const defaultTask = header?.dataset.currentTask || document.body.dataset.pageTitle || 'Tracking page';
    
    timeDisplay.textContent = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    // Remove previous highlighting
    document.querySelectorAll('.schedule-item.current').forEach(item => {
        item.classList.remove('current');
    });

    // Find and highlight current activity
    let found = false;
    document.querySelectorAll('.schedule-item').forEach(item => {
        const start = timeToMinutes(item.getAttribute('data-start'));
        const end = timeToMinutes(item.getAttribute('data-end'));
        
        if (currentMinutes >= start && currentMinutes < end) {
            item.classList.add('current');
            
            const boldElements = item.querySelectorAll('[style*="font-weight: 500"]');
            let taskText = '';
            if (boldElements.length > 1) {
                taskText = boldElements[1].textContent.trim();
            } else if (boldElements.length > 0) {
                taskText = boldElements[0].textContent.trim();
            }
            
            activityDisplay.textContent = taskText ? `Now: ${taskText}` : `Now: ${defaultTask}`;

            // Scroll to current item once on page load
            if (!window.currentScrollDone) {
                window.currentScrollDone = true;
                setTimeout(() => scrollToCurrentTask(item), 80);
            }

            found = true;
        }
    });

    if (!found) {
        activityDisplay.textContent = defaultTask === 'Tracking page' ? 'No active schedule item right now' : defaultTask;
    }
}

function scrollToCurrentTask(item) {
    const header = document.querySelector('.current-time-display');
    const headerHeight = header ? header.offsetHeight + 16 : 0;
    const itemTop = item.getBoundingClientRect().top + window.scrollY;
    const targetScroll = Math.max(0, itemTop - headerHeight - 12);
    window.scrollTo({ top: targetScroll, behavior: 'smooth' });
}

function getStorageKey() {
    return `tracker-memory:${window.location.pathname}`;
}

function makeTableCellsEditable() {
    document.querySelectorAll('.tracker-table tr').forEach(row => {
        const cells = Array.from(row.children);
        cells.forEach((cell, index) => {
            if (cell.tagName.toLowerCase() !== 'td') return;
            if (cell.querySelector('input, select, textarea')) return;
            if (index === 0) {
                cell.contentEditable = 'false';
                cell.style.userSelect = 'none';
            } else {
                cell.contentEditable = 'true';
                cell.dataset.editable = 'true';
            }
        });
    });
}

function savePageData() {
    const data = {
        tables: [],
        checkboxes: []
    };

    document.querySelectorAll('.tracker-table').forEach(table => {
        const rows = [];
        Array.from(table.querySelectorAll('tr')).forEach((row, rowIndex) => {
            if (row.querySelector('th')) return;
            const rowValues = Array.from(row.children).map(cell => cell.textContent.trim());
            rows.push(rowValues);
        });
        data.tables.push(rows);
    });

    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        data.checkboxes.push(checkbox.checked);
    });

    localStorage.setItem(getStorageKey(), JSON.stringify(data));
}

function restorePageData() {
    const raw = localStorage.getItem(getStorageKey());
    if (!raw) return;

    try {
        const data = JSON.parse(raw);
        const tables = document.querySelectorAll('.tracker-table');
        tables.forEach((table, tableIndex) => {
            const rows = data.tables?.[tableIndex] || [];
            const rowElements = Array.from(table.querySelectorAll('tr')).filter(row => !row.querySelector('th'));
            rowElements.forEach((row, rowIndex) => {
                const values = rows[rowIndex] || [];
                Array.from(row.children).forEach((cell, cellIndex) => {
                    if (cell.tagName.toLowerCase() !== 'td') return;
                    if (cell.querySelector('input, select, textarea')) return;
                    if (values[cellIndex] !== undefined) {
                        cell.textContent = values[cellIndex];
                    }
                });
            });
        });

        document.querySelectorAll('input[type="checkbox"]').forEach((checkbox, index) => {
            checkbox.checked = Array.isArray(data.checkboxes) ? Boolean(data.checkboxes[index]) : checkbox.checked;
        });
    } catch (error) {
        console.warn('Unable to restore tracker data:', error);
    }
}

function attachStorageListeners() {
    document.querySelectorAll('.tracker-table td[data-editable="true"]').forEach(cell => {
        cell.addEventListener('input', savePageData);
        cell.addEventListener('blur', savePageData);
    });

    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', savePageData);
    });
}

function toggleMobileMenu() {
    const nav = document.querySelector('.site-nav');
    if (!nav) return;
    nav.classList.toggle('open');
}

function closeMobileMenu() {
    const nav = document.querySelector('.site-nav');
    if (!nav) return;
    nav.classList.remove('open');
}

function attachMenuListeners() {
    const button = document.querySelector('.menu-toggle');
    if (button) {
        button.addEventListener('click', toggleMobileMenu);
    }

    document.querySelectorAll('.site-nav a').forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });

    document.addEventListener('click', event => {
        const nav = document.querySelector('.site-nav');
        const button = document.querySelector('.menu-toggle');
        if (!nav || !button) return;
        if (nav.classList.contains('open') && !nav.contains(event.target) && !button.contains(event.target)) {
            closeMobileMenu();
        }
    });
}

// Update schedule every minute
setInterval(updateSchedule, 60000);

// Update immediately on page load
updateSchedule();

// Handle scroll to make header minimalist
function handleHeaderScroll() {
    const header = document.querySelector('.current-time-display');
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // On mobile, trigger minimalist view when scrolled past initial header height
        const scrollThreshold = window.innerHeight * 0.4; // 40% of viewport height
        
        if (window.scrollY > scrollThreshold) {
            header.classList.add('scrolled');
            document.body.classList.add('scrolled-state');
        } else {
            header.classList.remove('scrolled');
            document.body.classList.remove('scrolled-state');
        }
    } else {
        // On desktop, keep it simple - just show time when scrolling
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
}

// Listen for scroll events
window.addEventListener('scroll', handleHeaderScroll, { passive: true });

// Also run on resize to handle responsive changes
window.addEventListener('resize', handleHeaderScroll);

// Scroll to current task and initialize header state on load
window.addEventListener('load', () => {
    makeTableCellsEditable();
    restorePageData();
    attachStorageListeners();
    attachMenuListeners();
    updateSchedule();
    handleHeaderScroll();
});

window.addEventListener('beforeunload', savePageData);

// Initial call
handleHeaderScroll();
