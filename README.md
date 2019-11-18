**Prerequisites:**
$ node --version
v12.9.0

$ npm --version
6.10.2

Android Studio 3.4.2
Build #AI-183.6156.11.34.5692245, built on June 27, 2019
JRE: 1.8.0_152-release-1343-b01 amd64
JVM: OpenJDK 64-Bit Server VM by JetBrains s.r.o
Windows 10 10.0

${JDK_HOME} = C:\Program Files\Java\jdk1.8.0_221
${JAVA_HOME} = D:\Program Files\Android\Android Studio\jre\jre

**Project set up**
1. Navigate to the root directory
2. npm install && npm run postinstall
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

**Notes:**
- Send Ctrl + M to Android Virtual Device:
'adb shell input keyevent 82'
- refer https://stackoverflow.com/questions/52919945/how-to-pass-extra-auth-parameters-for-firestore-rules-authentication-react-nati to set rules for CRUD actions in firestore
**References:**
Set up react native development
https://facebook.github.io/react-native/docs/getting-started

Create a Firebase project and get google-service.json for Google-Application Authentication
https://rnfirebase.io/docs/v5.x.x/installation/initial-setup#Creating-a-new-project

Install react-native-firebase module for project (search for @react-native-firebase in code to have more details)
https://rnfirebase.io/docs/v5.x.x/getting-started
