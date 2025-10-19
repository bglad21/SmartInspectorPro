# Onboarding Flow - Testing Instructions

**Date:** October 19, 2025
**Status:** ✅ Ready for Testing
**Builds:** ✅ iOS & Android Successfully Launched

## 🎉 SUCCESS! Both platforms are now running with the onboarding flow

### Build Status

**iOS Simulator:**

- ✅ Build completed successfully
- ✅ App installed on iPhone 16 Pro (iOS 18.2)
- ✅ App launched successfully
- **Device:** iPhone 16 Pro Simulator
- **iOS Version:** 18.2
- **Bundle ID:** com.smartinspectorpro.app

**Android Emulator:**

- ✅ Build completed successfully (5 seconds)
- ✅ APK installed on Medium Phone API 36
- ✅ App launched successfully
- **Device:** Medium_Phone_API_36.0 (AVD)
- **API Level:** 36
- **Package:** com.smartinspectorpro.app

**Metro Bundler:**

- ✅ Running with cache reset
- ✅ All new onboarding code loaded
- **PID:** 80385
- **Port:** 8081 (default)

## 🧪 Test Scenarios

### Test 1: New User Registration with Onboarding

**Objective:** Verify complete registration → verification → onboarding flow

**Steps:**

1. On either iOS or Android, tap "Register" on Login screen
2. Fill in registration form:
   - First Name: Test
   - Last Name: Onboarding
   - Email: test-onboarding-oct19@example.com
   - Password: Test1234!
   - Confirm Password: Test1234!
3. Tap "Sign Up"
4. Check email for verification code
5. Enter verification code
6. Tap "Verify Email"

**Expected Results:**

- ✅ Auto sign-in completes automatically
- ✅ OnboardingScreen appears with personalized greeting: "Welcome, Test! 👋"
- ✅ Three option cards are visible:
  - 💼 Get a Membership
  - 👥 Join a Team
  - 👀 Preview the App
- ✅ Footer text: "You can change these settings anytime in your account settings"

**Console Logs to Verify:**

```
✅ Email verified successfully
🔵 Auto-signing in user after email verification...
✅ User automatically signed in after email verification
📊 Auth State: {
  isAuthenticated: true,
  isInitialized: true,
  hasCompletedOnboarding: false,
  isLoadingData: false
}
```

### Test 2: Onboarding Option - Get a Membership

**Prerequisites:** Complete Test 1 (OnboardingScreen is visible)

**Steps:**

1. Tap "View Plans" button on "Get a Membership" card

**Expected Results:**

- ✅ `completeOnboarding()` action dispatched
- ✅ AsyncStorage key `@onboarding_complete` set to `'true'`
- ✅ Redux state `hasCompletedOnboarding` becomes `true`
- ✅ Navigation to MembershipDetails screen
- ✅ OnboardingScreen won't show again on future logins

**Console Logs to Verify:**

```
📊 Auth State: {
  isAuthenticated: true,
  hasCompletedOnboarding: true  // ← Changed
}
```

### Test 3: Onboarding Option - Join a Team

**Prerequisites:** Complete Test 1 (OnboardingScreen is visible)

**Alternative Test:** Register a different user

**Steps:**

1. Tap "Join Team" button on "Join a Team" card

**Expected Results:**

- ✅ `completeOnboarding()` action dispatched
- ✅ AsyncStorage updated
- ✅ Navigation to JoinTeamInspection screen
- ✅ Onboarding marked as complete

### Test 4: Onboarding Option - Preview the App

**Prerequisites:** Complete Test 1 (OnboardingScreen is visible)

**Alternative Test:** Register a third user

**Steps:**

1. Tap "Preview Now" button on "Preview the App" card

**Expected Results:**

- ✅ `completeOnboarding()` action dispatched
- ✅ AsyncStorage updated
- ✅ Navigation to Home screen
- ✅ Onboarding marked as complete

### Test 5: Returning User - Onboarding Skipped

**Prerequisites:** Complete any of Tests 2, 3, or 4 (onboarding completed)

**Steps:**

1. From Home screen, open menu
2. Tap "Sign Out"
3. Sign in again with the same credentials used in registration

**Expected Results:**

- ✅ Sign in successful
- ✅ OnboardingScreen is NOT shown
- ✅ Navigate directly to Home screen
- ✅ Console shows `hasCompletedOnboarding: true`

**Console Logs to Verify:**

```
🔄 Initializing auth state...
✅ Auth initialization complete
📊 Auth State: {
  isAuthenticated: true,
  isInitialized: true,
  hasCompletedOnboarding: true,  // ← Loaded from AsyncStorage
  isLoadingData: false
}
```

### Test 6: Onboarding Persistence Across App Restarts

**Prerequisites:** Complete any onboarding test

**Steps:**

1. Complete onboarding (any option)
2. Force quit the app (swipe up on iOS, close from recent apps on Android)
3. Relaunch the app
4. Observe automatic sign-in (if session is still valid)

**Expected Results:**

- ✅ App loads
- ✅ Auth state initialized
- ✅ `hasCompletedOnboarding` is `true` (loaded from AsyncStorage)
- ✅ OnboardingScreen is skipped
- ✅ Home screen appears

### Test 7: Existing User (bgladysz21@icloud.com)

**Objective:** Verify existing users are not shown onboarding again

**Steps:**

1. Sign out (if signed in)
2. Sign in with existing credentials:
   - Email: bgladysz21@icloud.com
   - Password: Badass21!

**Expected Results:**

- ✅ Sign in successful
- ✅ OnboardingScreen appears (because this user hasn't completed onboarding yet)
- ✅ After selecting any option, onboarding is marked complete
- ✅ Future sign-ins skip onboarding

**Note:** This user was created before onboarding was implemented, so they'll see it on first sign-in after this update.

## 🔍 Debugging Tools

### Console Log Monitoring

Watch for these key log messages:

**Auth Initialization:**

```
🔄 Initializing auth state...
✅ Auth initialization complete
```

**Auth State Changes:**

```
📊 Auth State: {
  isAuthenticated: boolean,
  isInitialized: boolean,
  hasCompletedOnboarding: boolean,
  isLoadingData: boolean
}
```

**Onboarding Completion:**

```
// (Internal Redux action, check Redux DevTools)
Action: auth/completeOnboarding/fulfilled
```

### AsyncStorage Inspection

**React Native Debugger (Chrome DevTools):**

1. Open Chrome DevTools
2. Navigate to Application → Storage → AsyncStorage
3. Check keys:
   - `@onboarding_complete` → should be `'true'` after onboarding
   - `@auth_user` → user profile JSON
   - `@auth_tokens` → JWT tokens

**React Native CLI:**

```bash
# iOS
npx react-native run-ios --configuration Debug

# Android
adb shell run-as com.smartinspectorpro.app cat /data/data/com.smartinspectorpro.app/shared_prefs/AsyncStorage.xml
```

### Redux DevTools

**If Redux DevTools is configured:**

1. Open Redux DevTools
2. Watch for actions:
   - `auth/initialize/fulfilled`
   - `auth/signIn/fulfilled`
   - `auth/completeOnboarding/pending`
   - `auth/completeOnboarding/fulfilled`
3. Inspect state tree:
   - `state.auth.hasCompletedOnboarding`

## 🐛 Common Issues & Solutions

### Issue 1: OnboardingScreen Not Appearing

**Symptom:** After email verification and auto sign-in, user goes directly to Home screen

**Possible Causes:**

1. `hasCompletedOnboarding` is already `true` in AsyncStorage
2. Navigation conditional logic issue

**Solution:**

```bash
# Clear AsyncStorage for testing
# iOS: Delete app and reinstall
# Android: Settings → Apps → Smart Inspector Pro → Clear Storage

# Or manually clear onboarding flag (in app code):
await AsyncStorage.removeItem('@onboarding_complete');
```

**Debug:**

```javascript
// Add to OnboardingScreen.tsx
useEffect(() => {
  console.log('🎯 OnboardingScreen mounted');
}, []);
```

### Issue 2: Onboarding Shows Every Time

**Symptom:** OnboardingScreen appears on every sign-in

**Possible Causes:**

1. `completeOnboarding()` action not being dispatched
2. AsyncStorage write failing
3. AsyncStorage being cleared on sign out (expected behavior)

**Solution:**

- Check handler functions in OnboardingScreen.tsx
- Verify `await dispatch(completeOnboarding()).unwrap()` is called
- Check AsyncStorage write success

**Debug:**

```javascript
// In OnboardingScreen handlers
const handleSignUpMembership = async () => {
  console.log('🔵 Completing onboarding...');
  try {
    await dispatch(completeOnboarding()).unwrap();
    console.log('✅ Onboarding marked complete');
    navigation.navigate('MembershipDetails');
  } catch (error) {
    console.error('❌ Failed to complete onboarding:', error);
  }
};
```

### Issue 3: Navigation Type Errors

**Symptom:** TypeScript errors or navigation crashes

**Solution:**

- Verify `Onboarding` is in `RootStackParamList` (src/navigation/types.ts)
- Check all navigation.navigate() calls use correct screen names
- Restart TypeScript server in VS Code

### Issue 4: AWS Cognito Errors

**Symptom:** Sign-in fails or MFA challenge appears

**Solution:**

- Verify user has `CONFIRMED` status in Cognito
- Check MFA is set to OPTIONAL (verified in ONBOARDING_COGNITO_VERIFICATION.md)
- Ensure email is verified

**Debug:**

```bash
# Check user status
aws cognito-idp admin-get-user \
  --user-pool-id us-east-1_HgZUMoxyZ \
  --username bgladysz21@icloud.com
```

## 📱 Platform-Specific Notes

### iOS Testing

**Simulator:** iPhone 16 Pro (iOS 18.2)

- Shake device for developer menu (Cmd+D)
- Reload app: Cmd+R
- Open debugger: Cmd+D → "Open Debugger"

**Check Console Logs:**

```bash
# Real-time logs
npx react-native log-ios
```

### Android Testing

**Emulator:** Medium Phone API 36

- Developer menu: Cmd+M (Mac) or Ctrl+M (Windows)
- Reload app: RR (double tap R)
- Open debugger: Cmd+M → "Debug"

**Check Console Logs:**

```bash
# Real-time logs
npx react-native log-android

# Or adb
adb logcat | grep ReactNative
```

## ✅ Success Criteria

After testing, verify:

- [ ] New user registration flow works end-to-end
- [ ] Email verification completes successfully
- [ ] Auto sign-in happens after verification
- [ ] OnboardingScreen appears with personalized greeting
- [ ] All three onboarding options work:
  - [ ] Get a Membership → MembershipDetails
  - [ ] Join a Team → JoinTeamInspection
  - [ ] Preview the App → Home
- [ ] Onboarding is marked complete after any option
- [ ] Returning users skip onboarding
- [ ] Onboarding persistence works across app restarts
- [ ] No TypeScript errors
- [ ] No runtime errors
- [ ] Both iOS and Android work identically

## 📝 Documentation

**Implementation Details:**

- `CompletedTaskEvidence/Phase_08/ONBOARDING_FLOW_IMPLEMENTATION.md` - Complete technical documentation
- `CompletedTaskEvidence/Phase_08/ONBOARDING_COGNITO_VERIFICATION.md` - AWS Cognito compatibility verification

**Key Files:**

- `src/screens/onboarding/OnboardingScreen.tsx` - Onboarding UI
- `src/navigation/index.tsx` - Navigation logic
- `src/navigation/types.ts` - Type definitions
- `src/redux/slices/auth.slice.ts` - State management

## 🎯 Next Steps After Testing

### If All Tests Pass:

1. **Document Test Results:**

   - Screenshot each onboarding option
   - Record screen capture of full flow
   - Update CompletedTaskEvidence with test results

2. **Check off Task in BUILD_CHECKLIST.md:**

   - Mark Phase 8, Task P8-T02 as complete
   - Add evidence links

3. **Move to Next Task:**
   - P8-T03: Create Inspection Management Screens

### If Issues Found:

1. **Document the Issue:**

   - What was expected
   - What actually happened
   - Console logs
   - Screenshots

2. **Create Bug Report:**

   - File in appropriate location
   - Include reproduction steps
   - Tag with priority

3. **Fix and Retest:**
   - Make necessary corrections
   - Verify fix with test scenario
   - Update documentation

## 🚀 Ready to Test!

Both iOS and Android apps are now running with the complete onboarding flow. Use the test scenarios above to verify everything works as expected.

**Current Test User:** bgladysz21@icloud.com / Badass21!
**Create New Test Users:** test-onboarding-oct19@example.com (or any valid email)

Happy testing! 🎉

---

**Created by:** GitHub Copilot AI Agent
**Date:** October 19, 2025
**iOS Build:** ✅ Success (iPhone 16 Pro, iOS 18.2)
**Android Build:** ✅ Success (Medium Phone API 36)
**Metro Bundler:** ✅ Running with cache reset
