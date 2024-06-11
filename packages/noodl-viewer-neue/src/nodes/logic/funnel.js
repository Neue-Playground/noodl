'use strict';

const FunnelNode = {
  name: 'Funnel',
  docs: 'https://docs.noodl.net/nodes/core/funnel',
  category: 'Neue',
  color: 'neueLogic',
  initialize: function () {
    this._internal.inputs = [];
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
