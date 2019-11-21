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
  KeyboardAvoidingView,
} from 'react-native';
import firebase from 'react-native-firebase';
import {w, h, totalSize} from '../../../api/Dimensions';
import InputField from '../../components/InputField.js';
import Loader from '../../components/Loader';
import {themeColor} from '../../../../App';
const passwordLogo = require('../../../../assets/password.png');
const eyeImg = require('../../../../assets/eye_black.png');
const emailLogo = require('../../../../assets/email.png');

export default class LoginForm extends Component {
  _isMounted = false;
  constructor() {
    super();
    this.state = {
      username: 'ntdquang1412@gmail.com',
      password: 'empty',
      showPass: true,
      press: false,
      user: null,
      error: null,
      loading: false,
      usernameInputColor: themeColor.bright,
      pwdInputColor: '#ffffff',
    };
    this.passwordInput = React.createRef();
    this.usernameInput = React.createRef();
  }

  _setState = object => {
    if (this._isMounted) {
      this.setState(object);
    }
  };
  userNameInputHandler = text => {
    this._setState({username: text, usernameInputColor: themeColor.bright});
  };
  passwordInputHandler = text => {
    this._setState({password: text});
  };

  showPass = () => {
    this.state.press === false
      ? this._setState({showPass: false, press: true})
      : this._setState({showPass: true, press: false});
  };

  focusPasswordAction = username => {
    this._setState({
      username: username,
    });
    this.passwordInput.focus();
  };

  passwordOnSubmitEditing = password => {
    this._setState({
      password: password,
    });
    this.onPress();
  };

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  /*
    @Todo:
    - Show sign in progress: Loading gif while waiting authentication
  */
  onLogin = () => {
    const {username, password} = this.state;
    console.log('debug', username, password);
    return username.length > 0
      ? new Promise(resolve => {
          this._setState({loading: true});
          firebase
            .auth()
            .signInWithEmailAndPassword(username, password)
            .then(user => {
              console.log('logged IN!!!!!!!!!!!!!!!!!!!');
              this._setState({loading: false, user: user});
              // If you need to do anything with the user, do it here
              // The user will be logged in automatically by the
              // `onAuthStateChanged` listener we set up in App.js earlier
            })
            .catch(error => {
              const {code, message} = error;
              this._setState({loading: false});
              let alertMessage = message;
              // Works on both iOS and Android
              switch (error.code) {
                case 'auth/invalid-email':
                  alertMessage =
                    message + ' Email should be yourmail@example.com';
                  console.log('Invalid email address format.');
                  break;
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                  console.log('Invalid email address or password');
                  break;
                default:
                  alertMessage = 'Check your internet connection';
                  console.log('Check your internet connection');
              }
              resolve(null);
              Alert.alert(
                'Login failed',
                alertMessage,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      this.passwordInput.clear();
                      this.usernameInput.focus();
                    },
                  },
                ],
                {cancelable: false},
              );
            });
        })
      : Alert.alert(
          // in this case user has not enter anything to InputField
          'Login failed',
          'Username/password should not be empty.',
          [
            {
              text: 'OK',
              onPress: () => {
                this.passwordInput.clear();
                this.usernameInput.focus();
              },
            },
          ],
          {cancelable: false},
        );
  };

  onPress = () => {
    this.onLogin();
  };

  forgotPassword = () => {
    if (this.state.username.length === 0) {
      console.warn('User email is not entered');
      this._setState({usernameInputColor: '#ff0000'});
      return;
    }
    const yourEmail = this.state.username;
    return new Promise(resolve => {
      firebase
        .auth()
        .sendPasswordResetEmail(yourEmail)
        .then(() => {
          Alert.alert(`Please check for new email!! '${yourEmail}'`);
        })
        .catch(e => {
          console.log(e);
          let alertMessage = e.message;
          // Works on both iOS and Android
          switch (e.code) {
            case 'auth/invalid-email':
              alertMessage = `'${yourEmail}' Email should be email@example.com`;
              this._setState({usernameInputColor: '#ff0000'});
              console.log('Invalid email address format.');
              break;
            case 'auth/user-not-found':
              alertMessage = `'${yourEmail}' is not found from system`;
              this._setState({usernameInputColor: '#ff0000'});
              console.log('Email address not found');
              break;
            default:
              alertMessage = 'Check your internet connection';
              console.log('Check your internet connection');
          }
          resolve(null);
          Alert.alert(alertMessage);
        });
    });
  };

  // @Todo
  // Add red indicator for password when incorrect pwd was entered. Look at username field for reference
  render() {
    return (
      <View style={styles.container}>
        <KeyboardAvoidingView behavior="padding" style={styles.loginContainer}>
          <Loader
            isLoading={this.state.loading}
            indicatorSize="large"
            indicatorColor="#446e46"
          />
          <InputField
            source={emailLogo}
            placeholder={'Email address'}
            secureTextEntry={false}
            autoCorrect={false}
            returnKeyType={'next'}
            maxLength={25}
            textFieldBoxColor={this.state.usernameInputColor}
            onSubmitEditingFunc={({nativeEvent}) =>
              this.focusPasswordAction(nativeEvent.text)
            }
            onChangeTextFunc={this.userNameInputHandler}
            ref={input => {
              this.usernameInput = input;
            }}
          />
          <InputField
            source={passwordLogo}
            placeholder={'Password'}
            secureTextEntry={this.state.showPass}
            returnKeyType={'done'}
            maxLength={25}
            textFieldBoxColor={this.state.usernameInputColor}
            onSubmitEditingFunc={({nativeEvent}) =>
              this.passwordOnSubmitEditing(nativeEvent.text)
            }
            onChangeTextFunc={this.passwordInputHandler}
            ref={input => {
              this.passwordInput = input;
            }}
          />
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={this.onPress}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.btnEye}
            onPress={this.showPass}>
            <Image
              source={eyeImg}
              style={styles.iconEye}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </KeyboardAvoidingView>
        <TouchableOpacity
          // style={styles.forgotButton}
          onPress={() => {
            console.log('Damn, forgot again');
            this.forgotPassword();
          }}>
          <Text style={styles.forgotText}>Forgot your password?</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  loginContainer: {
    height: h(26),
    width: w(85),
    marginBottom: h(2),
    alignItems: 'center',
    backgroundColor: '#446e46',
    borderRadius: totalSize(2),
  },
  container: {
    height: h(26),
    width: w(85),
    marginBottom: h(10),
    alignItems: 'center',
    borderRadius: totalSize(2),
  },
  inputWrapper: {
    flex: 0,
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
    width: w(75),
    borderRadius: w(7),
    backgroundColor: 'rgba(123,184,126,0.5)',
    marginBottom: h(1.5),
  },
  forgotButton: {
    height: h(5),
    width: w(75),
    borderRadius: w(7),
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginTop: h(3),
    marginBottom: h(3),
  },
  buttonText: {
    textAlign: 'center',
    fontSize: totalSize(2.5),
    color: 'white',
    paddingTop: h(0.5),
  },
  forgotText: {
    textAlign: 'center',
    fontSize: totalSize(1.5),
    color: '#fff',
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
    top: h(10.5),
    right: w(7),
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
