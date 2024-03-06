'use strict';

const DeviceNode = {
  name: 'Accelerometer/Gyroscope',
  docs: 'https://www.neue.se/support-documentation/building-an-app/patches-the-building-blocks/',
  category: 'Neue',
  color: 'neue',
  initialize: function () {
    this._internal.inputs = [];
  },

  inputs: {
    "Gyroscope  off": {
      group: 'Gyroscope',
      type: 'boolean',
      displayName: 'Gyroscope  off',
      default: false,
      get() {
        return this._internal["Gyroscope  off"];
      }
    },
    "Accelerometer off": {
      group: 'Accelerometer',
      type: 'boolean',
      displayName: 'Accelerometer off',
      default: false,
      get() {
        return this._internal["Accelerometer off"];
      }
    },
    "Sensor update rate": {
      group: 'General',
      type: {
        name: 'enum',
        enums: [
          {
            label: '13 Hz',
            value: '13'
          },
          {
            label: '26  Hz',
            value: '26'
          },
          {
            label: '52  Hz',
            value: '52'
          }
        ]
      },
      default: '13',
      displayName: 'Sensor update rate',
      get() {
        return this._internal["Sensor update rate"];
      }
    },
    "Accelerometer scale": {
      group: 'Accelerometer',
      type: {
        name: 'enum',
        enums: [
          {
            label: '2G',
            value: '2G'
          },
          {
            label: '4G',
            value: '4G'
          },
          {
            label: '8G',
            value: '8G'
          },
          {
            label: '16G',
            value: '16G'
          }
        ]
      },
      default: '2',
      displayName: 'Accelerometer scale',
      get() {
        return this._internal["Accelerometer scale"];
      }
    },
    "Gyro max degrees per second": {
      group: 'Gyroscope',
      type: {
        name: 'enum',
        enums: [
          {
            label: '250 DPS',
            value: '250 DPS'
          },
          {
            label: '500 DPS',
            value: '500 DPS'
          },
          {
            label: '1000 DPS',
            value: '1000 DPS'
          },
          {
            label: '2000 DPS',
            value: '2000 DPS'
          }
        ]
      },
      default: '250',
      displayName: 'Gyro max degrees per second',
      get() {
        return this._internal["Gyro max degrees per second"];
      }
    },
    "Performance mode": {
      group: 'General',
      type: {
        name: 'enum',
        enums: [
          {
            label: 'Low power',
            value: 'Low power'
          },
          {
            label: 'High performance',
            value: 'Low power'
          }
        ]
      },
      default: 'low',
      displayName: 'Performance mode',
      get() {
        return this._internal["Performance mode"];
      }
    },
    "Event type": {
      group: 'General',
      type: {
        name: 'enum',
        enums: [
          {
            label: 'None',
            value: 'None'
          },
          {
            label: 'Single tap',
            value: 'Single tap'
          },
          {
            label: 'FA2 single tap',
            value: 'FA2 single tap'
          },
          {
            label: 'Double tap',
            value: 'Double tap'
          },
          {
            label: 'Free fall',
            value: 'Free fall'
          },
          {
            label: '6D orientation detection',
            value: '6D orientation detection'
          },
          {
            label: 'Activity/inactivity recoqnition',
            value: 'Activity/inactivity recoqnition'
          }
        ]
      },
      default: 'none',
      displayName: 'Event type',
      get() {
        return this._internal["Event type"];
      }
    }
  },
  outputs: {
    "Accelerometer": {
      group: 'Sensor Data',
      type: 'number',
      displayName: 'Accelerometer',
      get() {
        return this._internal["Accelerometer"];
      }
    },
    "Gyroscope": {
      group: 'Sensor Data',
      type: 'number',
      displayName: 'Gyroscope',
      get() {
        return this._internal["Gyroscope"];
      }
    },
    "Acc/Gyro": {
      group: 'Sensor Data',
      type: 'number',
      displayName: 'Acc/Gyro',
      get() {
        return this._internal["Acc/Gyro"];
      }
    },
    "Acc event": {
      group: 'Sensor Data',
      type: 'number',
      displayName: 'Acc event',
      get() {
        return this._internal["Acc event"];
      }
    },
    "Acc vector length": {
      group: 'Sensor Data',
      type: 'number',
      displayName: 'Acc vector length',
      get() {
        return this._internal["Acc vector length"];
      }
    }
  }
};

module.exports = {
  node: DeviceNode
};
