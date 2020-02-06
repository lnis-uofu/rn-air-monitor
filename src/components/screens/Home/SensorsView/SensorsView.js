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

  componentDidMount = async () => {
    var sensors = new Array();
    this.getUserDevices().then(userDevices => {
      this.setState({sensorCount: userDevices.length});
      userDevices.forEach(device => {
        this.getPMValue(device.mac_add).then(pmsValue => {
          if (pmsValue.ok) {
            pmsValue.json().then(responseJson => {
              if (responseJson) {
                let color = this.pmsColorScale(responseJson[0].avg_pm25);
                sensors.push({
                  pmsValue: responseJson[0].avg_pm25,
                  color: color,
                  label: device.user_label,
                });
                // console.log(sensors);
                this.setState({
                  //Setting the data source
                  dataSource: sensors,
                });
              }
            });
          } else {
            Alert.alert('Could not get data! Error value', pmsValue.status);
          }
        });
      });
      // Initialize dummy flatlist data
      this.dataPreparation();
    });
  };

  render() {
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
