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
      dontCreateRootComponent: true,
      skipStdNodes: true
    });

    registerNodes(this.runtime);

    this.runtime.setDebugInspectorsEnabled(options.enableDebugInspectors);

    if (options.connectToEditor && options.editorAddress) {
      this.runtime.connectToEditor(options.editorAddress);
    }

    this.runtime.editorConnection.on('firmware', async (content: any) => {
      const firmware = content.firmware;
      const response = await fetch(
        'https://shthy94udd.execute-api.eu-west-1.amazonaws.com/dev2/project/nodes/' + firmware
      );
      const json = await response.json();
      const nodes = json.nodes;
      const categories = json.categories;
      console.log('####################################', categories);
      this.runtime.coreNodes = JSON.parse(categories);
      for (const node of nodes) {
        if (!node) continue;
        const nodeObj = JSON.parse(node);
        nodeObj.methods = {
          setResponseParameter: function (name, value) {
            this._internal.responseParameters[name] = value;
          },
          registerInputIfNeeded: function (name) {
            if (this.hasInput(name)) {
              return;
            }

            if (name.startsWith('pm-'))
              this.registerInput(name, {
                set: this.setResponseParameter.bind(this, name.substring('pm-'.length))
              });
          }
        };
        this.runtime.registerNode({
          node: nodeObj,
          setup: function (context, graphModel) {
            if (!context.editorConnection || !context.editorConnection.isRunningLocally()) {
              return;
            }

            function _managePortsForNode(node) {
              function _updatePorts() {
                const ports = [];

                // Add params outputs
                if (node.parameters.status === 'success' || node.parameters.status === undefined) {
                  let params = node.parameters.params;
                  if (params !== undefined) {
                    params = params.split(',');
                    for (const i in params) {
                      const p = params[i];

                      ports.push({
                        type: '*',
                        plug: 'input',
                        group: 'Parameters',
                        name: 'pm-' + p,
                        displayName: p
                      });
                    }
                  }
                }

                context.editorConnection.sendDynamicPorts(node.id, ports);
              }

              _updatePorts();
              node.on('parameterUpdated', function (event) {
                if (event.name === 'params') {
                  _updatePorts();
                }
              });
            }

            graphModel.on('editorImportComplete', () => {
              graphModel.on('nodeAdded.acc', function (node) {
                _managePortsForNode(node);
              });

              for (const node of graphModel.getNodesWithType('noodl.acc')) {
                _managePortsForNode(node);
              }
            });
          }
        });
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
