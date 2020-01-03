import React from 'react';
import firebase from 'react-native-firebase';
import {
  Alert,
  Text,
  Button,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageBackground,
  Platform,
} from 'react-native';
import {w, h, totalSize} from '../../../api/Dimensions';
import DeviceRegistration from '../Register/DeviceRegistration';
import QRCodeScanner from 'react-native-qrcode-scanner';
import WifiManager from 'react-native-wifi-reborn';
import Loader from '../../components/Loader';
const homebgPath = require('../../../../assets/home_bg.png');
const configureIconPath = require('../../../../assets/configure_icon.png');
const configureIconSize = totalSize(4);
const wifiPrefix = 'AirU-';
const softAPPassword = 'cleantheair';
const statusURL = 'http://192.168.4.1/status.json';
const mobileDataAlertMessage =
  Platform.OS === 'ios'
    ? 'iOS construction'
    : 'Setting > Connections > Data usage > Uncheck Mobile data';
const sleep = milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};
const usersCollection = 'users';

const urcCode = {
  CONNECTED: 0,
  CONNECTION_ERROR: 1,
  NOT_CONNECTED: 2,
};

addDeviceInfoToFireBaseDataBase = async (macAddress) => {
  console.log('Get devices info!');
  var isDuplicated = false;
  const refUser = await firebase
  .firestore()
  .collection(usersCollection)
  .doc(global.email);

  console.log('firebase.firestore().runTransaction');
  await firebase.firestore().runTransaction(async transaction => {
    console.log('Get devices info!');
    const doc = await transaction.get(refUser);

    // if it does not exist set the entry
    if (!doc.exists) {
      console.log('Not EXISTED');
      const newDeviceData = new Array();
      newDeviceData.push(macAddress);
      transaction.set(refUser, {devices: newDeviceData})
      return 1;
    }
    console.log('EXISTED');
    const devicesData = doc.data().devices;
    // Check to see if there is such field
    if (devicesData) {
      // Check duplication
      devicesData.forEach(device => {
        if (macAddress === device) {
          console.log('Found duplication');
          isDuplicated = true;
        }
      });
      if (isDuplicated !== true) {
        devicesData.push(macAddress);
        console.log('New Devices data ');
        console.log(devicesData);
        // Update new device information to the current table
        transaction.update(refUser, {
          devices: devicesData,
        });
      } else {
        console.log('Found duplication');
      }
    } else {
      const newDeviceData = new Array();
      newDeviceData.push(macAddress);
      transaction.update(refUser, {devices: newDeviceData})
      return 1;
    }

  })
  .catch(err => {
    console.warn(err);
  });
}
export default class HomeScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      cameraScan: false,
      isLoggedIn: true,
      softAPssid: wifiPrefix,
      registeringDevice: false,
      isLoading: false,
    };
  }

  deviceRegistrationDone = () => {
    this.setState({registeringDevice: false, cameraScan: false, isLoading: false});
  };

  onScanSuccess = async (qrData) => {
    console.log('Scan success!!!');
    console.log(qrData.data);
    let macAddrNoColons = qrData.data;
    // Original mac addr AA:BB:CC:DD:EE - drop the colons in the mac address
    macAddrNoColons = macAddrNoColons.split(':').join('');
    const addrLength = macAddrNoColons.length;
    const softAPssid = `${wifiPrefix}${macAddrNoColons.substring(
      addrLength - 4,
      addrLength,
    )}`;
    console.log(softAPssid);
    // Update information on database

    this.setState({
      softAPssid: softAPssid,
    });
    // Update board information to database
    await addDeviceInfoToFireBaseDataBase(qrData.data);
    // Connect to Soft Access Point on Device
    this.connectToAirUSoftAP(softAPssid);
  };

  componentDidMount = async () => {
    console.log('HomeScreen mounted ' + global.email);
  };

  // Return Response object
  // Need to add timeout on HTTP request
  fetchWiFiStatusFromDevice = async () => {
    return fetch(statusURL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        console.log('fetchWiFiStatusFromDevice');
        console.log(response);
        response.json().then(responseJson => {
          console.log('body JSON');
          console.log(responseJson);
        });
        return response;
      })
      .catch(error => {
        console.warn('fetchWiFiStatusFromDevice error code: --> ' + error);
        this.setState({
          cameraScan: false,
          registeringDevice: false,
          isLoading: false,
        });
      });
  };
  connectionStatusCallBack = status => {
    console.log('isConnected? ' + status);
    if (status) {
      this.fetchWiFiStatusFromDevice().then(response => {
        if (response.ok) {
          console.log('Connected successfully! ', this.state.softAPssid);
          this.setState({
            cameraScan: false,
            registeringDevice: true,
            isLoading: false,
          });
        } else {
          console.warn('Terrible things happened!');
          this.setState({
            cameraScan: false,
            registeringDevice: false,
            isLoading: false,
          });
        }
      })
      .catch(err => {
        Alert.alert('Make sure you disabled mobile data and device is on!', 'Please retry again after that!');
      });
    } else {
      console.warn('Not connected. retry');
      this.setState({
        cameraScan: false,
        registeringDevice: false,
        isLoading: false,
      });
    }
  };

  connectToAirUSoftAP = softAPssid => {
    console.log('Connecting to AirU soft AP ' + softAPssid);
    WifiManager.connectToProtectedSSID(softAPssid, softAPPassword, true).then(
      () => {
        this.setState({isLoading: true, cameraScan: false});
        sleep(8000).then(() => {
          // @problem
          // always return false when using data on Android
          WifiManager.connectionStatus(this.connectionStatusCallBack);
        });
      },
      () => {
        console.warn('Connection failed!');
      },
    );
  };

  render() {
    if (this.state.cameraScan) {
      return (
        <QRCodeScanner
          showMarker={true}
          onRead={this.onScanSuccess}
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
    } else if (this.state.registeringDevice) {
      return (
        <DeviceRegistration onRegistrationDone={this.deviceRegistrationDone} />
      );
    } else {
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
              Alert.alert('Disable your mobile data', mobileDataAlertMessage, [
                {
                  text: 'OK',
                  onPress: () => {
                    this.setState({cameraScan: true});
                  },
                },
              ]);
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
          <Loader
            isLoading={this.state.isLoading}
            indicatorSize={100}
            indicatorColor="#FFF"
          />
        </ImageBackground>
      );
    }
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
