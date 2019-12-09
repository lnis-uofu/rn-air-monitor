import React, {Component} from 'react';
import {
  Text,
  StyleSheet,
  View,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import {w, h, totalSize} from '../../../api/Dimensions';
import InputField from '../../components/InputField';
import {themeColor} from '../../../../App';

const homebgPath = require('../../../../assets/home_bg.png');
const passwordLogo = require('../../../../assets/password.png');
const emailLogo = require('../../../../assets/wifi.png');
const widgetWidth = w(90);
export default class DeviceRegistration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      wifiCredential: false,
      ssid: '',
      wifiPassword: '',
    };
    this.passwordInput = React.createRef();
    this.ssidInput = React.createRef();
  }

  focusPasswordAction = ssid => {
    this.setState({
      ssid: ssid,
    });
    this.passwordInput.focus();
  };

  ssidInputHandler = text => {
    this.setState({ssid: text});
  };

  pwdInputHandler = text => {
    this.setState({wifiPassword: text});
  };

  wifiCredsDone = () => {
    this.setState({wifiCredential: true});
    console.log('ssid/pwd:', this.state.ssid, this.state.wifiPassword);
  };

  render() {
    return (
      <ImageBackground source={homebgPath} style={styles.backgroundStyle}>
        <View style={styles.credentialContainerStyle}>
          <InputField
            source={emailLogo}
            placeholder={'SSID'}
            secureTextEntry={false}
            autoCorrect={false}
            returnKeyType={'next'}
            maxLength={25}
            textFieldBoxColor={themeColor.bright}
            onSubmitEditingFunc={({nativeEvent}) =>
              this.focusPasswordAction(nativeEvent.text)
            }
            onChangeTextFunc={this.ssidInputHandler}
            ref={input => {
              this.ssidInput = input;
            }}
          />
          <InputField
            source={passwordLogo}
            placeholder={'PASSWORD'}
            secureTextEntry={true}
            autoCorrect={false}
            returnKeyType={'done'}
            maxLength={25}
            textFieldBoxColor={themeColor.bright}
            onSubmitEditingFunc={this.wifiCredsDone}
            onChangeTextFunc={this.pwdInputHandler}
            ref={input => {
              this.passwordInput = input;
            }}
          />
        </View>
        <View style={styles.tabView}>
          <TouchableOpacity
            style={styles.processDoneStyle}
            onPress={this.props.onRegistrationDone}>
            <Text style={styles.processDoneText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.processDoneStyle}
            onPress={this.wifiCredsDone}>
            <Text style={styles.processDoneText}>Next</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }
}

DeviceRegistration.propTypes = {
  onRegistrationDone: PropTypes.func,
};

DeviceRegistration.defaultProps = {
  onRegistrationDone: () => {
    console.log('No function bind!!??');
  },
};

const styles = StyleSheet.create({
  backgroundStyle: {
    flex: 1,
    alignItems: 'center',
    width: w(100),
    height: h(100),
  },
  tabView: {
    flex: 0,
    flexDirection: 'row',
    marginBottom: h(4),
    width: w(90),
    height: h(6),
  },
  credentialContainerStyle: {
    alignItems: 'center',
    backgroundColor: '#71AC7F',
    marginTop: h(20),
    marginBottom: h(5),
    width: widgetWidth,
    height: h(17),
    borderRadius: totalSize(2),
  },
  processDoneText: {
    textAlign: 'center',
    fontSize: totalSize(2.4),
    fontWeight: '200',
    color: '#71AC7F',
    marginTop: h(0.7),
  },
  processDoneStyle: {
    flex: 1,
    alignItems: 'center',
    height: h(5),
    width: widgetWidth / 2,
    borderWidth: 1,
    borderColor: '#71AC7F',
    borderRadius: totalSize(2),
  },
});
