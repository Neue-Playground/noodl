'use strict';

const DeviceNode = {
  name: 'MQTT',
  docs: 'https://docs.noodl.net/nodes/neue/mqtt',
  category: 'Neue',
  color: 'neueData',
  initialize: function () {
    this._internal.inputs = [];
  },
  inputs: {
    'Ping in': {
      type: 'signal',
      group: 'Connection',
      displayName: 'Ping in',
      get() {
        return this._internal['Ping in'];
      }
    },
    'Publish msg in': {
      type: 'string',
      group: 'Message',
      displayName: 'Publish msg in',
      get() {
        return this._internal['Publish msg in'];
      }
    },
    Topic: {
      type: 'string',
      group: 'Message',
      displayName: 'Topic',
      get() {
        return this._internal['Topic'];
      }
    },
    'Client ID': {
      type: 'string',
      group: 'Settings',
      displayName: 'Client ID',
      get() {
        return this._internal['Client ID'];
      }
    },
    Username: {
      type: 'string',
      group: 'Settings',
      displayName: 'Username',
      get() {
        return this._internal['Username'];
      }
    },
    Password: {
      type: 'string',
      group: 'Settings',
      displayName: 'Password',
      get() {
        return this._internal['Password'];
      }
    },
    Port: {
      type: 'number',
      group: 'Settings',
      displayName: 'Port',
      get() {
        return this._internal['Port'];
      }
    },
    Host: {
      type: 'string',
      group: 'Settings',
      displayName: 'Host',
      get() {
        return this._internal['Host'];
      }
    },
    Connect: {
      type: 'boolean',
      group: 'Connection',
      displayName: 'Connect',
      get() {
        return this._internal['Connect'];
      }
    },
    Subscribe: {
      type: 'boolean',
      group: 'Connection',
      displayName: 'Subscribe',
      get() {
        return this._internal['Subscribe'];
      }
    },
    UseSSL: {
      type: 'boolean',
      group: 'Connection',
      displayName: 'UseSSL',
      get() {
        return this._internal['UseSSL'];
      }
    }
  },
  outputs: {
    'MQTT msg out': {
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
