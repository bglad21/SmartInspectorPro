# Smart Inspector Pro - Troubleshooting Guide

**Version**: 1.0.0  
**Last Updated**: October 17, 2025  
**Purpose**: Solutions to common development issues

---

## Table of Contents

1. [Build Errors](#build-errors)
2. [Runtime Errors](#runtime-errors)
3. [Testing Issues](#testing-issues)
4. [AWS Service Errors](#aws-service-errors)
5. [Platform-Specific Issues](#platform-specific-issues)
6. [Performance Issues](#performance-issues)
7. [Third-Party Library Conflicts](#third-party-library-conflicts)
8. [Database Issues](#database-issues)
9. [Network & API Errors](#network--api-errors)
10. [Development Environment Issues](#development-environment-issues)

---

## Build Errors

### Metro Bundler Issues

#### Error: "Metro bundler process exited with code 1"

**Symptoms**: Metro crashes on startup or during development

**Solutions**:
```bash
# 1. Clear Metro cache
npm start -- --reset-cache

# 2. Clear watchman
watchman watch-del-all

# 3. Delete node_modules and reinstall
rm -rf node_modules
npm install

# 4. Kill any processes on port 8081
lsof -ti:8081 | xargs kill -9

# 5. Restart Metro with verbose logging
npm start -- --verbose
```

#### Error: "Unable to resolve module"

**Symptoms**: `Unable to resolve module './components/Button' from 'src/App.tsx'`

**Causes**:
- File doesn't exist at specified path
- Incorrect import statement
- TypeScript path alias not configured
- Metro cache issue

**Solutions**:
```bash
# 1. Verify file exists
ls src/components/Button.tsx

# 2. Check import statement (case-sensitive)
# ❌ import { Button } from './components/button';
# ✅ import { Button } from './components/Button';

# 3. Clear cache and restart
npm start -- --reset-cache

# 4. Check tsconfig.json path aliases
{
  "compilerOptions": {
    "paths": {
      "@components/*": ["src/components/*"]
    }
  }
}

# 5. Check babel.config.js for module resolver
module.exports = {
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@components': './src/components',
        },
      },
    ],
  ],
};
```

---

### iOS Build Errors

#### Error: "Command PhaseScriptExecution failed with a nonzero exit code"

**Symptoms**: Xcode build fails during "Run Script" phase

**Solutions**:
```bash
# 1. Clean and rebuild pods
cd ios
rm -rf Pods Podfile.lock
pod deintegrate
pod install
cd ..

# 2. Clean Xcode build
xcodebuild clean -workspace ios/SmartInspectorPro.xcworkspace -scheme SmartInspectorPro

# 3. Delete DerivedData
rm -rf ~/Library/Developer/Xcode/DerivedData

# 4. Check Node version (must match .nvmrc if present)
node --version  # Should be 20.x

# 5. Reinstall node_modules
rm -rf node_modules
npm install

# 6. Try building again
npm run ios
```

#### Error: "No such module 'React'" or "'React/RCTBridgeModule.h' file not found"

**Symptoms**: Swift/Objective-C files can't find React headers

**Solutions**:
```bash
# 1. Reinstall pods with repo update
cd ios
pod deintegrate
pod cache clean --all
pod install --repo-update
cd ..

# 2. Verify Header Search Paths in Xcode
# Open ios/SmartInspectorPro.xcworkspace in Xcode
# Target → Build Settings → Header Search Paths
# Should include: $(SRCROOT)/../node_modules/react-native/React

# 3. Clean build
xcodebuild clean -workspace ios/SmartInspectorPro.xcworkspace -scheme SmartInspectorPro

# 4. Restart Xcode and rebuild
```

#### Error: "error: Signing for 'SmartInspectorPro' requires a development team"

**Symptoms**: Build fails due to code signing

**Solutions**:
```bash
# 1. Open Xcode
open ios/SmartInspectorPro.xcworkspace

# 2. Select target → Signing & Capabilities
# 3. Select your development team
# 4. Enable "Automatically manage signing"

# Or manually sign:
# - Team: [Your Team]
# - Bundle Identifier: com.smartinspector.pro
# - Provisioning Profile: [Auto or Manual]
```

---

### Android Build Errors

#### Error: "SDK location not found"

**Symptoms**: Android build fails with `sdk.dir not found`

**Solutions**:
```bash
# 1. Create local.properties file
echo "sdk.dir=$ANDROID_HOME" > android/local.properties

# macOS example:
echo "sdk.dir=/Users/$USER/Library/Android/sdk" > android/local.properties

# Windows example:
echo "sdk.dir=C:\\Users\\$USERNAME\\AppData\\Local\\Android\\Sdk" > android/local.properties

# 2. Verify ANDROID_HOME is set
echo $ANDROID_HOME  # Should print path to Android SDK

# 3. If not set, add to shell profile (~/.zshrc or ~/.bash_profile)
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

#### Error: "Execution failed for task ':app:installDebug'"

**Symptoms**: App fails to install on device/emulator

**Solutions**:
```bash
# 1. Check if device is connected
adb devices

# 2. Uninstall existing app
adb uninstall com.smartinspectorpro

# 3. Clean and rebuild
cd android
./gradlew clean
cd ..
npm run android

# 4. If still failing, check device storage (needs 500MB+)
adb shell df /data

# 5. Clear app data
adb shell pm clear com.smartinspectorpro
```

#### Error: "Gradle build daemon disappeared unexpectedly"

**Symptoms**: Gradle crashes during build

**Solutions**:
```bash
# 1. Increase Gradle memory (android/gradle.properties)
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
org.gradle.daemon=true
org.gradle.parallel=true

# 2. Stop Gradle daemon
cd android
./gradlew --stop
cd ..

# 3. Clear Gradle cache
rm -rf ~/.gradle/caches/

# 4. Clean and rebuild
cd android
./gradlew clean build
cd ..
```

---

## Runtime Errors

### App Crashes on Launch

#### Error: Red screen with "Invariant Violation: Module AppRegistry is not a registered callable module"

**Symptoms**: App crashes immediately after launch

**Solutions**:
```bash
# 1. Clear Metro cache
npm start -- --reset-cache

# 2. Reload app
# iOS: Cmd+R
# Android: RR (double tap R)

# 3. Rebuild app
npm run ios  # or npm run android

# 4. Check index.js/App.tsx for errors
# Ensure AppRegistry.registerComponent is called

# 5. Verify no circular dependencies
npx madge --circular src/
```

#### Error: "Timeout - AsyncStorage_getAllKeys timed out"

**Symptoms**: App hangs during AsyncStorage operations

**Solutions**:
```typescript
// 1. Increase timeout in AsyncStorage config
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add timeout handling
const getWithTimeout = async (key: string, timeout = 5000) => {
  return Promise.race([
    AsyncStorage.getItem(key),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), timeout)
    ),
  ]);
};

// 2. Clear AsyncStorage if corrupted
await AsyncStorage.clear();

// 3. Check for large data being stored
// Limit: 6MB on iOS, 2MB on Android
```

### JavaScript Errors

#### Error: "undefined is not an object (evaluating 'user.name')"

**Symptoms**: Null/undefined reference error

**Solutions**:
```typescript
// ❌ Bad: No null check
const name = user.name;

// ✅ Good: Optional chaining
const name = user?.name;

// ✅ Good: Nullish coalescing
const name = user?.name ?? 'Unknown';

// ✅ Good: Type guard
if (user && user.name) {
  const name = user.name;
}

// ✅ Good: Early return
if (!user) {
  return <LoadingSpinner />;
}
```

#### Error: "Maximum update depth exceeded"

**Symptoms**: React throws infinite loop error

**Causes**:
- setState called in render without condition
- useEffect without dependency array
- Event handler called instead of referenced

**Solutions**:
```typescript
// ❌ Bad: Infinite loop
const [count, setCount] = useState(0);
setCount(count + 1); // Called every render!

// ✅ Good: Inside useEffect
useEffect(() => {
  setCount(count + 1);
}, []); // Only on mount

// ❌ Bad: Handler called immediately
<Button onPress={handlePress()} />

// ✅ Good: Handler referenced
<Button onPress={handlePress} />
// or
<Button onPress={() => handlePress()} />
```

---

## Testing Issues

### Jest Errors

#### Error: "Cannot find module '@components/Button' from 'src/App.test.tsx'"

**Symptoms**: Jest can't resolve path aliases

**Solutions**:
```javascript
// jest.config.js
module.exports = {
  preset: 'react-native',
  moduleNameMapper: {
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@redux/(.*)$': '<rootDir>/src/redux/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@aws-amplify)/)',
  ],
};
```

#### Error: "ReferenceError: fetch is not defined"

**Symptoms**: Tests fail when making API calls

**Solutions**:
```bash
# Install whatwg-fetch polyfill
npm install --save-dev whatwg-fetch

# Add to jest setup file (jest.setup.js)
import 'whatwg-fetch';

# Or mock fetch globally
global.fetch = jest.fn();
```

### Detox Errors

#### Error: "Detox can't seem to connect to the test app"

**Symptoms**: E2E tests timeout connecting to app

**Solutions**:
```bash
# 1. Rebuild Detox app
npm run detox:build:ios

# 2. Verify app is installed
xcrun simctl list apps booted | grep SmartInspector

# 3. Check Detox configuration (.detoxrc.js)
{
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/SmartInspectorPro.app',
      build: 'xcodebuild -workspace ios/SmartInspectorPro.xcworkspace -scheme SmartInspectorPro -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build'
    }
  }
}

# 4. Reset simulator
xcrun simctl erase all

# 5. Run tests with verbose logging
npm run detox:test:ios -- --loglevel verbose
```

---

## AWS Service Errors

### Cognito Authentication Errors

#### Error: "User is not authenticated"

**Symptoms**: API calls fail with 401 Unauthorized

**Solutions**:
```typescript
// 1. Check if user session is valid
import { Auth } from 'aws-amplify';

try {
  const user = await Auth.currentAuthenticatedUser();
  console.log('User session valid:', user);
} catch (error) {
  console.log('Not authenticated, redirecting to login');
  navigation.navigate('Login');
}

// 2. Refresh token if expired
try {
  const session = await Auth.currentSession();
  const token = session.getIdToken().getJwtToken();
} catch (error) {
  // Token expired, re-authenticate
  await Auth.signOut();
  navigation.navigate('Login');
}

// 3. Check AWS Amplify configuration
console.log('Amplify config:', Auth.configure());
```

#### Error: "InvalidParameterException: Missing required parameter USER_POOL_ID"

**Symptoms**: Cognito configuration missing

**Solutions**:
```bash
# 1. Pull Amplify configuration
amplify pull --appId YOUR_APP_ID --envName dev

# 2. Verify aws-exports.js exists
ls src/aws-exports.js

# 3. Import in App.tsx
import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';

Amplify.configure(awsconfig);

# 4. Check environment variables
echo $AWS_COGNITO_USER_POOL_ID
```

### S3 Upload Errors

#### Error: "Access Denied" when uploading to S3

**Symptoms**: Storage.put() fails with 403 error

**Solutions**:
```typescript
// 1. Check IAM permissions for authenticated users
// Cognito Identity Pool → Edit identity pool → IAM roles
// Authenticated role must have s3:PutObject permission

// 2. Verify bucket CORS configuration
// S3 bucket → Permissions → CORS configuration
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]

// 3. Use correct access level
import { Storage } from 'aws-amplify';

await Storage.put(key, file, {
  level: 'private', // or 'public', 'protected'
  contentType: file.type,
});

// 4. Check Amplify Storage configuration
console.log('Storage config:', Storage.configure());
```

#### Error: "NotAuthorizedException: Token is not from a supported provider of this identity pool"

**Symptoms**: iOS/Android authentication fails with "Token not from supported provider" error

**Root Cause**: Identity Pool is configured with wrong App Client ID (common after project renaming or using legacy configurations)

**Solutions**:
```bash
# 1. Verify current App Client ID in aws-config.ts
cat src/config/aws-config.ts | grep userPoolWebClientId

# 2. Check Identity Pool configuration
aws cognito-identity describe-identity-pool \
  --identity-pool-id YOUR_IDENTITY_POOL_ID \
  --query 'CognitoIdentityProviders[0]' \
  --output json

# 3. If ClientId doesn't match, update Identity Pool
aws cognito-identity update-identity-pool \
  --identity-pool-id YOUR_IDENTITY_POOL_ID \
  --identity-pool-name YOUR_POOL_NAME \
  --allow-unauthenticated-identities \
  --cognito-identity-providers \
    ProviderName=cognito-idp.REGION.amazonaws.com/USER_POOL_ID,\
ClientId=CORRECT_APP_CLIENT_ID,\
ServerSideTokenCheck=true

# 4. Verify the fix
aws cognito-identity describe-identity-pool \
  --identity-pool-id YOUR_IDENTITY_POOL_ID \
  --query 'CognitoIdentityProviders[0].ClientId'

# 5. Clear cached tokens on devices
# iOS: xcrun simctl uninstall booted com.your.bundleid
# Android: adb uninstall com.your.packagename

# 6. Rebuild and reinstall app
npm run ios  # or npm run android
```

**Reference**: See `CompletedTaskEvidence/Phase_08/IDENTITY_POOL_FIX.md` for complete documentation of this issue and fix (October 19, 2025).

### Lambda Function Errors

#### Error: "Task timed out after 3.00 seconds"

**Symptoms**: Lambda function exceeds timeout

**Solutions**:
```bash
# 1. Increase Lambda timeout (amplify/backend/function/[name]/[name]-cloudformation-template.json)
{
  "LambdaExecutionRole": {
    "Properties": {
      "Timeout": 30  # Increase from 3 to 30 seconds
    }
  }
}

# 2. Push changes
amplify push

# 3. Optimize Lambda code
# - Reduce cold start time (minimize dependencies)
# - Use connection pooling for databases
# - Cache frequently accessed data

# 4. Monitor Lambda metrics
amplify function log [functionName]
```

---

## Platform-Specific Issues

### iOS Issues

#### Issue: App works in simulator but crashes on physical device

**Symptoms**: App runs fine in simulator, crashes on real iPhone

**Solutions**:
```bash
# 1. Check minimum iOS version (Info.plist)
# MinimumOSVersion: 13.0 or higher

# 2. Rebuild for device
npm run ios -- --device "Your iPhone Name"

# 3. Check code signing (Xcode → Signing & Capabilities)

# 4. Enable exception breakpoints in Xcode
# Debug → Breakpoints → Create Exception Breakpoint

# 5. View device logs
# Xcode → Window → Devices and Simulators → Select device → View Device Logs
```

#### Issue: Dark mode causing UI issues

**Symptoms**: Colors inverted or unreadable in dark mode

**Solutions**:
```typescript
// 1. Detect color scheme
import { useColorScheme } from 'react-native';

const colorScheme = useColorScheme();
const backgroundColor = colorScheme === 'dark' ? '#000' : '#fff';

// 2. Force light mode (if dark mode not supported yet)
// Info.plist
<key>UIUserInterfaceStyle</key>
<string>Light</string>

// 3. Use theme context
import { ThemeProvider } from './context/ThemeContext';

<ThemeProvider>
  <App />
</ThemeProvider>
```

### Android Issues

#### Issue: App crashes with "java.lang.OutOfMemoryError"

**Symptoms**: Android app crashes on large data operations

**Solutions**:
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<application
  android:largeHeap="true"
  ...
>

<!-- android/gradle.properties -->
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m

<!-- Optimize images -->
<!-- Use WebP format instead of PNG -->
<!-- Implement pagination for large lists -->
```

#### Issue: Android back button not working

**Symptoms**: Hardware back button doesn't navigate back

**Solutions**:
```typescript
import { BackHandler } from 'react-native';
import { useEffect } from 'react';

useEffect(() => {
  const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
    if (canGoBack) {
      navigation.goBack();
      return true; // Prevent default behavior
    }
    return false; // Allow default behavior (exit app)
  });

  return () => backHandler.remove();
}, [navigation, canGoBack]);
```

---

## Performance Issues

### Slow List Rendering

**Symptoms**: FlatList/ScrollView lags when scrolling

**Solutions**:
```typescript
// 1. Use FlatList instead of ScrollView
<FlatList
  data={inspections}
  renderItem={({ item }) => <InspectionCard inspection={item} />}
  keyExtractor={item => item.id}
  // Optimizations
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>

// 2. Memoize list items
const MemoizedCard = React.memo(InspectionCard);

// 3. Optimize images
<Image
  source={{ uri: photo.url }}
  resizeMode="cover"
  style={{ width: 100, height: 100 }}
  // Add cache control
  cache="force-cache"
/>
```

### Memory Leaks

**Symptoms**: App slows down over time, memory usage increases

**Solutions**:
```typescript
// 1. Clean up subscriptions in useEffect
useEffect(() => {
  const subscription = someObservable.subscribe();
  
  return () => {
    subscription.unsubscribe(); // Cleanup!
  };
}, []);

// 2. Cancel pending requests on unmount
useEffect(() => {
  const controller = new AbortController();
  
  fetch('/api/data', { signal: controller.signal })
    .then(response => response.json())
    .catch(error => {
      if (error.name === 'AbortError') {
        console.log('Request cancelled');
      }
    });
  
  return () => {
    controller.abort(); // Cancel request
  };
}, []);

// 3. Clear timers
useEffect(() => {
  const timer = setTimeout(() => {}, 1000);
  
  return () => {
    clearTimeout(timer);
  };
}, []);
```

---

## Third-Party Library Conflicts

### React Navigation Issues

#### Error: "The action 'NAVIGATE' was not handled by any navigator"

**Symptoms**: Navigation doesn't work

**Solutions**:
```typescript
// 1. Ensure screen is defined in navigator
<Stack.Navigator>
  <Stack.Screen name="Detail" component={DetailScreen} />
</Stack.Navigator>

// 2. Check navigation reference
const navigation = useNavigation();
// Make sure component is inside NavigationContainer

// 3. Verify screen name matches
navigation.navigate('Detail'); // Must match Stack.Screen name
```

### AWS Amplify Issues

#### Error: "Amplify has not been configured"

**Symptoms**: Amplify methods throw configuration error

**Solutions**:
```typescript
// 1. Configure Amplify before using
import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';

Amplify.configure(awsconfig);

// 2. Must be called before any Amplify API usage
// Put in App.tsx before rendering

// 3. Verify aws-exports.js is correct
console.log('AWS Config:', awsconfig);
```

---

## Database Issues

### PostgreSQL Connection Errors

#### Error: "ECONNREFUSED" when connecting to database

**Solutions**:
```bash
# 1. Check if PostgreSQL is running
pg_isready

# 2. Start PostgreSQL
# macOS
brew services start postgresql@16

# Linux
sudo systemctl start postgresql

# 3. Verify connection string
# Format: postgresql://user:password@host:port/database
DATABASE_URL=postgresql://postgres:password@localhost:5432/smart_inspector_dev

# 4. Test connection
psql -d smart_inspector_dev -c "SELECT 1;"
```

---

## Network & API Errors

### API Call Failures

#### Error: "Network request failed"

**Symptoms**: All API calls fail

**Solutions**:
```bash
# 1. Check API server is running
curl http://localhost:3000/api/health

# 2. For Android emulator, use 10.0.2.2 instead of localhost
API_BASE_URL=http://10.0.2.2:3000/api

# 3. Setup ADB reverse port forwarding
adb reverse tcp:3000 tcp:3000

# 4. Check CORS configuration on server
# Allow origin: http://localhost:8081 (Metro bundler)

# 5. Test with Postman/Insomnia first
```

---

## Development Environment Issues

### Node Version Conflicts

**Symptoms**: `npm install` fails with version errors

**Solutions**:
```bash
# 1. Use nvm to manage Node versions
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

# 2. Install correct Node version
nvm install 20
nvm use 20
nvm alias default 20

# 3. Verify version
node --version  # Should show v20.x.x

# 4. Delete and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## Getting Help

### Before Asking for Help

1. **Search error message** on Google/Stack Overflow
2. **Check this document** for similar issues
3. **Review recent changes** (git log)
4. **Test in clean environment** (new simulator/emulator)
5. **Gather error context**:
   - Full error message and stack trace
   - Steps to reproduce
   - Platform (iOS/Android)
   - Environment (Node version, OS version)
   - What you've already tried

### Where to Get Help

- **Team Slack/Discord**: #engineering channel
- **GitHub Issues**: Create issue with `bug` label
- **Stack Overflow**: Tag `react-native`, `aws-amplify`, etc.
- **React Native Discord**: [reactiflux.com](https://www.reactiflux.com/)

---

## Version History

### v1.0.1 (October 19, 2025)
- Added troubleshooting section for Identity Pool misconfiguration
- Documented "Token not from supported provider" error and fix
- Added reference to IDENTITY_POOL_FIX.md

### v1.0.0 (October 17, 2025)
- Initial troubleshooting guide
- Build, runtime, testing, AWS issues
- Platform-specific solutions
- Performance and database issues

---

## Contributing

Found a solution to a new issue? Add it to this document!

**Maintainer**: Development Team  
**Last Review**: October 17, 2025
