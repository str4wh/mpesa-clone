// Public Feedback Module - No Login Required

let selectedPublicFile = null;
let selectedRating = 0;
let submissionInProgress = false;

// Initialize public feedback features
function initializePublicFeedback() {
  // Character counters
  const subjectInput = document.getElementById("public-subject");
  const messageInput = document.getElementById("public-message");

  if (subjectInput) {
    subjectInput.addEventListener("input", (e) => {
      document.getElementById("public-subject-counter").textContent =
        e.target.value.length;
    });
  }

  if (messageInput) {
    messageInput.addEventListener("input", (e) => {
      document.getElementById("public-message-counter").textContent =
        e.target.value.length;
    });
  }

  // Star rating
  initializeStarRating();

  // Form validation on blur
  initializeFormValidation();
}

// Star rating functionality
function initializeStarRating() {
  const stars = document.querySelectorAll("#public-rating i");
  const ratingText = document.getElementById("rating-text");
  const ratingLabels = ["Poor", "Fair", "Good", "Very Good", "Excellent"];

  stars.forEach((star, index) => {
    // Hover effect
    star.addEventListener("mouseenter", () => {
      highlightStars(index + 1);
      ratingText.textContent = ratingLabels[index];
    });

    // Click to select
    star.addEventListener("click", () => {
      selectedRating = index + 1;
      highlightStars(selectedRating);
      ratingText.textContent = ratingLabels[index];

      // Make selection permanent
      stars.forEach((s) => s.classList.remove("active"));
      for (let i = 0; i <= index; i++) {
        stars[i].classList.add("active");
      }
    });
  });

  // Reset on mouse leave if not selected
  const ratingContainer = document.getElementById("public-rating");
  ratingContainer.addEventListener("mouseleave", () => {
    if (selectedRating > 0) {
      highlightStars(selectedRating);
      ratingText.textContent = ratingLabels[selectedRating - 1];
    } else {
      highlightStars(0);
      ratingText.textContent = "";
    }
  });
}

function highlightStars(count) {
  const stars = document.querySelectorAll("#public-rating i");
  stars.forEach((star, index) => {
    if (index < count) {
      star.classList.remove("far");
      star.classList.add("fas");
      star.classList.add("hover");
    } else {
      star.classList.remove("fas", "hover");
      star.classList.add("far");
    }
  });
}

// Handle file selection
function handlePublicFileSelect(event) {
  const file = event.target.files[0];

  if (!file) {
    selectedPublicFile = null;
    document.getElementById("public-file-name").textContent =
      "Click to upload or drag image here (Max 5MB)";
    document.getElementById("public-file-preview").classList.add("hidden");
    return;
  }

  // Validate file type
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
  ];
  if (!allowedTypes.includes(file.type)) {
    showToast("Please select a valid file type (JPG, PNG, or PDF)", "error");
    event.target.value = "";
    return;
  }

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    showToast("File size must be less than 5MB", "error");
    event.target.value = "";
    return;
  }

  selectedPublicFile = file;
  document.getElementById("public-file-name").textContent = file.name;

  // Show preview for images
  if (file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = document.getElementById("public-file-preview");
      preview.innerHTML = `
                <img src="${e.target.result}" alt="Preview">
                <div class="file-preview-info">
                    <div class="file-preview-name">${file.name}</div>
                    <div class="file-preview-size">${formatFileSize(file.size)}</div>
                </div>
                <button type="button" class="file-remove-btn" onclick="removePublicFile()">
                    <i class="fas fa-times"></i>
                </button>
            `;
      preview.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
  } else {
    const preview = document.getElementById("public-file-preview");
    preview.innerHTML = `
            <i class="fas fa-file-pdf" style="font-size: 48px; color: var(--secondary-color);"></i>
            <div class="file-preview-info">
                <div class="file-preview-name">${file.name}</div>
                <div class="file-preview-size">${formatFileSize(file.size)}</div>
            </div>
            <button type="button" class="file-remove-btn" onclick="removePublicFile()">
                <i class="fas fa-times"></i>
            </button>
        `;
    preview.classList.remove("hidden");
  }
}

function removePublicFile() {
  selectedPublicFile = null;
  document.getElementById("public-attachment").value = "";
  document.getElementById("public-file-name").textContent =
    "Click to upload or drag image here (Max 5MB)";
  document.getElementById("public-file-preview").classList.add("hidden");
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

// Form validation
function initializeFormValidation() {
  const form = document.getElementById("public-feedback-form");
  if (!form) return;

  const inputs = form.querySelectorAll(
    "input[required], textarea[required], select[required]",
  );

  inputs.forEach((input) => {
    input.addEventListener("blur", () => {
      validateField(input);
    });
  });
}

function validateField(field) {
  const value = field.value.trim();
  let isValid = true;
  let errorMessage = "";

  // Check if required field is empty
  if (field.hasAttribute("required") && !value) {
    isValid = false;
    errorMessage = "This field is required";
  }

  // Specific validations
  if (value && field.id === "public-name") {
    if (!/^[A-Za-z\s]+$/.test(value)) {
      isValid = false;
      errorMessage = "Name should contain only letters and spaces";
    } else if (value.length < 2 || value.length > 50) {
      isValid = false;
      errorMessage = "Name should be between 2-50 characters";
    }
  }

  if (value && field.id === "public-phone") {
    if (!/^[7][0-9]{8}$/.test(value)) {
      isValid = false;
      errorMessage = "Enter a valid Kenyan phone number starting with 7";
    }
  }

  if (value && field.id === "public-email") {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      isValid = false;
      errorMessage = "Enter a valid email address";
    }
  }

  if (value && field.id === "public-subject") {
    if (value.length < 5) {
      isValid = false;
      errorMessage = "Subject must be at least 5 characters";
    }
  }

  if (value && field.id === "public-message") {
    if (value.length < 10) {
      isValid = false;
      errorMessage = "Message must be at least 10 characters";
    }
  }

  // Show/hide error
  showFieldError(field, isValid, errorMessage);

  return isValid;
}

function showFieldError(field, isValid, errorMessage) {
  // Remove existing error
  const existingError = field.parentElement.querySelector(".field-error");
  if (existingError) {
    existingError.remove();
  }

  if (!isValid) {
    field.style.borderColor = "var(--secondary-color)";
    const error = document.createElement("span");
    error.className = "field-error";
    error.style.color = "var(--secondary-color)";
    error.style.fontSize = "12px";
    error.style.marginTop = "4px";
    error.style.display = "block";
    error.textContent = errorMessage;
    field.parentElement.appendChild(error);
  } else {
    field.style.borderColor = "";
  }
}

// Submit public feedback
async function submitPublicFeedback(event) {
  event.preventDefault();

  // Prevent double submission
  if (submissionInProgress) {
    return;
  }

  // Check honeypot
  const honeypot = document.getElementById("honeypot").value;
  if (honeypot) {
    console.log("Spam detected (honeypot)");
    showToast("Error submitting feedback", "error");
    return;
  }

  // Get form values
  const name = document.getElementById("public-name").value.trim();
  const email = document.getElementById("public-email").value.trim();
  const category = document.getElementById("public-category").value;
  const source = document.getElementById("public-source").value;
  const subject = document.getElementById("public-subject").value.trim();
  const message = document.getElementById("public-message").value.trim();
  const consent = document.getElementById("public-consent").checked;

  // Validate all fields
  let isValid = true;
  const fields = [
    "public-name",
    "public-email",
    "public-subject",
    "public-message",
  ];
  fields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    if (!validateField(field)) {
      isValid = false;
    }
  });

  if (!category) {
    showToast("Please select a feedback category", "error");
    isValid = false;
  }

  if (!consent) {
    showToast("Please accept the privacy policy", "error");
    isValid = false;
  }

  if (!isValid) {
    return;
  }

  submissionInProgress = true;
  showLoading(true);

  // Disable submit button
  const submitBtn = document.getElementById("public-submit-btn");
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

  try {
    // Generate reference number
    const referenceNumber = generateReferenceNumber();

    // Upload attachment if exists
    let attachmentUrl = "";
    if (selectedPublicFile) {
      attachmentUrl = await uploadPublicAttachment(
        selectedPublicFile,
        referenceNumber,
      );
    }

    // Get IP address (simulated for demo)
    const ipAddress = await getClientIP();

    // Check for duplicate submission (using email instead of phone)
    const isDuplicate = await checkDuplicateSubmission(email, message);
    if (isDuplicate) {
      showToast(
        "You have already submitted similar feedback recently",
        "error",
      );
      submissionInProgress = false;
      showLoading(false);
      submitBtn.disabled = false;
      submitBtn.innerHTML =
        '<i class="fas fa-paper-plane"></i> Submit Feedback';
      return;
    }

    // Create feedback document
    const feedbackData = {
      ticketNumber: referenceNumber,
      userId: null,
      userName: name,
      userEmail: email,
      department: "Public Feedback",
      departmentId: null,
      subject: subject,
      message: message,
      priority: "medium",
      category: category,
      attachmentUrl: attachmentUrl,
      emailUpdates: true,
      status: "pending",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      adminResponse: "",
      respondedAt: null,
      isPublic: true,
      referenceNumber: referenceNumber,
      heardFrom: source || "",
      rating: selectedRating,
      consentGiven: consent,
      source: "landing-page",
      ipAddress: ipAddress,
      isSpam: false,
    };

    // Save to main feedback collection (same as authenticated feedback)
    const docRef = await db.collection("feedback").add(feedbackData);

    console.log("Public feedback submitted:", docRef.id);

    // Validate email format before sending to webhook
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast(
        "Invalid email format. Please check your email address.",
        "error",
      );
      submissionInProgress = false;
      showLoading(false);
      submitBtn.disabled = false;
      submitBtn.innerHTML =
        '<i class="fas fa-paper-plane"></i> Submit Feedback';
      return;
    }

    // Send to CustoFlow webhook
    try {
      const webhookResponse = await fetch(
        "http://localhost:5678/webhook-test/fd5bcb27-a283-45e1-ae9b-fba435fe24ba",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: message,
            email: email,
            adminEmail: "support@mpesa.com",
            timestamp: new Date().toISOString(),
            companyId: "yH3yxtik4wg9t1uH83cCJMKP2D02",
            apiKey: "cfk_1769673888338_289906",
          }),
        },
      );

      if (webhookResponse.ok) {
        console.log("Public feedback sent to CustoFlow webhook successfully");
      } else {
        console.warn("Webhook response not OK:", webhookResponse.status);
      }
    } catch (webhookError) {
      console.error("CustoFlow webhook error:", webhookError);
      // Continue even if webhook fails - feedback is already in Firestore
    }

    // Show success message
    document.getElementById("feedback-ref-number").textContent =
      referenceNumber;
    document.getElementById("public-feedback-form").classList.add("hidden");
    document
      .getElementById("public-feedback-success")
      .classList.remove("hidden");

    // Send confirmation email if provided (would be handled by backend)
    if (email) {
      console.log("Would send confirmation email to:", email);
    }

    showToast("Feedback submitted successfully!", "success");

    // Scroll to success message
    document
      .getElementById("public-feedback-success")
      .scrollIntoView({ behavior: "smooth", block: "center" });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    showToast("Error submitting feedback. Please try again.", "error");

    // Re-enable submit button
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Feedback';
  } finally {
    submissionInProgress = false;
    showLoading(false);
  }
}

// Upload public attachment
async function uploadPublicAttachment(file, referenceNumber) {
  try {
    const fileName = `${referenceNumber}_${Date.now()}_${file.name}`;
    const storageRef = storage.ref(`public-feedback-attachments/${fileName}`);

    const uploadTask = await storageRef.put(file);
    const downloadUrl = await uploadTask.ref.getDownloadURL();

    return downloadUrl;
  } catch (error) {
    console.error("Error uploading attachment:", error);
    throw error;
  }
}

// Generate reference number
function generateReferenceNumber() {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `FB-${timestamp}${random}`;
}

// Get client IP (simulated - in production use backend API)
async function getClientIP() {
  try {
    // In production, call your backend API to get the real IP
    // For demo, return a placeholder
    return "xxx.xxx.xxx.xxx";
  } catch (error) {
    return "unknown";
  }
}

// Check for duplicate submission
async function checkDuplicateSubmission(email, message) {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const snapshot = await db
      .collection("feedback")
      .where("userEmail", "==", email)
      .where("message", "==", message)
      .where(
        "createdAt",
        ">",
        firebase.firestore.Timestamp.fromDate(oneHourAgo),
      )
      .limit(1)
      .get();

    return !snapshot.empty;
  } catch (error) {
    console.error("Error checking duplicate:", error);
    return false; // Allow submission if check fails
  }
}

// Reset form
function resetPublicFeedbackForm() {
  // Hide success message
  document.getElementById("public-feedback-success").classList.add("hidden");
  document.getElementById("public-feedback-form").classList.remove("hidden");

  // Reset form
  const form = document.getElementById("public-feedback-form");
  form.reset();

  // Reset counters
  document.getElementById("public-subject-counter").textContent = "0";
  document.getElementById("public-message-counter").textContent = "0";

  // Reset rating
  selectedRating = 0;
  const stars = document.querySelectorAll("#public-rating i");
  stars.forEach((star) => {
    star.classList.remove("fas", "active", "hover");
    star.classList.add("far");
  });
  document.getElementById("rating-text").textContent = "";

  // Reset file
  removePublicFile();

  // Re-enable submit button
  const submitBtn = document.getElementById("public-submit-btn");
  submitBtn.disabled = false;
  submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Feedback';

  // Scroll to form
  document
    .getElementById("public-feedback")
    .scrollIntoView({ behavior: "smooth" });
}

// Track feedback
function trackFeedback() {
  document.getElementById("track-feedback-modal").classList.add("active");
}

function closeTrackFeedbackModal() {
  document.getElementById("track-feedback-modal").classList.remove("active");
  document.getElementById("track-reference").value = "";
  document.getElementById("track-phone").value = "";
  document.getElementById("track-results").classList.add("hidden");
}

// Search feedback by tracking
async function searchFeedbackByTracking() {
  const reference = document.getElementById("track-reference").value.trim();

  if (!reference) {
    showToast("Please enter a reference number", "error");
    return;
  }

  showLoading(true);

  try {
    const query = db
      .collection("feedback")
      .where("referenceNumber", "==", reference.toUpperCase())
      .orderBy("createdAt", "desc");

    const snapshot = await query.get();

    const resultsContainer = document.getElementById("track-results");
    resultsContainer.innerHTML = "";

    if (snapshot.empty) {
      resultsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>No feedback found</p>
                </div>
            `;
    } else {
      snapshot.forEach((doc) => {
        const feedback = doc.data();
        const resultItem = createTrackResultItem(feedback);
        resultsContainer.appendChild(resultItem);
      });
    }

    resultsContainer.classList.remove("hidden");
  } catch (error) {
    console.error("Error searching feedback:", error);
    showToast("Error searching feedback", "error");
  } finally {
    showLoading(false);
  }
}

function createTrackResultItem(feedback) {
  const div = document.createElement("div");
  div.className = "track-result-item";

  const statusClass = feedback.status.replace(" ", "-");
  const date = feedback.createdAt
    ? formatDatetime(feedback.createdAt.toDate())
    : "N/A";

  div.innerHTML = `
        <div class="track-result-header">
            <span class="track-result-ref">${feedback.referenceNumber}</span>
            <span class="status-badge ${statusClass}">${feedback.status}</span>
        </div>
        <div class="track-result-body">
            <p><strong>Subject:</strong> ${feedback.subject}</p>
            <p><strong>Category:</strong> ${feedback.category}</p>
            <p><strong>Submitted:</strong> ${date}</p>
            ${
              feedback.adminResponse
                ? `
                <div style="margin-top: 12px; padding: 12px; background-color: #d4edda; border-radius: 8px;">
                    <strong>Response:</strong>
                    <p style="margin-top: 8px;">${feedback.adminResponse}</p>
                </div>
            `
                : '<p style="color: var(--gray-dark); font-style: italic;">Pending review</p>'
            }
        </div>
    `;

  return div;
}

// Privacy policy modal
function showPrivacyPolicy() {
  event.preventDefault();
  document.getElementById("privacy-modal").classList.add("active");
}

function closePrivacyModal() {
  document.getElementById("privacy-modal").classList.remove("active");
}

// Close modals on outside click
document.addEventListener("click", (e) => {
  const trackModal = document.getElementById("track-feedback-modal");
  const privacyModal = document.getElementById("privacy-modal");

  if (e.target === trackModal) {
    closeTrackFeedbackModal();
  }

  if (e.target === privacyModal) {
    closePrivacyModal();
  }
});

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializePublicFeedback);
} else {
  initializePublicFeedback();
}

// Make functions globally available
window.submitPublicFeedback = submitPublicFeedback;
window.handlePublicFileSelect = handlePublicFileSelect;
window.removePublicFile = removePublicFile;
window.resetPublicFeedbackForm = resetPublicFeedbackForm;
window.trackFeedback = trackFeedback;
window.closeTrackFeedbackModal = closeTrackFeedbackModal;
window.searchFeedbackByTracking = searchFeedbackByTracking;
window.showPrivacyPolicy = showPrivacyPolicy;
window.closePrivacyModal = closePrivacyModal;
