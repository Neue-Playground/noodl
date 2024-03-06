'use strict';

const DeviceNode = {
  name: 'Range',
  docs: 'https://www.neue.se/support-documentation/building-an-app/patches-the-building-blocks/',
  category: 'Neue',
  color: 'visual',
  initialize: function () {
    this._internal.inputs = [];
  },

  inputs: {
    "Value in": {
      type: 'number',
      displayName: 'Value in',
      get() {
        return this._internal["Value in"];
      }
    },
    "Input range min": {
      type: 'number',
      displayName: 'Input range min',
      get() {
        return this._internal["Input range min"];
      }
    },
    "Input range max": {
      type: 'number',
      displayName: 'Input range max',
      get() {
        return this._internal["Input range max"];
      }
    },
    "Output range min": {
      type: 'number',
      displayName: 'Output range min',
      get() {
        return this._internal["Output range min"];
      }
    },
    "Output range max": {
      type: 'number',
      displayName: 'Output range max',
      get() {
        return this._internal["Output range max"];
      }
    }
  },
  outputs: {
    "Value out": {
      type: 'number',
      displayName: 'Value out',
      get() {
        return this._internal["Value out"];
      }
    }
  }
};

module.exports = {
  node: DeviceNode
};
