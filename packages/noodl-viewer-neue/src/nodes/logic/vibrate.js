'use strict';

const VibrateNode = {
  name: 'Vibrate',
  docs: 'https://docs.noodl.net/nodes/neue/vibrate',
  category: 'Neue',
  color: 'neueLogic',
  initialize: function () {
    this._internal.inputs = [];
  },
  inputs: {
    'Vibrate trig in': {
      type: 'signal',
      displayName: 'Vibrate trig in'
    }
  },
  outputs: {},
  settings: {
    'Name': {
      type: 'string',
      displayName: 'Name',
      default: 'Vibrate iOS device'
    },
    'requiredAppVersion': {
      type: 'number',
      displayName: '',
      default: 1
    },
    'Notes': {
      type: 'string',
      displayName: 'Notes',
      default: ''
    }
  }
};

module.exports = {
  node: VibrateNode
};
