// Feedback Module

let selectedFile = null;
let currentFeedbackList = [];

// Open feedback form
function openFeedbackForm() {
  if (!window.currentDepartment) {
    showToast("Please select a department first", "error");
    return;
  }

  if (!window.currentUser) {
    showToast("Please login to submit feedback", "error");
    showLogin();
    return;
  }

  // Pre-fill form with user and department data
  document.getElementById("feedback-department").value =
    window.currentDepartment.name;
  document.getElementById("feedback-name").value = window.currentUser.name;
  document.getElementById("feedback-email").value =
    window.currentUser.email || "Not available";

  // Populate category dropdown
  const categorySelect = document.getElementById("feedback-category");
  categorySelect.innerHTML = '<option value="">Select category</option>';

  window.currentDepartment.categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });

  // Reset form
  document.getElementById("feedback-subject").value = "";
  document.getElementById("feedback-priority").value = "";
  document.getElementById("feedback-message").value = "";
  document.getElementById("feedback-attachment").value = "";
  document.getElementById("file-name").textContent =
    "Click to upload or drag image here (Max 5MB)";
  document.getElementById("feedback-email-updates").checked = false;
  selectedFile = null;

  // Reset character counters
  document.getElementById("subject-counter").textContent = "0";
  document.getElementById("message-counter").textContent = "0";

  // Navigate to feedback form
  navigateTo("feedback-form");
}

// Handle file selection
function handleFileSelect(event) {
  const file = event.target.files[0];

  if (!file) {
    selectedFile = null;
    document.getElementById("file-name").textContent =
      "Click to upload or drag image here (Max 5MB)";
    return;
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    showToast("Please select an image file", "error");
    event.target.value = "";
    return;
  }

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    showToast("File size must be less than 5MB", "error");
    event.target.value = "";
    return;
  }

  selectedFile = file;
  document.getElementById("file-name").textContent = file.name;
}

// Character counters
document.addEventListener("DOMContentLoaded", () => {
  const subjectInput = document.getElementById("feedback-subject");
  const messageInput = document.getElementById("feedback-message");

  if (subjectInput) {
    subjectInput.addEventListener("input", (e) => {
      document.getElementById("subject-counter").textContent =
        e.target.value.length;
    });
  }

  if (messageInput) {
    messageInput.addEventListener("input", (e) => {
      document.getElementById("message-counter").textContent =
        e.target.value.length;
    });
  }
});

// Submit feedback
async function submitFeedback(event) {
  event.preventDefault();

  if (!window.currentUser) {
    showToast("Please login to submit feedback", "error");
    return;
  }

  // Get form values
  const subject = document.getElementById("feedback-subject").value.trim();
  const priority = document.getElementById("feedback-priority").value;
  const category = document.getElementById("feedback-category").value;
  const message = document.getElementById("feedback-message").value.trim();
  const emailUpdates = document.getElementById(
    "feedback-email-updates",
  ).checked;

  // Validate
  if (!subject || !priority || !category || !message) {
    showToast("Please fill in all required fields", "error");
    return;
  }

  showLoading(true);

  try {
    // Generate ticket number
    const ticketNumber = generateTicketNumber();

    // Upload attachment if exists
    let attachmentUrl = "";
    if (selectedFile) {
      attachmentUrl = await uploadAttachment(selectedFile, ticketNumber);
    }

    // Create feedback document
    const feedbackData = {
      userId: window.currentUser.uid,
      userName: window.currentUser.name,
      userEmail: window.currentUser.email || "",
      ticketNumber: ticketNumber,
      department: window.currentDepartment.name,
      departmentId: window.currentDepartment.id,
      subject: subject,
      message: message,
      priority: priority,
      category: category,
      attachmentUrl: attachmentUrl,
      emailUpdates: emailUpdates,
      status: "pending",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      adminResponse: "",
      respondedAt: null,
    };

    // Save to Firestore
    const docRef = await db.collection("feedback").add(feedbackData);

    console.log("Feedback submitted:", docRef.id);

    // Send to CustoFlow webhook
    try {
      await fetch(
        "http://localhost:5678/webhook-test/fd5bcb27-a283-45e1-ae9b-fba435fe24ba",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: message,
            timestamp: new Date().toISOString(),
            companyId: "yH3yxtik4wg9t1uH83cCJMKP2D02",
            apiKey: "cfk_1769673888338_289906",
          }),
        },
      );
      console.log("Feedback sent to CustoFlow webhook");
    } catch (webhookError) {
      console.error("CustoFlow webhook error:", webhookError);
      // Continue even if webhook fails - feedback is already in Firestore
    }

    showToast(
      `Feedback submitted successfully! Ticket #${ticketNumber}`,
      "success",
    );

    // Navigate to feedback history
    setTimeout(() => {
      navigateTo("feedback-history");
    }, 1500);
  } catch (error) {
    console.error("Error submitting feedback:", error);
    showToast("Error submitting feedback. Please try again.", "error");
  } finally {
    showLoading(false);
  }
}

// Upload attachment to Firebase Storage
async function uploadAttachment(file, ticketNumber) {
  try {
    const fileName = `${ticketNumber}_${Date.now()}_${file.name}`;
    const storageRef = storage.ref(`feedback-attachments/${fileName}`);

    const uploadTask = await storageRef.put(file);
    const downloadUrl = await uploadTask.ref.getDownloadURL();

    return downloadUrl;
  } catch (error) {
    console.error("Error uploading attachment:", error);
    throw error;
  }
}

// Generate ticket number
function generateTicketNumber() {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `TKT${timestamp}${random}`;
}

// Load feedback history
async function loadFeedbackHistory() {
  if (!window.currentUser) {
    showToast("Please login to view feedback history", "error");
    return;
  }

  showLoading(true);

  try {
    // Fetch ALL feedback (both authenticated and public)
    const feedbackSnapshot = await db
      .collection("feedback")
      .orderBy("createdAt", "desc")
      .get();

    currentFeedbackList = [];

    feedbackSnapshot.forEach((doc) => {
      currentFeedbackList.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    displayFeedbackList(currentFeedbackList);
  } catch (error) {
    console.error("Error loading feedback history:", error);
    showToast("Error loading feedback history", "error");
  } finally {
    showLoading(false);
  }
}

// Display feedback list
function displayFeedbackList(feedbackList) {
  const tableBody = document.getElementById("feedback-table-body");
  const emptyState = document.getElementById("feedback-empty-state");

  if (feedbackList.length === 0) {
    tableBody.innerHTML = "";
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
    tableBody.innerHTML = "";

    feedbackList.forEach((feedback) => {
      const row = createFeedbackRow(feedback);
      tableBody.appendChild(row);
    });
  }
}

// Create feedback table row
function createFeedbackRow(feedback) {
  const tr = document.createElement("tr");

  const statusClass = feedback.status.replace(" ", "-");
  const date = feedback.createdAt
    ? formatDate(feedback.createdAt.toDate())
    : "N/A";

  // Add public badge if this is public feedback
  const publicBadge = feedback.isPublic
    ? '<span class="badge" style="background-color: #6c757d; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-left: 5px;">Public</span>'
    : "";

  tr.innerHTML = `
        <td><strong>${feedback.ticketNumber}</strong></td>
        <td>${feedback.department}${publicBadge}</td>
        <td>${feedback.subject}</td>
        <td>${date}</td>
        <td><span class="status-badge ${statusClass}">${feedback.status}</span></td>
        <td>
            <button class="btn btn-primary" onclick="viewFeedbackDetail('${feedback.id}')">
                <i class="fas fa-eye"></i> View
            </button>
        </td>
    `;

  return tr;
}

// View feedback detail
async function viewFeedbackDetail(feedbackId) {
  showLoading(true);

  try {
    const feedbackDoc = await db.collection("feedback").doc(feedbackId).get();

    if (!feedbackDoc.exists) {
      showToast("Feedback not found", "error");
      return;
    }

    const feedback = feedbackDoc.data();

    // Populate modal
    document.getElementById("detail-ticket").textContent =
      feedback.ticketNumber;
    document.getElementById("detail-department").textContent =
      feedback.department;
    document.getElementById("detail-priority").textContent =
      feedback.priority.toUpperCase();
    document.getElementById("detail-category").textContent = feedback.category;
    document.getElementById("detail-subject").textContent = feedback.subject;
    document.getElementById("detail-message").textContent = feedback.message;

    const statusBadge = document.getElementById("detail-status-badge");
    statusBadge.textContent = feedback.status;
    statusBadge.className = `status-badge ${feedback.status.replace(" ", "-")}`;

    if (feedback.createdAt) {
      const date = feedback.createdAt.toDate();
      document.getElementById("detail-date").textContent =
        date.toLocaleString();
    }

    // Show/hide attachment
    const attachmentSection = document.getElementById(
      "detail-attachment-section",
    );
    if (feedback.attachmentUrl) {
      attachmentSection.classList.remove("hidden");
      document.getElementById("detail-attachment").href =
        feedback.attachmentUrl;
    } else {
      attachmentSection.classList.add("hidden");
    }

    // Show/hide admin response
    const responseSection = document.getElementById("detail-response-section");
    if (feedback.adminResponse) {
      responseSection.classList.remove("hidden");
      document.getElementById("detail-response").textContent =
        feedback.adminResponse;
      if (feedback.respondedAt) {
        const responseDate = feedback.respondedAt.toDate();
        document.getElementById("detail-response-date").textContent =
          responseDate.toLocaleString();
      }
    } else {
      responseSection.classList.add("hidden");
    }

    // Show modal
    document.getElementById("feedback-detail-modal").classList.add("active");
  } catch (error) {
    console.error("Error loading feedback detail:", error);
    showToast("Error loading feedback detail", "error");
  } finally {
    showLoading(false);
  }
}

// Close feedback detail modal
function closeFeedbackDetail() {
  document.getElementById("feedback-detail-modal").classList.remove("active");
}

// Filter feedback
function filterFeedback() {
  const statusFilter = document.getElementById("filter-status").value;
  const departmentFilter = document.getElementById("filter-department").value;

  let filteredList = [...currentFeedbackList];

  if (statusFilter) {
    filteredList = filteredList.filter((f) => f.status === statusFilter);
  }

  if (departmentFilter) {
    filteredList = filteredList.filter(
      (f) => f.departmentId === departmentFilter,
    );
  }

  displayFeedbackList(filteredList);
}

// Search feedback
function searchFeedback() {
  const searchTerm = document
    .getElementById("search-feedback")
    .value.toLowerCase();

  if (!searchTerm) {
    filterFeedback();
    return;
  }

  const filteredList = currentFeedbackList.filter((f) => {
    return (
      f.ticketNumber.toLowerCase().includes(searchTerm) ||
      f.subject.toLowerCase().includes(searchTerm) ||
      f.department.toLowerCase().includes(searchTerm) ||
      f.message.toLowerCase().includes(searchTerm)
    );
  });

  displayFeedbackList(filteredList);
}

// Close modal on outside click
document.addEventListener("click", (e) => {
  const feedbackModal = document.getElementById("feedback-detail-modal");
  if (e.target === feedbackModal) {
    closeFeedbackDetail();
  }
});
