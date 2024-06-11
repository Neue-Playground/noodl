'use strict';

const DeviceNode = {
  name: 'Location',
  docs: '',  // Placeholder, no information given about docs URL
  category: 'Neue',
  color: 'neueLogic',  // Assuming color based on the example
  initialize: function () {
    this._internal.inputs = [];
  },
  inputs: {},
  outputs: {
    'Altitude out': {
      type: 'number',
      displayName: 'Altitude out'
    },
    'Speed out': {
      type: 'number',
      displayName: 'Speed out'
    },
    'Heading out': {
      type: 'number',
      displayName: 'Heading out'
    },
    'Longitude out': {
      type: 'number',
      displayName: 'Longitude out'
    },
    'Latitude out': {
      type: 'number',
      displayName: 'Latitude out'
    }
  },
  settings: {
    'Name': {
      type: 'string',
      displayName: 'Name',
      default: 'iOS Location'
    },
    'Enable heading updates': {
      type: 'boolean',
      displayName: 'Enable heading updates',
      default: false
    },
    'Enable location updates': {
      type: 'boolean',
      displayName: 'Enable location updates',
      default: false
    },
    'Activity type': {
      type: {
        name: 'enum',
        enums: [
          { label: 'Fitness', value: 'Fitness' },
          { label: 'Automative navigation', value: 'Automative navigation' },
          { label: 'Other navigation', value: 'Other navigation' },
          { label: 'Other', value: 'Other' }
        ]
      },
      displayName: 'Activity type',
      default: 'Fitness'
    },
    'Desired location accuracy in meters': {
      type: 'number',
      displayName: 'Desired location accuracy in meters',
      default: 1
    },
    'Notes': {
      type: {
        name: 'string',
        multiline: true
      },
      displayName: 'Notes'
    }
  }
};

module.exports = {
  node: DeviceNode
};
