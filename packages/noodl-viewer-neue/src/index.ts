// We need to import this so it's available in NoodlRuntime.Services

//import WebSocket from 'ws';
import { NoodlRequest, NoodlResponse } from './bridge';
import { registerNodes } from './nodes';
import NoodlRuntime from '@noodl/runtime';
import Model from '@noodl/runtime/src/model';
import NodeScope from '@noodl/runtime/src/nodescope';
import './noodl-js-api';
import { addDynamicInputPorts } from './node-shared-port-definitions';

require('./services/userservice');

export class NeueRunner {
  private runtime: NoodlRuntime;

  constructor(options: {
    webSocketClass?: any;
    enableDebugInspectors?: boolean;
    connectToEditor?: boolean;
    editorAddress?: string;
  }) {
    this.runtime = new NoodlRuntime({
      type: 'neue',
      platform: {
        requestUpdate: (f: any) => setImmediate(f),
        getCurrentTime: () => new Date().getTime(),
        objectToString: (o: any) => JSON.stringify(o, null, 2),
        webSocketClass: options.webSocketClass,
        isRunningLocally: () => options.connectToEditor
      },
      componentFilter: (c) => c.name.startsWith('/#__neue__/'),
      nodeLibraryExtensions: [],
      dontCreateRootComponent: true
    });

    registerNodes(this.runtime);

    this.runtime.setDebugInspectorsEnabled(options.enableDebugInspectors);

    if (options.connectToEditor && options.editorAddress) {
      this.runtime.connectToEditor(options.editorAddress);
    }

    this.runtime.editorConnection.on('firmware', async (content: any) => {
      const firmware = content.firmware;
      const nodes = await fetch('https://neue.se/api/v2/noodl/nodes');
      const node1 = {
        name: 'Simple Accelerometer',
        docs: 'https://www.neue.se/support-documentation/building-an-app/patches-the-building-blocks/',
        category: 'Neue',
        color: 'neueSensor',
        initialize: function () {
          this._internal.inputs = [];
        },

        inputs: {
          mode: {
            group: 'General Parameters',
            displayName: 'Mode',
            type: {
              name: 'enum',
              enums: [
                {
                  label: 'Low Power',
                  value: '1'
                },
                {
                  label: 'Normal',
                  value: '2'
                },
                {
                  label: 'High Resolution',
                  value: '3'
                }
              ],
              allowEditOnly: true
            },
            default: '1',
            get() {
              return this._internal['mode'];
            }
          },
          enX: {
            group: 'General Parameters',
            displayName: 'Enable Acceleration X',
            type: {
              name: 'boolean',
              allowEditOnly: true
            },
            default: 0
          },
          enY: {
            group: 'General Parameters',
            displayName: 'Enable Acceleration Y',
            type: {
              name: 'boolean',
              allowEditOnly: true
            },
            default: 0
          },
          enZ: {
            group: 'General Parameters',
            displayName: 'Enable Acceleration Z',
            type: {
              name: 'boolean',
              allowEditOnly: true
            },
            default: 0
          },
          enT: {
            group: 'General Parameters',
            displayName: 'Enable Temperature',
            type: {
              name: 'boolean',
              allowEditOnly: true
            },
            default: 0
          },
          scale: {
            group: 'General Parameters',
            displayName: 'Scale',
            type: {
              name: 'enum',
              enums: [
                {
                  label: '2 g',
                  value: '2000'
                },
                {
                  label: '4 g',
                  value: '4000'
                },
                {
                  label: '8 g',
                  value: '8000'
                },
                {
                  label: '16 g',
                  value: '16000'
                }
              ],
              allowEditOnly: true
            },
            default: '2000',
            get() {
              return this._internal['scale'];
            }
          },
          odr: {
            group: 'General Parameters',
            displayName: 'ODR',
            type: {
              name: 'enum',
              enums: [
                {
                  label: 'Power Down',
                  value: '0'
                },
                {
                  label: '1 Hz',
                  value: '1000000'
                },
                {
                  label: '10 Hz',
                  value: '100000'
                },
                {
                  label: '25 Hz',
                  value: '40000'
                },
                {
                  label: '50 Hz',
                  value: '20000'
                },
                {
                  label: '100 Hz',
                  value: '10000'
                },
                {
                  label: '200 Hz',
                  value: '5000'
                },
                {
                  label: '400 Hz',
                  value: '2500'
                }
              ],
              allowEditOnly: true
            },
            default: '1000000',
            get() {
              return this._internal['odr'];
            }
          },
          sel4d: {
            group: 'Event Definition',
            displayName: 'Select 4D Detection',
            type: {
              name: 'enum',
              enums: [
                {
                  label: '4D DIS',
                  value: '0'
                },
                {
                  label: '4D INT1',
                  value: '1'
                },
                {
                  label: '4D INT2',
                  value: '2'
                }
              ],
              allowEditOnly: true
            },
            default: '0',
            get() {
              return this._internal['sel4d'];
            }
          },
          int1Ev: {
            group: 'Event Definition',
            displayName: 'Interrupt1 Events ',
            type: {
              name: 'enum',
              enums: [
                {
                  label: 'int1_OR',
                  value: '1'
                },
                {
                  label: 'int1_6DMove',
                  value: '2'
                },
                {
                  label: 'int1_AND',
                  value: '3'
                },
                {
                  label: 'int1_6DPos',
                  value: '4'
                }
              ],
              allowEditOnly: true
            },
            default: '1',
            get() {
              return this._internal['int1Ev'];
            }
          },
          int1zhie: {
            group: 'Event Definition',
            displayName: 'Interrupt1 Z Inerrupt Events ',
            type: {
              name: 'boolean',
              allowEditOnly: true
            },
            default: 0
          },
          int1zlie: {
            group: 'Event Definition',
            displayName: 'Interrupt1 Z Inerrupt Events ',
            type: {
              name: 'boolean',
              allowEditOnly: true
            },
            default: 0
          },
          int1yhie: {
            group: 'Event Definition',
            displayName: 'Interrupt1 Y Inerrupt Events ',
            type: {
              name: 'boolean',
              allowEditOnly: true
            },
            default: 0
          },
          int1ylie: {
            group: 'Event Definition',
            displayName: 'Interrupt1 Y Inerrupt Events ',
            type: {
              name: 'boolean',
              allowEditOnly: true
            },
            default: 0
          },
          int1xhie: {
            group: 'Event Definition',
            displayName: 'Interrupt1 X Inerrupt Events ',
            type: {
              name: 'boolean',
              allowEditOnly: true
            },
            default: 0
          },
          int1xlie: {
            group: 'Event Definition',
            displayName: 'Interrupt1 X Inerrupt Events ',
            type: {
              name: 'boolean',
              allowEditOnly: true
            },
            default: 0
          },
          int1Ths: {
            group: 'Event Definition',
            displayName: 'Interrupt1 Threshold',
            type: {
              name: 'slider',
              min: 0,
              max: 128,
              step: 1,
              allowEditOnly: true
            },
            default: 0,
            set(value) {
              if (value === undefined) return;
              if (value < 0) value = 0;
              if (value > 128) value = 128;
              this._internal['int1Ths'] = value;
            },
            get() {
              return this._internal['int1Ths'];
            }
          },
          int1Dur: {
            group: 'Event Definition',
            displayName: 'Interrupt1 Duration',
            type: {
              name: 'slider',
              min: 0,
              max: 128,
              step: 1,
              allowEditOnly: true
            },
            default: 0,
            set(value) {
              if (value === undefined) return;
              if (value < 0) value = 0;
              if (value > 128) value = 128;
              this._internal['int1Dur'] = value;
            },
            get() {
              return this._internal['int1Dur'];
            }
          },
          int2Ev: {
            group: 'Event Definition',
            displayName: 'Interrupt2 Events',
            type: {
              name: 'enum',
              enums: [
                {
                  label: 'int2_OR',
                  value: '1'
                },
                {
                  label: 'int2_6DMove',
                  value: '2'
                },
                {
                  label: 'int2_AND',
                  value: '3'
                },
                {
                  label: 'int2_6DPos',
                  value: '4'
                }
              ],
              allowEditOnly: true
            },
            default: '1',
            get() {
              return this._internal['int2Ev'];
            }
          },
          int2zhie: {
            group: 'Event Definition',
            displayName: 'Interruptw Z Inerrupt Events ',
            type: {
              name: 'boolean',
              allowEditOnly: true
            },
            default: 0
          },
          int2zlie: {
            group: 'Event Definition',
            displayName: 'Interrupt2 Z Inerrupt Events ',
            type: {
              name: 'boolean',
              allowEditOnly: true
            },
            default: 0
          },
          int2yhie: {
            group: 'Event Definition',
            displayName: 'Interrupt2 Y Inerrupt Events ',
            type: {
              name: 'boolean',
              allowEditOnly: true
            },
            default: 0
          },
          int2ylie: {
            group: 'Event Definition',
            displayName: 'Interrupt2 Y Inerrupt Events ',
            type: {
              name: 'boolean',
              allowEditOnly: true
            },
            default: 0
          },
          int2xhie: {
            group: 'Event Definition',
            displayName: 'Interrupt2 X Inerrupt Events ',
            type: {
              name: 'boolean',
              allowEditOnly: true
            },
            default: 0
          },
          int2xlie: {
            group: 'Event Definition',
            displayName: 'Interrupt2 X Inerrupt Events ',
            type: {
              name: 'boolean',
              allowEditOnly: true
            },
            default: 0
          },
          int2Ths: {
            group: 'Event Definition',
            displayName: 'Interrupt2 Threshold',
            type: {
              name: 'slider',
              min: 0,
              max: 128,
              step: 1,
              allowEditOnly: true
            },
            default: 0,
            set(value) {
              if (value === undefined) return;
              if (value < 0) value = 0;
              if (value > 128) value = 128;
              this._internal['int2Ths'] = value;
            },
            get() {
              return this._internal['int2Ths'];
            }
          },
          int2Dur: {
            group: 'Event Definition',
            displayName: 'Interrupt2 Duration',
            type: {
              name: 'slider',
              min: 0,
              max: 128,
              step: 1,
              allowEditOnly: true
            },
            default: 0,
            set(value) {
              if (value === undefined) return;
              if (value < 0) value = 0;
              if (value > 128) value = 128;
              this._internal['int2Dur'] = value;
            },
            get() {
              return this._internal['int2Dur'];
            }
          },
          enDcZ: {
            group: 'Event Definition',
            displayName: 'Click Config Double Click on Z-axis',
            type: {
              name: 'boolean',
              allowEditOnly: true
            },
            default: 0
          },
          enScZ: {
            group: 'Event Definition',
            displayName: 'Click Config Single Click on X-axis',
            type: {
              name: 'boolean',
              allowEditOnly: true
            },
            default: 0
          },
          enDcY: {
            group: 'Event Definition',
            displayName: 'Click Config Double Click on Y-axis',
            type: {
              name: 'boolean',
              allowEditOnly: true
            },
            default: 0
          },
          enScY: {
            group: 'Event Definition',
            displayName: 'Click Config Single Click on Y-axis',
            type: {
              name: 'boolean',
              allowEditOnly: true
            },
            default: 0
          },
          enDcX: {
            group: 'Event Definition',
            displayName: 'Click Config Double Click on X-axis',
            type: {
              name: 'boolean',
              allowEditOnly: true
            },
            default: 0
          },
          cThs: {
            group: 'Event Definition',
            displayName: 'Click Threshold',
            type: {
              name: 'slider',
              min: 0,
              max: 128,
              step: 1,
              allowEditOnly: true
            },
            default: 0,
            set(value) {
              if (value === undefined) return;
              if (value < 0) value = 0;
              if (value > 128) value = 128;
              this._internal['cThs'] = value;
            },
            get() {
              return this._internal['cThs'];
            }
          },
          tl: {
            group: 'Event Definition',
            displayName: 'Click Time Limit',
            type: {
              name: 'slider',
              min: 0,
              max: 128,
              step: 1,
              allowEditOnly: true
            },
            default: 0,
            set(value) {
              if (value === undefined) return;
              if (value < 0) value = 0;
              if (value > 128) value = 128;
              this._internal['tl'] = value;
            },
            get() {
              return this._internal['tl'];
            }
          },
          tL: {
            group: 'Event Definition',
            displayName: 'Click Time Latency',
            type: {
              name: 'slider',
              min: 0,
              max: 256,
              step: 1,
              allowEditOnly: true
            },
            default: 0,
            set(value) {
              if (value === undefined) return;
              if (value < 0) value = 0;
              if (value > 256) value = 256;
              this._internal['tL'] = value;
            },
            get() {
              return this._internal['tL'];
            }
          },
          tW: {
            group: 'Event Definition',
            displayName: 'Click Time Window',
            type: {
              name: 'slider',
              min: 0,
              max: 256,
              step: 1,
              allowEditOnly: true
            },
            default: 0,
            set(value) {
              if (value === undefined) return;
              if (value < 0) value = 0;
              if (value > 256) value = 256;
              this._internal['tW'] = value;
            },
            get() {
              return this._internal['tW'];
            }
          },
          actEnSa: {
            group: 'Event Definition',
            displayName: 'Sleep Activity',
            type: {
              name: 'boolean',
              allowEditOnly: true
            },
            default: 0
          },
          actSaThs: {
            group: 'Event Definition',
            displayName: 'Sleep Activity Threshold',
            type: {
              name: 'slider',
              min: 0,
              max: 128,
              step: 1,
              allowEditOnly: true
            },
            default: 0,
            set(value) {
              if (value === undefined) return;
              if (value < 0) value = 0;
              if (value > 128) value = 128;
              this._internal['actSaThs'] = value;
            },
            get() {
              return this._internal['actSaThs'];
            }
          },
          actSaDur: {
            group: 'Event Definition',
            displayName: 'Sleep Activity Duration',
            type: {
              name: 'slider',
              min: 0,
              max: 256,
              step: 1,
              allowEditOnly: true
            },
            default: 0,
            set(value) {
              if (value === undefined) return;
              if (value < 0) value = 0;
              if (value > 256) value = 256;
              this._internal['actSaDur'] = value;
            },
            get() {
              return this._internal['actSaDur'];
            }
          },
          enFf: {
            group: 'Event Definition',
            displayName: 'Free Fall',
            type: {
              name: 'boolean',
              allowEditOnly: true
            },
            default: 0
          },
          enWu: {
            group: 'Event Definition',
            displayName: 'Wake up',
            type: {
              name: 'boolean',
              allowEditOnly: true
            },
            default: 0
          },
          Enable: {
            group: 'Ports',
            displayName: 'Enable',
            type: 'boolean'
          }
        },
        outputs: {
          'Acc X': {
            group: 'Ports',
            displayName: 'Acc X',
            type: 'number'
          },
          'Acc Y': {
            group: 'Ports',
            displayName: 'Acc Y',
            type: 'number'
          },
          'Acc Z': {
            group: 'Ports',
            displayName: 'Acc Z',
            type: 'number'
          },
          'Acc XYZ': {
            group: 'Ports',
            displayName: 'Acc XYZ',
            type: 'number'
          },
          Temperature: {
            group: 'Ports',
            displayName: 'Temperature',
            type: 'number'
          },
          Event: {
            group: 'Ports',
            displayName: 'Event',
            type: 'signal'
          }
        }
      };
      const node2 = {
        name: 'Temperature/Humidity Sensor',
        docs: 'https://www.neue.se/support-documentation/building-an-app/patches-the-building-blocks/',
        category: 'Neue',
        color: 'neueSensor',
        initialize: function () {
          this._internal.inputs = [];
        },

        inputs: {
          act: {
            group: 'General Parameters',
            displayName: 'Active',
            type: {
              name: 'boolean',
              allowEditOnly: true
            },
            default: 0
          },
          enCNT: {
            group: 'General Parameters',
            displayName: 'Continuous Mode',
            type: {
              name: 'boolean',
              allowEditOnly: true
            },
            default: 0
          },
          enMAN: {
            group: 'General Parameters',
            displayName: 'Manual Mode',
            type: {
              name: 'boolean',
              allowEditOnly: true
            },
            default: 0
          },
          time: {
            group: 'General Parameters',
            displayName: 'Integration Timer',
            type: {
              name: 'enum',
              enums: [
                {
                  label: '800 ms',
                  value: '0'
                },
                {
                  label: '400 ms',
                  value: '1'
                },
                {
                  label: '200 ms',
                  value: '2'
                },
                {
                  label: '100 ms',
                  value: '3'
                },
                {
                  label: '50 ms',
                  value: '4'
                },
                {
                  label: '25 ms',
                  value: '5'
                },
                {
                  label: '12.5 ms',
                  value: '6'
                },
                {
                  label: '6.25 ms',
                  value: '7'
                }
              ],
              allowEditOnly: true
            },
            default: '0',
            get() {
              return this._internal['time'];
            }
          },
          enCDR: {
            group: 'General Parameters',
            displayName: 'Enable CDR',
            type: {
              name: 'boolean',
              allowEditOnly: true
            },
            default: 0
          },
          Enable: {
            group: 'Ports',
            displayName: 'Enable',
            type: 'boolean'
          }
        },
        outputs: {
          'Ambient Light': {
            group: 'Ports',
            displayName: 'Ambient Light',
            type: 'number'
          }
        }
      };
      // addDynamicInputPorts(node, 'enX = true', ['enY']);
      this.runtime.registerNode({ node: node1 });
      if (firmware === '1.0.2') {
        this.runtime.registerNode({ node: node2 });
      }
      this.runtime.sendNodeLibrary();
    });
  }

  public async load(exportData: any, projectSettings?: any) {
    await this.runtime.setData(exportData);

    if (projectSettings) this.runtime.setProjectSettings(projectSettings);
  }

  public async run(functionName: string, request: NoodlRequest): Promise<NoodlResponse> {
    return new Promise<NoodlResponse>((resolve, reject) => {
      const requestId = Math.random().toString(26).slice(2);

      const requestScope = new NodeScope(this.runtime.context);
      requestScope.modelScope = new Model.Scope();
      //Neue
      this.runtime.context
        .createComponentInstanceNode('/#__neue__/' + functionName, requestId + '-' + functionName, requestScope)
        .then((functionComponent) => {
          // Look for the first request node (should only be one)
          const requestNode = functionComponent.nodeScope.getNodesWithType('Neue')[0];
          if (requestNode) {
            // Look for all response nodes
            let hasResponded = false;
            const responseNodes = functionComponent.nodeScope.getNodesWithTypeRecursive('Neue');
            responseNodes.forEach((resp) => {
              resp._internal._sendResponseCallback = (resp) => {
                if (hasResponded) return;
                hasResponded = true;

                //the functionComponent is "manually" created outside of a scope, so call the delete function directly
                functionComponent._onNodeDeleted();
                requestScope.reset(); //this deletes any remaining nodes, although there shouldn't be any at this point

                //clean upp all models
                requestScope.modelScope.reset();

                resolve(resp);
              };
            });

            setImmediate(() => {
              try {
                requestNode.sendRequest(request).catch(reject);
              } catch (e) {
                reject(e);
              }
            });
          } else {
            reject(Error('Could not find request node for function'));
          }
        })
        .catch((e) => {
          // Failed creating component
          reject(e);
        });
    });
  }
}
