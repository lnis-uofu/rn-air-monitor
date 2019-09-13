/**
 * @file: App.js
 *
 * @summary
 * Load Login page in ./src/components/screens/Login/Login at the beginning
 *
 * @author: Quang Nguyen
 *
 */

import React, {Component} from 'react';
import Login from './src/components/screens/Login/Login';

export default class App extends Component {
  render() {
    return <Login />;
  }
}
