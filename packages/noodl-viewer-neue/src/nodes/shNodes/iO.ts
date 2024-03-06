'use strict';

const DeviceNode = {
    name: 'I/O',
    docs: 'https://www.neue.se/support-documentation/building-an-app/patches-the-building-blocks/',
    category: 'Neue',
    color: 'neue',
    initialize: function () {
        this._internal.inputs = [];
    },
    getInspectInfo() {
        return and(this._internal.inputs);
    },
    inputs: {
        "Pin 0": {
            type: 'number',
            displayName: 'Pin 0',
            get() {
                return this._internal["Pin 0"];
            }
        },
        "Pin 1": {
            type: 'number',
            displayName: 'Pin 1',
            get() {
                return this._internal["Pin 1"];
            }
        },
        "Pin 2": {
            type: 'number',
            displayName: 'Pin 2',
            get() {
                return this._internal["Pin 2"];
            }
        },
        "Pin 3": {
            type: 'number',
            displayName: 'Pin 3',
            get() {
                return this._internal["Pin 3"];
            }
        },
        "Pin 4": {
            type: 'number',
            displayName: 'Pin 4',
            get() {
                return this._internal["Pin 4"];
            }
        },
        "Pin 5": {
            type: 'number',
            displayName: 'Pin 5',
            get() {
                return this._internal["Pin 5"];
            }
        },
        "Pin 6": {
            type: 'number',
            displayName: 'Pin 6',
            get() {
                return this._internal["Pin 6"];
            }
        },
        "Pin 7": {
            type: 'number',
            displayName: 'Pin 7',
            get() {
                return this._internal["Pin 7"];
            }
        },
        "Pin 0 mode": {
            type: {
                name: 'enum',
                enums: [
                  {
                    label: 'Digital in',
                    value: 'digitalIn'
                  },
                  {
                    label: 'Digital out',
                    value: 'digitalOut'
                  },
                  {
                    label: 'Analog in',
                    value: 'analogIn'
                  },
                  {
                    label: 'Analog out',
                    value: 'analogOut'
                  }
                ]
              },
            default:'digitalIn',
            displayName: 'Pin 0 mode',
            get() {
                return this._internal["Pin 0 mode"];
            }
        },
        "Pin 1 mode": {
            type: {
                name: 'enum',
                enums: [
                  {
                    label: 'Digital in',
                    value: 'digitalIn'
                  },
                  {
                    label: 'Digital out',
                    value: 'digitalOut'
                  },
                  {
                    label: 'Analog in',
                    value: 'analogIn'
                  },
                  {
                    label: 'Analog out',
                    value: 'analogOut'
                  }
                ]
              },
            default:'digitalIn',
            displayName: 'Pin 1 mode',
            get() {
                return this._internal["Pin 1 mode"];
            }
        },
        "Pin 2 mode": {
            type: {
                name: 'enum',
                enums: [
                  {
                    label: 'Digital in',
                    value: 'digitalIn'
                  },
                  {
                    label: 'Digital out',
                    value: 'digitalOut'
                  },
                  {
                    label: 'Analog in',
                    value: 'analogIn'
                  },
                  {
                    label: 'Analog out',
                    value: 'analogOut'
                  }
                ]
              },
            default:'digitalIn',
            displayName: 'Pin 2 mode',
            get() {
                return this._internal["Pin 2 mode"];
            }
        },
        "Pin 3 mode": {
            type: {
                name: 'enum',
                enums: [
                  {
                    label: 'Digital in',
                    value: 'digitalIn'
                  },
                  {
                    label: 'Digital out',
                    value: 'digitalOut'
                  },
                  {
                    label: 'Analog in',
                    value: 'analogIn'
                  },
                  {
                    label: 'Analog out',
                    value: 'analogOut'
                  }
                ]
              },
            default:'digitalIn',
            displayName: 'Pin 3 mode',
            get() {
                return this._internal["Pin 3 mode"];
            }
        },
        "Pin 4 mode": {
            type: {
                name: 'enum',
                enums: [
                  {
                    label: 'Digital in',
                    value: 'digitalIn'
                  },
                  {
                    label: 'Digital out',
                    value: 'digitalOut'
                  },
                  {
                    label: 'Analog in',
                    value: 'analogIn'
                  },
                  {
                    label: 'Analog out',
                    value: 'analogOut'
                  }
                ]
              },
            default:'digitalIn',
            displayName: 'Pin 4 mode',
            get() {
                return this._internal["Pin 4 mode"];
            }
        },
        "Pin 5 mode": {
            type: {
                name: 'enum',
                enums: [
                  {
                    label: 'Digital in',
                    value: 'digitalIn'
                  },
                  {
                    label: 'Digital out',
                    value: 'digitalOut'
                  },
                  {
                    label: 'Analog in',
                    value: 'analogIn'
                  },
                  {
                    label: 'Analog out',
                    value: 'analogOut'
                  }
                ]
              },
            default:'digitalIn',
            displayName: 'Pin 5 mode',
            get() {
                return this._internal["Pin 5 mode"];
            }
        },
    },
    outputs: {
        "Pin 0": {
            type: 'number',
            displayName: 'Pin 0',
            get() {
                return this._internal["Pin 0"];
            }
        },
        "Pin 1": {
            type: 'number',
            displayName: 'Pin 1',
            get() {
                return this._internal["Pin 1"];
            }
        },
        "Pin 2": {
            type: 'number',
            displayName: 'Pin 2',
            get() {
                return this._internal["Pin 2"];
            }
        },
        "Pin 3": {
            type: 'number',
            displayName: 'Pin 3',
            get() {
                return this._internal["Pin 3"];
            }
        },
        "Pin 4": {
            type: 'number',
            displayName: 'Pin 4',
            get() {
                return this._internal["Pin 4"];
            }
        },
        "Pin 5": {
            type: 'number',
            displayName: 'Pin 5',
            get() {
                return this._internal["Pin 5"];
            }
        },
        "Pin 6": {
            type: 'number',
            displayName: 'Pin 6',
            get() {
                return this._internal["Pin 6"];
            }
        },
        "Pin 7": {
            type: 'number',
            displayName: 'Pin 7',
            get() {
                return this._internal["Pin 7"];
            }
        },
    }
};

module.exports = {
    node: DeviceNode
};

function and(values) {
    //if none are false, then return true
    return values.length > 0 && values.some((v) => !v) === false;
}
