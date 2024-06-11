'use strict';

const ButtonNode = {
  name: 'Button',
  docs: 'https://docs.noodl.net/nodes/neue/button',
  category: 'Neue',
  color: 'neueSensor',
  initialize: function () {
    this._internal.inputs = [];
  },
  inputs: {},
  outputs: {
    'Trigger out': {
      type: 'signal',
      displayName: 'Trigger out'
    }
  },
  settings: {
    'Name': {
      type: 'string',
      displayName: 'Name',
      default: 'Button'
    },
    'requiredAppVersion': {
      type: 'number',
      displayName: '',
      default: 1
    }
  }
};

module.exports = {
  node: ButtonNode
};
