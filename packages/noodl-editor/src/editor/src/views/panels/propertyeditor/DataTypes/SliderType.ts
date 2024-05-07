import { find } from 'underscore';

import { TypeView } from '../TypeView';
import { getEditType } from '../utils';

export class SliderType extends TypeView {
  el: TSFixme;

  static fromPort(args) {
    const view = new SliderType();

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
    this.el = this.bindView(this.parent.cloneTemplate('slider'), this);
    TypeView.prototype.render.call(this);

    this.$('.property-input-dropdown').on('mousedown', function (event) {
      event.preventDefault(); // make sure drop down doesn't blur input until after "onPropertyChanged" has been triggered
    });

    this.$('input').prop('min', this.type.min);
    this.$('input').prop('max', this.type.max);
    this.$('input').prop('step', this.type.step);
    this.$('input').val(this.getCurrentValue().value);
    this.$('i').text(this.getCurrentValue().value);
    return this.el;
  }
  onPropertyChanged(scope, el) {
    this.parent.setParameter(this.name, this.$('input').val());

    // Update current value
    const current = this.getCurrentValue();
    this.$('i').text(current.value);
    this.isDefault = current.isDefault;
  }
  resetToDefault() {
    const current = this.getCurrentValue();
    this.$('input').val(0);
  }
}
