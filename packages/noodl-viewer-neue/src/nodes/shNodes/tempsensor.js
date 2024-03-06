'use strict';

const DeviceNode = {
  name: 'Temperature/Humidity',
  docs: 'https://www.neue.se/support-documentation/building-an-app/patches-the-building-blocks/',
  category: 'Neue',
  color: 'neue',
  initialize: function () {
    this._internal.inputs = [];
  },
  inputs: {},
  outputs: {
    "Temp/Humidity": {
      type: 'array',
      displayName: 'Temp/Humidity',
      getter: function () {
        return [this._internal["Temperature"], this._internal["Humidity"]];
      }
    },
    "Temperature": {
      type: 'number',
      displayName: 'Temperature',
      getter: function () {
        return this._internal.temperature;
      }
    },
    "Humidity": {
      type: 'number',
      displayName: 'Humidity',
      getter: function () {
        return this._internal.humidity;
      }
    }
  }
};

module.exports = {
  node: DeviceNode
};
