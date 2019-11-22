import React from 'react';
import firebase from 'react-native-firebase';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import {w, h, totalSize} from '../../../api/Dimensions';
import QRCodeScanner from 'react-native-qrcode-scanner';

const homebgPath = require('../../../../assets/home_bg.png');
const configureIconPath = require('../../../../assets/configure_icon.png');
const configureIconSize = totalSize(5);
export default class HomeScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      cameraScan: false,
      isLoggedIn: true,
    };
    this.registerForm = React.createRef();
  }
  onSuccess = qrData => {
    console.log('Scan success!!!');
    console.log(qrData.data);
  };

  render() {
    if (this.state.cameraScan) {
      return (
        <QRCodeScanner
          showMarker={true}
          onRead={this.onSuccess}
          topContent={<Text style={styles.centerText}>Scan window</Text>}
          bottomContent={
            <TouchableOpacity
              style={styles.buttonTouchable}
              onPress={() => {
                this.setState({cameraScan: false});
              }}>
              <Text style={styles.buttonText}>OK. Got it!</Text>
            </TouchableOpacity>
          }
        />
      );
    }

    return (
      <ImageBackground source={homebgPath} style={styles.viewStyle}>
        <TouchableOpacity
          style={styles.configureIcon}
          onPress={() => {
            console.log('Configuration page');
          }}>
          <Image
            style={{height: configureIconSize, width: configureIconSize}}
            source={configureIconPath}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.roundTouchable}
          onPress={() => {
            console.log('Add new sensor');
            this.setState({cameraScan: true});
          }}>
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
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777',
  },
  textBold: {
    fontWeight: '500',
    color: '#000',
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)',
  },
  buttonTouchable: {
    padding: 16,
  },
});
