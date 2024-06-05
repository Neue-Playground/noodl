'use strict';

const iOSNotificationNode = {
  name: 'iOS Notification',
  docs: 'https://docs.noodl.net/nodes/neue/ios-notification',
  category: 'Neue',
  color: 'neueData',
  initialize: function () {
    // Initialization code if needed
  },
  inputs: {
    'Trigger notification in': {
      type: {
        name: '*',
        allowConnectionsOnly: true
      },
      displayName: 'Trigger notification in'
    }
  },
  outputs: {},
  settings: {
    'Name': {
      type: 'string',
      displayName: 'Name',
      default: 'iOS Notification'
    },
    'Notification title': {
      type: 'string',
      displayName: 'Notification title'
    },
    'Notification message': {
      type: 'string',
      displayName: 'Notification message'
    },
    'Sound': {
      type: 'boolean',
      displayName: 'Sound',
      default: true
    },
    'Notes': {
      type: 'string',
      displayName: 'Notes'
    },
    'requiredAppVersion': {
      type: 'number',
      displayName: '',
      default: 1
    }
  }
};

module.exports = {
  node: iOSNotificationNode
};
