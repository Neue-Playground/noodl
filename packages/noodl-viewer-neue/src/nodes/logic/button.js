'use strict';

const ButtonNode = {
  name: 'Button',
  docs: 'https://docs.noodl.net/nodes/neue/button',
  category: 'Neue',
  color: 'neueData',
  initialize: function () {
    // Initialization code if needed
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
