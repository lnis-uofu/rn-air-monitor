import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {ActivityIndicator, StyleSheet, Modal, View} from 'react-native';

export default class Loader extends Component {
  render() {
    console.log('is loading ' + this.props.isLoading);
    return (
      <Modal
        style={styles.modalStyle}
        transparent={true}
        animationType={'none'}
        visible={this.props.isLoading}>
        <View style={styles.modalStyle}>
          <ActivityIndicator
            style={styles.loadingIcon}
            size={this.props.indicatorSize}
            color={this.props.indicatorColor}
            animating={this.props.isLoading}
          />
        </View>
      </Modal>
    );
  }
}

Loader.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  indicatorSize: PropTypes.string,
  indicatorColor: PropTypes.string,
  backGroundColor: PropTypes.string,
};
const styles = StyleSheet.create({
  loadingIcon: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  modalStyle: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    backgroundColor: 'rgba(32, 32, 32, 0.3)',
  },
});
