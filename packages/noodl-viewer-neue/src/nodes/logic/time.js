'use strict';

const DeviceNode = {
  name: 'Time',
  docs: 'https://docs.noodl.net/nodes/utilities/logic/condition',
  category: 'Neue',
  color: 'neueLogic',
  initialize: function () {
    this._internal.inputs = [];
  },

  inputs: {
    'Date: YYYYmmdd': {
      type: 'string',
      displayName: 'Date: YYYYmmdd'
    },
    'Date: HHmmss': {
      type: 'string',
      displayName: 'Date: HHmmss'
    },
    'Date format (yy-MM-dd HH:mm:ss': {
      type: 'string',
      displayName: 'Date format (yy-MM-dd HH:mm:ss'
    },
    'Repeat every x seconds': {
      type: 'number',
      displayName: 'Repeat every x seconds'
    },
    'Trig in': {
      type: {
        name: '*',
        allowConnectionsOnly: true
      },
      displayName: 'Trig in'
    },
  },
  outputs: {
    'Trigger out': {
      type: 'signal',
      displayName: 'Trigger out'
    },
    'Unix time out': {
      type: 'number',
      displayName: 'Unix time out'
    },
    'String time': {
      type: 'string',
      displayName: 'String time'
    }
  }
};

module.exports = {
  node: DeviceNode
};
