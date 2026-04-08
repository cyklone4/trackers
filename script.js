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
            const titleElement = item.querySelector('[style*="font-weight: 500"]');
            if (titleElement && titleElement.textContent) {
                // Get the second occurrence of bold text (the activity name)
                const boldElements = item.querySelectorAll('[style*="font-weight: 500"]');
                if (boldElements.length > 1) {
                    activityDisplay.textContent = boldElements[1].textContent.trim();
                } else if (boldElements.length > 0) {
                    activityDisplay.textContent = boldElements[0].textContent.trim();
                }
            }
            
            // Scroll to current item
            item.scrollIntoView({ behavior: 'smooth', block: 'center' });
            found = true;
        }
    });

    if (!found) {
        activityDisplay.textContent = 'Rest time - Schedule complete for today';
    }
}

// Update schedule every minute
setInterval(updateSchedule, 60000);

// Update immediately on page load
updateSchedule();
