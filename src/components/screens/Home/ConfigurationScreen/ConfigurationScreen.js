import React, {Component} from 'react';
import {TouchableOpacity, Text, FlatList, StyleSheet, View} from 'react-native';
import {w, h, totalSize} from '../../../../api/Dimensions';
import firebase from 'react-native-firebase';
import PropTypes from 'prop-types';

const labels = {
  logOut: 'Log out',
  goBack: 'Go back',
};
export class ConfigurationScreen extends Component {
  onSelect = title => {
    switch (title) {
      case labels.logOut:
        console.log('Logging out');
        firebase
          .auth()
          .signOut()
          .then(() => {
            console.log('signed out');
          })
          .catch(error => {
            console.log(error);
          });
        break;
      case labels.goBack:
        console.log('Go back to previous screen');
        this.props.onDone();
        break;
      default:
        console.log('No Option available');
    }
  };
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Configuration Page</Text>
        </View>
        <FlatList
          data={DATA}
          renderItem={({item}) => (
            <Item title={item.title} onSelect={this.onSelect} />
          )}
        />
      </View>
    );
  }
}
const DATA = [
  {
    id: 'logoutId',
    title: labels.logOut,
  },
  {
    id: 'goBackId',
    title: labels.goBack,
  },
];

function Item({title, onSelect}) {
  return (
    <TouchableOpacity onPress={() => onSelect(title)} style={[styles.item]}>
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
}

ConfigurationScreen.propTypes = {
  onDone: PropTypes.func,
};

ConfigurationScreen.defaultProps = {
  onDone: () => {
    console.log('No function bind!!??');
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    width: w(100),
    height: h(6),
    alignItems: 'center',
    backgroundColor: 'rgba(10,10,10,0.6)',
    marginBottom: h(4),
  },
  headerText: {
    fontSize: totalSize(2),
    color: 'white',
    marginVertical: h(1.5),
  },
  item: {
    backgroundColor: 'rgba(10,10,10,0.2)',
    padding: h(2),
    marginVertical: h(0.2),
    alignItems: 'center',
  },
  title: {
    fontSize: totalSize(2),
  },
});

export default ConfigurationScreen;
