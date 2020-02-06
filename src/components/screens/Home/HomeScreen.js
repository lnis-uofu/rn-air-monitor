import React from 'react';
import firebase from 'react-native-firebase';
import {
  Alert,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageBackground,
  Platform,
  Modal,
  View,
} from 'react-native';
import {w, h, totalSize} from '../../../api/Dimensions';
import DeviceRegistration from '../Register/DeviceRegistration';
import QRCodeScanner from 'react-native-qrcode-scanner';
import WifiManager from 'react-native-wifi-reborn';
import Loader from '../../components/Loader';
import ConfigurationScreen from './ConfigurationScreen/ConfigurationScreen';
import SensorsView from './SensorsView/SensorsView';
import InputField from '../../components/InputField';
import RadioForm from 'react-native-simple-radio-button';
import Geolocation from '@react-native-community/geolocation';

const homebgPath = require('../../../../assets/home_bg.png');
const configureIconPath = require('../../../../assets/configure_icon.png');
const deviceLabel = require('../../../../assets/label_icon.png');
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
var radio_props = [
  {label: 'Wall Mounted', value: 0},
  {label: 'Wearable', value: 1},
];

export default class HomeScreen extends React.Component {
  addDeviceInfoToFireBaseDataBase = async (macAddress, label) => {
    console.log('Get devices info!');
    var isDuplicated = false;
    var dev_map = {mac_add: macAddress, user_label: label};
    const refUser = await firebase
      .firestore()
      .collection(usersCollection)
      .doc(global.email);

    console.log('firebase.firestore().runTransaction');
    await firebase
      .firestore()
      .runTransaction(async transaction => {
        const doc = await transaction.get(refUser);

        // if it does not exist set the entry
        if (!doc.exists) {
          console.log('Not EXISTED');
          const newDeviceData = new Array();
          newDeviceData.push(macAddress);
          transaction.set(refUser, {devices: newDeviceData});
          return 1;
        }
        console.log('EXISTED');
        const devicesData = doc.data().devices;
        console.log(devicesData);
        // Check to see if there is such field
        if (devicesData) {
          // Check duplication
          devicesData.forEach(device => {
            if (macAddress === device.mac_add) {
              console.log('Found duplication');
              isDuplicated = true;
            }
          });
          if (isDuplicated !== true) {
            // devicesData.push(macAddress);
            devicesData.push(dev_map);
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
          newDeviceData.push(dev_map);
          // Update new information to database
          transaction.update(refUser, {devices: newDeviceData});
          return 1;
        }
      })
      .catch(err => {
        console.warn('addDeviceInfoToFireBaseDataBase' + err);
      });
  };
  constructor() {
    super();
    this.state = {
      cameraScan: false,
      configurationPage: false,
      isLoggedIn: true,
      softAPssid: wifiPrefix,
      registeringDevice: false,
      isLoading: false,
      isEnteringDeviceLabel: false,
      deviceTypeConfirm: false,
      isWearable: false,
    };
    this.label = '';
  }

  configurationPageDone = () => {
    this.setState({configurationPage: false});
  };
  deviceRegistrationDone = () => {
    this.setState({
      registeringDevice: false,
      cameraScan: false,
      isLoading: false,
    });
  };

  onScanSuccess = async qrData => {
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
    await this.addDeviceInfoToFireBaseDataBase(qrData.data, this.label);
    // Connect to Soft Access Point on Device
    this.connectToAirUSoftAP(softAPssid);
  };
  componentDidMount = async () => {
    console.log('HomeScreen mounted ' + global.email);
    Geolocation.getCurrentPosition(
      position => {
        console.log(position);
      },
      error => Alert.alert(error.message),
      {enableHighAccuracy: true, timeout: 200000, maximumAge: 1000},
    );
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
      this.fetchWiFiStatusFromDevice()
        .then(response => {
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
          Alert.alert(
            'Make sure you disabled mobile data and device is on!',
            'Please retry again after that!',
          );
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

  onSubmittingDeviceLabel = () => {
    if (this.label.length === 0) {
      Alert.alert('Please give your AirU a name!');
      return;
    }
    // skip the camera scan when it is wearable device
    if (this.state.isWearable) {
      this.setState({
        cameraScan: false,
        registeringDevice: true,
        isLoading: false,
        isEnteringDeviceLabel: false,
      });
    } else {
      this.setState({
        cameraScan: true,
        isEnteringDeviceLabel: false,
      });
    }
  };

  labelInputHandler = text => {
    this.label = text;
  };

  deviceTypesRadioButtons = () => {
    return (
      <View style={styles.enterSensorLabelView}>
        <Text
          style={[
            {
              fontSize: totalSize(2.5),
              textAlign: 'center',
              marginTop: h(3),
              marginBottom: h(1.5),
            },
          ]}>
          Select your device type!
        </Text>
        <RadioForm
          radio_props={radio_props}
          initial={0}
          buttonColor={'#20d440'}
          selectedButtonColor={'#20d440'}
          onPress={value => {
            if (value === 1) {
              this.setState({isWearable: true});
            } else {
              this.setState({isWearable: false});
            }
            this.setState({
              isEnteringDeviceLabel: true,
              deviceTypeConfirm: false,
            });
          }}
        />
      </View>
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
        <DeviceRegistration
          onRegistrationDone={this.deviceRegistrationDone}
          isWearable={this.state.isWearable}
        />
      );
    } else if (this.state.configurationPage) {
      return <ConfigurationScreen onDone={this.configurationPageDone} />;
    } else {
      return (
        <ImageBackground source={homebgPath} style={styles.viewStyle}>
          <TouchableOpacity
            style={styles.configureIcon}
            onPress={() => {
              console.log('Configuration page');
              this.setState({configurationPage: true});
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
                  onPress: async () => {
                    this.setState({deviceTypeConfirm: true});
                  },
                },
              ]);
            }}>
            <Text style={styles.plusText}>+</Text>
          </TouchableOpacity>
          <SensorsView />
          <Loader
            isLoading={this.state.isLoading}
            indicatorSize={100}
            indicatorColor="#FFF"
          />
          <Modal
            style={styles.modalStyle}
            transparent={true}
            animationType={'none'}
            visible={this.state.deviceTypeConfirm}>
            {this.deviceTypesRadioButtons()}
          </Modal>
          <Modal
            style={styles.modalStyle}
            transparent={true}
            animationType={'none'}
            visible={this.state.isEnteringDeviceLabel}>
            <View style={styles.enterSensorLabelView}>
              <Text
                style={[
                  {
                    fontSize: totalSize(2.5),
                    textAlign: 'center',
                    marginTop: h(3),
                    marginBottom: h(1.5),
                  },
                ]}>
                What would you like to call your AirU sensor?
              </Text>
              <InputField
                source={deviceLabel}
                placeholder={'Friendly, descriptive name'}
                secureTextEntry={false}
                returnKeyType={'done'}
                maxLength={25}
                textFieldBoxColor={'#000'}
                onSubmitEditingFunc={() => this.onSubmittingDeviceLabel()}
                onChangeTextFunc={this.labelInputHandler}
                placeHolderTextColor={'#aaa'}
                textFieldColor={'#000'}
              />
              <TouchableOpacity
                style={styles.doneEnteringLabel}
                onPress={() => {
                  this.onSubmittingDeviceLabel();
                }}>
                <Text
                  style={[
                    {
                      textAlign: 'center',
                      fontSize: totalSize(2.5),
                      fontWeight: 'bold',
                    },
                  ]}>
                  Ok
                </Text>
              </TouchableOpacity>
            </View>
          </Modal>
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
  enterSensorLabelView: {
    marginTop: h(20),
    height: h(25),
    width: w(80),
    borderRadius: h(5),
    alignContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255, 0.9)',
  },
  doneEnteringLabel: {
    marginTop: h(2),
    width: w(30),
    height: h(5),
    alignContent: 'center',
    borderRadius: totalSize(3),
    // backgroundColor: '#0f0',
  },
  modalStyle: {
    flex: 1,
    alignSelf: 'center',
    flexDirection: 'column',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
});
