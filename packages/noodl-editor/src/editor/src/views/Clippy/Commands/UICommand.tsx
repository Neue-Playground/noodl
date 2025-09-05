import { NodeGraphContextTmp } from '@noodl-contexts/NodeGraphContext/NodeGraphContext';
import { OpenAiStore } from '@noodl-store/AiAssistantStore';

import { getXmlChatProvider } from '@noodl-models/AiAssistant/context/ai-providers';
import { NodeGraphModel, NodeGraphNode, NodeGraphNodeJSON } from '@noodl-models/nodegraphmodel';
import { NodeLibrary } from '@noodl-models/nodelibrary';
import { ProjectModel } from '@noodl-models/projectmodel';
import { UndoActionGroup, UndoQueue } from '@noodl-models/undo-queue-model';
import { guid } from '@noodl-utils/utils';

import { generateUiPrimer } from './ui-primer';
import { makeImageGenerationRequest, saveImageDataToDisk } from './utils';

type UICommandOptions = {
  allowImageNode?: boolean;
  allowImageGeneration?: boolean;
  nodeGraphModel?: NodeGraphModel;
};

export async function handleUICommand(
  prompt: string,
  statusCallback: (status: string) => void,
  options?: UICommandOptions
) {
  const selectedNodes = NodeGraphContextTmp.nodeGraph.getSelectedNodes();
  let parentModel = selectedNodes[0]?.model;
  const nodeGraphModel = options.nodeGraphModel || NodeGraphContextTmp.nodeGraph.model;

  // HACK: To support custom node graph model
  if (options.nodeGraphModel) {
    parentModel = null;
  }

  if (!parentModel || !parentModel.type.allowChildrenWithCategory?.includes('Visual')) {
    //find a root that can add the nodes as children
    parentModel = nodeGraphModel.roots.find((root) => root.type.allowChildrenWithCategory?.includes('Visual'));
  }

  const components = ProjectModel.instance.components.filter((c) =>
    c.graph.commentsModel.getComments().some((c) => c.text.toLowerCase().startsWith('ai:'))
  );

  const comments = ProjectModel.instance.components.flatMap((c) => c.graph.commentsModel.getComments());

  const uiPrimer = comments.find((c) => c.text.toLowerCase().startsWith('ai ui primer:'))?.text;

  const userComponents = components.map((c) => {
    const comment = c.graph.commentsModel.getComments().find((c) => c.text.toLowerCase().startsWith('ai:'));
    const description = comment.text.substring(3).trim();

    return {
      name: c.localName.toLowerCase().replaceAll(' ', '-'),
      fullName: c.fullName,
      description,
      canHaveChildren: c.allowChildrenWithCategory?.includes('Visual')
    };
  });

  statusCallback('Generating nodes');

  const messages = [
    { role: 'system', content: generateUiPrimer({ ...options, userComponents, uiPrimer }) },
    { role: 'user', content: prompt }
  ];

  const undoGroup = new UndoActionGroup({ label: 'AI: Generate nodes' });

  const callbacks = {
    onTagOpen(tagName: string, attributes: Record<string, string>) {
      console.log('AI onTagOpen:', { tagName, attributes });
      const json: NodeGraphNodeJSON = {
        type: attributes.componentName ? transformComponentName(attributes.componentName) : transformName(tagName),
        parameters: {},
        children: [],
        x: 0,
        y: 0,
        id: guid()
      };

      console.log('json', json);

      const type = NodeLibrary.instance.getNodeTypeWithName(json.type);
      const allPortNames = new Set(type.ports.map((p) => p.name));

      const portMap = new Map<string, string>();
      for (const portName of allPortNames.values()) {
        portMap.set(portName.replaceAll(' ', '').toLowerCase(), portName);
      }

      for (const attr of Object.keys(attributes)) {
        if (attr === 'nodeLabel') {
          json.label = attributes[attr];
        }
        if (attr === 'variant') {
          json.variant = attributes[attr];
        } else {
          let portName = attr;
          // ports can have spaces, but xml attributes can't
          // so if the attribute doesn't match a port, try again but without spaces
          if (!allPortNames.has(portName)) {
            const n = portName.replaceAll(' ', '').toLowerCase();
            if (portMap.has(n)) {
              portName = portMap.get(n);
            }
          }

          json.parameters[portName] = getAttributeValue(portName, attributes[attr]);
        }
      }

      setDefaultValues(json);

      const node = NodeGraphNode.fromJSON(json);
      if (parentModel) {
        parentModel.addChild(node, { undo: undoGroup, disableSelect: true });
      } else {
        nodeGraphModel.addRoot(node, { undo: undoGroup, disableSelect: true });
      }

      parentModel = node;

      if (node.findPortWithName('src')) {
        if (attributes.prompt) {
          makeImageGenerationRequest(attributes.prompt)
            .then((imageData) => saveImageDataToDisk(imageData))
            .then((url) => node.setParameter('src', url));
        } else {
          const width = attributes.width || 100;
          const height = attributes.height || 100;
          const url = `https://via.placeholder.com/${width}x${height}`;
          node.setParameter('src', url);
        }
      }
    },
    onTagEnd() {
      parentModel = parentModel.parent;
    }
  };

  const selectedAiModel = OpenAiStore.getAiSelectedModel();

  const provider = getXmlChatProvider({
    selectedModel: selectedAiModel,
    openAi: {
      model: OpenAiStore.getOpenAiModel(),
      temperature: 0.1,
      max_tokens: 2048
    },
    gemini: {
      apiKey: OpenAiStore.getGeminiApiKey(),
      model: OpenAiStore.getGeminiModel()
    },
    bytez: {
      apiKey: OpenAiStore.getBytezApiKey(),
      model: OpenAiStore.getBytezModel()
    }
  });

  try {
    await provider.chatStreamXml({
      messages,
      onTagOpen: callbacks.onTagOpen,
      onTagEnd: callbacks.onTagEnd
    });
    statusCallback('Nodes generated successfully!'); // Success message
  } catch (error: any) {
    statusCallback(`Error: Failed to generate UI. ${error.message || ''}`);
    return; // Stop execution on error
  }
  UndoQueue.instance.push(undoGroup);
}

// Primer moved to './ui-primer'

function transformName(name: string) {
  const nameMap = {
    columns: 'net.noodl.visual.columns',
    button: 'net.noodl.controls.button',
    group: 'Group',
    text: 'Text',
    input: 'net.noodl.controls.textinput',
    img: 'Image',
    dropdown: 'net.noodl.controls.options',
    checkbox: 'net.noodl.controls.checkbox'
  };

  return nameMap[name] ? nameMap[name] : name;
}

function transformComponentName(name: string) {
  const component = ProjectModel.instance.components.find(
    (c) => c.fullName.toLocaleLowerCase() === name.toLocaleLowerCase()
  );

  return component?.fullName || name;
}

function getAttributeValue(name: string, value: string) {
  if (
    [
      'marginTop',
      'marginBottom',
      'marginLeft',
      'marginRight',
      'paddingTop',
      'paddingBottom',
      'paddingLeft',
      'paddingRight',
      'width',
      'height',
      'borderRadius'
    ].indexOf(name) !== -1
  ) {
    if (value === 'auto') {
      return undefined;
    }

    if (value.endsWith('%')) {
      return { value: Number(value.substring(0, value.length - 1)), unit: '%' };
    }

    return { value: Number(value), unit: 'px' };
  } else if (name === 'src' && value === '') {
    return undefined;
  }

  return value;
}

function setDefaultValues(node: NodeGraphNodeJSON) {
  if (node.type === 'Group') {
    node.parameters.sizeMode = 'contentHeight';
  }
  if (node.type === 'Group' && node.parameters.borderRadius) {
    node.parameters.clip = true;
  }
  if (node.type === 'Image') {
    if (node.parameters.height) {
      node.parameters.sizeMode = 'explicit';
    } else {
      node.parameters.sizeMode = 'contentHeight';
    }
    node.parameters.objectFit = 'cover';
  }
  if (node.type === 'net.noodl.controls.options' && node.parameters.label) {
    node.parameters.useLabel = true;
  }
}
