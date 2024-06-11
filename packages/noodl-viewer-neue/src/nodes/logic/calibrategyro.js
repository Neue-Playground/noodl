'use strict';

const CalibrateGyroNode = {
  name: 'Calibrate gyro',
  docs: 'https://docs.noodl.net/nodes/core/calibrate-gyro',
  category: 'Neue',
  color: 'neueSensor',
  initialize: function () {
    this._internal.inputs = [];
  },
  inputs: {
    'Gyro list in': {
      displayName: 'Gyro list in',
      type: 'list'
    }
  },
  outputs: {
    'Processed out': {
      displayName: 'Processed out',
      type: 'list'
    },
    'Calibration finished out': {
      displayName: 'Calibration finished out',
      type: 'signal'
    }
  },
  settings: {
    'Name': {
      displayName: 'Name',
      type: 'string',
      default: 'Calibrate gyro'
    },
    'requiredAppVersion': {
      displayName: '',
      type: 'number',
      default: 1
    },
    'X_offset': {
      displayName: 'X offset',
      type: 'number',
      default: 0
    },
    'Y_offset': {
      displayName: 'Y offset',
      type: 'number',
      default: 0
    },
    'Z_offset': {
      displayName: 'Z offset',
      type: 'number',
      default: 0
    },
    'Notes': {
      displayName: 'Notes',
      type: 'string',
      default: ''
    },
    'Trigger calibrate': {
      displayName: 'Trigger calibrate',
      type: 'button',
      default: false
    }
  }
};

module.exports = {
  node: CalibrateGyroNode
};
