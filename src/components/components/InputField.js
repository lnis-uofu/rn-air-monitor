import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {StyleSheet, View, Image, TextInput} from 'react-native';
import {w, h} from '../../api/Dimensions';

export default class InputField extends Component {
  constructor() {
    super();
    this.state = {
      text: '',
    };
  }

  setInputValue = text => {
    this._setState({text: text});
  };

  getInputValue = () => {
    return this.state.text;
  };

  focus = () => this.input.focus();
  clear = () => this.input.clear();

  render() {
    return (
      <View style={styles.inputWrapper}>
        <Image source={this.props.source} style={styles.inlineImg} />
        <TextInput
          style={styles.input}
          placeholder={this.props.placeholder}
          secureTextEntry={this.props.secureTextEntry}
          autoCorrect={this.props.autoCorrect}
          autoCapitalize={this.props.autoCapitalize}
          returnKeyType={this.props.returnKeyType}
          maxLength={this.props.maxLength}
          placeholderTextColor="rgba(255,255,255,0.4)"
          underlineColorAndroid="transparent"
          onSubmitEditing={this.props.onSubmitEditingFunc}
          onChangeText={this.props.onChangeTextFunc}
          ref={ref => (this.input = ref)}
        />
      </View>
    );
  }
}

InputField.propTypes = {
  source: PropTypes.number.isRequired,
  placeholder: PropTypes.string.isRequired,
  secureTextEntry: PropTypes.bool,
  autoCorrect: PropTypes.bool,
  autoCapitalize: PropTypes.string,
  returnKeyType: PropTypes.string,
  maxLength: PropTypes.number,
  onChangeTextFunc: PropTypes.func,
  onSubmitEditingFunc: PropTypes.func,
};

InputField.defaultProps = {
  focus: () => {},
  style: {},
  placeholder: '',
  blurOnSubmit: false,
  returnKeyType: 'next',
  error: false,
  keyboardType: null,
  secureTextEntry: false,
  autoCapitalize: 'none',
};

const styles = StyleSheet.create({
  input: {
    width: w(80),
    height: h(7),
    marginHorizontal: 20,
    paddingLeft: 45,
    borderRadius: 20,
    color: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff',
  },
  inputWrapper: {
    flex: 1,
  },
  inlineImg: {
    position: 'absolute',
    zIndex: 99,
    width: w(5),
    height: h(3),
    left: w(10),
    top: h(1.7),
  },
});
