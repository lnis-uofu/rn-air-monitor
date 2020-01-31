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
const window = Dimensions.get('window');
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
const pms_service = '000000ff-0000-1000-8000-00805f9b34fb';
const pms_service_read_noti = '0000ff01-0000-1000-8000-00805f9b34fb';
const pms_service_write = '0000ff03-0000-1000-8000-00805f9b34fb';

export default class BleDeviceRegistration extends Component {
  constructor() {
    super();

    this.state = {
      scanning: false,
      peripherals: new Map(),
      appState: '',
      location: {},
    };

    var currentPeripheral;
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

  geoOnSuccess = position => {
    console.log(position);
    var peripheral = this.currentPeripheral;
    BleManager.read(peripheral, pms_service, pms_service_read_noti).then(
      readData => {
        var a = '';
        // console.log(String.fromCharCode(readData));
        readData.forEach(byte => {
          a = a + String.fromCharCode(byte);
        });
        console.log(a);
        a = '{"PM1":0.30,"PM25":0.03,"PM10":0.10}';
        var dataObj = JSON.parse(a);
        dataObj.DEVICE_ID = peripheral.split(':').join('');
        dataObj.LAT = position.coords.latitude;
        dataObj.LON = position.coords.longitude;
        dataObj = this.addDateToWearableDataObject(dataObj);
        this.sendWearableDataToServer(dataObj);
      },
    );
  };

  findCoordinates = () => {
    Geolocation.getCurrentPosition(
      this.geoOnSuccess,
      error => Alert.alert(error.message),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
    );
  };

  addDateToWearableDataObject = dataObj => {
    dataObj.TIMESTAMP = '';
    var dates = Date.now();
    console.log(dates);
    dataObj.TIMESTAMP = dates;
    return dataObj;
  };
  sendWearableDataToServer = dataObj => {
    console.log(dataObj);
    fetch(GlobalConstants.SERVER_DOMAIN_NAME + GlobalConstants.SAVE_WEAR_DATA, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
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

  startScan() {
    if (!this.state.scanning) {
      this.setState({peripherals: new Map()});
      BleManager.scan([], 3, true).then(results => {
        console.log('Scanning...');
        this.setState({scanning: true});
      });
    }
  }

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

  test(peripheral) {
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
                    BleManager.startNotification(
                      peripheral.id,
                      pms_service,
                      pms_service_read_noti,
                    )
                      .then(() => {
                        console.log('Started notification on ' + peripheral.id);
                        // setTimeout(() => {
                        //   BleManager.write(
                        //     peripheral.id,
                        //     pms_service,
                        //     pms_service_write,
                        //     [0],
                        //   ).then(() => {
                        //     console.log('Writed NORMAL crust');
                        //     BleManager.write(
                        //       peripheral.id,
                        //       pms_service,
                        //       pms_service_write,
                        //       [1, 95],
                        //     ).then(() => {
                        //       console.log(
                        //         'Writed 351 temperature, the pizza should be BAKED',
                        //       );
                        //     });
                        //   });
                        // }, 500);
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
              console.log(item);
              const color = item.connected ? '#64a16d' : '#90de9c';
              return (
                <TouchableOpacity onPress={() => this.test(item)}>
                  <View style={[styles.row, {backgroundColor: color}]}>
                    <Text style={styles.bleDeviceName}>{item.name}</Text>
                    <Text style={styles.bleMacAddr}>{item.id}</Text>
                  </View>
                </TouchableOpacity>
              );
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
