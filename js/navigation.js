// Navigation Module - Single Page Application Routing

let currentSection = "landing-page";
let previousSection = null;

// Initialize navigation
function initializeNavigation() {
  // Handle browser back/forward buttons
  window.addEventListener("popstate", (event) => {
    if (event.state && event.state.section) {
      navigateTo(event.state.section, false);
    }
  });

  // Set initial state
  const initialSection = window.location.hash.substring(1) || "landing-page";
  history.replaceState({ section: initialSection }, "", `#${initialSection}`);

  // Check auth state and navigate accordingly
  auth.onAuthStateChanged((user) => {
    if (user) {
      if (currentSection === "landing-page") {
        navigateTo("dashboard");
      }
    } else {
      if (currentSection !== "landing-page") {
        navigateTo("landing-page");
      }
    }
  });
}

// Navigate between sections
function navigateTo(sectionId, addToHistory = true) {
  // Check if user is authenticated for protected routes
  const protectedRoutes = [
    "dashboard",
    "departments",
    "department-detail",
    "feedback-form",
    "feedback-history",
    "profile",
    "transaction-history",
  ];

  if (protectedRoutes.includes(sectionId) && !auth.currentUser) {
    showToast("Please login to access this page", "error");
    showLogin();
    return;
  }

  // Hide all sections
  const sections = document.querySelectorAll(".section");
  sections.forEach((section) => {
    section.classList.remove("active");
  });

  // Show target section
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add("active");
    previousSection = currentSection;
    currentSection = sectionId;

    // Add to browser history
    if (addToHistory) {
      history.pushState({ section: sectionId }, "", `#${sectionId}`);
    }

    // Scroll to top
    window.scrollTo(0, 0);

    // Update active nav links
    updateActiveNavLinks(sectionId);

    // Load section-specific data
    loadSectionData(sectionId);

    console.log(`Navigated to: ${sectionId}`);
  } else {
    console.error(`Section not found: ${sectionId}`);
  }
}

// Update active navigation links
function updateActiveNavLinks(sectionId) {
  // Update dashboard nav links
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.classList.remove("active");
  });

  // Add active class to current section link
  if (sectionId === "dashboard") {
    const dashboardLink = document.querySelector(
      '.nav-link[onclick*="dashboard"]',
    );
    if (dashboardLink) {
      dashboardLink.classList.add("active");
    }
  }
}

// Load section-specific data
async function loadSectionData(sectionId) {
  switch (sectionId) {
    case "dashboard":
      await loadDashboardData();
      break;
    case "departments":
      await loadDepartments();
      break;
    case "feedback-history":
      await loadFeedbackHistory();
      break;
    case "transaction-history":
      await loadTransactionHistory();
      break;
  }
}

// Load dashboard data
async function loadDashboardData() {
  if (!auth.currentUser) return;

  try {
    // Load recent transactions
    const transactionsSnapshot = await db
      .collection("transactions")
      .where("userId", "==", auth.currentUser.uid)
      .orderBy("timestamp", "desc")
      .limit(5)
      .get();

    const transactionsList = document.getElementById("transactions-list");

    if (transactionsSnapshot.empty) {
      transactionsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <p>No transactions yet</p>
                </div>
            `;
    } else {
      transactionsList.innerHTML = "";

      transactionsSnapshot.forEach((doc) => {
        const transaction = doc.data();
        const transactionItem = createTransactionItem(transaction);
        transactionsList.appendChild(transactionItem);
      });
    }

    // Populate departments dropdown
    await populateDepartmentsDropdown();
  } catch (error) {
    console.error("Error loading dashboard data:", error);
  }
}

// Create transaction item element
function createTransactionItem(transaction) {
  const div = document.createElement("div");
  div.className = "transaction-item";

  const iconClass = transaction.type === "send" ? "send" : "receive";
  const icon = transaction.type === "send" ? "fa-arrow-up" : "fa-arrow-down";
  const amountClass = transaction.type === "send" ? "negative" : "positive";
  const amountSign = transaction.type === "send" ? "-" : "+";

  div.innerHTML = `
        <div class="transaction-icon ${iconClass}">
            <i class="fas ${icon}"></i>
        </div>
        <div class="transaction-info">
            <h4>${transaction.description || "Transaction"}</h4>
            <p>${formatDate(transaction.timestamp.toDate())}</p>
        </div>
        <div class="transaction-amount ${amountClass}">
            ${amountSign} KSh ${transaction.amount.toLocaleString()}
        </div>
    `;

  return div;
}

// Load departments
async function loadDepartments() {
  try {
    const departmentsSnapshot = await db
      .collection("departments")
      .where("isActive", "==", true)
      .get();

    const departmentsGrid = document.getElementById("departments-grid");
    departmentsGrid.innerHTML = "";

    departmentsSnapshot.forEach((doc) => {
      const department = { id: doc.id, ...doc.data() };
      const card = createDepartmentCard(department);
      departmentsGrid.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading departments:", error);
    showToast("Error loading departments", "error");
  }
}

// Create department card
function createDepartmentCard(department) {
  const div = document.createElement("div");
  div.className = "department-card";
  div.onclick = () => showDepartmentDetail(department);

  div.innerHTML = `
        <div class="department-icon">
            <i class="fas ${department.icon}"></i>
        </div>
        <h3>${department.name}</h3>
        <p>${department.description}</p>
    `;

  return div;
}

// Show department detail
function showDepartmentDetail(department) {
  // Store current department
  window.currentDepartment = department;

  // Update department detail page
  document.getElementById("department-name").textContent = department.name;
  document.getElementById("department-title").textContent = department.name;
  document.getElementById("department-description").textContent =
    department.description;
  document.getElementById("department-icon").innerHTML =
    `<i class="fas ${department.icon}"></i>`;

  // Load categories
  const categoriesContainer = document.getElementById("department-categories");
  categoriesContainer.innerHTML = "<h3>Available Categories</h3>";

  const categoriesList = document.createElement("div");
  categoriesList.className = "categories-list";

  department.categories.forEach((category) => {
    const categoryItem = document.createElement("div");
    categoryItem.className = "category-item";
    categoryItem.textContent = category;
    categoriesList.appendChild(categoryItem);
  });

  categoriesContainer.appendChild(categoriesList);

  // Navigate to department detail page
  navigateTo("department-detail");
}

// Populate departments dropdown
async function populateDepartmentsDropdown() {
  const dropdown = document.getElementById("departments-dropdown");

  // Show loading state
  dropdown.innerHTML =
    '<div style="padding: 12px 20px; color: #999; display: flex; align-items: center; gap: 10px;"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

  try {
    const departmentsSnapshot = await db
      .collection("departments")
      .where("isActive", "==", true)
      .get();

    dropdown.innerHTML = "";

    if (departmentsSnapshot.empty) {
      dropdown.innerHTML =
        '<div style="padding: 12px 20px; color: #999;">No departments available</div>';
      return;
    }

    departmentsSnapshot.forEach((doc) => {
      const department = { id: doc.id, ...doc.data() };
      const link = document.createElement("a");
      link.href = "#";
      link.innerHTML = `<i class="fas ${department.icon}"></i> ${department.name}`;
      link.onclick = (e) => {
        e.preventDefault();
        // Close dropdown
        document
          .getElementById("departments-dropdown-container")
          .classList.remove("active");
        // Show department detail
        showDepartmentDetail(department);
      };
      dropdown.appendChild(link);
    });

    // Also populate filter dropdown in feedback history
    const filterDropdown = document.getElementById("filter-department");
    if (filterDropdown) {
      const currentOptions = Array.from(filterDropdown.options).map(
        (opt) => opt.value,
      );

      departmentsSnapshot.forEach((doc) => {
        const department = { id: doc.id, ...doc.data() };
        if (!currentOptions.includes(department.id)) {
          const option = document.createElement("option");
          option.value = department.id;
          option.textContent = department.name;
          filterDropdown.appendChild(option);
        }
      });
    }
  } catch (error) {
    console.error("Error populating departments dropdown:", error);
    dropdown.innerHTML =
      '<div style="padding: 12px 20px; color: #E31837;">Error loading departments</div>';
  }
}

// Mobile menu toggle
function toggleMobileMenu() {
  const mobileMenu = document.getElementById("mobile-menu");
  mobileMenu.classList.toggle("active");
}

function toggleDashboardMenu() {
  // Implement mobile dashboard menu
  const navMenu = document.querySelector(".nav-menu");
  if (navMenu) {
    navMenu.classList.toggle("mobile-active");
  }
}

// Scroll to features section
function scrollToFeatures() {
  const featuresSection = document.getElementById("features");
  if (featuresSection) {
    featuresSection.scrollIntoView({ behavior: "smooth" });
  }
}

// Show notifications
function showNotifications() {
  showToast("No new notifications", "info");
}

// Toggle profile menu
function toggleProfileMenu() {
  // Implement profile menu toggle
  showToast("Profile menu", "info");
}

// Open quick action
function openAction(actionType) {
  showToast(`${actionType} feature coming soon!`, "info");
}

// Load transaction history
async function loadTransactionHistory() {
  if (!auth.currentUser) return;

  try {
    const transactionsSnapshot = await db
      .collection("transactions")
      .where("userId", "==", auth.currentUser.uid)
      .orderBy("timestamp", "desc")
      .get();

    // Implement full transaction history display
    console.log("Loading transaction history...");
  } catch (error) {
    console.error("Error loading transaction history:", error);
  }
}

// Balance visibility toggle
window.balanceVisible = false;

function toggleBalanceVisibility() {
  window.balanceVisible = !window.balanceVisible;

  const balanceValue = document.getElementById("balance-value");
  const eyeIcon = document.getElementById("balance-eye");

  if (window.balanceVisible && window.currentUser) {
    balanceValue.textContent = window.currentUser.balance.toLocaleString();
    eyeIcon.className = "fas fa-eye-slash";
  } else {
    balanceValue.textContent = "••••••";
    eyeIcon.className = "fas fa-eye";
  }
}

// Go back from feedback form
function goBackFromFeedback() {
  if (window.currentDepartment) {
    showDepartmentDetail(window.currentDepartment);
  } else {
    navigateTo("departments");
  }
}

// Toggle departments dropdown
function toggleDepartmentsDropdown(event) {
  event.preventDefault();
  event.stopPropagation();

  const container = document.getElementById("departments-dropdown-container");
  const dropdown = document.getElementById("departments-dropdown");

  // Close other dropdowns first
  document.querySelectorAll(".dropdown.active").forEach((d) => {
    if (d !== container) {
      d.classList.remove("active");
    }
  });

  // Toggle current dropdown
  container.classList.toggle("active");

  // If opening and not yet populated, load departments
  if (
    container.classList.contains("active") &&
    dropdown.children.length === 0
  ) {
    populateDepartmentsDropdown();
  }
}

// Close dropdowns when clicking outside
document.addEventListener("click", (event) => {
  const dropdowns = document.querySelectorAll(".dropdown");
  dropdowns.forEach((dropdown) => {
    if (!dropdown.contains(event.target)) {
      dropdown.classList.remove("active");
    }
  });
});

// Close dropdown on escape key
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    document.querySelectorAll(".dropdown.active").forEach((d) => {
      d.classList.remove("active");
    });
  }
});

// Make functions globally available
window.toggleDepartmentsDropdown = toggleDepartmentsDropdown;

// Initialize navigation when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeNavigation);
} else {
  initializeNavigation();
}
