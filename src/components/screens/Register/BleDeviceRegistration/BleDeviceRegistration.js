import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  NativeEventEmitter,
  NativeModules,
  Platform,
  PermissionsAndroid,
  FlatList,
  ScrollView,
  AppState,
  Dimensions,
  Alert,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import BleManager from 'react-native-ble-manager';
import {totalSize} from '../../../../api/Dimensions';
import GlobalConstants from '../../../Constants/globalConstants';
import fireStoreHelpers from '../../../fireStoreHelpers/fireStoreHelpers';
const window = Dimensions.get('window');
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

/**
 * These UUIDs base on the configuration on the device side
 * @Note: Once we change these UUIDs, the same changes need to be made on the firmware side and vice versa
 */
pms_service = '000000ff-0000-1000-8000-00805f9b34fb';
pms_service_read_noti = '0000ff01-0000-1000-8000-00805f9b34fb';
pms_service_write = '0000ff03-0000-1000-8000-00805f9b34fb';
wifi_addr_service_read = '0000ff04-0000-1000-8000-00805f9b34fb';
if (Platform.OS === 'ios') {
  pms_service = '00FF';
  pms_service_read_noti = 'FF01';
  pms_service_write = 'FF03';
  wifi_addr_service_read = 'FF04';
}

// @todo: Add mac address to firebase corresponding to the user
export default class BleDeviceRegistration extends Component {
  constructor() {
    super();

    this.state = {
      scanning: false,
      peripherals: new Map(),
      appState: '',
      location: {},
    };

    this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);
    this.handleStopScan = this.handleStopScan.bind(this);
    this.handleUpdateValueForCharacteristic = this.handleUpdateValueForCharacteristic.bind(
      this,
    );
    this.handleDisconnectedPeripheral = this.handleDisconnectedPeripheral.bind(
      this,
    );
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
  }

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);

    BleManager.start({showAlert: false});

    this.handlerDiscover = bleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      this.handleDiscoverPeripheral,
    );
    this.handlerStop = bleManagerEmitter.addListener(
      'BleManagerStopScan',
      this.handleStopScan,
    );
    this.handlerDisconnect = bleManagerEmitter.addListener(
      'BleManagerDisconnectPeripheral',
      this.handleDisconnectedPeripheral,
    );
    this.handlerUpdate = bleManagerEmitter.addListener(
      'BleManagerDidUpdateValueForCharacteristic',
      this.handleUpdateValueForCharacteristic,
    );

    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ).then(result => {
        if (result) {
          console.log('Permission is OK');
        } else {
          PermissionsAndroid.requestPermission(
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          ).then(result => {
            if (result) {
              console.log('User accept');
            } else {
              console.log('User refuse');
            }
          });
        }
      });
    }
  }

  handleAppStateChange(nextAppState) {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      console.log('App has come to the foreground!');
      BleManager.getConnectedPeripherals([]).then(peripheralsArray => {
        console.log('Connected peripherals: ' + peripheralsArray.length);
      });
    }
    this.setState({appState: nextAppState});
  }

  /**
   * Commented out to keep data posted to database after unmount
   * There would likely some memory issue here if keep mounting and unmount this screen
   */
  componentWillUnmount() {
    this.handlerDiscover.remove();
    this.handlerStop.remove();
    this.handlerDisconnect.remove();
    this.handlerUpdate.remove();
  }

  handleDisconnectedPeripheral(data) {
    let peripherals = this.state.peripherals;
    let peripheral = peripherals.get(data.peripheral);
    if (peripheral) {
      peripheral.connected = false;
      peripherals.set(peripheral.id, peripheral);
      this.setState({peripherals});
    }
    console.log('Disconnected from ' + data.peripheral);
  }

  handleUpdateValueForCharacteristic(data) {
    console.log(
      'Received data from ' +
        data.peripheral +
        ' characteristic ' +
        data.characteristic,
      data.value,
    );
    this.currentPeripheral = data.peripheral;
    this.findCoordinates();
  }

  /**
   * Got Geographical location successfully.
   * Then read and parse BLE data package in order to send to Big Query db
   *  */
  geoOnSuccess = position => {
    var peripheral = this.currentPeripheral;
    BleManager.read(peripheral, pms_service, pms_service_read_noti)
      .then(readData => {
        var a = '';
        /**
         * BLE package is in JSON String format and received as bytes array.
         * Hence need to parse from byte to String then from String to JSON object
         *  */
        readData.forEach(byte => {
          a = a + String.fromCharCode(byte);
        });
        console.log(a);
        var dataObj = JSON.parse(a);
        dataObj.LAT = position.coords.latitude;
        dataObj.LON = position.coords.longitude;
        dataObj = this.addDateToWearableDataObject(dataObj);
        this.sendWearableDataToServer(dataObj);
      })
      .catch(err => {
        console.log(err);
      });
  };

  /**
   * Read ESP32 WiFi mac address.
   * In ESP32, we have 2 mac addresses: WiFi and BLE.
   * WiFi address is the default address that we would see a lot using Espressif tool kit
   * WiFi address is the one we have been using to manage sensors as well
   */
  readWiFiMacAddress = peripheral => {
    return new Promise(function(resolve, reject) {
      BleManager.read(peripheral, pms_service, wifi_addr_service_read)
        .then(readData => {
          var a = '';
          /**
           * Hence need to parse from byte to String then from String to JSON object
           *  */
          readData.forEach(byte => {
            a = a + String.fromCharCode(byte);
          });
          console.log('read wifi address ' + a);
          resolve(a);
        })
        .catch(err => {
          reject(err);
        });
    });
  };

  /**
   * Get Coordinates from GPS
   */
  findCoordinates = () => {
    Geolocation.getCurrentPosition(
      this.geoOnSuccess,
      error => console.warn(error.message),
      {enableHighAccuracy: false, timeout: 10000, maximumAge: 1000},
    );
  };

  addDateToWearableDataObject = dataObj => {
    dataObj.TIMESTAMP = '';
    var dates = Math.floor(Date.now() / 1000);
    dataObj.TIMESTAMP = dates;
    return dataObj;
  };

  /**
   * Make an API request to our internal server in order to save collected sensor data to Big Query on GCP
   * Sensor data:
   *   dataObj {
        PM1:
        PM25:
        PM10:
        DEVICE_ID:
        LAT:
        LON:
        TIMESTAMP:
        }
   *  */
  sendWearableDataToServer = dataObj => {
    console.log(dataObj);
    fetch(GlobalConstants.SERVER_DOMAIN_NAME + GlobalConstants.SAVE_WEAR_DATA, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataObj),
    }).then(response => {
      console.log(response);
    });
  };
  handleStopScan() {
    console.log('Scan is stopped');
    this.setState({scanning: false});
  }

  /**
   * BLE scan
   */
  startScan() {
    if (!this.state.scanning) {
      this.setState({peripherals: new Map()});
      BleManager.scan([], 3, true).then(results => {
        console.log('Scanning...');
        this.setState({scanning: true});
      });
    }
  }

  /**
   * Retrieve Connected BLE device
   */
  retrieveConnected() {
    BleManager.getConnectedPeripherals([]).then(results => {
      if (results.length == 0) {
        console.log('No connected peripherals');
      }
      console.log(results);
      var peripherals = this.state.peripherals;
      for (var i = 0; i < results.length; i++) {
        var peripheral = results[i];
        peripheral.connected = true;
        peripherals.set(peripheral.id, peripheral);
        this.setState({peripherals});
      }
    });
  }

  handleDiscoverPeripheral(peripheral) {
    var peripherals = this.state.peripherals;
    if (!peripherals.has(peripheral.id)) {
      // console.log('Got ble peripheral', peripheral);
      peripherals.set(peripheral.id, peripheral);
      this.setState({peripherals});
    }
  }

  /**
   * @param {BLE Peripheral Object} peripheral {name, id, connected}
   * if this Peripheral is connected then disconnect
   * else, connect to this BLE devices and subscribe notification on the PMS uuid and get sensor data in a certain rate define by firmware
   *
   * @todo: data rate to be configurable
   */
  handleConnectingBLEDevice(peripheral) {
    if (peripheral) {
      if (peripheral.connected) {
        BleManager.disconnect(peripheral.id);
      } else {
        BleManager.connect(peripheral.id)
          .then(() => {
            Alert.alert('Connected to device ' + peripheral.name);
            let peripherals = this.state.peripherals;
            let p = peripherals.get(peripheral.id);
            if (p) {
              p.connected = true;
              peripherals.set(peripheral.id, p);
              this.setState({peripherals});
            }
            console.log('Connected to ' + peripheral.id);

            setTimeout(() => {
              /* Test read current RSSI value
              BleManager.retrieveServices(peripheral.id).then((peripheralData) => {
                console.log('Retrieved peripheral services', peripheralData);
                BleManager.readRSSI(peripheral.id).then((rssi) => {
                  console.log('Retrieved actual RSSI value', rssi);
                });
              });*/
              BleManager.retrieveServices(peripheral.id).then(
                peripheralInfo => {
                  console.log(peripheralInfo);
                  setTimeout(() => {
                    this.readWiFiMacAddress(peripheral.id)
                      .then(data => {
                        console.log(data);
                        fireStoreHelpers.addDeviceInfoToFireBaseDataBase(
                          data.trim(),
                          peripheral.name.trim(),
                        );
                      })
                      .catch(err => {
                        console.warn(err);
                      });
                  }, 500);
                  setTimeout(() => {
                    BleManager.startNotification(
                      peripheral.id,
                      pms_service,
                      pms_service_read_noti,
                    )
                      .then(() => {
                        console.log('Started notification on ' + peripheral.id);
                      })
                      .catch(error => {
                        console.log('Notification error', error);
                      });
                  }, 200);
                },
              );
            }, 900);
          })
          .catch(error => {
            console.log('Connection error', error);
          });
      }
    }
  }

  render() {
    const list = Array.from(this.state.peripherals.values());
    console.log(list);
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={{
            marginTop: 40,
            margin: 20,
            padding: 20,
            backgroundColor: '#64a16d',
          }}
          onPress={() => this.startScan()}>
          <Text>Scan Bluetooth ({this.state.scanning ? 'on' : 'off'})</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            marginTop: 0,
            margin: 20,
            padding: 20,
            backgroundColor: '#64a16d',
          }}
          onPress={() => this.retrieveConnected()}>
          <Text>Retrieve connected peripherals</Text>
        </TouchableOpacity>
        <ScrollView style={styles.scroll}>
          {list.length === 0 && (
            <View style={{flex: 1, margin: 20}}>
              <Text style={{textAlign: 'center'}}>No peripherals</Text>
            </View>
          )}
          <FlatList
            data={list}
            renderItem={({item}) => {
              console.log(item.name);
              const color = item.connected ? '#64a16d' : '#90de9c';
              /**
               * Only show Sensor from AirU with prefix name as WAIRU
               * Prefer GlobalConstants.WEARABLE_NAME_PREFIX
               */
              if (
                item.name &&
                (item.name.includes(GlobalConstants.WEARABLE_NAME_PREFIX) > 0 ||
                item.name.includes(GlobalConstants.WEARABLE_NAME_PREFIX_IOS))
              ) {
                return (
                  <TouchableOpacity
                    onPress={() => this.handleConnectingBLEDevice(item)}>
                    <View style={[styles.row, {backgroundColor: color}]}>
                      <Text style={styles.bleDeviceName}>{item.name}</Text>
                      <Text style={styles.bleMacAddr}>{item.id}</Text>
                    </View>
                  </TouchableOpacity>
                );
              }
            }}
            // keyExtractor={item => item.id}
          />
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#b7edc0',
    width: window.width,
    height: window.height,
  },
  scroll: {
    flex: 1,
    // backgroundColor: '#f0f0f0',
    margin: 10,
  },
  row: {
    margin: 10,
    backgroundColor: '#90de9c',
  },
  bleDeviceName: {
    fontSize: totalSize(2.5),
    textAlign: 'center',
    color: '#333333',
    padding: 10,
  },
  bleMacAddr: {
    fontSize: totalSize(1),
    textAlign: 'center',
    color: '#333333',
    padding: 10,
  },
});
