import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import {h, w, totalSize} from '../../../../api/Dimensions';
import GlobalConstants from '../../../Constants/globalConstants.js';
import FireStoreConstants from '../../../Constants/fireStoreConstants';
import firebase from 'react-native-firebase';

const labels = 'Retrieving Data...';
const sleep = milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};
export class SensorsView extends Component {
  constructor() {
    super();
    this.state = {
      dataSource: {},
      sensorCount: 0,
    };
  }

  // Return color scale based on PM2.5 value
  pmsColorScale = pmsValue => {
    let color = 'rgba(0,255,0,0.6)';
    if (pmsValue < 50) {
      color = color;
    } else if (pmsValue < 100) {
      color = 'rgba(255,255,0,0.6)';
    } else if (pmsValue < 150) {
      color = 'rgba(255,128,0,0.6)';
    } else if (pmsValue < 200) {
      color = 'rgba(255,16,0,0.6)';
    } else if (pmsValue < 300) {
      color = 'rgba(128,0,255,0.6)';
    } else {
      color = 'rgba(100,0,0,0.6)';
    }
    return color;
  };

  /**
   * Show dummy list of device corresponding to number of devices belong to this user
   * Showing user that the application is in progress getting sensor's most recent PM25 data.
   */
  dataPreparation = () => {
    var that = this;
    let sensors = Array.apply(null, Array(this.state.sensorCount)).map(
      (v, i) => {
        const pmsValue = i;
        let color = this.pmsColorScale(pmsValue);
        return {
          pmsValue: pmsValue,
          color: color,
          label: labels,
        };
      },
    );
    console.log('data preparation');
    that.setState({
      dataSource: sensors,
    });
  };

  // Translate object to API params
  objToQueryString(obj) {
    const keyValuePairs = [];
    for (const key in obj) {
      keyValuePairs.push(
        encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]),
      );
    }
    return keyValuePairs.join('&');
  }

  // Get PM2.5 data from sensor
  // Input: sensor MAC address
  getPMValue = async mac_addr => {
    const device_id = mac_addr.split(':').join('');
    const queryParam = this.objToQueryString({
      device_id: device_id,
      days: 1,
    });
    return fetch(
      `${GlobalConstants.SERVER_DOMAIN_NAME}request_sensor_data/?${queryParam}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    )
      .then(response => {
        return response;
      })
      .catch(error => {
        console.warn('getPMValue error code: --> ' + error);
      });
  };

  /**
   * Query firebase database information from 'users' collection
   * Get corresponding user in this collection based on login information
   * Then get 'devices' fields to get an array of devices belong to this user
   *
   * @returns an array of 'devices'
   */
  async getUserDevices() {
    console.log('getUserDevices ' + global.email);
    var devicesData;
    const user = await firebase
      .firestore()
      .collection(FireStoreConstants.collections.users)
      .doc(global.email);
    console.log('firebase.firestore().runTransaction');
    await firebase
      .firestore()
      .runTransaction(async transaction => {
        const doc = await transaction.get(user);
        devicesData = await doc.data().devices;
        console.log(devicesData);
      })
      .catch(err => {
        console.log('GetUserDevices err' + err);
      });
    return await Promise.resolve(devicesData);
  }

  /**
   * When Mount this view:
   * - Fetch Sensors that belong to this account into a set
   * - Fetch the most recent PMS data of this sensor set and display
   */
  componentDidMount = async () => {
    this.getUserDevices().then(async userDevices => {
      this.setState({sensorCount: userDevices.length});
      let sensors = new Array(0);
      userDevices.forEach(async device => {
        // console.log(device);
        await this.getPMValue(device.mac_add).then(async pmsValue => {
          if (pmsValue.ok) {
            pmsValue
              .json()
              .then(async responseJson => {
                // console.log(responseJson);
                if (responseJson) {
                  // Get the most recent PMS25 data responseJson[0]
                  let color = await this.pmsColorScale(
                    responseJson[0].avg_pm25,
                  );
                  let obj = {
                    pmsValue: responseJson[0].avg_pm25,
                    color: color,
                    label: device.user_label,
                  };
                  sensors.push(obj);
                  // console.log('sensors');
                  // console.log(sensors);
                }
              })
              .catch(err => {
                console.log(err);
                let obj = {
                  pmsValue: 'OFFL',
                  color: this.pmsColorScale(400),
                  label: device.user_label,
                };
                sensors.push(obj);
              });
          } else {
            Alert.alert('Could not get data! Error value', pmsValue.status);
          }
        });
      });
      // Initialize dummy flatlist data
      this.dataPreparation();
      /**
       * Per entry in the database, it took some time to go through the process of getting data and render the list
       * 700 ms per device is what I am seeing a stable waiting time on my testing device
       */
      await sleep(userDevices.length * 700).then(() => {
        this.setState({
          dataSource: sensors,
        });
      });
    });
  };

  render() {
    console.log('RENDER');
    console.log(this.state.dataSource);
    if (this.state.sensorCount > 0) {
      return (
        <View style={styles.MainContainer}>
          <FlatList
            data={this.state.dataSource}
            renderItem={({item}) => (
              <View style={{flex: 1, flexDirection: 'column', margin: 1}}>
                <TouchableOpacity
                  style={[
                    styles.sensorContainer,
                    {backgroundColor: item.color},
                  ]}>
                  <Text style={styles.sensorPmsData}>{item.pmsValue}</Text>
                </TouchableOpacity>
                <Text style={styles.sensorLabel}>{item.label}</Text>
              </View>
            )}
            //Setting the number of column
            numColumns={3}
            keyExtractor={(item, index) => index}
          />
        </View>
      );
    } else {
      return <View style={styles.MainContainer} />;
    }
  }
}

const styles = StyleSheet.create({
  MainContainer: {
    justifyContent: 'center',
    flex: 1,
    width: w(100),
    paddingBottom: h(0.5),
  },
  sensorContainer: {
    alignSelf: 'center',
    height: totalSize(8),
    width: totalSize(8),
    borderRadius: totalSize(8) / 2,
  },
  sensorLabel: {
    marginTop: h(1),
    marginBottom: h(4),
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    textAlign: 'center',
    fontSize: totalSize(2.5),
  },
  sensorPmsData: {
    justifyContent: 'center',
    marginVertical: h(2),
    alignItems: 'center',
    alignSelf: 'center',
    fontSize: totalSize(3),
  },
});

export default SensorsView;
