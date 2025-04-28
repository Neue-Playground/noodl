'use strict';

const DeviceNode = {
  name: 'Transmit',
  docs: 'https://docs.noodl.net/nodes/neue/mqtt',
  category: 'Neue',
  color: 'neueData',
  initialize: function () {
    this._internal.inputs = [];
  },
  inputs: {
    'Transmit': {
      type: 'signal',
      group: 'Connection',
      displayName: 'Ping in',
      get() {
        return this._internal['Ping in'];
      }
    },
    'Data': {
      type: '*',
      group: 'Connection',
      displayName: 'Data'
    },
    'Table': {
      type: '*',
      group: 'Connection',
      displayName: 'Table'
    },
  },
  outputs: {
    'Transmission Complete': {
      type: 'string',
      group: 'Output',
      displayName: 'MQTT msg out',
      get() {
        return this._internal['MQTT msg out'];
      }
    },
    'MQTT pong out': {
      type: 'string',
      group: 'Connection',
      displayName: 'MQTT pong out',
      get() {
        return this._internal['MQTT pong out'];
      }
    },
    'Error out': {
      type: 'string',
      group: 'Output',
      displayName: 'Error out',
      get() {
        return this._internal['Error out'];
      }
    },
    'Status out': {
      type: 'string',
      group: 'Connection',
      displayName: 'Status out',
      get() {
        return this._internal['Status out'];
      }
    }
  }
};

module.exports = {
  node: DeviceNode
};
