'use strict';

const DeviceNode = {
  name: 'Accelerometer',
  docs: 'https://www.neue.se/support-documentation/building-an-app/patches-the-building-blocks/',
  category: 'Neue',
  color: 'neue',
  initialize: function () {
    this._internal.inputs = [];
  },

  inputs: {
    gyroscopeActive: {
      group: 'Gyroscope',
      type: 'boolean',
      displayName: 'Gyroscope  off',
      default: false,
      get() {
        return this._internal.gyroscopeActive;
      }
    },
    accelerometerActive: {
      group: 'Accelerometer',
      type: 'boolean',
      displayName: 'Accelerometer off',
      default: false,
      get() {
        return this._internal.accelerometerActive;
      }
    },
    sensorUpdateRate: {
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
        return this._internal.sensorUpdateRate;
      }
    },
    accelerometerScale: {
      group: 'Accelerometer',
      type: {
        name: 'enum',
        enums: [
          {
            label: '2G',
            value: '2'
          },
          {
            label: '4G',
            value: '4'
          },
          {
            label: '8G',
            value: '8'
          },
          {
            label: '16G',
            value: '16'
          }
        ]
      },
      default: '2',
      displayName: 'Accelerometer scale',
      get() {
        return this._internal.accelerometerScale;
      }
    },
    gyroMaxDegrees: {
      group: 'Gyroscope',
      type: {
        name: 'enum',
        enums: [
          {
            label: '250 DPS',
            value: '250'
          },
          {
            label: '500 DPS',
            value: '500'
          },
          {
            label: '1000 DPS',
            value: '1000'
          },
          {
            label: '2000 DPS',
            value: '2000'
          }
        ]
      },
      default: '250',
      displayName: 'Gyro max degrees per second',
      get() {
        return this._internal.gyroMaxDegrees;
      }
    },
    performanceMode: {
      group: 'General',
      type: {
        name: 'enum',
        enums: [
          {
            label: 'Low power',
            value: 'low'
          },
          {
            label: 'High performance',
            value: 'high'
          }
        ]
      },
      default: 'low',
      displayName: 'Performance mode',
      get() {
        return this._internal.performanceMode;
      }
    },
    eventType: {
      group: 'General',
      type: {
        name: 'enum',
        enums: [
          {
            label: 'None',
            value: 'none'
          },
          {
            label: 'Single tap',
            value: 'single'
          },
          {
            label: 'FA2 single tap',
            value: 'fa2'
          },
          {
            label: 'Double tap',
            value: 'double'
          },
          {
            label: 'Free fall',
            value: 'free-fall'
          },
          {
            label: '6D orientation detection',
            value: '6d'
          },
          {
            label: 'Activity/inactivity recoqnition',
            value: 'activity'
          }
        ]
      },
      default: 'none',
      displayName: 'Event type',
      get() {
        return this._internal.eventType;
      }
    }
  },
  outputs: {
    accelerometerValue: {
      group: 'Sensor Data',
      type: 'number',
      displayName: 'Accelerometer',
      get() {
        return this._internal.accelerometerValue;
      }
    },
    gyroscopeValue: {
      group: 'Sensor Data',
      type: 'number',
      displayName: 'Gyroscope',
      get() {
        return this._internal.gyroscopeValue;
      }
    },
    accGyroValue: {
      group: 'Sensor Data',
      type: 'number',
      displayName: 'Acc/Gyro',
      get() {
        return this._internal.accGyroValue;
      }
    },
    accEvent: {
      group: 'Sensor Data',
      type: 'number',
      displayName: 'Acc event',
      get() {
        return this._internal.accEvent;
      }
    },
    accelerometerVector: {
      group: 'Sensor Data',
      type: 'number',
      displayName: 'Acc vector length',
      get() {
        return this._internal.accelerometerVector;
      }
    }
  }
};

module.exports = {
  node: DeviceNode
};
