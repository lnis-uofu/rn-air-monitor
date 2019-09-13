/**
 * @file: LoginForm.js
 *
 * @summary
 * @function userNameInputHandler: deal with changes on username input
 * @function passwordInputHandler: deal with changes on password input
 * @function showPass: show password touch
 * @function focusPasswordAction: Action when hit Next button on username input
 * @function passwordOnSubmitEditing: Action when hit Done button on password input
 * @function onLogin: Get username and password for login
 *
 * @author: Quang Nguyen
 *
 */

import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import firebase from 'react-native-firebase';
import {w, h, totalSize} from '../../../api/Dimensions';
import InputField from '../../components/InputField.js';
const passwordLogo = require('../../../../assets/password.png');
const eyeImg = require('../../../../assets/eye_black.png');
const personLogo = require('../../../../assets/person.png');

export default class LoginForm extends Component {
  constructor() {
    super();
    this.state = {
      focusPassword: false,
      username: '',
      password: '',
      showPass: true,
      press: false,
      userInfo: null,
      error: null,
      loading: true,
    };
    this.passwordInput = React.createRef();
    this.usernameInput = React.createRef();
  }

  userNameInputHandler = text => {
    this.setState({username: text});
  };
  passwordInputHandler = text => {
    this.setState({password: text});
  };

  showPass = () => {
    this.state.press === false
      ? this.setState({showPass: false, press: true})
      : this.setState({showPass: true, press: false});
  };

  focusPasswordAction = username => {
    this.setState({
      username: username,
    });
    this.passwordInput.focus();
  };

  passwordOnSubmitEditing = password => {
    this.setState({
      password: password,
    });
    this.onPress();
  };

  /**
   * When the App component mounts, we listen for any authentication
   * state changes in Firebase.
   * Once subscribed, the 'user' parameter will either be null
   * (logged out) or an Object (logged in)
   */
  componentDidMount() {
    this.authSubscription = firebase.auth().onAuthStateChanged(user => {
      this.setState({
        loading: false,
        user,
      });
    });
  }

  /**
   * Don't forget to stop listening for authentication state changes
   * when the component unmounts.
   */
  componentWillUnmount() {
    this.authSubscription();
  }

  onLogin = () => {
    const {username, password} = this.state;
    console.log('debug', username, password);
    firebase
      .auth()
      .signInWithEmailAndPassword(username, password)
      .then(user => {
        console.log('logged IN!!!!!!!!!!!!!!!!!!!');
        // If you need to do anything with the user, do it here
        // The user will be logged in automatically by the
        // `onAuthStateChanged` listener we set up in App.js earlier
      })
      .catch(error => {
        const {code, message} = error;
        // Works on both iOS and Android
        Alert.alert(
          'Login failed',
          message,
          [
            {
              text: 'Cancel',
              onPress: () => console.log('Cancel Pressed'),
              style: 'cancel',
            },
            {
              text: 'OK',
              onPress: () => {
                this.passwordInput.clear();
                this.usernameInput.clear();
                this.usernameInput.focus();
              },
            },
          ],
          {cancelable: false},
        );
      });
  };

  onPress = () => {
    this.onLogin();
  };

  render() {
    return (
      <View style={styles.container}>
        {/* <View style={styles.inputWrapper}>
          <Image
            source={personLogo}
            style={styles.inlineImg}
            resizeMode="contain"
          />
          <TextInput
            style={styles.input}
            placeholder={'Username'}
            returnKeyType={'next'}
            onChangeText={this.userNameInputHandler}
            maxLength={25}
            placeholderTextColor="white"
            onSubmitEditing={({nativeEvent}) =>
              this.focusPasswordAction(nativeEvent.text)
            }
          />
        </View> */}
        {/* <View style={styles.inputWrapper}>
          <Image
            source={password}
            style={styles.inlineImg}
            resizeMode="contain"
          />
          <TextInput
            style={styles.input}
            placeholder={'Password'}
            returnKeyType={'done'}
            maxLength={25}
            onChangeText={this.passwordInputHandler}
            secureTextEntry={this.state.showPass}
            placeholderTextColor="white"
            ref={input => {
              this.passwordInput = input;
            }}
            onSubmitEditing={({nativeEvent}) =>
              this.passwordOnSubmitEditing(nativeEvent.text)
            }
          />
        </View> */}
        {/* @Todo: resolve warning about ref in password input field*/}
        <InputField
          source={personLogo}
          placeholder={'Email'}
          secureTextEntry={false}
          autoCorrect={false}
          returnKeyType={'next'}
          maxLength={25}
          onSubmitEditingFunc={({nativeEvent}) =>
            this.focusPasswordAction(nativeEvent.text)
          }
          onChangeTextFunc={this.userNameInputHandler}
          refProp={input => {
            this.usernameInput = input;
          }}
        />
        <InputField
          source={passwordLogo}
          placeholder={'Password'}
          secureTextEntry={this.state.showPass}
          returnKeyType={'done'}
          maxLength={25}
          onSubmitEditingFunc={({nativeEvent}) =>
            this.passwordOnSubmitEditing(nativeEvent.text)
          }
          onChangeTextFunc={this.passwordInputHandler}
          refProp={input => {
            this.passwordInput = input;
          }}
        />
        <TouchableOpacity style={styles.buttonContainer} onPress={this.onPress}>
          <Text style={styles.buttonText}> LOGIN </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.btnEye}
          onPress={this.showPass}>
          <Image source={eyeImg} style={styles.iconEye} resizeMode="contain" />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: h(25),
    width: w(80),
    marginTop: w(10),
    marginBottom: h(10),
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
  },
  input: {
    width: w(80),
    height: h(7),
    marginHorizontal: 20,
    paddingLeft: 45,
    borderRadius: 20,
    color: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff',
  },
  buttonContainer: {
    height: h(5),
    width: w(80),
    borderRadius: w(7),
    backgroundColor: 'rgba(103,145,57,0.5)',
  },
  buttonText: {
    textAlign: 'center',
    fontSize: totalSize(2.5),
    color: 'white',
    paddingTop: h(0.5),
  },
  imageIcon: {
    width: w(7),
    height: h(7),
  },
  iconEye: {
    width: w(6),
    height: h(6),
    tintColor: 'rgba(0,0,0,0.2)',
  },
  btnEye: {
    position: 'absolute',
    top: 70,
    right: 15,
  },
  inlineImg: {
    position: 'absolute',
    zIndex: 99,
    width: w(5),
    height: h(5),
    left: 35,
    top: h(1),
  },
});
