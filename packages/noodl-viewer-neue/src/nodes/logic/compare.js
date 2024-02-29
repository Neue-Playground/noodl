'use strict';

const DeviceNode = {
  name: 'Compare',
  docs: 'https://docs.noodl.net/nodes/utilities/logic/condition',
  category: 'Logic',
  color: 'visual',
  initialize: function () {
    this._internal.inputs = [];
  },

  inputs: {
    value: {
      type: 'number',
      displayName: 'Value'
    },
    threshold1: {
      type: 'number',
      displayName: 'Threshold 1',
      group: 'Threshold'
    },
    threshold2: {
      type: 'number',
      displayName: 'Threshold 2',
      group: 'Threshold'
    },
    threshold3: {
      type: 'number',
      displayName: 'Threshold 3',
      group: 'Threshold'
    },
    threshold4: {
      type: 'number',
      displayName: 'Threshold 4',
      group: 'Threshold'
    },
    threshold5: {
      type: 'number',
      displayName: 'Threshold 5',
      group: 'Threshold'
    },
    threshold6: {
      type: 'number',
      displayName: 'Threshold 6',
      group: 'Threshold'
    },
    threshold7: {
      type: 'number',
      displayName: 'Threshold 7',
      group: 'Threshold'
    },
    threshold8: {
      type: 'number',
      displayName: 'Threshold 8',
      group: 'Threshold'
    }
  },
  outputs: {
    equalOut: {
      type: 'boolean',
      displayName: 'Equal out',
      group: 'Equal'
    },
    equalValueOut: {
      type: 'number',
      displayName: 'Equal value out',
      group: 'Equal'
    },
    greaterThan: {
      type: 'boolean',
      displayName: 'Greater than',
      group: 'Greater'
    },
    greaterThanValueOut: {
      type: 'number',
      displayName: 'Greater than value out',
      group: 'Greater'
    },
    smallerThan: {
      type: 'boolean',
      displayName: 'Smaller than',
      group: 'Smaller'
    },
    smallerThanValueOut: {
      type: 'number',
      displayName: 'Smaller than value out',
      group: 'Smaller'
    },
    errorOut: {
      type: 'number',
      displayName: 'Error out'
    }
  }
};

module.exports = {
  node: DeviceNode
};
