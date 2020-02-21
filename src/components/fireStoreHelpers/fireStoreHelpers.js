import FireStoreConstants from '../Constants/fireStoreConstants';
import firebase from 'react-native-firebase';
const usersCollection = 'users';

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

  static addDeviceInfoToFireBaseDataBase = async (macAddress, label) => {
    console.log('Get devices info!');
    var isDuplicated = false;
    var dev_map = {mac_add: macAddress, user_label: label};
    const refUser = await firebase
      .firestore()
      .collection(usersCollection)
      .doc(global.email);

    console.log('firestoreHelpers.addDeviceInfoToFireBaseDataBase');
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
            console.log(device.mac_add);
            console.log(macAddress);
            if (macAddress.includes(device.mac_add)) {
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
}
