# Quick Reference: Email/Password Authentication

## 🚀 Start Development Server

```bash
npx http-server -p 3000 -c-1 -o
```

**Flags:**

- `-p 3000` = Use port 3000
- `-c-1` = Disable cache (always load fresh files)
- `-o` = Auto-open browser

**Access at:** http://localhost:3000

---

## 📝 User Actions

### Sign Up (New User)

1. Click **Sign Up** button
2. Enter: Name, Email, Password (6+ chars), Confirm Password
3. Accept terms
4. Click **Create Account**
5. ✅ Account created with KSh 1,000 balance

### Login (Existing User)

1. Click **Login** button
2. Enter: Email, Password
3. Click **Login**
4. ✅ Redirected to dashboard

### Google Sign-In (Fast)

1. Click **Continue with Google**
2. Select Google account
3. ✅ Auto-login

### Forgot Password

1. Click **Forgot password?**
2. Enter email
3. Check inbox for reset link
4. Set new password

---

## 🔧 Firebase Console Checklist

### Required Settings:

1. **Authentication → Sign-in method**
   - ✅ Email/Password: ENABLED
   - ✅ Google: ENABLED (optional)

2. **Project Settings**
   - Get your Firebase config credentials
   - Replace placeholders in `js/firebase-config.js`

3. **Authorized Domains**
   - Add `localhost` for development

---

## 📂 Files Modified

| File               | Change                                       |
| ------------------ | -------------------------------------------- |
| `index.html`       | Login/signup forms now use email/password    |
| `js/auth-email.js` | New authentication module (replaces auth.js) |
| `firebase.json`    | Removed hosting config                       |

---

## ✅ What Works (FREE Tier)

- ✅ Email/password authentication
- ✅ Google sign-in
- ✅ Password reset via email
- ✅ Dashboard with balance
- ✅ Transactions
- ✅ 6 Departments
- ✅ Feedback system
- ✅ Firestore database
- ✅ File storage

---

## 🔍 Troubleshooting

### "YOUR_API_KEY" Error

**Solution:** Update `js/firebase-config.js` with real Firebase credentials from Firebase Console

### "auth/billing-not-enabled" Error

**Solution:** Already fixed! You're now using email auth (free tier)

### Browser shows old page

**Solution:** Hard refresh (Ctrl+Shift+R) or restart server with `-c-1` flag

### Login button doesn't work

**Solution:** Check browser console (F12) for errors. Verify Firebase config is correct.

---

## 🧪 Test Steps

1. [ ] Server running at `http://localhost:3000`
2. [ ] Click **Sign Up** button
3. [ ] Create account with test email
4. [ ] Check Firebase Console → Users (new user appears)
5. [ ] Logout
6. [ ] Click **Login** with same credentials
7. [ ] Dashboard loads successfully
8. [ ] Test **Continue with Google**
9. [ ] Test **Forgot password?**

---

## 📞 Support

- **Firebase Email Auth:** https://firebase.google.com/docs/auth/web/password-auth
- **Migration Guide:** See `MIGRATION-PHONE-TO-EMAIL-AUTH.md`
- **Setup Instructions:** See `FIREBASE-FREE-TIER-AUTH.md`

---

## 🎉 You're All Set!

Your M-Pesa clone now uses **FREE email/password authentication**. No more billing errors!

**Next:** Test signup/login, then deploy when ready.
