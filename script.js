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
        const start = parseInt(item.getAttribute('data-start'));
        const end = parseInt(item.getAttribute('data-end'));
        
        if (currentMinutes >= start && currentMinutes < end) {
            item.classList.add('current');
            
            // Extract activity title from the item
            const boldElements = item.querySelectorAll('[style*="font-weight: 500"]');
            let taskText = '';
            if (boldElements.length > 1) {
                taskText = boldElements[1].textContent.trim();
            } else if (boldElements.length > 0) {
                taskText = boldElements[0].textContent.trim();
            }
            
            activityDisplay.textContent = taskText ? `Now: ${taskText}` : 'Now: current task';

            // Scroll to current item once on page load
            if (!window.currentScrollDone) {
                window.currentScrollDone = true;
                setTimeout(() => scrollToCurrentTask(item), 80);
            }

            found = true;
        }
    });

    if (!found) {
        activityDisplay.textContent = 'Rest time - Schedule complete for today';
    }
}

function scrollToCurrentTask(item) {
    const header = document.querySelector('.current-time-display');
    const headerHeight = header ? header.offsetHeight + 16 : 0;
    const itemTop = item.getBoundingClientRect().top + window.scrollY;
    const targetScroll = Math.max(0, itemTop - headerHeight - 12);
    window.scrollTo({ top: targetScroll, behavior: 'smooth' });
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
    updateSchedule();
    handleHeaderScroll();
});

// Initial call
handleHeaderScroll();
