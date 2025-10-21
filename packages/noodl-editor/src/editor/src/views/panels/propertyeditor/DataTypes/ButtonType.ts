import { find } from 'underscore';

import { TypeView } from '../TypeView';
import { getEditType } from '../utils';

export class ButtonType extends TypeView {
  el: TSFixme;

  static fromPort(args) {
    const view = new ButtonType();

    const p = args.port;
    const parent = args.parent;

    view.port = p;
    view.displayName = p.displayName ? p.displayName : p.name;
    view.name = p.name;
    view.type = getEditType(p);
    view.group = p.group;
    view.tooltip = p.tooltip;
    view.value = 0;
    view.parent = parent;
    view.isConnected = parent.model.isPortConnected(p.name, 'target');
    view.isDefault = parent.model.parameters[p.name] === undefined;

    return view;
  }
  render() {
    const _this = this;
    this.el = this.bindView(this.parent.cloneTemplate('button'), this);
    TypeView.prototype.render.call(this);

    this.$('.property-input-dropdown').on('mousedown', function (event) {
      event.preventDefault(); // make sure drop down doesn't blur input until after "onPropertyChanged" has been triggered
    });

    this.$('.input-button').val(this.name);
    return this.el;
  }
  onButtonClicked(scope, el, evt) {
    const _this = this;
    console.log('Button clicked:', this.name);

    this.parent.setParameter(this.name, true);

    evt.stopPropagation();
  }
}
