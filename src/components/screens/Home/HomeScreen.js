import React from 'react';
import firebase from 'react-native-firebase';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Image,
  TouchableHighlight,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import {w, h, totalSize} from '../../../api/Dimensions';
import {themeColor} from '../../../../App';
import leftPad from 'left-pad';
const homebgPath = require('../../../../assets/home_bg.png');
const configureIconPath = require('../../../../assets/configure_icon.png');
const configureIconSize = totalSize(5);
export default class HomeScreen extends React.Component {
  render() {
    return (
      <ImageBackground source={homebgPath} style={styles.viewStyle}>
        <TouchableOpacity
          style={styles.configureIcon}
          onPress={console.log('Configuration page')}>
          <Image
            style={{height: configureIconSize, width: configureIconSize}}
            source={configureIconPath}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.roundTouchable}
          onPress={console.log('Add new sensor')}>
          <Text style={styles.plusText}>+</Text>
        </TouchableOpacity>
        <Button
          title="Logout"
          onPress={() => {
            firebase
              .auth()
              .signOut()
              .then(() => {
                console.log('signed out');
              })
              .catch(error => {
                console.log(error);
              });
          }}
        />
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  viewStyle: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  roundTouchable: {
    height: h(10),
    width: h(10),
    borderRadius: h(5),
    backgroundColor: '#71AC7F',
    marginTop: h(10),
    marginBottom: h(10),
  },
  plusText: {
    textAlign: 'center',
    fontSize: h(7),
    color: '#fff',
  },
  configureIcon: {
    height: configureIconSize,
    width: configureIconSize,
    borderRadius: configureIconSize / 2,
    marginLeft: w(85),
    marginTop: h(2),
  },
});
