'use strict';

const DeviceNode = {
  name: 'Timer',
  docs: 'https://docs.noodl.net/nodes/utilities/logic/condition',
  category: 'Logic',
  color: 'visual',
  initialize: function () {
    this._internal.inputs = [];
  },

  inputs: {
    "Trigger count": {
      type: 'number',
      displayName: 'Trigger count'
    },
    "ON/OFF": {
      type: 'boolean',
      displayName: 'ON/OFF',
    },
    "Output 1 count": {
      type: {
        name: 'number',
        allowEditOnly: true
      },
      displayName: 'Output 1 count',
    },
    "Output 2 count": {
      type: {
        name: 'number',
        allowEditOnly: true
      },
      displayName: 'Output 2 count',
    },
    "Output 3 count": {
      type: {
        name: 'number',
        allowEditOnly: true
      },
      displayName: 'Output 3 count',
    },
    "Output 4 count": {
      type: {
        name: 'number',
        allowEditOnly: true
      },
      displayName: 'Output 4 count',
    },
    "Output 5 count": {
      type: {
        name: 'number',
        allowEditOnly: true
      },
      displayName: 'Output 5 count',
    },
    "Output 6 count": {
      type: {
        name: 'number',
        allowEditOnly: true
      },
      displayName: 'Output 6 count',
    },
    "Output 7 count": {
      type: {
        name: 'number',
        allowEditOnly: true
      },
      displayName: 'Output 7 count',
    },
    "Output 8 count": {
      type: {
        name: 'number',
        allowEditOnly: true
      },
      displayName: 'Output 8 count',
    },
    "Mode": {
      type: {
        name: 'enum',
        allowEditOnly: true,
        enums: [
          {
            label: 'Count sequence when triggered',
            value: 'Count sequence when triggered'
          },
          {
            label: 'Continous counting',
            value: 'Continous counting'
          }
        ]
      },
    }

  },
  outputs: {
    "Counter 1": {
      type: 'signal',
      displayName: 'Counter 1',
    },
    "Counter 2": {
      type: 'signal',
      displayName: 'Counter 2',
    },
    "Counter 3": {
      type: 'signal',
      displayName: 'Counter 3',
    },
    "Counter 4": {
      type: 'signal',
      displayName: 'Counter 4',
    },
    "Counter 5": {
      type: 'signal',
      displayName: 'Counter 5',
    },
    "Counter 6": {
      type: 'signal',
      displayName: 'Counter 6',
    },
    "Counter 7": {
      type: 'signal',
      displayName: 'Counter 7',
    },
    "Counter 8": {
      type: 'signal',
      displayName: 'Counter 8',
    }
  }
};

module.exports = {
  node: DeviceNode
};
