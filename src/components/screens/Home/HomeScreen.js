import React from 'react';
import firebase from 'react-native-firebase';
import {View, Text, Button} from 'react-native';
export default class HomeScreen extends React.Component {
  render() {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <Text>Home Screen</Text>
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
      </View>
    );
  }
}
