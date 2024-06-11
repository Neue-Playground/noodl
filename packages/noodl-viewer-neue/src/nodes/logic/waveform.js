'use strict';

const WaveformRandomNode = {
  name: 'Waveform/random',
  docs: 'https://docs.noodl.net/nodes/neue/waveform-random',
  category: 'Neue',
  color: 'neueLogic',
  initialize: function () {
    this._internal.inputs = [];
  },
  inputs: {},
  outputs: {
    'Signal out': {
      type: 'signal',
      displayName: 'Signal out'
    }
  },
  settings: {
    'Name': {
      type: 'string',
      displayName: 'Name',
      default: 'Signal generator'
    },
    'SignalType': {
      type: {
        name: 'enum',
        enums: [
          { label: 'Pulse wave', value: 'pulse' },
          { label: 'Sine wave', value: 'sine' },
          { label: 'Triangle wave', value: 'triangle' },
          { label: 'Sawtooth wave', value: 'sawtooth' },
          { label: 'Random', value: 'random' }
        ]
      },
      displayName: 'Signal type',
      default: 'sine'
    },
    'Enable': {
      type: 'boolean',
      displayName: 'Enable',
      default: false
    },
    'Frequency': {
      type: 'number',
      displayName: 'Frequency',
      default: 0.5
    },
    'requiredAppVersion': {
      type: 'number',
      displayName: '',
      default: 1
    },
    'Notes': {
      type: 'string',
      displayName: 'Notes',
      default: ''
    }
  }
};

module.exports = {
  node: WaveformRandomNode
};
