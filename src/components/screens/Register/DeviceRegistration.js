import React, {Component} from 'react';
import {
  Alert,
  Text,
  StyleSheet,
  View,
  ImageBackground,
  TouchableOpacity,
  Modal,
} from 'react-native';
import PropTypes from 'prop-types';
import {w, h, totalSize} from '../../../api/Dimensions';
import InputField from '../../components/InputField';
import {themeColor} from '../../../../App';
import Loader from '../../components/Loader';
import WifiManager from 'react-native-wifi-reborn';
import BleDeviceRegistration from './BleDeviceRegistration/BleDeviceRegistration';
var Spinner = require('react-native-spinkit');

const homebgPath = require('../../../../assets/home_bg.png');
const passwordLogo = require('../../../../assets/password.png');
const emailLogo = require('../../../../assets/wifi.png');
const widgetWidth = w(100);
const backIconRadius = h(3);
const backText = '<';
const connectURL = 'http://192.168.4.1/connect.json';
const statusURL = 'http://192.168.4.1/status.json';
const sleep = milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

export default class DeviceRegistration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      wifiCredential: false,
      ssid: '',
      wifiPassword: '',
      ssidInputThemeColor: themeColor.bright,
      wiFiPwdInputThemeColor: themeColor.bright,
      sendingMessageColor: '#fff',
      queryWifiStatusColor: '#fff',
    };
    this.passwordInput = React.createRef();
    this.ssidInput = React.createRef();
  }

  focusPasswordAction = ssid => {
    this.setState({
      ssid: ssid,
    });
    this.passwordInput.focus();
  };

  ssidInputHandler = text => {
    this.setState({ssid: text});
  };

  pwdInputHandler = text => {
    this.setState({wifiPassword: text});
  };

  pollingWifiStatus = milliseconds => {
    sleep(milliseconds).then(() => {});
  };

  wifiCredsDone = () => {
    if (this.state.ssid.length === 0) {
      console.warn('Please enter your WiFi name');
      this.setState({
        ssidInputThemeColor: themeColor.error,
        wifiCredential: false,
      });
      return;
    } else {
    }
    if (this.state.wifiPassword.length === 0) {
      console.warn('Please enter your WiFi Password');
      this.setState({
        wiFiPwdInputThemeColor: themeColor.error,
        wifiCredential: false,
      });
      return;
    } else {
    }
    this.setState({
      ssidInputThemeColor: themeColor.bright,
      wiFiPwdInputThemeColor: themeColor.bright,
      wifiCredential: true,
    });
    console.log('ssid/pwd:', this.state.ssid, this.state.wifiPassword);
    this.requestWifiStationConnect().then(response => {
      console.log('>>>>>>>>>>>>>>request sent');
      this.setState({sendingMessageColor: '#2bff59'});
      if (response.status !== 200) {
        // Return code is not success
        this.setState({sendingMessageColor: themeColor.error});
        console.warn('Fail to send HTTP request');
        Alert.alert(
          'Request failed! Please retry!',
          `Error '${response.status}' return!`,
        );
      } else {
        // Status code is 200. Continue with checking the connection
        // Wait for wifi to be configured on device
        sleep(15000)
          .then(() => {
            this.setState({sendingMessageColor: '#2bff59'});
            this.fetchWiFiStatusFromDevice().then(responseOne => {
              responseOne.json().then(responseJson => {
                console.log('body JSON');
                console.log(responseJson);
                if (responseJson.urc === 0) {
                  // Connected, good
                  // Disconnect with device, reconnect to previous WiFi
                  Alert.alert(
                    'Congratulation',
                    'Your device has been connected to WiFi successfully',
                    [
                      {
                        text: 'OK',
                        onPress: () => {
                          console.log(
                            `Reconnecting to WiFi ${this.state.ssid}/
                            ${this.state.wifiPassword}`,
                          );
                          WifiManager.disconnect();
                          sleep(2000).then(() => {
                            WifiManager.connectToProtectedSSID(
                              this.state.ssid,
                              this.state.wifiPassword,
                              true,
                            ).then(
                              () => {
                                sleep(8000).then(() => {
                                  this.setState({
                                    wifiCredential: false,
                                    sendingMessageColor: '#fff',
                                    queryWifiStatusColor: '#fff',
                                  });
                                  this.props.onRegistrationDone();
                                });
                              },
                              () => {
                                console.warn('Connection failed!');
                                // Retry if failed
                                sleep(2000).then(() => {
                                  WifiManager.connectToProtectedSSID(
                                    this.state.ssid,
                                    this.state.wifiPassword,
                                    true,
                                  ).then(
                                    () => {
                                      console.log('Connected');
                                      sleep(8000).then(() => {
                                        this.setState({
                                          wifiCredential: false,
                                          sendingMessageColor: '#fff',
                                          queryWifiStatusColor: '#fff',
                                        });
                                        this.props.onRegistrationDone();
                                      });
                                    },
                                    () => {
                                      console.warn('Connection failed!');

                                      this.props.onRegistrationDone();
                                    },
                                  );
                                });
                              },
                            );
                          });
                        },
                      },
                    ],
                  );
                  console.log('URC 0');
                } else {
                  Alert.alert(
                    'Fail to connect to wifi',
                    `Make sure you entered the correct credential 
                  '${this.state.ssid}/${this.state.wifiPassword}'
                  or Make sure your WiFi Access Point is up!`,
                  );
                  this.setState({
                    wifiCredential: false,
                  });

                  console.log('URC 1');
                }
              });
            });
          })
          .catch(err => {
            console.warn('Cannot configure', err);
            this.setState({wifiCredential: false});
          });
      }
    });
  };

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

  requestWifiStationConnect = async () => {
    return fetch(connectURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Custom-ssid': this.state.ssid,
        'X-Custom-pwd': this.state.wifiPassword,
      },
    })
      .then(response => {
        console.log(response.status);
        return response;
      })
      .catch(error => {
        // console.warn(error);
      });
  };

  render() {
    if (!this.props.isWearable) {
      return (
        <ImageBackground source={homebgPath} style={styles.backgroundStyle}>
          <View style={styles.headerStyle}>
            <TouchableOpacity
              style={styles.roundTouchable}
              onPress={this.props.onRegistrationDone}>
              <Text style={styles.cancelTextStyle}>{backText}</Text>
            </TouchableOpacity>
            <Text style={styles.headerTextStyle}>WiFi Credentials</Text>
          </View>

          <View style={styles.credentialContainerStyle}>
            <InputField
              source={emailLogo}
              placeholder={'WiFi SSID'}
              secureTextEntry={false}
              autoCorrect={false}
              returnKeyType={'next'}
              maxLength={25}
              textFieldBoxColor={this.state.ssidInputThemeColor}
              onSubmitEditingFunc={({nativeEvent}) =>
                this.focusPasswordAction(nativeEvent.text)
              }
              onChangeTextFunc={this.ssidInputHandler}
              ref={input => {
                this.ssidInput = input;
              }}
            />
            <InputField
              source={passwordLogo}
              placeholder={'PASSWORD'}
              secureTextEntry={true}
              autoCorrect={false}
              returnKeyType={'done'}
              maxLength={25}
              textFieldBoxColor={this.state.wiFiPwdInputThemeColor}
              onSubmitEditingFunc={this.wifiCredsDone}
              onChangeTextFunc={this.pwdInputHandler}
              ref={input => {
                this.passwordInput = input;
              }}
            />
          </View>
          <View style={styles.tabView}>
            <TouchableOpacity
              style={styles.NextButtonStyle}
              onPress={this.wifiCredsDone}>
              <Text style={styles.nextTextStyle}>Next</Text>
            </TouchableOpacity>
          </View>
          <Modal
            transparent={true}
            animationType={'none'}
            visible={this.state.wifiCredential}>
            <Loader
              isLoading={this.state.wifiCredential}
              indicatorSize={100}
              indicatorColor="#FFF"
            />
            <View style={styles.registrationProcessTextStyle}>
              <Text style={{color: this.state.sendingMessageColor}}>
                Sending request to device...
              </Text>
              <Text style={{color: this.state.sendingMessageColor}}>
                Received Response OK...
              </Text>
              <Text style={{color: this.state.queryWifiStatusColor}}>
                Querying wifi status...
              </Text>
            </View>
          </Modal>
        </ImageBackground>
      );
    } else {
      return (
        <ImageBackground source={homebgPath} style={styles.backgroundStyle}>
          <View style={styles.headerStyle}>
            <TouchableOpacity
              style={styles.roundTouchable}
              onPress={this.props.onRegistrationDone}>
              <Text style={styles.cancelTextStyle}>{backText}</Text>
            </TouchableOpacity>
            <Text style={styles.headerTextStyle}>
              Choose Your Wearable device
            </Text>
          </View>
          <BleDeviceRegistration />
        </ImageBackground>
      );
    }
  }
}

DeviceRegistration.propTypes = {
  onRegistrationDone: PropTypes.func,
  isWearable: PropTypes.bool,
};

DeviceRegistration.defaultProps = {
  onRegistrationDone: () => {
    console.log('No function bind!!??');
  },
  isWearable: false,
};

const styles = StyleSheet.create({
  backgroundStyle: {
    flex: 1,
    alignItems: 'center',
    width: w(100),
    height: h(100),
  },
  headerStyle: {
    alignItems: 'center',
    flex: 0,
    flexDirection: 'row',
    height: backIconRadius * 2,
    width: widgetWidth,
    backgroundColor: '#71AC7F',
  },
  headerTextStyle: {
    textAlign: 'center',
    fontSize: totalSize(2),
    fontWeight: '200',
    color: '#fff',
    marginLeft: w(20),
  },
  roundTouchable: {
    alignItems: 'center',
    height: backIconRadius * 2,
    width: backIconRadius * 2.5,
    borderRadius: backIconRadius,
    // backgroundColor: 'rgba(113, 172, 127,0.1)',
  },
  tabView: {
    flex: 0,
    flexDirection: 'row',
    marginBottom: h(4),
    width: widgetWidth / 2,
    height: h(6),
  },
  credentialContainerStyle: {
    alignItems: 'center',
    backgroundColor: '#71AC7F',
    marginTop: h(15),
    marginBottom: h(5),
    width: widgetWidth,
    height: h(17),
    borderRadius: totalSize(2),
  },
  nextTextStyle: {
    textAlign: 'center',
    fontSize: totalSize(2.4),
    fontWeight: '200',
    color: '#71AC7F',
    marginTop: h(0.7),
  },
  cancelTextStyle: {
    fontSize: h(4),
    fontWeight: '300',
    color: '#C5FBD0',
  },
  NextButtonStyle: {
    flex: 1,
    alignItems: 'center',
    height: h(5),
    width: widgetWidth / 2,
    backgroundColor: 'rgba(113, 172, 127,0.1)',
  },
  spinner: {
    marginBottom: h(30),
  },
  registrationProcessTextStyle: {
    marginTop: h(80),
    height: h(30),
    width: w(55),
  },
});
