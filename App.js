/**
 * @file: App.js
 *
 * @summary
 * Load Login page in ./src/components/screens/Login/Login at the beginning
 *
 * @author: Quang Nguyen
 *
 */
import 'react-native-gesture-handler';
import React from 'react';
import Login from './src/components/screens/Login/Login';
import HomeScreen from './src/components/screens/Home/HomeScreen';
import firebase from 'react-native-firebase';
import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
export const themeColor = {
  bright: '#C5FBD0',
  dark: '#325C3C',
  error: '#ff0000',
};

const RootStack = createStackNavigator(
  {
    Home: HomeScreen,
    Login: Login,
  },
  {
    initialRouteName: 'Home',
  },
);

const AppContainer = createAppContainer(RootStack);
export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      loading: true,
    };
  }
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

  componentWillUnmount() {
    this.authSubscription();
  }
  render() {
    console.log('User info ', this.state.user);
    return <HomeScreen />;

    // if (this.state.user == null) {
    //   return <Login />;
    // } else {
    //   console.log('Logged in with user ' + this.state.user);
    //   return <HomeScreen />;
    // }
  }
}
