/* =========================================
   EvoMind AI - Main JavaScript
   ========================================= */

// ===============================
// BACKEND
// ===============================

const BACKEND_URL =
  "https://evomind-ai-server-new.onrender.com";


// ===============================
// DEFAULT DATA
// ===============================

const defaultData = {
  journeys: [],
  tasks: [],
  history: [],
  chatMessages: []
};


// ===============================
// LOAD DATA
// ===============================

let appData = JSON.parse(
  localStorage.getItem("evomindData")
) || defaultData;


// Make sure all properties exist
appData.journeys = appData.journeys || [];
appData.tasks = appData.tasks || [];
appData.history = appData.history || [];
appData.chatMessages = appData.chatMessages || [];


// ===============================
// SAVE DATA
// ===============================

function saveData() {
  localStorage.setItem(
    "evomindData",
    JSON.stringify(appData)
  );
}


// ===============================
// PAGE NAVIGATION
// ===============================

function showPage(pageName, clickedButton = null) {

  const pages = document.querySelectorAll(".page");

  pages.forEach(page => {
    page.classList.remove("active");
  });

  const selectedPage =
    document.getElementById(pageName);

  if (selectedPage) {
    selectedPage.classList.add("active");
  }

  // Update active navigation button
  const navItems =
    document.querySelectorAll(".nav-item");

  navItems.forEach(item => {
    item.classList.remove("active");
  });

  if (clickedButton) {
    clickedButton.classList.add("active");
  } else {

    navItems.forEach(item => {

      const onclickValue =
        item.getAttribute("onclick") || "";

      if (
        onclickValue.includes(`'${pageName}'`)
      ) {
        item.classList.add("active");
      }

    });

  }

  // Close mobile sidebar
  const sidebar =
    document.querySelector(".sidebar");

  if (sidebar) {
    sidebar.classList.remove("open");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


// ===============================
// SIDEBAR
// ===============================

function toggleSidebar() {

  const sidebar =
    document.querySelector(".sidebar");

  if (sidebar) {
    sidebar.classList.toggle("open");
  }
}


// ===============================
// JOURNEY MODAL
// ===============================

function openJourneyModal() {

  const modal =
    document.getElementById("journeyModal");

  if (!modal) return;

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


// ===============================
// CREATE JOURNEY
// ===============================

function createJourney(event) {

  if (event) {
    event.preventDefault();
  }

  const goalInput =
    document.getElementById("journeyGoal");

  const levelInput =
    document.getElementById("journeyLevel");

  const timeInput =
    document.getElementById("studyTime");

  if (!goalInput) {
    showToast("Journey input not found.");
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


  // Check empty goal
  if (!goal) {

    showToast(
      "Please enter your learning goal."
    );

    goalInput.focus();

    return;
  }


  // Create unique journey
  const journey = {

    id:
      Date.now().toString(),

    goal: goal,

    level: level,

    dailyTime: dailyTime,

    progress: 0,

    createdAt:
      new Date().toISOString(),

    tasks: [

      {
        id: Date.now() + 1,
        title: `Learn the basics of ${goal}`,
        completed: false
      },

      {
        id: Date.now() + 2,
        title: `Practice ${goal}`,
        completed: false
      },

      {
        id: Date.now() + 3,
        title: `Build a small ${goal} project`,
        completed: false
      }

    ]

  };


  // Add journey
  appData.journeys.push(journey);


  // Add tasks
  journey.tasks.forEach(task => {

    appData.tasks.push({

      id: task.id,

      journeyId: journey.id,

      title: task.title,

      completed: false

    });

  });


  // Add history
  appData.history.unshift({

    id: Date.now(),

    type: "journey",

    message:
      `Created a new learning journey: ${goal}`,

    date:
      new Date().toISOString()

  });


  saveData();


  // Reset form
  goalInput.value = "";

  if (levelInput) {
    levelInput.selectedIndex = 0;
  }

  if (timeInput) {
    timeInput.selectedIndex = 0;
  }


  // Close modal
  closeJourneyModal();


  // Refresh UI
  updateDashboard();

  renderJourneys();

  renderTasks();

  renderHistory();


  // Open journeys page
  showPage("journeys");


  showToast(
    "🎉 Journey created successfully!"
  );
}


// ===============================
// RENDER JOURNEYS
// ===============================

function renderJourneys() {

  const container =
    document.getElementById("journeysGrid");

  if (!container) return;


  // Empty state
  if (appData.journeys.length === 0) {

    container.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">🧭</div>

        <h3>No learning journeys yet</h3>

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

      const journeyTasks =
        appData.tasks.filter(
          task =>
            task.journeyId === journey.id
        );

      const completed =
        journeyTasks.filter(
          task => task.completed
        ).length;

      const total =
        journeyTasks.length;

      const progress =
        total > 0
          ? Math.round(
              (completed / total) * 100
            )
          : 0;


      return `

        <div class="journey-card">

          <div class="journey-card-header">

            <div class="journey-icon">
              🚀
            </div>

            <button
              class="delete-btn"
              onclick="deleteJourney('${journey.id}')"
              title="Delete journey"
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

              <span>Progress</span>

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
            ${completed} of ${total} tasks completed
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


// ===============================
// DELETE JOURNEY
// ===============================

function deleteJourney(journeyId) {

  const journey =
    appData.journeys.find(
      item => item.id === journeyId
    );

  if (!journey) return;


  const confirmed =
    confirm(
      `Delete "${journey.goal}" journey?`
    );

  if (!confirmed) return;


  appData.journeys =
    appData.journeys.filter(
      item => item.id !== journeyId
    );


  appData.tasks =
    appData.tasks.filter(
      task => task.journeyId !== journeyId
    );


  appData.history.unshift({

    id: Date.now(),

    type: "journey",

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


// ===============================
// VIEW JOURNEY TASKS
// ===============================

function viewJourneyTasks(journeyId) {

  showPage("tasks");

  setTimeout(() => {

    const firstTask =
      document.querySelector(
        `[data-journey-id="${journeyId}"]`
      );

    if (firstTask) {

      firstTask.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

    }

  }, 100);
}


// ===============================
// RENDER TASKS
// ===============================

function renderTasks() {

  const container =
    document.getElementById("tasksContainer");

  if (!container) return;


  const completedCount =
    appData.tasks.filter(
      task => task.completed
    ).length;

  const pendingCount =
    appData.tasks.filter(
      task => !task.completed
    ).length;


  // Update counters
  const completedElement =
    document.getElementById("completedTasks");

  const pendingElement =
    document.getElementById("pendingTasks");


  if (completedElement) {
    completedElement.textContent =
      completedCount;
  }

  if (pendingElement) {
    pendingElement.textContent =
      pendingCount;
  }


  // Empty state
  if (appData.tasks.length === 0) {

    container.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">
          📚
        </div>

        <h3>No tasks yet</h3>

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
            aria-label="Complete task"
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
                    🧭 ${escapeHTML(journey.goal)}
                  </small>
                `
                : ""
            }

          </div>

        </div>

      `;

    }).join("");
}


// ===============================
// TOGGLE TASK
// ===============================

function toggleTask(taskId) {

  const task =
    appData.tasks.find(
      item => item.id === taskId
    );

  if (!task) return;


  task.completed =
    !task.completed;


  // Add history
  if (task.completed) {

    appData.history.unshift({

      id: Date.now(),

      type: "task",

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


// ===============================
// HISTORY
// ===============================

function renderHistory() {

  const container =
    document.getElementById(
      "historyContainer"
    );

  if (!container) return;


  if (appData.history.length === 0) {

    container.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">
          🕒
        </div>

        <h3>No activity yet</h3>

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
                  ? "✅"
                  : "🧭"
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

      }).join("");
}


// ===============================
// DASHBOARD
// ===============================

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


// ===============================
// STREAK
// ===============================

function calculateStreak() {

  const completedHistory =
    appData.history.filter(
      item => item.type === "task"
    );


  if (completedHistory.length === 0) {
    return 0;
  }


  const dates = [
    ...new Set(
      completedHistory.map(
        item =>
          new Date(item.date)
            .toISOString()
            .split("T")[0]
      )
    )
  ];


  dates.sort(
    (a, b) =>
      new Date(b) - new Date(a)
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


// ===============================
// AI CHAT
// ===============================

async function sendMessage() {

  const input =
    document.getElementById(
      "chatInput"
    );


  if (!input) return;


  const message =
    input.value.trim();


  if (!message) return;


  // Show user message
  addUserMessage(message);


  input.value = "";


  // Show loading
  const loadingId =
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

            message: message,

            history:
              appData.chatMessages
                .slice(-10)

          })

        }
      );


    const data =
      await response.json();


    removeMessage(loadingId);


    if (
      data.success &&
      data.reply
    ) {

      addAIMessage(
        data.reply
      );

    } else {

      addAIMessage(
        "Sorry, I couldn't get a response right now."
      );

    }

  } catch (error) {

    console.error(
      "Chat error:",
      error
    );


    removeMessage(loadingId);


    addAIMessage(
      "⚠️ Unable to connect to EvoMind AI. Please try again."
    );

  }

}


// ===============================
// ADD USER MESSAGE
// ===============================

function addUserMessage(message) {

  const chatContainer =
    document.getElementById(
      "chatMessages"
    );


  if (!chatContainer) return;


  const messageElement =
    document.createElement("div");


  messageElement.className =
    "message user";


  messageElement.innerHTML = `

    <div class="message-bubble">
      ${escapeHTML(message)}
    </div>

  `;


  chatContainer.appendChild(
    messageElement
  );


  chatContainer.scrollTop =
    chatContainer.scrollHeight;


  appData.chatMessages.push({

    role: "user",

    content: message

  });


  saveData();
}


// ===============================
// ADD AI MESSAGE
// ===============================

function addAIMessage(message) {

  const chatContainer =
    document.getElementById(
      "chatMessages"
    );


  if (!chatContainer) {
    return null;
  }


  const id =
    "msg-" + Date.now();


  const messageElement =
    document.createElement("div");


  messageElement.id = id;

  messageElement.className =
    "message assistant";


  messageElement.innerHTML = `

    <div class="message-avatar">
      🤖
    </div>

    <div class="message-bubble">
      ${escapeHTML(message)}
    </div>

  `;


  chatContainer.appendChild(
    messageElement
  );


  chatContainer.scrollTop =
    chatContainer.scrollHeight;


  // Don't save temporary loading message
  if (message !== "Thinking...") {

    appData.chatMessages.push({

      role: "assistant",

      content: message

    });

    saveData();

  }


  return id;
}


// ===============================
// REMOVE MESSAGE
// ===============================

function removeMessage(id) {

  const element =
    document.getElementById(id);

  if (element) {
    element.remove();
  }

}


// ===============================
// CLEAR CHAT
// ===============================

function clearChat() {

  const chatContainer =
    document.getElementById(
      "chatMessages"
    );


  if (chatContainer) {

    chatContainer.innerHTML = "";

  }


  appData.chatMessages = [];

  saveData();


  showToast(
    "Chat cleared."
  );
}


// ===============================
// ENTER KEY CHAT
// ===============================

function handleChatKey(event) {

  if (
    event.key === "Enter" &&
    !event.shiftKey
  ) {

    event.preventDefault();

    sendMessage();

  }

}


// ===============================
// THEME
// ===============================

function toggleTheme() {

  document.body.classList.toggle(
    "light-theme"
  );


  const isLight =
    document.body.classList.contains(
      "light-theme"
    );


  localStorage.setItem(
    "evomindTheme",
    isLight
      ? "light"
      : "dark"
  );


  showToast(
    isLight
      ? "☀️ Light mode enabled"
      : "🌙 Dark mode enabled"
  );
}


// ===============================
// LOAD THEME
// ===============================

function loadTheme() {

  const savedTheme =
    localStorage.getItem(
      "evomindTheme"
    );


  if (
    savedTheme === "light"
  ) {

    document.body.classList.add(
      "light-theme"
    );

  }

}


// ===============================
// TOAST
// ===============================

function showToast(message) {

  const toast =
    document.getElementById(
      "toast"
    );

  const toastMessage =
    document.getElementById(
      "toastMessage"
    );


  if (!toast) return;


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


// ===============================
// DATE FORMAT
// ===============================

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

  } catch {

    return "";

  }

}


// ===============================
// ESCAPE HTML
// ===============================

function escapeHTML(value) {

  const div =
    document.createElement("div");

  div.textContent =
    String(value);

  return div.innerHTML;
}


// ===============================
// LOAD CHAT HISTORY
// ===============================

function loadChatHistory() {

  const chatContainer =
    document.getElementById(
      "chatMessages"
    );


  if (
    !chatContainer ||
    appData.chatMessages.length === 0
  ) {
    return;
  }


  appData.chatMessages
    .slice(-20)
    .forEach(message => {

      const element =
        document.createElement("div");


      if (
        message.role === "user"
      ) {

        element.className =
          "message user";

        element.innerHTML = `

          <div class="message-bubble">
            ${escapeHTML(
              message.content
            )}
          </div>

        `;

      } else {

        element.className =
          "message assistant";

        element.innerHTML = `

          <div class="message-avatar">
            🤖
          </div>

          <div class="message-bubble">
            ${escapeHTML(
              message.content
            )}
          </div>

        `;

      }


      chatContainer.appendChild(
        element
      );

    });


  chatContainer.scrollTop =
    chatContainer.scrollHeight;
}


// ===============================
// CHAT INPUT EVENT
// ===============================

function setupChatInput() {

  const input =
    document.getElementById(
      "chatInput"
    );


  if (!input) return;


  input.addEventListener(
    "keydown",
    handleChatKey
  );

}


// ===============================
// INITIALIZE APP
// ===============================

document.addEventListener(
  "DOMContentLoaded",
  function() {

    loadTheme();

    updateDashboard();

    renderJourneys();

    renderTasks();

    renderHistory();

    loadChatHistory();

    setupChatInput();

    showPage("home");

  }
);
