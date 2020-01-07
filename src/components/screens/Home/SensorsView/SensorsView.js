import React, {Component} from 'react';
import {StyleSheet, View, FlatList, TouchableOpacity, Text} from 'react-native';
import {h, w, totalSize} from '../../../../api/Dimensions';

const locations = [
  'West Valley, UT',
  'Murray, UT',
  'Sugar House, UT',
  'Sandy, UT',
  'Cottonwood Heights, UT',
  'Holladay, UT',
];
export class SensorsView extends Component {
  constructor() {
    super();
    this.state = {
      dataSource: {},
    };
  }
  componentDidMount() {
    var that = this;
    let sensors = Array.apply(null, Array(10)).map((v, i) => {
      const pmsValue = 40 * i;
      let color = 'rgba(0,255,0,0.6)';
      const position = Math.floor(Math.random() * Math.floor(6));

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
      return {id: pmsValue, color: color, location: locations[position]};
    });
    that.setState({
      //Setting the data source
      dataSource: sensors,
    });
  }
  render() {
    return (
      <View style={styles.MainContainer}>
        <FlatList
          data={this.state.dataSource}
          renderItem={({item}) => (
            <View style={{flex: 1, flexDirection: 'column', margin: 1}}>
              <TouchableOpacity
                style={[styles.sensorContainer, {backgroundColor: item.color}]}>
                <Text style={styles.sensorPmsData}>{item.id}</Text>
              </TouchableOpacity>
              <Text style={styles.sensorLabel}>{item.location}</Text>
            </View>
          )}
          //Setting the number of column
          numColumns={3}
          keyExtractor={(item, index) => index}
        />
      </View>
    );
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
    // backgroundColor: "rgba(0,200,0,0.6)"
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
    // height: h(10),
  },
});

export default SensorsView;
