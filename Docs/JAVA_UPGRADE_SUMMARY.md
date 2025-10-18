# Java Upgrade Summary

## Overview

This document summarizes the Java runtime configuration for Smart Inspector Pro's Android build system.

## Current Configuration

### Java Versions Installed

- **Java 17 (Temurin)**: OpenJDK 17.0.16 - **ACTIVE for React Native build**
- **Java 21 (Homebrew)**: OpenJDK 21.0.8 - Installed but not used for React Native

### Why Java 17 Instead of Java 21?

**React Native 0.82.0 currently requires Java 17 as the maximum supported version.** While Java 21 is the latest LTS version, React Native's Android toolchain has not yet been updated to support it. Attempting to build with Java 21 results in compilation errors:

```
error: invalid source release: 21
```

### What Was Configured

#### 1. Java 21 Installation

```bash
# Installed via Homebrew
brew install openjdk@21

# Symlinked to system Java location
sudo ln -sfn /opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk \
  /Library/Java/JavaVirtualMachines/openjdk-21.jdk
```

#### 2. Android Gradle Configuration (Java 17)

**File: `android/build.gradle`**

```gradle
buildscript {
    ext {
        javaVersion = JavaVersion.VERSION_17  // Explicitly set to Java 17
        // ... other settings
    }
}

allprojects {
    tasks.withType(JavaCompile).configureEach {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
```

**File: `android/app/build.gradle`**

```gradle
android {
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = '17'
    }
}
```

**File: `android/gradle.properties`**

```properties
# Java 17 LTS Configuration (Required for React Native)
# Note: React Native currently requires Java 17 (Java 21 not yet supported)
org.gradle.java.home=/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home
```

#### 3. Android Gradle Plugin Update

Updated to AGP 8.7.3 for better Java 17 support:

```gradle
classpath("com.android.tools.build:gradle:8.7.3")
```

### Build Verification

#### Gradle Version Check

```bash
$ cd android && ./gradlew -version

Gradle 9.0.0
Launcher JVM: 21.0.8 (Homebrew 21.0.8)
Daemon JVM: /Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home
```

**Note:** Gradle runs on Java 21, but compiles the Android app with Java 17 as configured in `gradle.properties`.

#### Successful Build

```bash
$ cd android && ./gradlew assembleDebug
BUILD SUCCESSFUL in 1m 16s
96 actionable tasks: 81 executed, 15 up-to-date
```

## When Can We Upgrade to Java 21?

Monitor these resources for Java 21 support in React Native:

- **React Native Releases**: https://github.com/facebook/react-native/releases
- **Android Gradle Plugin**: https://developer.android.com/build/releases/gradle-plugin

Typically, Java version support follows this pattern:

1. **Android Gradle Plugin** adds support for new Java version
2. **React Native** updates to use newer AGP version
3. **Community testing** validates compatibility

**Estimated Timeline**: Java 21 support expected in React Native 0.84+ (Q2-Q3 2026)

## Shell Environment

### Java 21 as System Default

The shell environment is configured to use Java 21 by default:

```bash
# Added to ~/.zshrc
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
export PATH="$JAVA_HOME/bin:$PATH"
```

To verify:

```bash
$ java --version
openjdk 21.0.8 2025-07-15
OpenJDK Runtime Environment Homebrew (build 21.0.8)
```

### Switching Between Java Versions

To temporarily use Java 17:

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
java --version
```

To permanently switch back to Java 17:

```bash
# Edit ~/.zshrc
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
```

## Summary

✅ **Java 21 installed** and available on the system
✅ **Java 17 configured** for React Native Android builds
✅ **Gradle 9.0.0** running on Java 21
✅ **Android builds** compiling with Java 17
✅ **Build verified** and working correctly

## Files Modified

1. `android/build.gradle` - Added Java version configuration and AGP 8.7.3
2. `android/app/build.gradle` - Added compileOptions and kotlinOptions for Java 17
3. `android/gradle.properties` - Set Gradle to use Java 17 JDK
4. `~/.zshrc` - Configured Java 21 as system default

## Next Steps

When React Native adds Java 21 support:

1. Update `android/gradle.properties` to point to Java 21 JDK
2. Update `android/build.gradle` to use `JavaVersion.VERSION_21`
3. Update `android/app/build.gradle` compileOptions and kotlinOptions to '21'
4. Clean and rebuild: `cd android && ./gradlew clean assembleDebug`

## References

- [React Native Environment Setup](https://reactnative.dev/docs/environment-setup)
- [Android Gradle Plugin Release Notes](https://developer.android.com/build/releases/gradle-plugin)
- [Java Development Kit Downloads](https://adoptium.net/)
