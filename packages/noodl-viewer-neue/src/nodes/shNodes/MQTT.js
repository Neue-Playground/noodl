'use strict';

const DeviceNode = {
  name: 'MQTT',
  docs: 'https://docs.noodl.net/nodes/neue/mqtt',
  category: 'Neue',
  color: 'neue',
  initialize: function () {
    this._internal.inputs = [];
  },
  inputs: {
    pingIn: {
      type: 'signal',
      group: 'Connection',
      displayName: 'Ping in',
      get() {
        return this._internal.pingIn;
      }
    },
    publishMessage: {
      type: 'string',
      group: 'Message',
      displayName: 'Publish msg in',
      get() {
        return this._internal.publishMessage;
      }
    },
    topic: {
      type: 'string',
      group: 'Message',
      displayName: 'Topic',
      get() {
        return this._internal.topic;
      }
    },
    clientID: {
      type: 'string',
      group: 'Settings',
      displayName: 'Client ID',
      get() {
        return this._internal.clientID;
      }
    },
    username: {
      type: 'string',
      group: 'Settings',
      displayName: 'Username',
      get() {
        return this._internal.username;
      }
    },
    password: {
      type: 'string',
      group: 'Settings',
      displayName: 'Password',
      get() {
        return this._internal.password;
      }
    },
    port: {
      type: 'number',
      group: 'Settings',
      displayName: 'Port',
      get() {
        return this._internal.port;
      }
    },
    host: {
      type: 'string',
      group: 'Settings',
      displayName: 'Host',
      get() {
        return this._internal.host;
      }
    },
    connect: {
      type: 'boolean',
      group: 'Connection',
      displayName: 'Connect',
      get() {
        return this._internal.connect;
      }
    },
    subscribe: {
      type: 'boolean',
      group: 'Connection',
      displayName: 'Subscribe',
      get() {
        return this._internal.subscribe;
      }
    },
    useSSL: {
      type: 'boolean',
      group: 'Connection',
      displayName: 'UseSSL',
      get() {
        return this._internal.useSSL;
      }
    }
  },
  outputs: {
    messageOut: {
      type: 'string',
      group: 'Output',
      displayName: 'MQTT msg out',
      get() {
        return this._internal.messageOut;
      }
    },
    pongOut: {
      type: 'string',
      group: 'Connection',
      displayName: 'MQTT pong out',
      get() {
        return this._internal.pongOut;
      }
    },
    errorOut: {
      type: 'string',
      group: 'Output',
      displayName: 'Error out',
      get() {
        return this._internal.errorOut;
      }
    },
    statusOut: {
      type: 'string',
      group: 'Connection',
      displayName: 'Status out',
      get() {
        return this._internal.statusOut;
      }
    }
  }
};

module.exports = {
  node: DeviceNode
};
