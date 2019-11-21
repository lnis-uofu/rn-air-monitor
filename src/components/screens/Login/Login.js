/**
 * @file: Login.js
 *
 * @summary
 * Render the Login page of the project
 *
 * @author: Quang Nguyen
 *
 */
import React, {Component} from 'react';
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
  ImageBackground,
} from 'react-native';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import {w, h, totalSize} from '../../../api/Dimensions';
import {themeColor} from '../../../../App'
const uLogo = require('../../../../assets/U_Logo.png');
const backGroundImage = require('../../../../assets/green_gradient.jpg');
const {width} = Dimensions.get('window');

export default class Login extends Component {
  _isMounted = false;

  constructor() {
    super();
    this.state = {
      active: 0,
      xTabOne: 0, //x co-ordinate of tab one
      xTabTwo: 0, //x co-ordinate of tab two
      translateX: new Animated.Value(0),
      translateXTabOne: new Animated.Value(0),
      translateXTabTwo: new Animated.Value(width),
      translateY: -1000,
      isLoggedIn: false,
    };
    this.registerForm = React.createRef();
  }

  _setState = object => {
    if (this._isMounted) {
      this.setState(object);
    }
  };

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  handleSlide = type => {
    let {active, translateX, translateXTabOne, translateXTabTwo} = this.state;
    Animated.spring(translateX, {
      toValue: type,
      speed: 300,
      duration: 2000,
      useNativeDriver: true,
    }).start();
    if (active === 0) {
      Animated.parallel([
        Animated.spring(translateXTabOne, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }).start(),
        Animated.spring(translateXTabTwo, {
          toValue: width,
          duration: 100,
          useNativeDriver: true,
        }).start(),
      ]);
    } else {
      Animated.parallel([
        Animated.spring(translateXTabOne, {
          toValue: -width,
          duration: 100,
          useNativeDriver: true,
        }).start(),
        Animated.spring(translateXTabTwo, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }).start(),
      ]);
    }
  };

  animatedTabTransform = position => {
    return {
      flex: 1,
      position: 'absolute',
      width: '50%',
      height: '100%',
      top: 0,
      left: 0,
      borderBottomWidth: 2,
      borderBottomColor: themeColor.bright,
      borderRadius: 4,
      transform: [{translateX: position}],
    };
  };

  /*
  This is the call back function which is pass to RegisterForm
  for handling the navigation back to LoginForm
  after a successful registration
  */
  onRegistrationDone = () => {
    this._setState({active: 0, xTabOne: 0});
    this.handleSlide(this.state.xTabOne);
  };

  isLoading = () => {
    this._setState({isLoading: true});
  };

  textStyleChangeOnState = (currentState, activeState, color) => {
    return {
      color: currentState === activeState ? themeColor.dark : color,
      fontSize: currentState === activeState ? 14 : 16,
      fontWeight: currentState === activeState ? 'normal' : 'bold',
    };
  };
  render() {
    let {
      xTabOne,
      xTabTwo,
      translateX,
      active,
      translateXTabOne,
      translateXTabTwo,
      translateY,
    } = this.state;
    console.log('Render Platform version ' + Platform.Version);

    return (
      <ImageBackground
        source={backGroundImage}
        style={{width: '100%', height: '100%'}}>
        <KeyboardAvoidingView behavior="padding" style={styles.container}>
          <View style={styles.logoContainer}>
            <Image style={styles.icon} resizeMode="contain" source={uLogo} />
            <Text style={styles.logoText}>UNIVERSITY of UTAH</Text>
          </View>
          <View style={styles.tabView}>
            <Animated.View style={this.animatedTabTransform(translateX)} />
            <TouchableOpacity
              style={styles.tabStyle}
              onLayout={event =>
                this._setState({
                  xTabOne: event.nativeEvent.layout.x,
                })
              }
              onPress={() => {
                this.setState({active: 0}, () => this.handleSlide(xTabOne));
                console.log(xTabOne);
              }}>
              <Text
                style={this.textStyleChangeOnState(
                  active,
                  1,
                  themeColor.bright,
                )}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tabStyle}
              onLayout={event =>
                this._setState({
                  xTabTwo: event.nativeEvent.layout.x,
                })
              }
              onPress={() => {
                console.log(xTabTwo);
                this.setState({active: 1}, () => this.handleSlide(xTabTwo));
              }}>
              <Text
                style={this.textStyleChangeOnState(
                  active,
                  0,
                  themeColor.bright,
                )}>
                Register
              </Text>
            </TouchableOpacity>
          </View>
          <KeyboardAvoidingView behavior="padding">
            <Animated.View
              style={{
                transform: [
                  {
                    translateX: translateXTabOne,
                  },
                ],
              }}
              onLayout={event =>
                this._setState({
                  translateY: event.nativeEvent.layout.height,
                })
              }>
              <LoginForm />
            </Animated.View>
            <Animated.View
              style={{
                transform: [
                  {
                    translateX: translateXTabTwo,
                  },
                  {
                    translateY: -translateY,
                  },
                ],
              }}
              onLayout={event =>
                this._setState({
                  translateY: event.nativeEvent.layout.height,
                })
              }>
              <RegisterForm onActionDone={this.onRegistrationDone} />
            </Animated.View>
          </KeyboardAvoidingView>
        </KeyboardAvoidingView>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 0,
    alignItems: 'center',
  },
  icon: {
    flex: -4,
    width: w(20),
    height: h(15),
  },
  logoContainer: {
    flex: -4,
    width: w(60),
    height: h(26),
    marginTop: h(5),
    marginBottom: h(5),
    alignItems: 'center',
  },
  logoText: {
    flex: -8,
    fontSize: h(4),
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
  tabView: {
    flex: 0,
    flexDirection: 'row',
    marginBottom: h(4),
    width: w(90),
    height: h(6),
  },
  tabStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
