'use strict';

const FlowStartStopNode = {
  name: 'Flow start/stop',
  docs: 'https://docs.noodl.net/nodes/neue/flow-start-stop',
  category: 'Neue',
  color: 'neueData',
  initialize: function () {
    // Initialization code if needed
  },
  inputs: {},
  outputs: {
    'Flow did start out': {
      type: 'signal',
      displayName: 'Flow did start out'
    }
  },
  settings: {
    'Name': {
      type: 'string',
      displayName: 'Name',
      default: 'Flow start/stop'
    },
    'requiredAppVersion': {
      type: 'number',
      displayName: '',
      default: 1
    },
    'Notes': {
      type: 'string',
      displayName: 'Notes'
    }
  }
};

module.exports = {
  node: FlowStartStopNode
};
