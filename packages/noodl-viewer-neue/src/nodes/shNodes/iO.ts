'use strict';

enum pinMode{
    digitalIn='Digital in',
    digitalOut='Digital out',
    analogIn='Analog in',
    analogOut='Analog out',
}

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
        pin0: {
            type: 'number',
            displayName: 'Pin 0',
            get() {
                return this._internal.pin0;
            }
        },
        pin1: {
            type: 'number',
            displayName: 'Pin 1',
            get() {
                return this._internal.pin1;
            }
        },
        pin2: {
            type: 'number',
            displayName: 'Pin 2',
            get() {
                return this._internal.pin2;
            }
        },
        pin3: {
            type: 'number',
            displayName: 'Pin 3',
            get() {
                return this._internal.pin3;
            }
        },
        pin4: {
            type: 'number',
            displayName: 'Pin 4',
            get() {
                return this._internal.pin4;
            }
        },
        pin5: {
            type: 'number',
            displayName: 'Pin 5',
            get() {
                return this._internal.pin5;
            }
        },
        pin6: {
            type: 'number',
            displayName: 'Pin 6',
            get() {
                return this._internal.pin6;
            }
        },
        pin7: {
            type: 'number',
            displayName: 'Pin 7',
            get() {
                return this._internal.pin7;
            }
        },
        pin0Mode: {
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
                return this._internal.pin0Mode;
            }
        },
        pin1Mode: {
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
                return this._internal.pin1Mode;
            }
        },
        pin2Mode: {
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
                return this._internal.pin2Mode;
            }
        },
        pin3Mode: {
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
                return this._internal.pin3Mode;
            }
        },
        pin4Mode: {
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
                return this._internal.pin4Mode;
            }
        },
        pin5Mode: {
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
                return this._internal.pin5Mode;
            }
        },
    },
    outputs: {
        pin0: {
            type: 'number',
            displayName: 'Pin 0',
            get() {
                return this._internal.pin0;
            }
        },
        pin1: {
            type: 'number',
            displayName: 'Pin 1',
            get() {
                return this._internal.pin1;
            }
        },
        pin2: {
            type: 'number',
            displayName: 'Pin 2',
            get() {
                return this._internal.pin2;
            }
        },
        pin3: {
            type: 'number',
            displayName: 'Pin 3',
            get() {
                return this._internal.pin3;
            }
        },
        pin4: {
            type: 'number',
            displayName: 'Pin 4',
            get() {
                return this._internal.pin4;
            }
        },
        pin5: {
            type: 'number',
            displayName: 'Pin 5',
            get() {
                return this._internal.pin5;
            }
        },
        pin6: {
            type: 'number',
            displayName: 'Pin 6',
            get() {
                return this._internal.pin6;
            }
        },
        pin7: {
            type: 'number',
            displayName: 'Pin 7',
            get() {
                return this._internal.pin7;
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
