# Smart Inspector Pro - Development Setup Guide

**Version**: 1.0.0  
**Last Updated**: October 17, 2025  
**Target Audience**: New developers joining the project  
**Estimated Setup Time**: 4-6 hours (first time), 1-2 hours (experienced developers)

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [System Requirements](#system-requirements)
3. [Development Tools Installation](#development-tools-installation)
4. [Project Setup](#project-setup)
5. [AWS Configuration](#aws-configuration)
6. [Running the App](#running-the-app)
7. [Verification Steps](#verification-steps)
8. [Common Setup Issues](#common-setup-issues)
9. [Optional Tools](#optional-tools)
10. [Next Steps](#next-steps)

---

## Prerequisites

### Required Accounts
- [ ] **GitHub Account** - Access to SmartInspectorPro repository
- [ ] **AWS Account** - Access to Smart Inspector Pro AWS organization
- [ ] **OpenAI Account** - API key for AI features (provided by team)
- [ ] **Apple Developer Account** - For iOS development ($99/year)
- [ ] **Google Play Developer Account** - For Android development ($25 one-time)

### Required Knowledge
- JavaScript/TypeScript fundamentals
- React/React Native basics
- Git version control
- Command-line interface (Terminal/PowerShell)
- REST API concepts

### Recommended Knowledge
- AWS services (S3, Cognito, Lambda)
- PostgreSQL/SQL basics
- Mobile app architecture
- Redux state management

---

## System Requirements

### macOS (Required for iOS Development)
- **OS**: macOS 12.0 (Monterey) or later
- **CPU**: Apple Silicon (M1/M2/M3) or Intel Core i5+
- **RAM**: 16GB minimum, 32GB recommended
- **Storage**: 50GB free space minimum
- **Xcode**: Version 15.0+ (includes iOS 17 SDK)

### Windows/Linux (Android Only)
- **OS**: Windows 10/11 or Ubuntu 20.04+
- **CPU**: Quad-core processor (Intel i5/AMD Ryzen 5 or better)
- **RAM**: 16GB minimum, 32GB recommended
- **Storage**: 50GB free space minimum

---

## Development Tools Installation

### 1. Node.js & npm

**macOS** (using Homebrew):
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js (LTS version)
brew install node@20

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show v10.x.x
```

**Windows** (using Chocolatey):
```powershell
# Install Chocolatey (run as Administrator)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Node.js
choco install nodejs-lts

# Verify installation
node --version
npm --version
```

**Linux** (Ubuntu/Debian):
```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 2. Git

**macOS**:
```bash
# Git comes with Xcode Command Line Tools
xcode-select --install

# Or install via Homebrew
brew install git

git --version  # Should show 2.40+
```

**Windows**:
```powershell
choco install git

git --version
```

**Linux**:
```bash
sudo apt-get update
sudo apt-get install git

git --version
```

**Configure Git**:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global init.defaultBranch main
```

### 3. Watchman (macOS/Linux)

Watchman improves React Native's file watching performance.

**macOS**:
```bash
brew install watchman

watchman --version  # Should show 2023.x or later
```

**Linux**:
```bash
# Install dependencies
sudo apt-get install -y autoconf automake build-essential python3-dev libssl-dev libtool

# Clone and build Watchman
cd /tmp
git clone https://github.com/facebook/watchman.git
cd watchman
git checkout v2023.11.20.00
./autogen.sh
./configure
make
sudo make install

watchman --version
```

### 4. React Native CLI

```bash
# Install globally
npm install -g react-native-cli

# Verify installation
react-native --version
```

### 5. iOS Development Tools (macOS Only)

#### Xcode
1. Download from Mac App Store or [developer.apple.com](https://developer.apple.com/xcode/)
2. Install Xcode 15.0 or later
3. Open Xcode and accept license agreements
4. Install additional components when prompted

**Verify Xcode Installation**:
```bash
xcode-select --print-path
# Should show: /Applications/Xcode.app/Contents/Developer

# Check Xcode version
xcodebuild -version
# Should show: Xcode 15.0 or later
```

#### CocoaPods
```bash
# Install CocoaPods (Ruby gem)
sudo gem install cocoapods

# Verify installation
pod --version  # Should show 1.14.0+

# Optional: Speed up pod install
gem install cocoapods-deintegrate cocoapods-clean
```

#### iOS Simulator Setup
```bash
# List available simulators
xcrun simctl list devices

# Boot a simulator (example: iPhone 15 Pro)
xcrun simctl boot "iPhone 15 Pro"

# Or open Simulator app
open -a Simulator
```

### 6. Android Development Tools

#### Java Development Kit (JDK)
```bash
# macOS
brew install openjdk@17

# Add to PATH (add to ~/.zshrc or ~/.bash_profile)
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export PATH=$JAVA_HOME/bin:$PATH

# Windows
choco install openjdk17

# Linux
sudo apt-get install openjdk-17-jdk

# Verify installation
java -version  # Should show OpenJDK 17
```

#### Android Studio
1. Download from [developer.android.com/studio](https://developer.android.com/studio)
2. Install Android Studio
3. Launch Android Studio
4. Complete setup wizard:
   - Install Android SDK
   - Install Android SDK Platform (API 34 - Android 14)
   - Install Android SDK Build-Tools
   - Install Android Emulator
   - Install Android SDK Platform-Tools

**Configure Environment Variables**:

**macOS/Linux** (add to `~/.zshrc` or `~/.bash_profile`):
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
# export ANDROID_HOME=$HOME/Android/Sdk  # Linux

export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

**Windows** (System Environment Variables):
```
ANDROID_HOME = C:\Users\YourUsername\AppData\Local\Android\Sdk
Path += %ANDROID_HOME%\platform-tools
Path += %ANDROID_HOME%\emulator
Path += %ANDROID_HOME%\tools
Path += %ANDROID_HOME%\tools\bin
```

**Apply changes**:
```bash
# macOS/Linux
source ~/.zshrc  # or source ~/.bash_profile

# Verify
echo $ANDROID_HOME
adb --version
```

#### Android Emulator Setup
```bash
# List available AVDs (Android Virtual Devices)
emulator -list-avds

# Create an AVD (if none exist)
# Open Android Studio → Device Manager → Create Device
# Recommended: Pixel 6 Pro with API 34 (Android 14)

# Start emulator from command line
emulator -avd Pixel_6_Pro_API_34

# Or use Android Studio Device Manager GUI
```

### 7. AWS CLI

```bash
# macOS
brew install awscli

# Windows
choco install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Verify installation
aws --version  # Should show 2.x
```

### 8. AWS Amplify CLI

```bash
# Install globally
npm install -g @aws-amplify/cli

# Verify installation
amplify --version  # Should show 12.x or later
```

### 9. PostgreSQL Client (Optional but Recommended)

```bash
# macOS
brew install postgresql@16

# Windows
choco install postgresql

# Linux
sudo apt-get install postgresql-client-16

# Verify installation
psql --version  # Should show 16.x
```

### 10. VS Code (Recommended Editor)

1. Download from [code.visualstudio.com](https://code.visualstudio.com/)
2. Install VS Code
3. Install essential extensions:

```bash
# Install extensions via command line
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension msjsdiag.vscode-react-native
code --install-extension GitHub.copilot
code --install-extension eamodio.gitlens
code --install-extension formulahendry.auto-rename-tag
code --install-extension wix.vscode-import-cost
code --install-extension bradlc.vscode-tailwindcss
```

**Recommended VS Code Settings** (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.updateImportsOnFileMove.enabled": "always",
  "javascript.updateImportsOnFileMove.enabled": "always",
  "files.exclude": {
    "**/.git": true,
    "**/.DS_Store": true,
    "**/node_modules": true,
    "**/.expo": true,
    "**/.expo-shared": true
  }
}
```

---

## Project Setup

### 1. Clone Repository

```bash
# Navigate to your projects directory
cd ~/GitHub  # or your preferred location

# Clone the repository
git clone https://github.com/bglad21/SmartInspectorPro.git

# Navigate into project
cd SmartInspectorPro

# Verify you're on main branch
git branch
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies (root level)
npm install

# This will install:
# - React Native and core libraries
# - Redux Toolkit and RTK Query
# - AWS Amplify
# - React Navigation
# - Testing libraries (Jest, Detox)
# - Development tools (ESLint, Prettier)
```

**Expected Installation Time**: 5-10 minutes (depending on internet speed)

### 3. iOS Setup (macOS Only)

```bash
# Navigate to iOS directory
cd ios

# Install CocoaPods dependencies
pod install

# This installs native iOS dependencies
# Expected time: 3-5 minutes

# Return to project root
cd ..
```

**Common Pod Install Issues**:
- If `pod install` fails, try: `pod install --repo-update`
- If still failing: `pod cache clean --all && pod install`

### 4. Environment Configuration

Create environment files for different environments:

```bash
# Copy example environment file
cp .env.example .env.development
cp .env.example .env.staging
cp .env.example .env.production
```

**Edit `.env.development`** with your local/development values:
```bash
# App Configuration
APP_ENV=development
APP_NAME=Smart Inspector Pro (Dev)
APP_VERSION=0.2.0-alpha

# API Configuration
API_BASE_URL=http://localhost:3000/api
API_TIMEOUT=30000

# AWS Configuration
AWS_REGION=us-east-1
AWS_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
AWS_COGNITO_CLIENT_ID=your_client_id_here
AWS_COGNITO_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AWS_S3_BUCKET=smart-inspector-dev
AWS_S3_REGION=us-east-1
AWS_CLOUDFRONT_DOMAIN=your-cloudfront-domain.cloudfront.net

# OpenAI Configuration
OPENAI_API_KEY=sk-YOUR_OPENAI_API_KEY_HERE

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY_TEST=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_SECRET_KEY_TEST=sk_test_YOUR_SECRET_KEY_HERE

# Database Configuration (for backend)
DATABASE_URL=postgresql://user:password@localhost:5432/smart_inspector_dev
REDIS_URL=redis://localhost:6379

# Feature Flags
ENABLE_AI_FEATURES=true
ENABLE_MARKETPLACE=true
ENABLE_TEAM_COLLABORATION=true
ENABLE_DEBUG_LOGGING=true

# Analytics
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
MIXPANEL_TOKEN=your_mixpanel_token

# Testing
E2E_TEST_EMAIL=test@smartinspector.com
E2E_TEST_PASSWORD=Test123456!
```

**Important**: Never commit `.env.development`, `.env.staging`, or `.env.production` files!

### 5. Database Setup (Backend)

If running backend locally:

```bash
# Start PostgreSQL (macOS)
brew services start postgresql@16

# Create development database
createdb smart_inspector_dev

# Run migrations (once backend is set up)
cd backend
npm install
npm run migrate

# Seed database with sample data
npm run seed

# Return to project root
cd ..
```

### 6. Redis Setup (Backend - Optional for Local)

```bash
# macOS
brew install redis
brew services start redis

# Windows
choco install redis-64

# Linux
sudo apt-get install redis-server
sudo systemctl start redis

# Verify Redis is running
redis-cli ping
# Should return: PONG
```

---

## AWS Configuration

### 1. Configure AWS CLI

```bash
# Configure AWS credentials
aws configure

# You'll be prompted for:
# - AWS Access Key ID: (provided by team lead)
# - AWS Secret Access Key: (provided by team lead)
# - Default region name: us-east-1
# - Default output format: json
```

**Verify AWS Configuration**:
```bash
# Test AWS access
aws s3 ls
aws cognito-idp list-user-pools --max-results 10

# Should list existing resources without errors
```

### 2. Configure Amplify

```bash
# Initialize Amplify in project
amplify init

# Amplify will ask:
# - Enter a name for the project: SmartInspectorPro
# - Enter a name for the environment: dev
# - Choose your default editor: Visual Studio Code
# - Choose the type of app: javascript
# - What javascript framework: react-native
# - Source Directory Path: src
# - Distribution Directory Path: /
# - Build Command: npm run build
# - Start Command: npm start
# - Select authentication method: AWS profile
# - Choose AWS profile: default

# Pull existing Amplify environment (if project already exists)
amplify pull --appId YOUR_APP_ID --envName dev
```

### 3. Verify AWS Resources

```bash
# Check Amplify status
amplify status

# Expected output:
# ✔ Current Environment: dev
# ✔ Auth: Cognito User Pool configured
# ✔ Storage: S3 bucket configured
# ✔ Function: Lambda functions configured
```

---

## Running the App

### Start Metro Bundler

Metro is React Native's JavaScript bundler. Start it in a dedicated terminal:

```bash
# Terminal 1: Start Metro
npm start

# Or with cache reset (if experiencing issues)
npm start -- --reset-cache
```

**Keep this terminal open** - Metro must run continuously during development.

### Run iOS App (macOS Only)

```bash
# Terminal 2: Run on iOS Simulator
npm run ios

# Or specify a specific simulator
npm run ios -- --simulator="iPhone 15 Pro"

# Or run on physical device (requires setup)
npm run ios -- --device "Your iPhone Name"
```

**First Build Time**: 5-10 minutes (subsequent builds: 30-60 seconds)

**Troubleshooting iOS Build**:
```bash
# If build fails, try cleaning:
cd ios
xcodebuild clean
pod deintegrate
pod install
cd ..
npm run ios
```

### Run Android App

```bash
# Terminal 3: Run on Android Emulator
npm run android

# Or specify a specific device
npm run android -- --deviceId=emulator-5554

# Or run on physical device (USB debugging enabled)
npm run android -- --deviceId=YOUR_DEVICE_ID
```

**First Build Time**: 10-15 minutes (subsequent builds: 1-2 minutes)

**List connected Android devices**:
```bash
adb devices
```

**Troubleshooting Android Build**:
```bash
# If build fails, try cleaning:
cd android
./gradlew clean
cd ..
npm run android

# If Gradle issues persist:
cd android
./gradlew --stop
./gradlew clean build
cd ..
```

### Run Backend Server (if developing locally)

```bash
# Terminal 4: Run backend
cd backend
npm run dev

# Backend should start on http://localhost:3000
# API endpoints: http://localhost:3000/api
```

---

## Verification Steps

Complete these steps to verify your setup is working correctly:

### 1. App Launches Successfully

- [ ] iOS app launches on simulator (no red error screen)
- [ ] Android app launches on emulator (no red error screen)
- [ ] App displays login/welcome screen
- [ ] No console errors in Metro bundler

### 2. Hot Reload Works

```bash
# Edit src/App.tsx and change some text
# Save the file
# App should automatically reload with changes
```

- [ ] iOS hot reload works
- [ ] Android hot reload works

### 3. AWS Cognito Authentication

- [ ] Can navigate to login screen
- [ ] Can create test account
- [ ] Receive email verification code
- [ ] Can log in with test credentials

### 4. Local Database Connection

```bash
# Test database connection
psql -d smart_inspector_dev -c "SELECT version();"
```

- [ ] PostgreSQL connection successful
- [ ] Tables created from migrations
- [ ] Sample data loaded

### 5. S3 Photo Upload

- [ ] Can capture photo using camera/library
- [ ] Photo uploads to S3 bucket
- [ ] Can view uploaded photo from CloudFront URL

### 6. Run Tests

```bash
# Run unit tests
npm test

# Run specific test file
npm test -- src/utils/csvParser.test.ts

# Run tests with coverage
npm test -- --coverage
```

- [ ] All unit tests pass
- [ ] Code coverage reports generate

### 7. ESLint & Prettier

```bash
# Run linting
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code
npm run format
```

- [ ] No linting errors
- [ ] Code formats correctly

---

## Common Setup Issues

### Issue 1: Metro Bundler "Already Running" Error

**Error**: `Something is already running on port 8081`

**Solution**:
```bash
# Kill process on port 8081
lsof -ti:8081 | xargs kill -9

# Or use React Native CLI
npm start -- --reset-cache
```

### Issue 2: iOS Build Fails - "Command PhaseScriptExecution failed"

**Error**: React Native pods installation error

**Solution**:
```bash
cd ios
rm -rf Pods Podfile.lock
pod cache clean --all
pod install
cd ..
```

### Issue 3: Android Build Fails - "SDK location not found"

**Error**: `sdk.dir not found in local.properties`

**Solution**:
```bash
# Create local.properties file
echo "sdk.dir=$ANDROID_HOME" > android/local.properties

# Or create manually at android/local.properties:
# sdk.dir=/Users/yourname/Library/Android/sdk  (macOS)
# sdk.dir=C:\\Users\\yourname\\AppData\\Local\\Android\\Sdk  (Windows)
```

### Issue 4: "Unable to resolve module" Error

**Error**: Cannot resolve dependency or module

**Solution**:
```bash
# Clear all caches
npm start -- --reset-cache
rm -rf node_modules
rm -rf ios/Pods
npm install
cd ios && pod install && cd ..
```

### Issue 5: AWS Amplify Auth Issues

**Error**: `Auth is not configured`

**Solution**:
```bash
# Re-pull Amplify configuration
amplify pull --appId YOUR_APP_ID --envName dev

# Or manually copy aws-exports.js from team
# Place in src/aws-exports.js
```

### Issue 6: Xcode "No such module 'React'"

**Error**: Swift/Objective-C can't find React module

**Solution**:
```bash
cd ios
pod deintegrate
pod install
cd ..

# Clean Xcode build
xcodebuild clean -workspace ios/SmartInspectorPro.xcworkspace -scheme SmartInspectorPro
```

### Issue 7: Watchman Issues

**Error**: `Watchman crawl failed`

**Solution**:
```bash
# Reset Watchman
watchman watch-del-all

# Restart Watchman
watchman shutdown-server
```

### Issue 8: Gradle Build Timeout (Android)

**Error**: Gradle build takes too long or times out

**Solution**:
```bash
# Increase Gradle memory (android/gradle.properties)
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
org.gradle.daemon=true
org.gradle.parallel=true
org.gradle.configureondemand=true
```

### Issue 9: CocoaPods Installation Errors

**Error**: `Couldn't install the following dependencies`

**Solution**:
```bash
# Update Ruby gems
sudo gem update --system

# Reinstall CocoaPods
sudo gem uninstall cocoapods
sudo gem install cocoapods

# Clean and reinstall
cd ios
pod repo update
pod install
cd ..
```

### Issue 10: Multiple Node Versions Conflict

**Error**: Version mismatch between global and project Node.js

**Solution**:
```bash
# Use nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

# Install and use Node 20
nvm install 20
nvm use 20
nvm alias default 20

# Verify
node --version  # Should show v20.x.x
```

---

## Optional Tools

### 1. React Native Debugger

Desktop app for debugging React Native apps.

```bash
# macOS
brew install --cask react-native-debugger

# Windows/Linux: Download from
# https://github.com/jhen0409/react-native-debugger/releases
```

### 2. Flipper (Meta's Debugging Tool)

```bash
# macOS
brew install --cask flipper

# Or download from: https://fbflipper.com/
```

### 3. Reactotron

Real-time debugging and state inspection.

```bash
# macOS
brew install --cask reactotron

# Install Reactotron client in project
npm install --save-dev reactotron-react-native
```

### 4. Postman / Insomnia (API Testing)

```bash
# Postman
brew install --cask postman

# Insomnia
brew install --cask insomnia
```

### 5. Database GUI Tools

**TablePlus** (PostgreSQL client):
```bash
brew install --cask tableplus
```

**Medis** (Redis client):
```bash
brew install --cask medis
```

### 6. Docker (for running services locally)

```bash
# macOS
brew install --cask docker

# Start Docker Desktop
open -a Docker

# Verify installation
docker --version
docker-compose --version
```

---

## Next Steps

After completing setup:

1. **Review Documentation**:
   - Read `CODE_STANDARDS.md` for coding conventions
   - Review `COMPONENT_LIBRARY.md` for UI patterns
   - Check `QUICK_REFERENCE.md` for common tasks

2. **Run Sample Builds**:
   - Build iOS app: `npm run ios`
   - Build Android app: `npm run android`
   - Run tests: `npm test`

3. **Join Team Communication**:
   - Slack/Discord channel invite
   - Daily standup schedule
   - Code review process

4. **Set Up Git Workflow**:
   ```bash
   # Create feature branch
   git checkout -b feature/your-feature-name
   
   # Make changes and commit
   git add .
   git commit -m "feat: add your feature"
   
   # Push and create PR
   git push origin feature/your-feature-name
   ```

5. **Pick Your First Task**:
   - Check GitHub Issues labeled "good first issue"
   - Review `ONBOARDING_CHECKLIST.md` (if available)
   - Pair with senior developer on first feature

6. **Development Workflow**:
   - Always pull latest changes: `git pull origin main`
   - Create feature branch for each task
   - Write tests for new code (aim for 80%+ coverage)
   - Run linting before committing: `npm run lint:fix`
   - Submit PR with descriptive title and description
   - Respond to code review feedback

---

## Additional Resources

### Documentation
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [Redux Toolkit](https://redux-toolkit.js.org/introduction/getting-started)
- [AWS Amplify](https://docs.amplify.aws/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Internal Documentation
- `Smart_Inspector_Pro_Build_Layout.md` - Complete technical spec
- `API_DOCUMENTATION.md` - API reference
- `TESTING_GUIDELINES.md` - Testing standards
- `TROUBLESHOOTING.md` - Common issues and solutions

### Community
- React Native Discord: [reactiflux.com](https://www.reactiflux.com/)
- Stack Overflow: Tag `react-native`

### Courses (Recommended)
- React Native - The Practical Guide (Udemy)
- AWS Amplify for Mobile (AWS Training)
- Advanced TypeScript (Frontend Masters)

---

## Getting Help

### Internal Support
1. **Check existing documentation** first (this guide, troubleshooting docs)
2. **Search GitHub Issues** for similar problems
3. **Ask in team Slack/Discord** channel
4. **Schedule pairing session** with senior developer
5. **Create detailed GitHub Issue** if problem persists

### When Asking for Help
Include:
- OS and version
- Node.js version (`node --version`)
- React Native version (`npx react-native --version`)
- Exact error message (full stack trace)
- Steps to reproduce
- What you've already tried

### Debugging Checklist
Before asking for help, try:
- [ ] Restart Metro bundler
- [ ] Clean build folders (`npm run clean`)
- [ ] Delete `node_modules` and reinstall (`rm -rf node_modules && npm install`)
- [ ] Clear all caches (`npm start -- --reset-cache`)
- [ ] Check environment variables in `.env` file
- [ ] Verify AWS credentials are valid
- [ ] Search error message on Google/Stack Overflow

---

## Version History

### v1.0.0 (October 17, 2025)
- Initial development setup guide
- macOS, Windows, Linux instructions
- iOS and Android setup procedures
- AWS Amplify configuration
- Common troubleshooting solutions

---

## Feedback

Found an issue with this guide or have suggestions?
- Create a GitHub Issue with label `documentation`
- Submit a PR with improvements
- Message in #documentation Slack channel

**Maintainer**: Development Team  
**Last Review**: October 17, 2025  
**Next Review**: November 2025 or when major tools are updated
