'use strict';

const DeviceNode = {
  name: 'Temperature Sensor',
  docs: 'https://www.neue.se/support-documentation/building-an-app/patches-the-building-blocks/',
  category: 'Neue',
  color: 'neue',
  initialize: function () {
    this._internal.inputs = [];
  },
  getInspectInfo() {
    return and(this._internal.inputs);
  },
  inputs: {
  },
  outputs: {
    value: {
      type: 'array',
      displayName: 'Temp/humidity',
      getter: function () {
        return [this._internal.temperature, this._internal.humidity];
      }
    },
    temperature: {
      type: 'number',
      displayName: 'Temperature',
      getter: function () {
        return this._internal.temperature;
      }
    },
    humidity: {
      type: 'number',
      displayName: 'Humidity',
      getter: function () {
        return this._internal.humidity;
      }
    },
  }
};

module.exports = {
  node: DeviceNode
};

function and(values) {
  //if none are false, then return true
  return values.length > 0 && values.some((v) => !v) === false;
}
