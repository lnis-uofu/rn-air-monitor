import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Text,
  Image,
  Platform,
} from 'react-native';
import LoginForm from './LoginForm';
import {w, h, totalSize} from '../../../api/Dimensions';
const companyLogo = require('../../../../assets/companylogo.png');
const uLogo = require('../../../../assets/U_Logo.png');

export default class Login extends Component {
  state = {
    isEmailCorrect: false,
    isPasswordCorrect: false,
    isLogin: false,
  };

  render() {
    console.log('Platform version ' + Platform.Version);
    return (
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <View style={styles.logoContainer}>
          <Image style={styles.icon} resizeMode="contain" source={uLogo} />
          <Text style={styles.logoText}> The UNIVERSITY of UTAH</Text>
        </View>
        <LoginForm />
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#85b53f',
  },
  icon: {
    flex: 2,
    // width: w(70),
    // height: h(30),
    width: w(30),
    height: h(20),
  },
  logoContainer: {
    flex: -1,
    width: w(70),
    height: h(30),
    marginTop: h(10),
    marginBottom: h(7),
    alignItems: 'center',
  },
  logoText: {
    flex: -1,
    fontSize: h(5),
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  email: {
    marginBottom: h(4.5),
  },
  createAccount: {
    color: '#ffffffEE',
    textAlign: 'center',
    fontSize: totalSize(2),
    fontWeight: '600',
  },
  forgotPassword: {
    color: '#ffffffEE',
    textAlign: 'center',
    fontSize: totalSize(2),
    fontWeight: '600',
  },
});
