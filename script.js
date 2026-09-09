// ==========================================
// EvoMind AI - script.js
// ==========================================

const BACKEND_URL =
    "https://evomind-ai-server-new.onrender.com";


// ==========================================
// DATA
// ==========================================

const defaultData = {
    journeys: [],
    tasks: [],
    history: [],
    chatMessages: []
};

let appData = loadData();


// ==========================================
// LOAD DATA
// ==========================================

function loadData() {

    try {

        const saved =
            localStorage.getItem("evomindData");

        if (!saved) {
            return {
                journeys: [],
                tasks: [],
                history: [],
                chatMessages: []
            };
        }

        const data = JSON.parse(saved);

        return {
            journeys: data.journeys || [],
            tasks: data.tasks || [],
            history: data.history || [],
            chatMessages: data.chatMessages || []
        };

    } catch (error) {

        console.error("Data loading error:", error);

        return {
            journeys: [],
            tasks: [],
            history: [],
            chatMessages: []
        };
    }
}


// ==========================================
// SAVE DATA
// ==========================================

function saveData() {

    localStorage.setItem(
        "evomindData",
        JSON.stringify(appData)
    );
}


// ==========================================
// PAGE NAVIGATION
// ==========================================

function showPage(pageName, button = null) {

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    const page =
        document.getElementById(pageName);

    if (page) {
        page.classList.add("active");
    }

    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
    });

    if (button) {

        button.classList.add("active");

    } else {

        document.querySelectorAll(".nav-item").forEach(item => {

            const onclick =
                item.getAttribute("onclick") || "";

            if (
                onclick.includes("'" + pageName + "'")
            ) {
                item.classList.add("active");
            }

        });

    }

    // Page title
    const titles = {
        home: "Home",
        mentor: "AI Mentor",
        journeys: "My Journeys",
        tasks: "Tasks",
        history: "History"
    };

    const title =
        document.getElementById("pageTitle");

    if (title) {
        title.textContent =
            titles[pageName] || "EvoMind";
    }

    // Close mobile sidebar
    const sidebar =
        document.getElementById("sidebar");

    if (sidebar) {
        sidebar.classList.remove("open");
    }
}


// ==========================================
// SIDEBAR
// ==========================================

function toggleSidebar() {

    const sidebar =
        document.getElementById("sidebar");

    if (sidebar) {
        sidebar.classList.toggle("open");
    }
}


// ==========================================
// JOURNEY MODAL
// ==========================================

function openJourneyModal() {

    const modal =
        document.getElementById("journeyModal");

    if (!modal) {
        console.error("journeyModal not found");
        return;
    }

    modal.classList.add("show");

    setTimeout(() => {

        const input =
            document.getElementById("journeyGoal");

        if (input) {
            input.focus();
        }

    }, 100);
}


function closeJourneyModal() {

    const modal =
        document.getElementById("journeyModal");

    if (modal) {
        modal.classList.remove("show");
    }
}


// Close modal when clicking outside

document.addEventListener("click", function(event) {

    const modal =
        document.getElementById("journeyModal");

    if (
        modal &&
        event.target === modal
    ) {
        closeJourneyModal();
    }

});


// ==========================================
// CREATE JOURNEY
// ==========================================

function createJourney(event) {

    // Very important for form
    if (event) {
        event.preventDefault();
    }

    console.log("Create Journey button clicked");

    const goalInput =
        document.getElementById("journeyGoal");

    const levelInput =
        document.getElementById("journeyLevel");

    const timeInput =
        document.getElementById("studyTime");


    // Check inputs

    if (!goalInput) {

        console.error(
            "journeyGoal input not found"
        );

        showToast(
            "Something went wrong. Please refresh."
        );

        return;
    }


    const goal =
        goalInput.value.trim();


    const level =
        levelInput
            ? levelInput.value
            : "Beginner";


    const dailyTime =
        timeInput
            ? timeInput.value
            : "30 minutes";


    // Empty goal

    if (goal === "") {

        showToast(
            "Please enter a learning goal."
        );

        goalInput.focus();

        return;
    }


    // Unique ID

    const journeyId =
        Date.now().toString();


    // Create journey

    const journey = {

        id: journeyId,

        goal: goal,

        level: level,

        dailyTime: dailyTime,

        progress: 0,

        createdAt:
            new Date().toISOString()

    };


    // Add journey

    appData.journeys.push(journey);


    // Create learning tasks

    const taskTitles = [

        `Understand the basics of ${goal}`,

        `Practice ${goal} with examples`,

        `Build a small project using ${goal}`

    ];


    taskTitles.forEach((title, index) => {

        appData.tasks.push({

            id:
                Date.now() + index + 1,

            journeyId:
                journeyId,

            title:
                title,

            completed:
                false

        });

    });


    // Add history

    appData.history.unshift({

        id:
            Date.now(),

        type:
            "journey",

        message:
            `Created a new learning journey: ${goal}`,

        date:
            new Date().toISOString()

    });


    // SAVE

    saveData();


    console.log(
        "Journey created:",
        journey
    );


    // Clear form

    goalInput.value = "";


    if (levelInput) {
        levelInput.value = "Beginner";
    }


    if (timeInput) {
        timeInput.value = "30 minutes";
    }


    // Close modal

    closeJourneyModal();


    // Update everything

    updateDashboard();

    renderJourneys();

    renderTasks();

    renderHistory();


    // Open journeys page

    showPage("journeys");


    // Success message

    showToast(
        "🎉 Journey created successfully!"
    );
}


// ==========================================
// RENDER JOURNEYS
// ==========================================

function renderJourneys() {

    const container =
        document.getElementById("journeysGrid");

    if (!container) {
        return;
    }


    if (appData.journeys.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ◎
                </div>

                <h3>
                    No learning journeys yet
                </h3>

                <p>
                    Create your first journey
                    and start learning.
                </p>

                <button
                    class="primary-btn"
                    onclick="openJourneyModal()"
                >
                    + Create Journey
                </button>

            </div>

        `;

        return;
    }


    container.innerHTML =
        appData.journeys.map(journey => {

            const tasks =
                appData.tasks.filter(
                    task =>
                        task.journeyId === journey.id
                );


            const completed =
                tasks.filter(
                    task => task.completed
                ).length;


            const total =
                tasks.length;


            const progress =
                total === 0
                    ? 0
                    : Math.round(
                        (completed / total) * 100
                    );


            return `

                <div class="journey-card">

                    <div class="journey-card-header">

                        <div class="journey-icon">
                            ◎
                        </div>

                        <button
                            class="delete-btn"
                            onclick="deleteJourney('${journey.id}')"
                        >
                            ×
                        </button>

                    </div>


                    <h3>
                        ${escapeHTML(journey.goal)}
                    </h3>


                    <div class="journey-meta">

                        <span>
                            📊 ${escapeHTML(journey.level)}
                        </span>

                        <span>
                            ⏱️ ${escapeHTML(journey.dailyTime)}
                        </span>

                    </div>


                    <div class="progress-section">

                        <div class="progress-info">

                            <span>
                                Progress
                            </span>

                            <strong>
                                ${progress}%
                            </strong>

                        </div>


                        <div class="progress-bar">

                            <div
                                class="progress-fill"
                                style="width:${progress}%"
                            ></div>

                        </div>

                    </div>


                    <p class="task-info">

                        ${completed}
                        of
                        ${total}
                        tasks completed

                    </p>


                    <button
                        class="secondary-btn"
                        onclick="viewJourneyTasks('${journey.id}')"
                    >
                        View Tasks →
                    </button>

                </div>

            `;

        }).join("");
}


// ==========================================
// DELETE JOURNEY
// ==========================================

function deleteJourney(journeyId) {

    const journey =
        appData.journeys.find(
            item => item.id === journeyId
        );

    if (!journey) {
        return;
    }


    const confirmDelete =
        confirm(
            `Delete "${journey.goal}" journey?`
        );


    if (!confirmDelete) {
        return;
    }


    appData.journeys =
        appData.journeys.filter(
            item =>
                item.id !== journeyId
        );


    appData.tasks =
        appData.tasks.filter(
            task =>
                task.journeyId !== journeyId
        );


    appData.history.unshift({

        id:
            Date.now(),

        type:
            "journey",

        message:
            `Deleted learning journey: ${journey.goal}`,

        date:
            new Date().toISOString()

    });


    saveData();


    renderJourneys();

    renderTasks();

    renderHistory();

    updateDashboard();


    showToast(
        "Journey deleted."
    );
}


// ==========================================
// VIEW JOURNEY TASKS
// ==========================================

function viewJourneyTasks(journeyId) {

    showPage("tasks");


    setTimeout(() => {

        const task =
            document.querySelector(
                `[data-journey-id="${journeyId}"]`
            );

        if (task) {

            task.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }

    }, 200);
}


// ==========================================
// RENDER TASKS
// ==========================================

function renderTasks() {

    const container =
        document.getElementById("tasksContainer");

    if (!container) {
        return;
    }


    const completed =
        appData.tasks.filter(
            task => task.completed
        ).length;


    const pending =
        appData.tasks.filter(
            task => !task.completed
        ).length;


    const completedElement =
        document.getElementById(
            "completedTasks"
        );


    const pendingElement =
        document.getElementById(
            "pendingTasks"
        );


    if (completedElement) {
        completedElement.textContent =
            completed;
    }


    if (pendingElement) {
        pendingElement.textContent =
            pending;
    }


    if (appData.tasks.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ✓
                </div>

                <h3>
                    No tasks yet
                </h3>

                <p>
                    Create a learning journey
                    to generate tasks.
                </p>

            </div>

        `;

        return;
    }


    container.innerHTML =
        appData.tasks.map(task => {

            const journey =
                appData.journeys.find(
                    item =>
                        item.id === task.journeyId
                );


            return `

                <div
                    class="task-item ${task.completed ? "completed" : ""}"
                    data-journey-id="${task.journeyId}"
                >

                    <button
                        class="task-check"
                        onclick="toggleTask(${task.id})"
                    >
                        ${task.completed ? "✓" : ""}
                    </button>


                    <div class="task-content">

                        <h4>
                            ${escapeHTML(task.title)}
                        </h4>

                        ${
                            journey
                                ? `
                                    <small>
                                        🧭
                                        ${escapeHTML(journey.goal)}
                                    </small>
                                `
                                : ""
                        }

                    </div>

                </div>

            `;

        }).join("");
}


// ==========================================
// TOGGLE TASK
// ==========================================

function toggleTask(taskId) {

    const task =
        appData.tasks.find(
            item =>
                item.id === taskId
        );


    if (!task) {
        return;
    }


    task.completed =
        !task.completed;


    if (task.completed) {

        appData.history.unshift({

            id:
                Date.now(),

            type:
                "task",

            message:
                `Completed task: ${task.title}`,

            date:
                new Date().toISOString()

        });

    }


    saveData();


    renderTasks();

    renderJourneys();

    renderHistory();

    updateDashboard();


    if (task.completed) {

        showToast(
            "✅ Task completed!"
        );

    }
}


// ==========================================
// HISTORY
// ==========================================

function renderHistory() {

    const container =
        document.getElementById(
            "historyContainer"
        );


    if (!container) {
        return;
    }


    if (appData.history.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ◷
                </div>

                <h3>
                    No activity yet
                </h3>

                <p>
                    Your learning activity
                    will appear here.
                </p>

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

                        <div class="history-icon">
                            ${
                                item.type === "task"
                                    ? "✓"
                                    : "◎"
                            }
                        </div>

                        <div>

                            <p>
                                ${escapeHTML(item.message)}
                            </p>

                            <small>
                                ${formatDate(item.date)}
                            </small>

                        </div>

                    </div>

                `;

            })
            .join("");
}


// ==========================================
// DASHBOARD
// ==========================================

function updateDashboard() {

    const journeyCount =
        document.getElementById(
            "journeyCount"
        );


    const taskCount =
        document.getElementById(
            "taskCount"
        );


    const streakCount =
        document.getElementById(
            "streakCount"
        );


    const completedTasks =
        appData.tasks.filter(
            task => task.completed
        ).length;


    if (journeyCount) {

        journeyCount.textContent =
            appData.journeys.length;

    }


    if (taskCount) {

        taskCount.textContent =
            completedTasks;

    }


    if (streakCount) {

        streakCount.textContent =
            calculateStreak();

    }
}


// ==========================================
// STREAK
// ==========================================

function calculateStreak() {

    const completed =
        appData.history.filter(
            item =>
                item.type === "task"
        );


    if (completed.length === 0) {
        return 0;
    }


    const dates =
        [
            ...new Set(
                completed.map(item =>
                    new Date(item.date)
                        .toISOString()
                        .split("T")[0]
                )
            )
        ];


    dates.sort(
        (a, b) =>
            new Date(b) -
            new Date(a)
    );


    let streak = 1;


    for (
        let i = 0;
        i < dates.length - 1;
        i++
    ) {

        const current =
            new Date(dates[i]);


        const previous =
            new Date(dates[i + 1]);


        const difference =
            Math.round(
                (
                    current - previous
                ) /
                (1000 * 60 * 60 * 24)
            );


        if (difference === 1) {

            streak++;

        } else {

            break;

        }
    }


    return streak;
}


// ==========================================
// AI SUGGESTION
// ==========================================

function useSuggestion(text) {

    showPage("mentor");


    const input =
        document.getElementById(
            "chatInput"
        );


    if (input) {

        input.value = text;

        input.focus();

    }
}


// ==========================================
// AI CHAT
// ==========================================

async function sendMessage() {

    const input =
        document.getElementById(
            "chatInput"
        );


    if (!input) {
        return;
    }


    const message =
        input.value.trim();


    if (!message) {
        return;
    }


    addUserMessage(message);


    input.value = "";


    const loading =
        addAIMessage(
            "Thinking..."
        );


    try {

        const response =
            await fetch(
                `${BACKEND_URL}/api/chat`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        message:
                            message,

                        history:
                            appData.chatMessages
                                .slice(-10)

                    })

                }
            );


        const data =
            await response.json();


        if (loading) {
            loading.remove();
        }


        if (
            data.success &&
            data.reply
        ) {

            addAIMessage(
                data.reply
            );

        } else {

            addAIMessage(
                "Sorry, I could not generate a response."
            );

        }

    } catch (error) {

        console.error(
            "AI error:",
            error
        );


        if (loading) {
            loading.remove();
        }


        addAIMessage(
            "⚠️ Unable to connect to EvoMind AI."
        );

    }
}


// ==========================================
// CHAT AREA
// ==========================================

function addUserMessage(message) {

    const chatArea =
        document.getElementById(
            "chatArea"
        );


    if (!chatArea) {
        return;
    }


    const div =
        document.createElement("div");


    div.className =
        "message user";


    div.innerHTML = `

        <div class="message-bubble">
            ${escapeHTML(message)}
        </div>

    `;


    chatArea.appendChild(div);


    chatArea.scrollTop =
        chatArea.scrollHeight;


    appData.chatMessages.push({

        role:
            "user",

        content:
            message

    });


    saveData();
}


function addAIMessage(message) {

    const chatArea =
        document.getElementById(
            "chatArea"
        );


    if (!chatArea) {
        return null;
    }


    const div =
        document.createElement("div");


    div.className =
        "message assistant";


    div.innerHTML = `

        <div class="message-avatar">
            ✦
        </div>

        <div class="message-bubble">
            ${escapeHTML(message)}
        </div>

    `;


    chatArea.appendChild(div);


    chatArea.scrollTop =
        chatArea.scrollHeight;


    if (message !== "Thinking...") {

        appData.chatMessages.push({

            role:
                "assistant",

            content:
                message

        });


        saveData();

    }


    return div;
}


// ==========================================
// ENTER KEY
// ==========================================

function handleChatKey(event) {

    if (
        event.key === "Enter" &&
        !event.shiftKey
    ) {

        event.preventDefault();

        sendMessage();

    }
}


// ==========================================
// THEME
// ==========================================

function toggleTheme() {

    const body =
        document.body;


    const current =
        body.getAttribute(
            "data-theme"
        );


    const newTheme =
        current === "dark"
            ? "light"
            : "dark";


    body.setAttribute(
        "data-theme",
        newTheme
    );


    localStorage.setItem(
        "evomindTheme",
        newTheme
    );


    showToast(
        newTheme === "dark"
            ? "🌙 Dark mode"
            : "☀️ Light mode"
    );
}


function loadTheme() {

    const saved =
        localStorage.getItem(
            "evomindTheme"
        );


    if (saved) {

        document.body.setAttribute(
            "data-theme",
            saved
        );

    }

}


// ==========================================
// TOAST
// ==========================================

function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    const toastMessage =
        document.getElementById(
            "toastMessage"
        );


    if (!toast) {
        return;
    }


    if (toastMessage) {

        toastMessage.textContent =
            message;

    }


    toast.classList.add(
        "show"
    );


    setTimeout(() => {

        toast.classList.remove(
            "show"
        );

    }, 3000);
}


// ==========================================
// UTILITIES
// ==========================================

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(value);


    return div.innerHTML;
}


function formatDate(date) {

    try {

        return new Date(date)
            .toLocaleString(
                "en-IN",
                {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit"
                }
            );

    } catch (error) {

        return "";

    }
}


// ==========================================
// LOAD OLD CHAT
// ==========================================

function loadChatHistory() {

    const chatArea =
        document.getElementById(
            "chatArea"
        );


    if (
        !chatArea ||
        appData.chatMessages.length === 0
    ) {
        return;
    }


    appData.chatMessages
        .slice(-20)
        .forEach(message => {

            const div =
                document.createElement(
                    "div"
                );


            if (
                message.role === "user"
            ) {

                div.className =
                    "message user";


                div.innerHTML = `

                    <div class="message-bubble">
                        ${escapeHTML(message.content)}
                    </div>

                `;

            } else {

                div.className =
                    "message assistant";


                div.innerHTML = `

                    <div class="message-avatar">
                        ✦
                    </div>

                    <div class="message-bubble">
                        ${escapeHTML(message.content)}
                    </div>

                `;

            }


            chatArea.appendChild(div);

        });


    chatArea.scrollTop =
        chatArea.scrollHeight;
}


// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "EvoMind loaded successfully"
        );

        loadTheme();

        updateDashboard();

        renderJourneys();

        renderTasks();

        renderHistory();

        loadChatHistory();

        showPage("home");


        const chatInput =
            document.getElementById(
                "chatInput"
            );


        if (chatInput) {

            chatInput.addEventListener(
                "keydown",
                handleChatKey
            );

        }

    }
);
