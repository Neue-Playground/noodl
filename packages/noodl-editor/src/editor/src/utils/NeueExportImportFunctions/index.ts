import { NeueService } from "@noodl-models/NeueServices/NeueService";
import { ComponentModel } from "@noodl-models/componentmodel";
import { ProjectModel } from "@noodl-models/projectmodel";
import { isComponentModel_NeueRuntime } from "@noodl-utils/NodeGraph";
import { filesystem } from "@noodl/platform";
import crypto from "crypto";

export async function getJsonConfiguration(flowId, setJsonData) {
    const allComponents = ProjectModel.instance.components.filter(comp => isComponentModel_NeueRuntime(comp));

    const components = [];
    allComponents.forEach(element => {
      const nodes = element?.graph?.getNodeSetWithNodes(element.getNodes()).nodes;
      components.push({
        ...element.toJSON(),
        nodes
      })
    });

    await filesystem.writeJson(__dirname + 'exportedConfig.json', { components, flowId: flowId !== '' ? flowId : crypto.randomBytes(16).toString("hex") });
    setJsonData({ components, flowId: flowId !== '' ? flowId : '' })
  }

  export  function deleteExistingNeueComponents() {
    const allComponents = ProjectModel.instance.components.filter(comp => isComponentModel_NeueRuntime(comp));
    allComponents.forEach(component => ProjectModel.instance.removeComponent(component))
  }

  export async function loadJsonConfiguration(flowId) {
    NeueService.instance.fetchFlow(flowId).then(async (json)=>{ await filesystem.writeJson(__dirname + 'test.json',json);
    for (let i = json.components.length - 1; i >= 0; i--) {
      const importComponent = ProjectModel.instance.getComponentWithName(json.components[i].name);
      if(importComponent){
        ProjectModel.instance.renameComponentWithName(importComponent.name, `${importComponent.name}_${crypto.randomBytes(3).toString("hex")}`,{});
      }

      const component = ComponentModel.fromJSON(json.components[i])

      ProjectModel.instance.addComponent(component);
    }});
  }
