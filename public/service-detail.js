// Service detail page functionality
let serviceId = null;
let refreshInterval = null;
const REFRESH_INTERVAL = 60000; // 60 seconds

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Get service ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    serviceId = urlParams.get('id');
    
    if (!serviceId) {
        showError('No service ID provided');
        return;
    }

    // Initial data load
    loadServiceDetails();
    
    // Set up auto-refresh
    refreshInterval = setInterval(loadServiceDetails, REFRESH_INTERVAL);
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
});

async function loadServiceDetails() {
    try {
        const response = await fetch(`/api/service/${serviceId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        updateUI(data);
    } catch (error) {
        console.error('Error loading service details:', error);
        showError('Failed to load service details');
    }
}

function updateUI(data) {
    // Update service name and status
    document.getElementById('serviceName').textContent = data.name;
    const statusBadge = document.getElementById('statusBadge');
    statusBadge.textContent = data.status;
    statusBadge.className = `status-badge ${data.status.toLowerCase()}`;

    // Update quick stats
    document.getElementById('uptime').textContent = `${data.uptime}%`;
    document.getElementById('responseTime').textContent = `${data.avgResponseTime}ms`;
    document.getElementById('lastCheck').textContent = new Date(data.lastCheck).toLocaleString();
    document.getElementById('totalChecks').textContent = data.totalChecks;

    // Update charts
    updateResponseTimeChart(data.responseTimeHistory);
    updateUptimeCalendar(data.uptimeHistory);

    // Update recent events
    updateEventsList(data.recentEvents);
}

function updateResponseTimeChart(data) {
    // Implement chart update logic using your preferred charting library
    // Example: Chart.js
    const ctx = document.getElementById('responseTimeChart').getContext('2d');
    // Create/update chart...
}

function updateUptimeCalendar(data) {
    // Implement calendar update logic
    const calendar = document.getElementById('uptimeCalendar');
    // Create/update calendar...
}

function updateEventsList(events) {
    const eventsList = document.getElementById('eventsList');
    eventsList.innerHTML = '';
    
    events.forEach(event => {
        const eventItem = document.createElement('div');
        eventItem.className = 'event-item';
        eventItem.innerHTML = `
            <span class="event-time">${new Date(event.timestamp).toLocaleString()}</span>
            <span class="event-status ${event.status.toLowerCase()}">${event.status}</span>
            <span class="event-message">${event.message}</span>
        `;
        eventsList.appendChild(eventItem);
    });
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.insertBefore(errorDiv, document.body.firstChild);
}
