export default class FireStoreConstant {
  static collections = {
    users: 'users',
    devices: 'devices',
    mac_addresses: 'mac_addresses',
  };

  static documentField = {
    users: {
      devices: 'devices',
      email: 'email',
      first_name: 'first_name',
      last_name: 'last_name',
    },
  };
}
