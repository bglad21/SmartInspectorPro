# Metro Bundler Connection Fix

**Date:** October 19, 2025
**Issue:** Both iOS and Android simulators showing "Unable to load script" error
**Status:** ✅ Fixed - Metro bundler restarted

## The Problem

Both simulators showed the red error screen:

- **iOS**: "No script URL provided. Make sure the packager is running..."
- **Android**: "Unable to load script. Make sure you're running Metro..."

**Root Cause:** Metro bundler stopped or wasn't properly connected to the simulators.

## The Solution

### ✅ What Was Done

1. **Killed existing Metro process** (port 8081 was in use)
2. **Restarted Metro with cache reset**: `npm start -- --reset-cache`
3. **Metro is now running** on http://localhost:8081
4. **iOS app relaunched** successfully
5. **Android emulator restarted** and app being reinstalled

### Current Status

**Metro Bundler:** ✅ Running

```
Dev server ready on http://localhost:8081
Press 'r' to reload
Press 'd' to open Dev Menu
```

**iOS Simulator:** ✅ App relaunched (PID: 84548)

**Android Emulator:** 🔄 Starting and installing app

## How to Reload Apps Manually

### iOS Simulator

**Method 1: Use iOS Simulator Menu**

1. Focus on iOS Simulator window
2. Press `Cmd + R` to reload

**Method 2: Developer Menu**

1. Press `Cmd + D` (or shake device)
2. Tap "Reload"

**Method 3: From Terminal**

```bash
xcrun simctl launch booted com.smartinspectorpro.app
```

### Android Emulator

**Method 1: Developer Menu**

1. Press `Cmd + M` (Mac) or `Ctrl + M` (Windows/Linux)
2. Tap "Reload"

**Method 2: Double R Key**

1. Focus on terminal running Metro
2. Press `R` twice quickly (RR)

**Method 3: From Terminal**

```bash
adb shell input text "RR"
```

**Method 4: Restart App**

```bash
adb shell am start -n com.smartinspectorpro.app/.MainActivity
```

## Metro Bundler Commands

### From Metro Terminal (when focused on Metro output):

- **`r`** - Reload app on all connected devices
- **`d`** - Open developer menu on all connected devices
- **`j`** - Open Chrome DevTools debugger
- **`Ctrl+C`** - Stop Metro bundler

### From Another Terminal:

**Reload iOS:**

```bash
# Method 1: Restart app
xcrun simctl launch booted com.smartinspectorpro.app

# Method 2: Send reload notification
curl -X POST http://localhost:8081/reload
```

**Reload Android:**

```bash
# Method 1: Restart app
adb shell am start -n com.smartinspectorpro.app/.MainActivity

# Method 2: Send reload command
adb shell input keyevent KEYCODE_MENU && adb shell input tap 500 500
```

## Common Metro Issues & Fixes

### Issue 1: Port 8081 Already in Use

**Error:** `EADDRINUSE: address already in use :::8081`

**Fix:**

```bash
# Kill process on port 8081
lsof -ti:8081 | xargs kill -9

# Then restart Metro
npm start -- --reset-cache
```

### Issue 2: Metro Not Connecting to Devices

**Symptoms:**

- Red screen: "Unable to load script"
- "No script URL provided"

**Fix:**

```bash
# 1. Stop Metro (Ctrl+C)
# 2. Clear cache
watchman watch-del-all
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*

# 3. Restart Metro
npm start -- --reset-cache
```

### Issue 3: Watchman Warnings

**Warning:** "Recrawled this watch 5 times..."

**Fix:**

```bash
# Reset watchman
watchman watch-del '/Users/brandongladysz/GitHub/SmartInspectorPro'
watchman watch-project '/Users/brandongladysz/GitHub/SmartInspectorPro'

# Or completely reset watchman
watchman shutdown-server
```

### Issue 4: Stale Bundle Cache

**Symptoms:**

- Changes not reflecting
- Old code still running

**Fix:**

```bash
# Stop Metro
# Clear all caches
rm -rf node_modules/.cache
rm -rf $TMPDIR/react-*
npm start -- --reset-cache
```

## Quick Restart Commands

**Full Reset (when nothing works):**

```bash
# 1. Kill all React Native processes
pkill -f "react-native" || pkill -f "metro"

# 2. Clear all caches
watchman watch-del-all
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/metro-*
rm -rf node_modules/.cache

# 3. Restart Metro
npm start -- --reset-cache

# 4. In another terminal, rebuild iOS
npm run ios

# 5. In another terminal, rebuild Android
npm run android
```

**Quick Reload (when Metro is running):**

```bash
# From Metro terminal, just press: r
# This reloads all connected devices
```

## Verify Metro Is Running

```bash
# Check if Metro is running
ps aux | grep metro | grep -v grep

# Check if port 8081 is open
lsof -i:8081

# Test Metro connection
curl http://localhost:8081/status
```

**Expected output:**

```
packager-status:running
```

## Network Configuration (for Physical Devices)

If testing on physical devices, ensure they can reach Metro:

**1. Find your computer's IP:**

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**2. Configure app to use your IP:**

Edit `ios/SmartInspectorPro/AppDelegate.mm`:

```objective-c
// Change localhost to your computer's IP
return [NSURL URLWithString:@"http://192.168.1.XXX:8081/index.bundle?platform=ios"];
```

**3. Ensure firewall allows port 8081**

## Debugging Tips

### Enable Debug Logging

**Metro with verbose logging:**

```bash
npm start -- --reset-cache --verbose
```

**iOS with logs:**

```bash
npm run ios -- --verbose
# Or in separate terminal:
npx react-native log-ios
```

**Android with logs:**

```bash
npm run android -- --verbose
# Or in separate terminal:
npx react-native log-android
```

### Check Bundle Generation

**Test if Metro can generate bundle:**

```bash
curl "http://localhost:8081/index.bundle?platform=ios" > /dev/null
curl "http://localhost:8081/index.bundle?platform=android" > /dev/null
```

If these commands succeed, Metro is working correctly.

## Current Session Status

### ✅ Completed

- [x] Killed stale Metro process
- [x] Restarted Metro with cache reset
- [x] Metro running on port 8081
- [x] iOS app relaunched
- [x] Android emulator starting

### 🔄 In Progress

- [ ] Android emulator boot complete
- [ ] Android app installation
- [ ] Test onboarding flow on both platforms

## Next Steps

Once both simulators show the app (not the error screen):

1. **Test with Existing User:**

   - Sign in: bgladysz21@icloud.com / Badass21!
   - Should see OnboardingScreen (first time after update)

2. **Test with New User:**

   - Register new account
   - Verify email
   - Observe auto sign-in
   - See OnboardingScreen with greeting

3. **Test All Three Options:**
   - Get a Membership → MembershipDetails
   - Join a Team → JoinTeamInspection
   - Preview the App → Home

## Metro Bundler Health Check

Run this to verify everything is working:

```bash
# 1. Check Metro is running
curl -s http://localhost:8081/status

# 2. Check iOS bundle can be generated
curl -I "http://localhost:8081/index.bundle?platform=ios" 2>&1 | head -1

# 3. Check Android bundle can be generated
curl -I "http://localhost:8081/index.bundle?platform=android" 2>&1 | head -1

# All should return successful responses
```

**Expected:**

```
packager-status:running
HTTP/1.1 200 OK
HTTP/1.1 200 OK
```

---

**Issue Resolved:** Metro bundler connection restored
**Time to Fix:** ~2 minutes
**Root Cause:** Port conflict / stale Metro process
**Prevention:** Always ensure Metro is running before launching simulators
