# Firebase Email Authentication Setup Guide

## FREE TIER SOLUTION (No Billing Required)

This guide shows how to use **Email/Password** and **Google Sign-In** authentication instead of phone auth, which works on Firebase's free Spark plan.

---

## Step 1: Enable Email/Password Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Email/Password**
5. Toggle **Enable** → Save
6. (Optional) Enable **Email link (passwordless sign-in)**

---

## Step 2: Enable Google Sign-In (Optional)

1. In the same **Sign-in method** tab
2. Click on **Google**
3. Toggle **Enable**
4. Select a **Project support email**
5. Click **Save**

---

## Step 3: Update Firebase Config

Make sure your `js/firebase-config.js` has your **real credentials**:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXX", // Your actual API key
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxx",
};
```

Get these from: Firebase Console → Project Settings → Your apps → SDK setup

---

## Step 4: Use the New Login Page

### Option A: Standalone Login Page

1. Open `login.html` in your browser
2. Create an account with email/password
3. Or sign in with Google
4. After login, you'll be redirected to `index.html` (main app)

### Option B: Integrate with Existing App

Replace phone auth buttons in your existing `index.html` with:

```html
<!-- In your auth modal -->
<form onsubmit="loginWithEmail(event)">
  <input type="email" id="login-email" placeholder="Email" required />
  <input type="password" id="login-password" placeholder="Password" required />
  <button type="submit">Sign In</button>
</form>

<button onclick="loginWithGoogle()">
  <img
    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
  />
  Sign in with Google
</button>

<!-- Add the script -->
<script src="js/auth-email.js"></script>
```

---

## Step 5: Test Your Authentication

1. **Start your server:**

   ```bash
   npx http-server
   ```

2. **Open login page:**

   ```
   http://localhost:8080/login.html
   ```

3. **Create account:**
   - Enter name, email, password
   - Click "Create Account"
   - Check your email for verification link

4. **Sign in with Google:**
   - Click "Continue with Google"
   - Select your Google account
   - Approve permissions

---

## Step 6: Verify Users in Firebase Console

1. Go to Firebase Console → **Authentication** → **Users**
2. You should see your newly created users
3. Check if email is verified

---

## Comparison: Phone Auth vs Email Auth

| Feature              | Phone Auth                                   | Email/Password | Google Sign-In   |
| -------------------- | -------------------------------------------- | -------------- | ---------------- |
| **Cost**             | ❌ Requires Blaze plan (~$0.01-0.06 per SMS) | ✅ FREE        | ✅ FREE          |
| **Setup**            | Complex (reCAPTCHA, SMS)                     | Simple         | Very Simple      |
| **User Experience**  | Good for Kenya/M-Pesa                        | Standard       | Best (one-click) |
| **Verification**     | SMS OTP                                      | Email link     | Auto-verified    |
| **Production Ready** | Yes (with billing)                           | Yes            | Yes              |

---

## What Works on FREE Tier

✅ **Email/Password authentication**
✅ **Google Sign-In**
✅ **Facebook Login**
✅ **GitHub Login**
✅ **Twitter Login**
✅ **Anonymous authentication**
✅ **Firestore** (10K reads/day, 20K writes/day)
✅ **Storage** (1GB storage, 10GB transfer/month)
✅ **Hosting** (10GB storage, 360MB/day transfer)

❌ **Phone authentication** (Requires Blaze plan)

---

## Option: Upgrade to Blaze Plan for Phone Auth

If you MUST have phone authentication:

### Steps to Upgrade:

1. Go to Firebase Console → **⚙️** → **Usage and billing**
2. Click **Modify plan** → Select **Blaze (Pay as you go)**
3. Add billing information (credit/debit card)
4. Set **budget alerts** (recommended: $5-10/month for testing)

### Costs:

- **Phone Auth**: $0.01-0.06 per verification SMS
- **Monthly estimate**: ~$5-20 for 100-500 users
- **Set alerts**: Billing → Budgets & alerts → Create budget

### After Upgrading:

- Phone auth will work immediately
- Use your existing `js/auth.js` file
- No code changes needed

---

## Recommended Solution for M-Pesa Clone

For a **free development environment**, use:

1. **Email/Password** for account creation
2. **Google Sign-In** for quick access
3. Store phone numbers in user profile (Firestore)
4. Simulate M-Pesa transactions without SMS

For **production** (real users):

1. **Upgrade to Blaze plan** (~$10-50/month typical usage)
2. Use **phone authentication** (matches M-Pesa UX)
3. Implement **SMS notifications** for transactions
4. Set **billing alerts** to avoid surprises

---

## Files Created

- ✅ `js/auth-email.js` - Email/password + Google auth module
- ✅ `login.html` - Standalone login/signup page (works on free tier)

## Next Steps

1. ✅ Enable Email/Password in Firebase Console
2. ✅ Update firebase-config.js with real credentials
3. ✅ Test login.html
4. ✅ (Optional) Integrate auth-email.js into your main app
5. ❓ Decide: Stay on free tier OR upgrade for phone auth

---

## Need Help?

- **Firebase billing docs**: https://firebase.google.com/pricing
- **Phone auth pricing**: https://firebase.google.com/docs/auth/phone-pricing
- **Email auth docs**: https://firebase.google.com/docs/auth/web/password-auth

---

## Summary

✅ **Problem**: Phone auth requires paid Blaze plan ($0.01-0.06/SMS)
✅ **Solution**: Use email/password + Google sign-in (FREE)
✅ **Files Ready**: `login.html` and `js/auth-email.js`
✅ **Action**: Enable email auth in Firebase Console → Test login.html

**Choose your path:**

- 🆓 **Free tier**: Use email/Google auth (ready to use now!)
- 💳 **Paid tier**: Upgrade to Blaze for phone auth (matches M-Pesa UX better)
