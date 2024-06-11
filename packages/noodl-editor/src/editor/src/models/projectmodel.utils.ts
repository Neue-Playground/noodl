import { ComponentModel } from '@noodl-models/componentmodel';
import { ProjectModel } from '@noodl-models/projectmodel';
import { isComponentModel_BrowserRuntime, isComponentModel_NeueRuntime } from '@noodl-utils/NodeGraph';

export function getDefaultComponent(instance = ProjectModel.instance): ComponentModel {
  let component =
    instance.getComponentWithName('/Main') ||
    instance.getComponentWithName('/Start') ||
    instance.getComponentWithName('/#__neue__/Main') ||
    instance.getComponentWithName('/Lesson');
  if (!component) {
    component = instance.getRootComponent();
  }

  if (!component) {
    component = instance.getComponents().find(isComponentModel_BrowserRuntime);
  }

  return component;
}
