**Prerequisites:**
$ node --version
v12.9.0

$ npm --version
6.10.2

${JDK_HOME} = C:\Program Files\Java\jdk1.8.0_221
${JAVA_HOME} = D:\Program Files\Android\Android Studio\jre\jre

**Project set up**
1. Navigate to the root directory
2. npm install
3. The top-level build.gradle version value
        buildToolsVersion = "28.0.3"
        minSdkVersion = 16
        compileSdkVersion = 28
        targetSdkVersion = 28
        supportLibVersion = "28.0.0"
4. run for android and iOS
"npm run run-android" or "react-native run-android" - npm script for easier run from IDE

*IDE used:*
- VSCode for react-native javascript
- Android studio for android development and Android Virtual Device (AVD)

**References:**
https://facebook.github.io/react-native/docs/getting-started
