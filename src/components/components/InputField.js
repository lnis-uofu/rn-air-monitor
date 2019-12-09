import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {StyleSheet, View, Image, TextInput} from 'react-native';
import {w, h, totalSize} from '../../api/Dimensions';
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

  textStyleChangeOnState = color => {
    return {
      width: w(80),
      height: h(6),
      marginHorizontal: w(6),
      paddingLeft: w(11),
      borderRadius: totalSize(3),
      borderBottomWidth: totalSize(0.15),
      color: color,
      borderBottomColor: color,
    };
  };

  render() {
    return (
      <View style={styles.inputWrapper}>
        <Image source={this.props.source} style={styles.inlineImg} />
        <TextInput
          style={this.textStyleChangeOnState(this.props.textFieldBoxColor)}
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
  textFieldBoxColor: PropTypes.string,
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
  textFieldBoxColor: '#ffffff',
  autoCapitalize: 'none',
};

const styles = StyleSheet.create({
  inputWrapper: {
    flex: 1,
  },
  inlineImg: {
    position: 'absolute',
    zIndex: 99,
    width: w(5),
    height: h(3),
    left: w(10),
    top: h(1.5),
  },
});
