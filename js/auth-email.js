// Email/Password Authentication Module (Free Tier Alternative)
// This works on Firebase Spark (free) plan

// Email/Password Login
async function loginWithEmail(event) {
  event.preventDefault();

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  if (!email || !password) {
    showToast("Please enter email and password", "error");
    return;
  }

  // Validate email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast("Please enter a valid email address", "error");
    return;
  }

  showLoading(true);

  try {
    const userCredential = await auth.signInWithEmailAndPassword(
      email,
      password,
    );
    const user = userCredential.user;

    console.log("Login successful:", user.uid);
    showToast("Login successful!", "success");

    // Close modal and navigate to dashboard
    closeAuthModal();
    navigateTo("dashboard");
  } catch (error) {
    console.error("Login error:", error);

    let errorMessage = "Login failed";

    switch (error.code) {
      case "auth/user-not-found":
        errorMessage = "No account found with this email";
        break;
      case "auth/wrong-password":
        errorMessage = "Incorrect password";
        break;
      case "auth/invalid-email":
        errorMessage = "Invalid email address";
        break;
      case "auth/user-disabled":
        errorMessage = "This account has been disabled";
        break;
      case "auth/too-many-requests":
        errorMessage = "Too many failed attempts. Please try again later";
        break;
      default:
        errorMessage = error.message;
    }

    showToast(errorMessage, "error");
  } finally {
    showLoading(false);
  }
}

// Email/Password Signup
async function signupWithEmail(event) {
  event.preventDefault();

  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  const confirmPassword = document.getElementById(
    "signup-confirm-password",
  ).value;

  // Validation
  if (!name || !email || !password || !confirmPassword) {
    showToast("Please fill in all fields", "error");
    return;
  }

  if (name.length < 2) {
    showToast("Name must be at least 2 characters", "error");
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast("Please enter a valid email address", "error");
    return;
  }

  if (password.length < 6) {
    showToast("Password must be at least 6 characters", "error");
    return;
  }

  if (password !== confirmPassword) {
    showToast("Passwords do not match", "error");
    return;
  }

  showLoading(true);

  try {
    // Create user account
    const userCredential = await auth.createUserWithEmailAndPassword(
      email,
      password,
    );
    const user = userCredential.user;

    // Update display name
    await user.updateProfile({
      displayName: name,
    });

    // Send email verification
    await user.sendEmailVerification();

    // Create user document in Firestore
    await db.collection("users").doc(user.uid).set({
      name: name,
      email: email,
      phoneNumber: "",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      emailVerified: false,
      balance: 1000.0, // Starting balance
      transactionCount: 0,
    });

    console.log("Signup successful:", user.uid);
    showToast("Account created! Please verify your email.", "success");

    // Close modal and navigate to dashboard
    closeAuthModal();
    navigateTo("dashboard");
  } catch (error) {
    console.error("Signup error:", error);

    let errorMessage = "Signup failed";

    switch (error.code) {
      case "auth/email-already-in-use":
        errorMessage = "An account with this email already exists";
        break;
      case "auth/invalid-email":
        errorMessage = "Invalid email address";
        break;
      case "auth/weak-password":
        errorMessage = "Password is too weak. Use at least 6 characters";
        break;
      case "auth/operation-not-allowed":
        errorMessage = "Email/password authentication is not enabled";
        break;
      default:
        errorMessage = error.message;
    }

    showToast(errorMessage, "error");
  } finally {
    showLoading(false);
  }
}

// Google Sign-In (Also Free Tier)
async function loginWithGoogle() {
  showLoading(true);

  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await auth.signInWithPopup(provider);
    const user = result.user;

    // Check if user document exists
    const userDoc = await db.collection("users").doc(user.uid).get();

    if (!userDoc.exists) {
      // Create user document for new Google users
      await db
        .collection("users")
        .doc(user.uid)
        .set({
          name: user.displayName,
          email: user.email,
          phoneNumber: user.phoneNumber || "",
          photoURL: user.photoURL || "",
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          emailVerified: user.emailVerified,
          balance: 1000.0,
          transactionCount: 0,
        });
    }

    console.log("Google login successful:", user.uid);
    showToast("Login successful!", "success");

    closeAuthModal();
    navigateTo("dashboard");
  } catch (error) {
    console.error("Google login error:", error);

    let errorMessage = "Google login failed";

    switch (error.code) {
      case "auth/popup-closed-by-user":
        errorMessage = "Login cancelled";
        break;
      case "auth/popup-blocked":
        errorMessage = "Popup blocked. Please allow popups for this site";
        break;
      case "auth/account-exists-with-different-credential":
        errorMessage = "An account already exists with this email";
        break;
      default:
        errorMessage = error.message;
    }

    showToast(errorMessage, "error");
  } finally {
    showLoading(false);
  }
}

// Password Reset
async function resetPassword() {
  const email = prompt("Enter your email address:");

  if (!email) return;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast("Please enter a valid email address", "error");
    return;
  }

  showLoading(true);

  try {
    await auth.sendPasswordResetEmail(email);
    showToast("Password reset email sent! Check your inbox.", "success");
  } catch (error) {
    console.error("Password reset error:", error);

    let errorMessage = "Failed to send reset email";

    switch (error.code) {
      case "auth/user-not-found":
        errorMessage = "No account found with this email";
        break;
      case "auth/invalid-email":
        errorMessage = "Invalid email address";
        break;
      default:
        errorMessage = error.message;
    }

    showToast(errorMessage, "error");
  } finally {
    showLoading(false);
  }
}

// Logout (same as phone auth)
async function logout() {
  try {
    await auth.signOut();
    console.log("Logout successful");
    showToast("Logged out successfully", "success");
    navigateTo("landing");
  } catch (error) {
    console.error("Logout error:", error);
    showToast("Error logging out", "error");
  }
}

// Auth state observer
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("User is signed in:", user.email);

    // Update UI for logged-in state
    const loginBtn = document.querySelector('[onclick="showLogin()"]');
    const signupBtn = document.querySelector('[onclick="showSignup()"]');

    if (loginBtn) loginBtn.style.display = "none";
    if (signupBtn) signupBtn.style.display = "none";
  } else {
    console.log("User is signed out");

    // Update UI for logged-out state
    const loginBtn = document.querySelector('[onclick="showLogin()"]');
    const signupBtn = document.querySelector('[onclick="showSignup()"]');

    if (loginBtn) loginBtn.style.display = "inline-block";
    if (signupBtn) signupBtn.style.display = "inline-block";
  }
});

// Helper functions for modal management
function showLogin() {
  const modal = document.getElementById("auth-modal");
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");

  if (modal && loginForm && signupForm) {
    modal.classList.add("active");
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
  }
}

function showSignup() {
  const modal = document.getElementById("auth-modal");
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");

  if (modal && loginForm && signupForm) {
    modal.classList.add("active");
    loginForm.classList.add("hidden");
    signupForm.classList.remove("hidden");
  }
}

function closeAuthModal() {
  const modal = document.getElementById("auth-modal");
  if (modal) {
    modal.classList.remove("active");

    // Reset forms
    const loginForm = document
      .getElementById("login-form")
      ?.querySelector("form");
    const signupForm = document
      .getElementById("signup-form")
      ?.querySelector("form");

    if (loginForm) loginForm.reset();
    if (signupForm) signupForm.reset();
  }
}

function switchToLogin() {
  showLogin();
}

function switchToSignup() {
  showSignup();
}

// Make functions globally available
window.loginWithEmail = loginWithEmail;
window.signupWithEmail = signupWithEmail;
window.loginWithGoogle = loginWithGoogle;
window.resetPassword = resetPassword;
window.logout = logout;
window.showLogin = showLogin;
window.showSignup = showSignup;
window.closeAuthModal = closeAuthModal;
window.switchToLogin = switchToLogin;
window.switchToSignup = switchToSignup;
