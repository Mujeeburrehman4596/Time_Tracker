document.addEventListener('DOMContentLoaded', () => {
    const timerForm = document.getElementById('timer-form');
    const manualLogForm = document.getElementById('manual-log-form');
    const timeEntriesList = document.getElementById('time-entries-list');
    const timeReports = document.getElementById('time-reports');

    let timeEntries = JSON.parse(localStorage.getItem('timeEntries')) || [];
    let timerStartTime = null;
    let timerTaskName = '';
    let timerInterval = null;

    function renderTimeEntries() {
        timeEntriesList.innerHTML = '';
        timeEntries.forEach((entry, index) => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.innerHTML = `
                ${entry.taskName} - ${entry.duration} minutes - ${entry.category}
                <button class="btn btn-danger btn-sm ml-2 delete-entry" data-index="${index}">Delete</button>
            `;
            timeEntriesList.appendChild(li);
        });
        renderReports();
    }

    function renderReports() {
        const totalDuration = timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
        const categories = {};

        timeEntries.forEach(entry => {
            if (!categories[entry.category]) {
                categories[entry.category] = 0;
            }
            categories[entry.category] += entry.duration;
        });

        let categoryReport = '<h4>Category Breakdown</h4>';
        for (const [category, duration] of Object.entries(categories)) {
            categoryReport += `<p>${category}: ${duration} minutes</p>`;
        }

        timeReports.innerHTML = `
            <h4>Time Reports</h4>
            <p>Total Time Tracked: ${totalDuration} minutes</p>
            ${categoryReport}
        `;
    }

    function saveData() {
        localStorage.setItem('timeEntries', JSON.stringify(timeEntries));
    }

    function startTimer() {
        timerStartTime = new Date();
        timerTaskName = document.getElementById('task-name').value;
        document.getElementById('start-timer').disabled = true;
        document.getElementById('stop-timer').disabled = false;

        timerInterval = setInterval(() => {
            const now = new Date();
            const duration = Math.round((now - timerStartTime) / (1000 * 60)); // duration in minutes
            document.getElementById('stop-timer').textContent = `Stop Timer (${duration} minutes)`;
        }, 1000); // Update every second
    }

    function stopTimer() {
        clearInterval(timerInterval);
        const now = new Date();
        const duration = Math.round((now - timerStartTime) / (1000 * 60)); // duration in minutes
        timeEntries.push({
            taskName: timerTaskName,
            duration: duration,
            category: 'work' // default category
        });
        timerStartTime = null;
        timerTaskName = '';
        timerInterval = null;

        document.getElementById('start-timer').disabled = false;
        document.getElementById('stop-timer').disabled = true;
        document.getElementById('stop-timer').textContent = 'Stop Timer';

        saveData();
        renderTimeEntries();
    }

    timerForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const taskName = document.getElementById('task-name').value;

        if (!timerStartTime) {
            startTimer();
        } else {
            stopTimer();
        }
    });

    manualLogForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const taskName = document.getElementById('manual-task-name').value;
        const duration = parseFloat(document.getElementById('manual-time-duration').value);
        const category = document.getElementById('manual-category').value;
        timeEntries.push({ taskName, duration, category });
        saveData();
        renderTimeEntries();
        manualLogForm.reset();
    });

    timeEntriesList.addEventListener('click', function (e) {
        if (e.target.classList.contains('delete-entry')) {
            const index = e.target.getAttribute('data-index');
            timeEntries.splice(index, 1);
            saveData();
            renderTimeEntries();
        }
    });

    // Initial rendering
    renderTimeEntries();
});
