'use strict';

const MotionActivityNode = {
  name: 'Motion activity',
  docs: 'https://docs.noodl.net/nodes/neue/motion-activity',
  category: 'Neue',
  color: 'neueData',
  initialize: function () {
    // Initialization code if needed
  },
  inputs: {},
  outputs: {
    'Walking out': {
      type: '*',
      displayName: 'Walking out'
    },
    'Stationary out': {
      type: '*',
      displayName: 'Stationary out'
    }
  },
  settings: {
    'Name': {
      type: 'string',
      displayName: 'Name',
      default: 'iOS Motion activity'
    },
    'Notes': {
      type: 'string',
      displayName: 'Notes'
    },
    'requiredAppVersion': {
      type: 'number',
      displayName: '',
      default: 1
    },
    'Enable motion activity updates': {
      type: 'boolean',
      displayName: 'Enable motion activity updates',
      default: false
    }
  }
};

module.exports = {
  node: MotionActivityNode
};
