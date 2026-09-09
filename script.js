/* =====================================================
   EVOMIND AI — SCRIPT.JS
===================================================== */

/* =====================================================
   BACKEND URL
===================================================== */

// Render backend live hone ke baad yahan uska URL paste karenge.
// Example:
// const BACKEND_URL = "https://evomind-ai-server.onrender.com";

const BACKEND_URL = "https://evomind-ai-server-new.onrender.com";


/* =====================================================
   DEFAULT DATA
===================================================== */

const defaultData = {
    journeys: [],
    tasks: [],
    history: [],
    messages: [],
    streak: 0,
    theme: "dark"
};


/* =====================================================
   LOAD DATA
===================================================== */

function loadData() {

    try {

        const saved = localStorage.getItem("evomindData");

        if (!saved) {
            return { ...defaultData };
        }

        const data = JSON.parse(saved);

        return {
            ...defaultData,
            ...data,
            journeys: Array.isArray(data.journeys) ? data.journeys : [],
            tasks: Array.isArray(data.tasks) ? data.tasks : [],
            history: Array.isArray(data.history) ? data.history : [],
            messages: Array.isArray(data.messages) ? data.messages : []
        };

    } catch (error) {

        console.error("Data loading error:", error);

        return { ...defaultData };
    }
}


let appData = loadData();


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

function showPage(pageId, clickedButton = null) {

    const pages = document.querySelectorAll(".page");

    pages.forEach(page => {
        page.classList.remove("active");
    });


    const selectedPage = document.getElementById(pageId);

    if (selectedPage) {
        selectedPage.classList.add("active");
    }


    const navItems = document.querySelectorAll(".nav-item");

    navItems.forEach(item => {
        item.classList.remove("active");
    });


    if (clickedButton) {

        clickedButton.classList.add("active");

    } else {

        navItems.forEach(item => {

            const text = item.textContent
                .trim()
                .toLowerCase();

            if (
                (pageId === "home" && text.includes("home")) ||
                (pageId === "mentor" && text.includes("mentor")) ||
                (pageId === "journeys" && text.includes("journeys")) ||
                (pageId === "tasks" && text.includes("tasks")) ||
                (pageId === "history" && text.includes("history"))
            ) {
                item.classList.add("active");
            }

        });

    }


    const titles = {
        home: "Home",
        mentor: "AI Mentor",
        journeys: "My Journeys",
        tasks: "Tasks",
        history: "History"
    };


    const pageTitle = document.getElementById("pageTitle");

    if (pageTitle) {
        pageTitle.textContent = titles[pageId] || "EvoMind";
    }


    closeSidebar();

    updateAllUI();
}


/* =====================================================
   SIDEBAR
===================================================== */

function toggleSidebar() {

    const sidebar = document.getElementById("sidebar");

    if (sidebar) {
        sidebar.classList.toggle("open");
    }
}


function closeSidebar() {

    const sidebar = document.getElementById("sidebar");

    if (sidebar) {
        sidebar.classList.remove("open");
    }
}


/* =====================================================
   JOURNEY MODAL
===================================================== */

function openJourneyModal() {

    const modal = document.getElementById("journeyModal");

    if (!modal) return;

    modal.classList.add("show");

    const input = document.getElementById("journeyGoal");

    if (input) {
        setTimeout(() => input.focus(), 100);
    }
}


function closeJourneyModal() {

    const modal = document.getElementById("journeyModal");

    if (modal) {
        modal.classList.remove("show");
    }
}


/* =====================================================
   CREATE JOURNEY
===================================================== */

function createJourney(event) {

    event.preventDefault();


    const goalInput = document.getElementById("journeyGoal");
    const levelInput = document.getElementById("journeyLevel");
    const timeInput = document.getElementById("studyTime");


    const goal = goalInput.value.trim();
    const level = levelInput.value;
    const studyTime = timeInput.value;


    if (!goal) {

        showToast("Please enter a learning goal.");

        return;
    }


    const journey = {

        id: Date.now(),

        goal: goal,

        level: level,

        studyTime: studyTime,

        progress: 0,

        createdAt: new Date().toLocaleDateString(),

        status: "Active"

    };


    appData.journeys.unshift(journey);


    const newTasks = [

        {
            id: Date.now() + 1,
            journeyId: journey.id,
            text: `Learn the basics of ${goal}`,
            completed: false
        },

        {
            id: Date.now() + 2,
            journeyId: journey.id,
            text: `Practice ${goal}`,
            completed: false
        },

        {
            id: Date.now() + 3,
            journeyId: journey.id,
            text: `Build a small ${goal} project`,
            completed: false
        }

    ];


    appData.tasks.push(...newTasks);


    appData.history.unshift({

        id: Date.now(),

        type: "journey",

        text: `Created a new journey: ${goal}`,

        date: new Date().toLocaleString()

    });


    saveData();


    event.target.reset();

    closeJourneyModal();

    updateAllUI();

    showToast("Learning journey created! 🎉");


    setTimeout(() => {

        showPage("journeys");

    }, 500);
}


/* =====================================================
   RENDER JOURNEYS
===================================================== */

function renderJourneys() {

    const container =
        document.getElementById("journeysGrid");

    if (!container) return;


    if (appData.journeys.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <h3>No journeys yet</h3>
                <p>Create your first learning journey to get started.</p>
            </div>
        `;

        return;
    }


    container.innerHTML = appData.journeys.map(journey => {

        const journeyTasks =
            appData.tasks.filter(
                task => task.journeyId === journey.id
            );


        const completed =
            journeyTasks.filter(
                task => task.completed
            ).length;


        const progress =
            journeyTasks.length
                ? Math.round(
                    (completed / journeyTasks.length) * 100
                )
                : 0;


        return `
            <div class="journey-card">

                <div class="page-badge">
                    ${escapeHTML(journey.level)}
                </div>

                <h3>${escapeHTML(journey.goal)}</h3>

                <p>
                    Daily study time:
                    ${escapeHTML(journey.studyTime)}
                </p>

                <div class="journey-progress">

                    <span>
                        Progress: ${progress}%
                    </span>

                    <div class="progress-bar">

                        <div
                            class="progress-fill"
                            style="width:${progress}%"
                        ></div>

                    </div>

                </div>

            </div>
        `;

    }).join("");
}


/* =====================================================
   RENDER TASKS
===================================================== */

function renderTasks() {

    const container =
        document.getElementById("tasksContainer");

    if (!container) return;


    if (appData.tasks.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <h3>No tasks yet</h3>
                <p>Create a learning journey to generate tasks.</p>
            </div>
        `;

        return;
    }


    container.innerHTML = appData.tasks.map(task => {

        return `
            <div class="task-item ${task.completed ? "completed" : ""}">

                <input
                    type="checkbox"
                    class="task-check"
                    ${task.completed ? "checked" : ""}
                    onchange="toggleTask(${task.id})"
                >

                <span class="task-text">
                    ${escapeHTML(task.text)}
                </span>

            </div>
        `;

    }).join("");
}


/* =====================================================
   TOGGLE TASK
===================================================== */

function toggleTask(taskId) {

    const task = appData.tasks.find(
        item => item.id === taskId
    );


    if (!task) return;


    task.completed = !task.completed;


    if (task.completed) {

        appData.history.unshift({

            id: Date.now(),

            type: "task",

            text: `Completed task: ${task.text}`,

            date: new Date().toLocaleString()

        });


        appData.streak++;

        showToast("Task completed! 🎉");} else {

        appData.streak =
            Math.max(0, appData.streak - 1);

    }


    saveData();

    updateAllUI();
}


/* =====================================================
   RENDER HISTORY
===================================================== */

function renderHistory() {

    const container =
        document.getElementById("historyContainer");

    if (!container) return;


    if (appData.history.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <h3>No activity yet</h3>
                <p>Your learning activity will appear here.</p>
            </div>
        `;

        return;
    }


    container.innerHTML =
        appData.history
            .slice(0, 30)
            .map(item => {

                return `
                    <div class="history-item">

                        <strong>
                            ${escapeHTML(item.text)}
                        </strong>

                        <span>
                            ${escapeHTML(item.date)}
                        </span>

                    </div>
                `;

            })
            .join("");
}


/* =====================================================
   UPDATE STATS
===================================================== */

function updateStats() {

    const journeyCount =
        document.getElementById("journeyCount");

    const taskCount =
        document.getElementById("taskCount");

    const streakCount =
        document.getElementById("streakCount");

    const completedTasks =
        document.getElementById("completedTasks");

    const pendingTasks =
        document.getElementById("pendingTasks");


    const completed =
        appData.tasks.filter(
            task => task.completed
        ).length;


    const pending =
        appData.tasks.length - completed;


    if (journeyCount) {
        journeyCount.textContent =
            appData.journeys.length;
    }


    if (taskCount) {
        taskCount.textContent = completed;
    }


    if (streakCount) {
        streakCount.textContent =
            appData.streak;
    }


    if (completedTasks) {
        completedTasks.textContent =
            completed;
    }


    if (pendingTasks) {
        pendingTasks.textContent =
            pending;
    }
}


/* =====================================================
   UPDATE ALL UI
===================================================== */

function updateAllUI() {

    updateStats();

    renderJourneys();

    renderTasks();

    renderHistory();

    renderMessages();
}


/* =====================================================
   AI SUGGESTION
===================================================== */

function useSuggestion(text) {

    const input =
        document.getElementById("chatInput");

    if (!input) return;


    input.value = text;

    input.focus();
}


/* =====================================================
   SEND AI MESSAGE
===================================================== */

async function sendMessage() {

    const input =
        document.getElementById("chatInput");

    const chatArea =
        document.getElementById("chatArea");


    if (!input || !chatArea) return;


    const message =
        input.value.trim();


    if (!message) {

        showToast("Please enter a message.");

        return;
    }


    addMessage("user", message);


    input.value = "";


    const loadingId =
        addMessage(
            "assistant",
            "Thinking..."
        );


    try {

        /*
           Backend URL is empty for now.

           We will connect this after
           Render backend is successfully deployed.
        */

        if (!BACKEND_URL) {

            updateMessage(
                loadingId,
                "AI Mentor will be connected after the backend is deployed. 🚀"
            );

            return;
        }


        const response =
            await fetch(
                `${BACKEND_URL}/api/chat`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        message: message,

                        history:
                            appData.messages
                                .slice(-10)
                                .map(item => ({
                                    role: item.role,
                                    content: item.content
                                }))

                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.error ||
                "AI service failed."
            );
        }


        updateMessage(
            loadingId,
            data.reply
        );


        appData.history.unshift({

            id: Date.now(),

            type: "chat",

            text: `Asked AI Mentor: ${message}`,

            date: new Date().toLocaleString()

        });


        saveData();

        renderHistory();


    } catch (error) {

        console.error("Chat error:", error);


        updateMessage(
            loadingId,
            "Sorry, I couldn't connect to the AI server right now."
        );


        showToast("AI server connection failed.");

    }
}


/* =====================================================
   ADD MESSAGE
===================================================== */

function addMessage(role, content) {

    const message = {

        id: Date.now() + Math.random(),

        role: role,

        content: content

    };


    appData.messages.push(message);

    saveData();


    renderMessages();


    return message.id;
}


/* =====================================================
   UPDATE MESSAGE
===================================================== */

function updateMessage(id, newContent) {

    const message =
        appData.messages.find(
            item => item.id === id
        );


    if (!message) return;


    message.content = newContent;

    saveData();

    renderMessages();
}


/* =====================================================
   RENDER MESSAGES
===================================================== */

function renderMessages() {

    const chatArea =
        document.getElementById("chatArea");

    if (!chatArea) return;


    const welcome = `
        <div class="welcome-message">

            <div class="mentor-avatar">
                ✦
            </div>

            <div>

                <h3>Hi! I'm EvoMind 👋</h3>

                <p>
                    I'm here to help you learn.
                    What would you like to work on today?
                </p>

            </div>

        </div>
    `;


    const messagesHTML =
        appData.messages.map(message => {

            return `
                <div class="message ${message.role}">

                    <div class="message-bubble">
                        ${escapeHTML(message.content)}
                    </div>

                </div>
            `;

        }).join("");


    chatArea.innerHTML =
        welcome + messagesHTML;


    chatArea.scrollTop =
        chatArea.scrollHeight;
}


/* =====================================================
   THEME
===================================================== */

function toggleTheme() {

    appData.theme =
        appData.theme === "dark"
            ? "light"
            : "dark";


    applyTheme();

    saveData();

    showToast(
        appData.theme === "dark"
            ? "Dark mode enabled 🌙"
            : "Light mode enabled ☀️"
    );
}


function applyTheme() {

    document.body.dataset.theme =
        appData.theme;
}


/* =====================================================
   TOAST
===================================================== */

function showToast(message) {

    const toast =
        document.getElementById("toast");

    const toastMessage =
        document.getElementById("toastMessage");


    if (!toast || !toastMessage) return;


    toastMessage.textContent = message;

    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);
}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =====================================================
   KEYBOARD SHORTCUT
===================================================== */

document.addEventListener(
    "keydown",
    function(event) {

        const input =
            document.getElementById("chatInput");


        if (
            event.key === "Enter" &&
            !event.shiftKey &&
            document.activeElement === input
        ) {

            event.preventDefault();

            sendMessage();
        }


        if (event.key === "Escape") {

            closeJourneyModal();

            closeSidebar();
        }

    }
);


/* =====================================================
   MODAL OUTSIDE CLICK
===================================================== */

document.addEventListener(
    "click",
    function(event) {

        const modal =
            document.getElementById("journeyModal");


        if (
            modal &&
            event.target === modal
        ) {

            closeJourneyModal();
        }

    }
);


/* =====================================================
   INITIALIZE APP
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        applyTheme();

        updateAllUI();

        showPage("home");

    }
);
