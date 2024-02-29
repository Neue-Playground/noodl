'use strict';

const DeviceNode = {
  name: 'MQTT',
  docs: 'https://www.neue.se/support-documentation/building-an-app/patches-the-building-blocks/',
  category: 'Neue',
  color: 'neue',
  initialize: function () {
    this._internal.inputs = [];
  },
  inputs: {},
  outputs: {
    value: {
      type: 'array',
      displayName: 'Input',
      getter: function () {
        return [this._internal.temperature, this._internal.humidity];
      }
    }
  }
};

module.exports = {
  node: DeviceNode
};
