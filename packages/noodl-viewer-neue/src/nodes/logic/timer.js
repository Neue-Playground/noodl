'use strict';

const DeviceNode = {
  name: 'Timer',
  docs: 'https://docs.noodl.net/nodes/utilities/logic/condition',
  category: 'Neue',
  color: 'neueLogic',
  initialize: function () {
    this._internal.inputs = [];
  },

  inputs: {
    'Time': {
      type: {
        name: 'number',
        allowEditOnly: true
      },
      displayName: 'Time (s)'
    },
    'Start/Reset': {
      type: {
        name: '*',
        allowConnectionOnly: true
      },
      displayName: 'Start/Reset'
    },
  },
  outputs: {
    'Finished': {
      type: 'signal',
      displayName: 'Finished'
    },
  }
};

module.exports = {
  node: DeviceNode
};
