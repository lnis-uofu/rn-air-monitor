import React, {Component} from 'react';
import PropTypes from 'prop-types';
import InputField from '../../components/InputField';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Text,
  Image,
  Platform,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import firebase from 'react-native-firebase';
import {w, h, totalSize} from '../../../api/Dimensions';
const passwordLogo = require('../../../../assets/password.png');
const eyeImg = require('../../../../assets/eye_black.png');
const personLogo = require('../../../../assets/person.png');
const emailLogo = require('../../../../assets/email.png');

export default class RegisterForm extends Component {
  constructor() {
    super();
    this.state = {
      focusPassword: false,
      username: '',
      firstName: '',
      lastName: '',
      password: '',
      showPass: true,
      press: false,
      userInfo: null,
      error: null,
      loading: true,
    };
    this.passwordInput = React.createRef();
    this.usernameInput = React.createRef();
    this.firstNameInput = React.createRef();
    this.lastNameInput = React.createRef();
  }

  userNameInputHandler = text => {
    this.setState({username: text});
  };
  passwordInputHandler = text => {
    this.setState({password: text});
  };
  firstNameInputHandler = text => {
    this.setState({firstName: text});
  };
  lastInputHandler = text => {
    this.setState({lastName: text});
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

  focusFirstName = firstName => {
    this.setState({
      firstName: firstName,
    });
    this.firstNameInput.focus();
  };

  focusLastName = lastName => {
    this.setState({
      lastName: lastName,
    });
    this.lastNameInput.focus();
  };

  passwordOnSubmitEditing = text => {
    this.onPress();
  };

  componentDidMount() {
    this.authSubscription = firebase.auth().onAuthStateChanged(user => {
      this.setState({
        loading: false,
        user,
      });
    });
  }

  /*
    @Todo:
    - add async when creating user
    - Check first and last name should not be empty
    - Show progress: Loading gif while waiting authentication
    - Navigate back to login tab for login
  */
  onPress = () => {
    const {username, password, firstName, lastName} = this.state;
    console.log(username + '/' + password + '/' + firstName + '/' + lastName);
    firebase.auth().createUserWithEmailAndPassword(username, password);
  };
  render() {
    return (
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <InputField
          source={emailLogo}
          placeholder={'Email address'}
          secureTextEntry={false}
          autoCorrect={false}
          returnKeyType={'next'}
          maxLength={25}
          onSubmitEditingFunc={({nativeEvent}) =>
            this.focusFirstName(nativeEvent.text)
          }
          onChangeTextFunc={this.userNameInputHandler}
          refProp={input => {
            this.usernameInput = input;
          }}
        />
        <InputField
          source={personLogo}
          placeholder={'First name'}
          secureTextEntry={false}
          autoCorrect={false}
          returnKeyType={'next'}
          maxLength={25}
          onSubmitEditingFunc={({nativeEvent}) =>
            this.focusLastName(nativeEvent.text)
          }
          onChangeTextFunc={this.firstNameInputHandler}
          refProp={input => {
            this.firstNameInput = input;
          }}
        />
        <InputField
          source={personLogo}
          placeholder={'Last name'}
          secureTextEntry={false}
          autoCorrect={false}
          returnKeyType={'next'}
          maxLength={25}
          onSubmitEditingFunc={({nativeEvent}) =>
            this.focusPasswordAction(nativeEvent.text)
          }
          onChangeTextFunc={this.lastNameInputHandler}
          refProp={input => {
            this.lastNameInput = input;
          }}
        />
        <InputField
          source={passwordLogo}
          placeholder={'Create a Password'}
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
          <Text style={styles.buttonText}> Register User </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.btnEye}
          onPress={this.showPass}>
          <Image source={eyeImg} style={styles.iconEye} resizeMode="contain" />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: h(37),
    width: w(85),
    // marginBottom: h(10),
    // alignContent: 'center',
    // alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: '#446e46',
    borderRadius: totalSize(2),
  },
  buttonContainer: {
    height: h(5),
    width: w(75),
    alignSelf: 'center',
    marginTop: h(2),
    marginBottom: h(2),
    borderRadius: w(7),
    backgroundColor: 'rgba(123,184,126,0.5)',
  },
  buttonText: {
    textAlign: 'center',
    fontSize: totalSize(2.5),
    color: 'white',
    paddingTop: h(0.5),
  },
  iconEye: {
    width: w(6),
    height: h(6),
    tintColor: 'rgba(0,0,0,0.2)',
  },
  btnEye: {
    position: 'absolute',
    bottom: h(9.5),
    right: w(7),
  },
});
