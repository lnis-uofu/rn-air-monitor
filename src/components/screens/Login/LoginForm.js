import React, {Component} from 'react';
import {StyleSheet, View, Text, TouchableOpacity, Image} from 'react-native';

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
    };
    this.passwordInput = React.createRef();
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

  onPress = () => {
    console.log(this.state.username + '/' + this.state.password);
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
          placeholder={'Username'}
          secureTextEntry={false}
          autoCorrect={false}
          returnKeyType={'next'}
          maxLength={25}
          onSubmitEditingFunc={({nativeEvent}) =>
            this.focusPasswordAction(nativeEvent.text)
          }
          onChangeTextFunc={this.userNameInputHandler}
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
