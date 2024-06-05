'use strict';

const FunnelNode = {
  name: 'Funnel',
  docs: 'https://docs.noodl.net/nodes/core/funnel',
  category: 'Core',
  color: 'core',
  initialize: function () {
    // Initialization code if needed
  },
  inputs: {},
  outputs: {
    'Funnel out': {
      type: 'signal',
      displayName: 'Funnel out'
    }
  },
  settings: {
    'Name': {
      type: 'string',
      displayName: 'Name',
      default: 'Funnel'
    },
    'requiredAppVersion': {
      type: 'number',
      displayName: '',
      default: 1
    }
  }
};

module.exports = {
  node: FunnelNode
};
