/* =====================================================
   EvoMind AI
   Frontend Application
===================================================== */


/* =====================================================
   DEFAULT DATA
===================================================== */

const defaultData = {

    journeys: [],

    messages: 0,

    tasksDone: 0,

    streak: 1,

    lastActive: null,

    theme: "dark",

    tasks: [

        {
            id: 1,
            text: "Spend 30 minutes learning something new",
            completed: false
        },

        {
            id: 2,
            text: "Practice one coding problem",
            completed: false
        },

        {
            id: 3,
            text: "Review what you learned today",
            completed: false
        }

    ],

    history: [],

    chat: []

};


/* =====================================================
   LOAD DATA
===================================================== */

let appData = loadData();


function loadData() {

    try {

        const saved =
            localStorage.getItem("evomindData");

        if (saved) {

            const parsed =
                JSON.parse(saved);

            return {
                ...defaultData,
                ...parsed
            };
        }

    } catch (error) {

        console.error(
            "Could not load EvoMind data:",
            error
        );

    }

    return {
        ...defaultData
    };
}


/* =====================================================
   SAVE DATA
===================================================== */

function saveData() {

    localStorage.setItem(
        "evomindData",
        JSON.stringify(appData)
    );

}


/* =====================================================
   PAGE NAVIGATION
===================================================== */

function showPage(pageName) {

    const pages =
        document.querySelectorAll(".page");

    pages.forEach(page => {

        page.classList.remove(
            "active-page"
        );

    });


    const selectedPage =
        document.getElementById(
            `page-${pageName}`
        );


    if (selectedPage) {

        selectedPage.classList.add(
            "active-page"
        );

    }


    const navItems =
        document.querySelectorAll(".nav-item");


    navItems.forEach(item => {

        item.classList.remove("active");

        if (
            item.dataset.page === pageName
        ) {

            item.classList.add("active");

        }

    });


    closeSidebar();


    if (pageName === "journeys") {

        renderJourneys();

    }


    if (pageName === "tasks") {

        renderTasks();

    }


    if (pageName === "history") {

        renderHistory();

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =====================================================
   SIDEBAR
===================================================== */

function toggleSidebar() {

    const sidebar =
        document.getElementById("sidebar");

    sidebar.classList.toggle("open");

}


function closeSidebar() {

    const sidebar =
        document.getElementById("sidebar");

    sidebar.classList.remove("open");

}


/* =====================================================
   JOURNEY MODAL
===================================================== */

function openJourneyModal() {

    const modal =
        document.getElementById(
            "journeyModal"
        );

    modal.classList.add("show");

    setTimeout(() => {

        document
            .getElementById("goalInput")
            .focus();

    }, 100);

}


function closeJourneyModal() {

    const modal =
        document.getElementById(
            "journeyModal"
        );

    modal.classList.remove("show");

}


function closeModalOutside(event) {

    if (
        event.target.id ===
        "journeyModal"
    ) {

        closeJourneyModal();

    }

}


/* =====================================================
   CREATE JOURNEY
===================================================== */

function createJourney() {

    const goal =
        document
            .getElementById("goalInput")
            .value
            .trim();


    const category =
        document
            .getElementById("categoryInput")
            .value;


    const dailyTime =
        document
            .getElementById("timeInput")
            .value;


    if (!goal) {

        showToast(
            "Please enter your learning goal."
        );

        document
            .getElementById("goalInput")
            .focus();

        return;

    }


    const journey = {

        id: Date.now(),

        goal: goal,

        category: category,

        dailyTime: dailyTime,

        progress: 0,

        createdAt:
            new Date().toISOString()

    };


    appData.journeys.unshift(
        journey
    );


    addHistory(
        "🎯",
        `Created journey: ${goal}`
    );


    saveData();

    closeJourneyModal();


    document
        .getElementById("goalInput")
        .value = "";


    updateDashboard();


    showPage("journeys");


    showToast(
        "Journey created successfully! 🎯"
    );

}


/* =====================================================
   RENDER JOURNEYS
===================================================== */

function renderJourneys() {

    const container =
        document.getElementById(
            "journeyList"
        );


    if (!appData.journeys.length) {

        container.innerHTML = `

            <div class="journey-card">

                <h3>No journeys yet</h3>

                <p class="journey-time">
                    Create your first learning journey
                    and start making progress.
                </p>

                <button
                    class="primary-btn small-btn"
                    onclick="openJourneyModal()"
                >
                    + Create Journey
                </button>

            </div>

        `;

        return;

    }


    container.innerHTML =
        appData.journeys
            .map(journey => {

                return `

                    <div
                        class="journey-card"
                        data-id="${journey.id}"
                    >

                        <button
                            class="delete-journey"
                            onclick="deleteJourney(${journey.id})"
                            aria-label="Delete journey"
                        >
                            ×
                        </button>


                        <span class="journey-category">
                            ${escapeHtml(journey.category)}
                        </span>


                        <h3>
                            ${escapeHtml(journey.goal)}
                        </h3>


                        <div class="journey-time">
                            ◷ ${journey.dailyTime} minutes daily
                        </div>


                        <div class="journey-progress">

                            <div
                                class="journey-progress-fill"
                                style="width:${journey.progress}%"
                            ></div>

                        </div>


                        <div class="journey-footer">

                            <span>Progress</span>

                            <span>
                                ${journey.progress}%
                            </span>

                        </div>

                    </div>

                `;

            })
            .join("");

}


/* =====================================================
   DELETE JOURNEY
===================================================== */

function deleteJourney(id) {

    const journey =
        appData.journeys.find(
            item => item.id === id
        );


    if (!journey) return;


    const confirmed =
        confirm(
            "Delete this journey?"
        );


    if (!confirmed) return;


    appData.journeys =
        appData.journeys.filter(
            item => item.id !== id
        );


    addHistory(
        "🗑️",
        `Deleted journey: ${journey.goal}`
    );


    saveData();

    renderJourneys();

    updateDashboard();

    showToast(
        "Journey deleted."
    );

}


/* =====================================================
   TASKS
===================================================== */

function renderTasks() {

    const container =
        document.getElementById(
            "taskList"
        );


    if (!appData.tasks.length) {

        container.innerHTML = `

            <p style="
                color:#858798;
                padding:20px 0;
            ">
                No tasks available.
            </p>

        `;

        updateTaskProgress();

        return;

    }


    container.innerHTML =
        appData.tasks
            .map(task => {

                return `

                    <div
                        class="task-item ${
                            task.completed
                                ? "completed"
                                : ""
                        }"
                        onclick="toggleTask(${task.id})"
                    >

                        <div class="task-checkbox">
                            ✓
                        </div>

                        <div class="task-text">
                            ${escapeHtml(task.text)}
                        </div>

                    </div>

                `;

            })
            .join("");


    updateTaskProgress();

}


/* =====================================================
   TOGGLE TASK
===================================================== */

function toggleTask(id) {

    const task =
        appData.tasks.find(
            item => item.id === id
        );


    if (!task) return;


    task.completed =
        !task.completed;


    if (task.completed) {

        addHistory(
            "✓",
            `Completed task: ${task.text}`
        );

        appData.tasksDone++;

        updateStreak();

    } else {

        appData.tasksDone =
            Math.max(
                0,
                appData.tasksDone - 1
            );

    }


    saveData();

    renderTasks();

    updateDashboard();


    if (task.completed) {

        showToast(
            "Great job! Keep going 🔥"
        );

    }

}


/* =====================================================
   TASK PROGRESS
===================================================== */

function updateTaskProgress() {

    const total =
        appData.tasks.length;


    const completed =
        appData.tasks.filter(
            task => task.completed
        ).length;


    const percent =
        total === 0
            ? 0
            : Math.round(
                (completed / total) * 100
            );


    const progress =
        document.getElementById(
            "taskProgress"
        );


    const percentage =
        document.getElementById(
            "taskPercent"
        );


    if (progress) {

        progress.style.width =
            `${percent}%`;

    }


    if (percentage) {

        percentage.textContent =
            `${percent}% complete`;

    }

}


/* =====================================================
   STREAK
===================================================== */

function updateStreak() {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    if (
        appData.lastActive !== today
    ) {

        appData.streak =
            Math.max(
                1,
                appData.streak || 1
            );

        appData.lastActive =
            today;

    }

}


/* =====================================================
   HISTORY
===================================================== */

function addHistory(
    icon,
    text
) {

    appData.history.unshift({

        id: Date.now(),

        icon: icon,

        text: text,

        date:
            new Date().toISOString()

    });


    if (
        appData.history.length > 50
    ) {

        appData.history =
            appData.history.slice(
                0,
                50
            );

    }

}


function renderHistory() {

    const container =
        document.getElementById(
            "historyList"
        );


    if (!appData.history.length) {

        container.innerHTML = `

            <div class="history-item">

                <div class="history-icon">
                    ✦
                </div>

                <div class="history-content">

                    <strong>
                        No activity yet
                    </strong>

                    <span>
                        Your EvoMind activity will appear here.
                    </span>

                </div>

            </div>

        `;

        return;

    }


    container.innerHTML =
        appData.history
            .map(item => {

                return `

                    <div class="history-item">

                        <div class="history-icon">
                            ${item.icon}
                        </div>

                        <div class="history-content">

                            <strong>
                                ${escapeHtml(item.text)}
                            </strong>

                            <span>
                                ${formatDate(item.date)}
                            </span>

                        </div>

                    </div>

                `;

            })
            .join("");

}


/* =====================================================
   CLEAR HISTORY
===================================================== */

function clearHistory() {

    if (
        !appData.history.length
    ) {

        showToast(
            "History is already empty."
        );

        return;

    }


    const confirmed =
        confirm(
            "Clear all history?"
        );


    if (!confirmed) return;


    appData.history = [];

    saveData();

    renderHistory();

    showToast(
        "History cleared."
    );

}


/* =====================================================
   AI CHAT
===================================================== */

function useSuggestion(text) {

    const input =
        document.getElementById(
            "chatInput"
        );


    input.value = text;

    input.focus();

    sendMessage();

}


function handleChatKey(event) {

    if (
        event.key === "Enter" &&
        !event.shiftKey
    ) {

        event.preventDefault();

        sendMessage();

    }

}


/* =====================================================
   SEND MESSAGE
===================================================== */

async function sendMessage() {

    const input =
        document.getElementById(
            "chatInput"
        );


    const message =
        input.value.trim();


    if (!message) return;


    addUserMessage(message);

    input.value = "";


    appData.messages++;

    addHistory(
        "✦",
        `Asked EvoMind: ${message}`
    );


    saveData();

    updateDashboard();


    const loadingId =
        addLoadingMessage();


    try {

        /*
          Backend endpoint.
          Later we will connect this
          with your backend/server.js.
        */

        const response =
            await fetch(
                "/api/chat",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        message: message
                    })

                }
            );


        if (!response.ok) {

            throw new Error(
                "Server error"
            );

        }


        const data =
            await response.json();


        removeLoadingMessage(
            loadingId
        );


        const reply =
            data.reply ||
            data.message ||
            "I couldn't generate a response right now.";


        addAIMessage(reply);


    } catch (error) {

        console.error(error);


        removeLoadingMessage(
            loadingId
        );


        addAIMessage(
            "I'm unable to connect to my AI server right now. Please make sure the backend is running and try again."
        );

    }

}


/* =====================================================
   CHAT UI
===================================================== */

function addUserMessage(text) {

    const chat =
        document.getElementById(
            "chatArea"
        );


    const message =
        document.createElement("div");


    message.className =
        "message user-message";


    message.innerHTML = `

        <div class="message-content">

            ${escapeHtml(text)}

        </div>

    `;


    chat.appendChild(message);

    scrollChat();

}


function addAIMessage(text) {

    const chat =
        document.getElementById(
            "chatArea"
        );


    const message =
        document.createElement("div");


    message.className =
        "message ai-message";


    message.innerHTML = `

        <div class="message-avatar">
            E
        </div>

        <div class="message-content">

            <strong>EvoMind</strong>

            <p>
                ${formatAIText(text)}
            </p>

        </div>

    `;


    chat.appendChild(message);

    scrollChat();

}


function addLoadingMessage() {

    const chat =
        document.getElementById(
            "chatArea"
        );


    const id =
        "loading-" + Date.now();


    const message =
        document.createElement("div");


    message.id = id;

    message.className =
        "message ai-message";


    message.innerHTML = `

        <div class="message-avatar">
            E
        </div>

        <div class="message-content">

            <strong>EvoMind</strong>

            <p>
                Thinking...
            </p>

        </div>

    `;


    chat.appendChild(message);

    scrollChat();


    return id;

}


function removeLoadingMessage(id) {

    const element =
        document.getElementById(id);


    if (element) {

        element.remove();

    }

}


function scrollChat() {

    const chat =
        document.getElementById(
            "chatArea"
        );


    chat.scrollTop =
        chat.scrollHeight;

}


/* =====================================================
   CLEAR CHAT
===================================================== */

function clearChat() {

    const chat =
        document.getElementById(
            "chatArea"
        );


    chat.innerHTML = `

        <div class="message ai-message">

            <div class="message-avatar">
                E
            </div>

            <div class="message-content">

                <strong>
                    Hey! I'm EvoMind 👋
                </strong>

                <p>
                    Tell me what you're learning or
                    what you're struggling with, and
                    I'll help you move forward.
                </p>

            </div>

        </div>


        <div class="suggestions">

            <button
                onclick="useSuggestion('Explain JavaScript simply')"
            >
                Explain JavaScript simply
            </button>

            <button
                onclick="useSuggestion('Make me a study plan')"
            >
                Make me a study plan
            </button>

            <button
                onclick="useSuggestion('Help me prepare for an interview')"
            >
                Help me prepare for an interview
            </button>

        </div>

    `;


    showToast(
        "Chat cleared."
    );

}/* =====================================================
   DASHBOARD
===================================================== */

function updateDashboard() {

    const journeyCount =
        document.getElementById(
            "homeJourneys"
        );


    const tasksDone =
        document.getElementById(
            "homeTasksDone"
        );


    const streak =
        document.getElementById(
            "homeStreak"
        );


    const messages =
        document.getElementById(
            "homeMessages"
        );


    if (journeyCount) {

        journeyCount.textContent =
            appData.journeys.length;

    }


    if (tasksDone) {

        tasksDone.textContent =
            appData.tasksDone;

    }


    if (streak) {

        streak.textContent =
            appData.streak;

    }


    if (messages) {

        messages.textContent =
            appData.messages;

    }


    const sidebarStreak =
        document.getElementById(
            "sidebarStreak"
        );


    if (sidebarStreak) {

        sidebarStreak.textContent =
            `${appData.streak} day`;

    }


    const taskStreak =
        document.getElementById(
            "taskStreak"
        );


    if (taskStreak) {

        taskStreak.textContent =
            `${appData.streak} day streak`;

    }

}


/* =====================================================
   THEME
===================================================== */

function toggleTheme() {

    if (appData.theme === "dark") {
        appData.theme = "light";
    } else {
        appData.theme = "dark";
    }

    saveData();
    applyTheme();

    showToast(
        appData.theme === "light"
            ? "Light mode enabled ☀️"
            : "Dark mode enabled 🌙"
    );
}


function applyTheme() {

    document.body.dataset.theme =
        appData.theme || "dark";


    const appearanceButton =
        document.querySelector(".appearance-btn");


    if (appearanceButton) {

        const icon =
            appearanceButton.querySelector("span:first-child");

        if (appData.theme === "light") {

            if (icon) {
                icon.textContent = "☀";
            }

            appearanceButton
                .querySelector("span:last-child")
                .textContent = "Dark Mode";

        } else {

            if (icon) {
                icon.textContent = "☾";
            }

            appearanceButton
                .querySelector("span:last-child")
                .textContent = "Appearance";

        }

    }

}

/* =====================================================
   TOAST
===================================================== */

let toastTimer;


function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    toast.textContent =
        message;


    toast.classList.add("show");


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 2500);

}


/* =====================================================
   DATE FORMAT
===================================================== */

function formatDate(dateString) {

    const date =
        new Date(dateString);


    return date.toLocaleString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    );

}


/* =====================================================
   SECURITY HELPER
===================================================== */

function escapeHtml(value) {

    const div =
        document.createElement("div");


    div.textContent =
        String(value);


    return div.innerHTML;

}


/* =====================================================
   SIMPLE AI TEXT FORMATTER
===================================================== */

function formatAIText(text) {

    return escapeHtml(text)
        .replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        )
        .replace(
            /\n/g,
            "<br>"
        );

}


/* =====================================================
   INITIALIZE
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        applyTheme();

        updateDashboard();

        renderTasks();

        renderJourneys();

        renderHistory();

        showPage("home");

    }
);
