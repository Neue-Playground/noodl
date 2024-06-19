'use strict';

const FunnelNode = {
  name: 'Funnel',
  docs: 'https://docs.noodl.net/nodes/core/funnel',
  category: 'Neue',
  color: 'neueLogic',
  initialize: function () {
    this._internal.inputs = [];
  },
  inputs: {
    'In 1': {
      type: '*',
      displayName: 'In 1',
    },
    'In 2': {
      type: '*',
      displayName: 'In 2',
    },
    'In 3': {
      type: '*',
      displayName: 'In 3',
    },
    'In 4': {
      type: '*',
      displayName: 'In 4',
    },
    'In 5': {
      type: '*',
      displayName: 'In 5',
    },
    'In 6': {
      type: '*',
      displayName: 'In 6',
    },
  },
  outputs: {
    'Funnel out': {
      type: '*',
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
