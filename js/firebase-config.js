// Firebase Configuration
// Replace these values with your actual Firebase project configuration
// Get these from Firebase Console > Project Settings > Your apps > SDK setup and configuration

const firebaseConfig = {
  apiKey: "AIzaSyCEaUAN243v5T1k-s36bJuw0axQPWR-g4k",
  authDomain: "mpesaclone-152ee.firebaseapp.com",
  projectId: "mpesaclone-152ee",
  storageBucket: "mpesaclone-152ee.firebasestorage.app",
  messagingSenderId: "1088373104757",
  appId: "1:1088373104757:web:e2a3ab3be04682c5d9983c"
};

// Initialize Firebase
try {
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

// Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Set persistence to LOCAL (session persists across browser sessions)
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch((error) => {
  console.error("Error setting persistence:", error);
});

// Initialize departments in Firestore (run once)
async function initializeDepartments() {
  const departments = [
    {
      id: "customer-support",
      name: "Customer Support Department",
      description: "General customer queries and assistance",
      icon: "fa-headset",
      categories: [
        "Account Issues",
        "Transaction Queries",
        "General Help",
        "Product Information",
      ],
      isActive: true,
    },
    {
      id: "technical-support",
      name: "Technical Support Department",
      description: "App issues, login problems, technical errors",
      icon: "fa-tools",
      categories: [
        "Login Problems",
        "App Errors",
        "System Issues",
        "Integration Problems",
      ],
      isActive: true,
    },
    {
      id: "billing",
      name: "Billing Department",
      description: "Transaction disputes, refunds, billing queries",
      icon: "fa-receipt",
      categories: [
        "Transaction Disputes",
        "Refund Requests",
        "Payment Issues",
        "Billing Inquiries",
      ],
      isActive: true,
    },
    {
      id: "sales",
      name: "Sales Department",
      description: "Business accounts, merchant services",
      icon: "fa-chart-line",
      categories: [
        "Business Accounts",
        "Merchant Services",
        "Partnership Inquiries",
        "Sales Support",
      ],
      isActive: true,
    },
    {
      id: "compliance",
      name: "Compliance Department",
      description: "Account verification, security concerns",
      icon: "fa-shield-alt",
      categories: [
        "Account Verification",
        "Security Issues",
        "Privacy Concerns",
        "Regulatory Compliance",
      ],
      isActive: true,
    },
    {
      id: "general-inquiries",
      name: "General Inquiries Department",
      description: "General questions and information",
      icon: "fa-info-circle",
      categories: [
        "General Questions",
        "Service Information",
        "Features Inquiry",
        "Other",
      ],
      isActive: true,
    },
  ];

  // Check if departments already exist
  const snapshot = await db.collection("departments").get();

  if (snapshot.empty) {
    console.log("Initializing departments...");
    const batch = db.batch();

    departments.forEach((dept) => {
      const docRef = db.collection("departments").doc(dept.id);
      batch.set(docRef, dept);
    });

    await batch.commit();
    console.log("Departments initialized successfully");
  } else {
    console.log("Departments already exist");
  }
}

// Call initialization when Firebase is ready
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // Initialize departments if needed
    initializeDepartments().catch((error) => {
      console.error("Error initializing departments:", error);
    });
  }
});

// Export for use in other files
window.firebaseApp = {
  auth,
  db,
  storage,
  firebase,
};
