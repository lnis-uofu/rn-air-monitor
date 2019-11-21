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
        Google play service version: 49 
4. run for android
"npm run android" or "react-native run-android" - npm script for the convenient of running from VSCODE

5. Run on iOS
- under ios directory, from terminal, run command "pod install"
- open .xcworkspace file
- Choose build destination
- Hit "Build and Run"
Note: refer this document for more information to build and run on iOS
https://docs.google.com/document/d/1i_dgn-NiY0AjQOG5gHsbp0zeadPwx7iXxpTm8IbkyHY/edit?usp=sharing

**IDE used:**
- VSCode for react-native javascript
- Android studio for android development and Android Virtual Device (AVD)

**Notes for android:**
- Command `react-native run-android` on Mac OS may run you into issue. Please refer this link to resolve that
- Send Ctrl + M to Android Virtual Device:
'adb shell input keyevent 82'
- refer https://stackoverflow.com/questions/52919945/how-to-pass-extra-auth-parameters-for-firestore-rules-authentication-react-nati to set rules for CRUD actions in firestore
- Google-services.json and debug.keystore are the 2 important files. We need those files for Google service authentication to interact with firebase services. Please contact ntdquang1412@gmail.com or tbecnel14@gmail.com for these files as well as permission to the project on Google Cloud Platform
- Those 2 files should be under ./android/app/
- Without those files, you will not be able to build the Android project.

**Note for iOS**
- GoogleService-Info.plist. We need this file for Google service authentication to interact with firebase services. Please contact ntdquang1412@gmail.com or tbecnel14@gmail.com for these files as well as permission to the project on Google Cloud Platform
- This file should be placed under ./ios/
- Without this file, you will not be able to build the iOS project.

**References:**
Set up react native development
https://facebook.github.io/react-native/docs/getting-started

Create a Firebase project and get google-service.json for Google-Application Authentication
https://rnfirebase.io/docs/v5.x.x/installation/initial-setup#Creating-a-new-project

Install react-native-firebase module for project (search for @react-native-firebase in code to have more details)
https://rnfirebase.io/docs/v5.x.x/getting-started

Install react navigation
https://reactnavigation.org/docs/en/getting-started.html