'use strict';

const CompareNode = {
  name: 'Compare',
  docs: 'https://docs.noodl.net/nodes/utilities/logic/condition',
  category: 'Logic',
  color: 'visual',
  initialize: function () { },
  getInspectInfo() {
    // const condition = this.getInputValue('condition');
    // let value;

    // value = condition;
    // return [
    //   {
    //     type: 'value',
    //     value
    //   }
    // ];
  },
  inputs: {
    value: {
      type: 'number',
      displayName: 'Value',
      set(value) {
        // if (!this.isInputConnected('eval')) {
        //   // Evaluate right away
        //   // this.scheduleEvaluate();
        // }
      }
    },
    threshold: {
      type: 'number',
      displayName: 'Threshold',
      valueChangedToTrue() {
        // this.scheduleEvaluate();
      }
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
    },
  },
  methods: {
    scheduleEvaluate() {
      // this.scheduleAfterInputsHaveUpdated(() => {
      //   this.flagOutputDirty('result');
      //   this.flagOutputDirty('isfalse');

      //   const condition = this.getInputValue('condition');
      //   this.sendSignalOnOutput(condition ? 'ontrue' : 'onfalse');
      // });
    }
  }
};

module.exports = {
  node: CompareNode
};
