# M-Pesa Clone - Complete Single Page Application

A fully-featured M-Pesa clone built with HTML, CSS, and vanilla JavaScript with Firebase backend integration.

## Features

### 1. Landing Page

- Hero section with M-Pesa branding
- Features overview showcase
- Trust indicators (30M+ users, 100% secure, 24/7 support)
- Responsive navigation
- Call-to-action buttons
- Footer with contact information and social links

### 2. Authentication System

- **Firebase Phone Authentication** (OTP-based)
- Login with phone number (+254 Kenya)
- Registration with:
  - Full name
  - Phone number
  - Email (optional)
  - National ID/Passport
  - 4-6 digit PIN
  - Terms acceptance
- reCAPTCHA verification
- OTP verification with countdown timer
- Resend OTP functionality
- Form validation
- Session persistence

### 3. Dashboard

- Welcome message with user's name
- Balance card with show/hide toggle
- Last login timestamp
- Quick action buttons:
  - Send Money
  - Request Money
  - Pay Bill
  - Buy Airtime
  - Withdraw Cash
  - My Account
- Recent transactions (last 5)
- Navigation with departments dropdown
- Profile menu
- Notification bell

### 4. Departments System

- 6 Pre-configured departments:
  - Customer Support
  - Technical Support
  - Billing Department
  - Sales Department
  - Compliance Department
  - General Inquiries
- Department detail pages with categories
- Icon-based navigation
- Accessible from dashboard dropdown

### 5. Feedback System

- Comprehensive feedback form:
  - Auto-filled department, name, and phone
  - Subject/title (max 100 chars)
  - Priority level (Low, Medium, High, Urgent)
  - Category dropdown (based on department)
  - Message/description (max 500 chars)
  - Optional screenshot upload (max 5MB)
  - Email updates checkbox
- Character counters for text inputs
- Auto-generated ticket numbers
- File upload to Firebase Storage
- Feedback history with:
  - Table view with ticket number, department, subject, date, status
  - Status badges (Pending, In Progress, Resolved, Closed)
  - Filter by status and department
  - Search functionality
  - Detailed view modal with admin responses

### 6. Navigation System

- Single Page Application (SPA) architecture
- Browser back/forward button support (History API)
- Smooth section transitions
- Protected routes (authentication required)
- Active menu highlighting
- Mobile-responsive hamburger menu

### 7. Design Features

- M-Pesa color scheme (Green: #00A650, Red: #E31837)
- Modern card-based layouts
- Font Awesome icons
- Google Fonts (Poppins)
- Smooth animations and transitions
- Toast notifications
- Loading overlays
- Modal dialogs
- Responsive design (mobile-first)
- Empty states for no data

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Firebase
  - Authentication (Phone Auth)
  - Firestore Database
  - Storage (for attachments)
- **Icons**: Font Awesome 6.4.0
- **Fonts**: Google Fonts (Poppins)

## Project Structure

```
mpesa-clone/
├── index.html              # Main HTML file with all sections
├── css/
│   └── style.css          # Complete styling
├── js/
│   ├── firebase-config.js  # Firebase initialization
│   ├── auth.js            # Authentication logic
│   ├── navigation.js      # SPA navigation
│   ├── feedback.js        # Feedback functionality
│   └── app.js             # Main application logic
├── assets/
│   ├── images/            # Image assets
│   └── icons/             # Icon assets
├── package.json           # Dependencies
└── README.md              # This file
```

## Setup Instructions

### 1. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project
3. Enable the following services:

#### Enable Phone Authentication:

- Go to **Authentication** > **Sign-in method**
- Enable **Phone** provider
- Add your domain to authorized domains

#### Enable Firestore Database:

- Go to **Firestore Database**
- Create database in production mode
- Set up security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Transactions collection
    match /transactions/{transactionId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }

    // Feedback collection
    match /feedback/{feedbackId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null; // Allow admin updates
    }

    // Departments collection (read-only for users)
    match /departments/{departmentId} {
      allow read: if true;
      allow write: if false; // Only admin can write
    }
  }
}
```

#### Enable Firebase Storage:

- Go to **Storage**
- Get started with default settings
- Set up security rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /feedback-attachments/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
                   && request.resource.size < 5 * 1024 * 1024 // 5MB limit
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

4. Get your Firebase configuration:
   - Go to **Project Settings** > **General**
   - Scroll to "Your apps" section
   - Click "Web" icon to create a web app
   - Copy the configuration object

5. Update `js/firebase-config.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

### 2. Local Development

1. Install a local web server (choose one):

   **Option A: Using Python**

   ```bash
   # Python 3
   cd "d:\mpesa clone"
   python -m http.server 8000
   ```

   **Option B: Using Node.js (http-server)**

   ```bash
   npm install -g http-server
   cd "d:\mpesa clone"
   http-server -p 8000
   ```

   **Option C: Using VS Code Live Server**
   - Install "Live Server" extension in VS Code
   - Right-click on index.html
   - Select "Open with Live Server"

2. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

### 3. Testing Phone Authentication

**Important**: For testing phone authentication:

1. **Test Phone Numbers** (Development):
   - Go to Firebase Console > Authentication > Sign-in method > Phone
   - Scroll to "Phone numbers for testing"
   - Add test phone numbers with verification codes:
     - Phone: +254722000000, Code: 123456
     - Phone: +254733000000, Code: 123456

2. **Production**:
   - Use real phone numbers
   - SMS charges apply
   - Configure billing in Firebase Console

### 4. Initialize Departments

The departments are automatically initialized when a user logs in. The default departments include:

- Customer Support Department
- Technical Support Department
- Billing Department
- Sales Department
- Compliance Department
- General Inquiries Department

### 5. Demo Features

For testing purposes, you can use these console commands after logging in:

```javascript
// Add initial balance (KSh 10,000)
addInitialBalance();

// Create sample transactions
createSampleTransactions();
```

## Database Schema

### Users Collection

```javascript
users/{userId}
  - name: string
  - phone: string
  - email: string (optional)
  - nationalId: string
  - pin: string
  - balance: number
  - createdAt: timestamp
  - lastLogin: timestamp
  - profilePicture: string (URL)
  - isVerified: boolean
```

### Transactions Collection

```javascript
transactions/{transactionId}
  - userId: string
  - type: string (send/receive/bill/airtime)
  - amount: number
  - recipient: string
  - description: string
  - timestamp: timestamp
  - status: string
```

### Feedback Collection

```javascript
feedback/{feedbackId}
  - userId: string
  - userName: string
  - userPhone: string
  - userEmail: string
  - ticketNumber: string (auto-generated)
  - department: string
  - departmentId: string
  - subject: string
  - message: string
  - priority: string (low/medium/high/urgent)
  - category: string
  - attachmentUrl: string (optional)
  - emailUpdates: boolean
  - status: string (pending/in-progress/resolved/closed)
  - createdAt: timestamp
  - updatedAt: timestamp
  - adminResponse: string (optional)
  - respondedAt: timestamp (optional)
```

### Departments Collection

```javascript
departments/{departmentId}
  - name: string
  - description: string
  - icon: string (Font Awesome class)
  - categories: array of strings
  - isActive: boolean
```

## User Flow

1. **First Visit** → Landing page → Sign Up → Enter details → Verify OTP → Dashboard
2. **Returning User** → Landing page → Login → Enter phone → Verify OTP → Dashboard
3. **Submit Feedback** → Dashboard → Departments → Select Department → Send Feedback → Fill Form → Submit
4. **View Feedback** → Dashboard → My Feedback → View History → Click View → See Details

## Security Considerations

⚠️ **Important for Production**:

1. **Hash PINs**: Never store PINs in plain text. Use bcrypt or similar:

   ```javascript
   const hashedPin = await bcrypt.hash(pin, 10);
   ```

2. **Environment Variables**: Store Firebase config in environment variables

3. **Rate Limiting**: Implement rate limiting for API calls

4. **Input Validation**: Always validate and sanitize user inputs

5. **HTTPS**: Deploy with HTTPS enabled

6. **Firestore Security Rules**: Implement proper security rules (provided above)

7. **Content Security Policy**: Add CSP headers

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Responsive Breakpoints

- Mobile: 480px
- Tablet: 768px
- Laptop: 1024px
- Desktop: 1200px

## Future Enhancements

- [ ] Real transaction processing
- [ ] Bank integration
- [ ] QR code payments
- [ ] Multi-language support (English, Swahili)
- [ ] Dark mode
- [ ] Push notifications
- [ ] Two-factor authentication
- [ ] Transaction receipts (PDF)
- [ ] Live chat support
- [ ] Progressive Web App (PWA)
- [ ] Admin dashboard for managing feedback

## Troubleshooting

### Firebase Initialization Error

- Check if Firebase config is correctly set in `firebase-config.js`
- Verify all Firebase services are enabled in console

### Phone Authentication Not Working

- Ensure Phone provider is enabled in Firebase Console
- Check if domain is added to authorized domains
- For testing, use test phone numbers

### reCAPTCHA Issues

- Ensure your domain is authorized in Firebase Console
- Check browser console for specific errors
- Try using invisible reCAPTCHA

### Images/Icons Not Loading

- Check file paths are correct
- Verify Font Awesome CDN link is active
- Check browser console for 404 errors

## License

This is a demo project for educational purposes.

## Credits

- Icons: Font Awesome
- Fonts: Google Fonts (Poppins)
- Backend: Firebase

## Support

For issues and questions, please refer to:

- [Firebase Documentation](https://firebase.google.com/docs)
- [Font Awesome Icons](https://fontawesome.com/icons)

---

**Note**: This is a clone project for demonstration purposes. M-Pesa is a trademark of Safaricom PLC.
#   m p e s a - c l o n e  
 