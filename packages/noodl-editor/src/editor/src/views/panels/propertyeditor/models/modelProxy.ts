import { isEqual } from 'underscore';

import { NodeGraphNode } from '@noodl-models/nodegraphmodel';
import { NodeLibrary } from '@noodl-models/nodelibrary';

/**
 * The model proxy is used to simulate different models for different interaction states / default values etc
 */
export class ModelProxy {
  model: NodeGraphNode;
  editMode: string;
  visualState: TSFixme;

  get parameters() {
    return new Proxy(this.model.parameters, {
      get: (_target, prop) => {
        const source = this.editMode === 'variant' ? this.model.variant : this.model;

        if (this.visualState === undefined || this.visualState === 'neutral') return source.parameters[prop];
        else
          return source.stateParameters !== undefined && source.stateParameters[this.visualState] !== undefined
            ? source.stateParameters[this.visualState][prop]
            : undefined;
      }
    });
  }

  get type() {
    return this.model.type;
  }

  get variantName() {
    return this.model.variantName;
  }

  constructor(args) {
    this.model = args.model;
    this.visualState = 'neutral';
  }
  setVisualState(state) {
    this.visualState = state;
  }
  setEditMode(mode) {
    this.editMode = mode;
  }
  getParameter(name) {
    const source = this.editMode === 'variant' ? this.model.variant : this.model;
    return source.getParameter(name, { state: this.visualState });
  }
  setParameter(name, value, args = {}) {
    const _oldPorts = this.getPorts();

    // @ts-expect-error
    args.state = this.visualState;

    const target = this.editMode === 'variant' ? this.model.variant : this.model;

    // Set the parameter for the specific interaction state
    target.setParameter(name, value, args);

    const _newPorts = this.getPorts();

    // Check if the ports have changed for this specific interaction state
    if (!isEqual(_oldPorts, _newPorts)) this.model.notifyListeners('instancePortsChanged');
    else {
      for (let i = 0; i < _newPorts.length; i++) {
        if (_newPorts[i].type.stepMultiplierValChanged) {
          this.model.notifyListeners('instancePortsChanged');
          return;
        }
      }
    }
  }
  isPortConnected(name) {
    if ((this.editMode !== 'variant' && this.visualState === undefined) || this.visualState === 'neutral') {
      return this.model.isPortConnected(name);
    } else return false;
  }
  on(event, handler, group) {
    return this.model.on(event, handler, group);
  }
  off(group) {
    return this.model.off(group);
  }

  getPorts(filter?: 'input' | TSFixme) {
    const source: NodeGraphNode = this.editMode === 'variant' ? this.model.variant : this.model;

    let ports = [].concat(source.getPorts(filter));

    // Apply ports condition filter
    const portFilter = NodeLibrary.instance.applyPortConditionsFilterForNode(this);
    portFilter.forEach((portname) => {
      const idx = ports.findIndex((p) => p.name === portname);
      if (idx !== -1) ports.splice(idx, 1);
    });
    for (let i = 0; i < ports.length; i++) {
      if (ports[i].type.stepMultiplier) {
        const newVal = NodeLibrary.instance.evalSliderStep(ports[i].type.stepMultiplier, this);
        ports[i].type.stepMultiplierValChanged = newVal !== ports[i].type.stepMultiplierVal;
        if (ports[i].type.stepMultiplierValChanged) {
          ports[i].type.stepMultiplierVal = newVal;
        }
      }
    }

    // Apply filter for allowVisualStates
    if (this.visualState !== undefined && this.visualState !== 'neutral') {
      ports = ports.filter((p) => !!p.allowVisualStates);
    }

    return ports;
  }

  getVisualStates() {
    return this.model.type.visualStates;
  }
  getPossibleTransitionsForState(state) {
    const source = this.editMode === 'variant' ? this.model.variant : this.model;
    return source.getPossibleTransitionsForState(state);
  }
  getStateTransition(property) {
    const source = this.editMode === 'variant' ? this.model.variant : this.model;
    return source.getStateTransition(this.visualState, property);
  }
  setStateTransition(property, curve, args) {
    const target = this.editMode === 'variant' ? this.model.variant : this.model;
    target.setStateTransition(this.visualState, property, curve, args);
  }
  getDefaultStateTransition() {
    const source = this.editMode === 'variant' ? this.model.variant : this.model;
    return source.getDefaultStateTransition(this.visualState);
  }
  setDefaultStateTransition(curve, args) {
    const target = this.editMode === 'variant' ? this.model.variant : this.model;
    target.setDefaultStateTransition(this.visualState, curve, args);
  }
  hasDefaultStateTransition() {
    const source = this.editMode === 'variant' ? this.model.variant : this.model;
    return (
      source.defaultStateTransitions !== undefined && source.defaultStateTransitions[this.visualState] !== undefined
    );
  }
  hasStateTransition(parameterName) {
    const source = this.editMode === 'variant' ? this.model.variant : this.model;
    return (
      source.stateTransitions !== undefined &&
      source.stateTransitions[this.visualState] !== undefined &&
      source.stateTransitions[this.visualState][parameterName] !== undefined
    );
  }
}
