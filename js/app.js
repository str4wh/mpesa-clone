// Main Application Module

// Global variables
window.currentUser = null;
window.currentDepartment = null;
window.balanceVisible = false;

// Initialize app
function initializeApp() {
  console.log("M-Pesa Application Initialized");

  // Check authentication state
  checkAuthState();

  // Initialize event listeners
  initializeEventListeners();

  // Close modals on outside click
  initializeModalHandlers();
}

// Check authentication state
function checkAuthState() {
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      console.log("User authenticated:", user.uid);

      try {
        // Load user data from Firestore
        const userDoc = await db.collection("users").doc(user.uid).get();

        if (userDoc.exists) {
          window.currentUser = {
            uid: user.uid,
            ...userDoc.data(),
          };

          console.log("User data loaded:", window.currentUser);

          // Update UI
          updateUserInterface();
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    } else {
      console.log("No user authenticated");
      window.currentUser = null;
    }
  });
}

// Update user interface with user data
function updateUserInterface() {
  if (!window.currentUser) return;

  // Update user name
  const userNameElements = document.querySelectorAll("#user-name");
  userNameElements.forEach((el) => {
    el.textContent = window.currentUser.name;
  });

  // Update user phone
  const userPhoneElements = document.querySelectorAll("#user-phone");
  userPhoneElements.forEach((el) => {
    const phone = window.currentUser.phone;
    const masked =
      phone.substring(0, 4) + " *** *** " + phone.substring(phone.length - 3);
    el.textContent = masked;
  });

  // Update balance
  const balanceElement = document.getElementById("balance-value");
  if (balanceElement && window.balanceVisible) {
    balanceElement.textContent = window.currentUser.balance.toLocaleString();
  }

  // Update last login
  if (window.currentUser.lastLogin) {
    const lastLoginElement = document.getElementById("last-login");
    if (lastLoginElement) {
      const date = window.currentUser.lastLogin.toDate();
      lastLoginElement.textContent = formatDatetime(date);
    }
  }
}

// Initialize event listeners
function initializeEventListeners() {
  // Close modal on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAuthModal();
      closeFeedbackDetail();
    }
  });

  // Handle form submissions
  const feedbackForm = document.getElementById("feedback-submission-form");
  if (feedbackForm) {
    feedbackForm.addEventListener("submit", submitFeedback);
  }
}

// Initialize modal handlers
function initializeModalHandlers() {
  // Auth modal
  const authModal = document.getElementById("auth-modal");
  if (authModal) {
    authModal.addEventListener("click", (e) => {
      if (e.target === authModal) {
        closeAuthModal();
      }
    });
  }

  // Feedback detail modal
  const feedbackModal = document.getElementById("feedback-detail-modal");
  if (feedbackModal) {
    feedbackModal.addEventListener("click", (e) => {
      if (e.target === feedbackModal) {
        closeFeedbackDetail();
      }
    });
  }
}

// Toast notification system
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  let icon = "fa-info-circle";
  if (type === "success") icon = "fa-check-circle";
  if (type === "error") icon = "fa-exclamation-circle";

  toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <div class="toast-message">${message}</div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

  container.appendChild(toast);

  // Auto remove after 5 seconds
  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease";
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 5000);
}

// Loading overlay
function showLoading(show) {
  const overlay = document.getElementById("loading-overlay");
  if (show) {
    overlay.classList.remove("hidden");
  } else {
    overlay.classList.add("hidden");
  }
}

// Format datetime
function formatDatetime(date) {
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days === 0) {
    if (hours === 0) {
      if (minutes === 0) {
        return "Just now";
      }
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    }
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (days === 1) {
    return "Yesterday";
  } else if (days < 7) {
    return `${days} days ago`;
  } else {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  }
}

// Format date (used in multiple modules)
if (typeof formatDate === "undefined") {
  window.formatDate = formatDatetime;
}

// Create sample transactions (for demo purposes)
async function createSampleTransactions() {
  if (!auth.currentUser) return;

  try {
    // Check if transactions already exist
    const existingTransactions = await db
      .collection("transactions")
      .where("userId", "==", auth.currentUser.uid)
      .limit(1)
      .get();

    if (!existingTransactions.empty) {
      console.log("Transactions already exist");
      return;
    }

    const sampleTransactions = [
      {
        userId: auth.currentUser.uid,
        type: "receive",
        amount: 5000,
        recipient: "John Doe",
        description: "Payment received from John Doe",
        timestamp: firebase.firestore.Timestamp.fromDate(
          new Date(Date.now() - 86400000 * 2),
        ),
        status: "completed",
      },
      {
        userId: auth.currentUser.uid,
        type: "send",
        amount: 2000,
        recipient: "Jane Smith",
        description: "Sent money to Jane Smith",
        timestamp: firebase.firestore.Timestamp.fromDate(
          new Date(Date.now() - 86400000),
        ),
        status: "completed",
      },
      {
        userId: auth.currentUser.uid,
        type: "bill",
        amount: 1500,
        recipient: "KPLC",
        description: "Electricity bill payment",
        timestamp: firebase.firestore.Timestamp.fromDate(
          new Date(Date.now() - 43200000),
        ),
        status: "completed",
      },
    ];

    const batch = db.batch();

    sampleTransactions.forEach((transaction) => {
      const docRef = db.collection("transactions").doc();
      batch.set(docRef, transaction);
    });

    await batch.commit();
    console.log("Sample transactions created");

    // Reload dashboard
    if (currentSection === "dashboard") {
      await loadDashboardData();
    }
  } catch (error) {
    console.error("Error creating sample transactions:", error);
  }
}

// Add initial balance to user (for demo purposes)
async function addInitialBalance() {
  if (!auth.currentUser) return;

  try {
    const userDoc = await db
      .collection("users")
      .doc(auth.currentUser.uid)
      .get();

    if (userDoc.exists && userDoc.data().balance === 0) {
      await db.collection("users").doc(auth.currentUser.uid).update({
        balance: 10000,
      });

      // Reload user data
      const updatedDoc = await db
        .collection("users")
        .doc(auth.currentUser.uid)
        .get();
      window.currentUser = {
        uid: auth.currentUser.uid,
        ...updatedDoc.data(),
      };

      updateUserInterface();
      showToast("Initial balance added: KSh 10,000", "success");
    }
  } catch (error) {
    console.error("Error adding initial balance:", error);
  }
}

// Utility: Generate random ID
function generateId(length = 10) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Utility: Validate email
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Utility: Validate phone number
function validatePhone(phone) {
  // Kenyan phone number validation
  const re = /^(\+254|254|0)?[17]\d{8}$/;
  return re.test(phone);
}

// Utility: Format currency
function formatCurrency(amount) {
  return `KSh ${amount.toLocaleString()}`;
}

// Utility: Truncate text
function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

// Error handler
window.addEventListener("error", (event) => {
  console.error("Global error:", event.error);
  // Don't show toast for every error to avoid spam
});

// Unhandled promise rejection handler
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
});

// Service Worker Registration (for PWA - optional)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // Uncomment to enable service worker
    // navigator.serviceWorker.register('/sw.js')
    //     .then(reg => console.log('Service Worker registered'))
    //     .catch(err => console.log('Service Worker registration failed'));
  });
}

// Initialize app when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}

// Make functions available globally
window.showToast = showToast;
window.showLoading = showLoading;
window.formatDatetime = formatDatetime;
window.generateId = generateId;
window.validateEmail = validateEmail;
window.validatePhone = validatePhone;
window.formatCurrency = formatCurrency;
window.truncateText = truncateText;

// Demo functions (remove in production)
window.createSampleTransactions = createSampleTransactions;
window.addInitialBalance = addInitialBalance;

console.log("M-Pesa Clone App Ready!");
console.log("To get started:");
console.log("1. Configure Firebase in js/firebase-config.js");
console.log("2. Enable Phone Authentication in Firebase Console");
console.log("3. Enable Firestore Database");
console.log("4. Enable Firebase Storage");
console.log("5. Add your domain to authorized domains in Firebase");
