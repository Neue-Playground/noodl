'use strict';

const DeviceNode = {
  name: 'Stepper',
  docs: '',
  category: 'Neue',
  color: 'visual',
  initialize: function () {
    this._internal.inputs = [];
  },

  inputs: {
    valueIn: {
      type: 'number',
      displayName: 'Value in',
      get() {
        return this._internal.valueIn;
      }
    }
  },
  outputs: {
    step1: {
      type: 'number',
      displayName: 'Step 1 out'
    },
    step2: {
      type: 'number',
      displayName: 'Step 2 out'
    },
    step3: {
      type: 'number',
      displayName: 'Step 3 out'
    },
    step4: {
      type: 'number',
      displayName: 'Step 4 out'
    },
    step5: {
      type: 'number',
      displayName: 'Step 5 out'
    },
    step6: {
      type: 'number',
      displayName: 'Step 6 out'
    },
    step7: {
      type: 'number',
      displayName: 'Step 7 out'
    },
    step8: {
      type: 'number',
      displayName: 'Step 8 out'
    }
  }
};

module.exports = {
  node: DeviceNode
};
