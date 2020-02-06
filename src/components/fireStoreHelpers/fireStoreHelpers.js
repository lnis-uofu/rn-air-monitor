import FireStoreConstants from '../Constants/fireStoreConstants';
import firebase from 'react-native-firebase';

export default class FireStoreHelper {
  static async getUserDevices() {
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
}
