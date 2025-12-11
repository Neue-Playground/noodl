import { NodeGraphContextTmp } from '@noodl-contexts/NodeGraphContext/NodeGraphContext';
import { AiStore } from '@noodl-store/AiAssistantStore';

import { AiAssistantModel } from '@noodl-models/AiAssistant';
import { ChatMessageType } from '@noodl-models/AiAssistant/ChatHistory';
import { NodeGraphModel, NodeGraphNode, NodeGraphNodeJSON } from '@noodl-models/nodegraphmodel';
import { ProjectModel } from '@noodl-models/projectmodel';
import { UndoActionGroup, UndoQueue } from '@noodl-models/undo-queue-model';
import { guid } from '@noodl-utils/utils';

import { chat, generateImage } from '../../../models/AiAssistant/cloud/CloudAiClient';
import { saveImageDataToDisk } from './utils';

type ConnectionDef = {
  fromId: string;
  fromProperty: string;
  toId: string;
  toProperty: string;
};

export async function handleUICommand(
  prompt: string,
  statusCallback: (status: string) => void,
  nodeGraphModel?: NodeGraphModel
) {
  const graph = nodeGraphModel || NodeGraphContextTmp.nodeGraph.model;
  const parentNode = graph.roots.find((root) => root.type.allowChildrenWithCategory?.includes('Visual'));

  console.log('parentNode', parentNode.toJSON());

  const undoGroup = new UndoActionGroup({ label: `AI UI: ${prompt}` });

  try {
    statusCallback('Collecting context...');

    // TODO: Check if user components exist and should be added in a specific way, otherwise remove these lines
    // const { userComponents, uiPrimer } = collectUserContext();

    AiAssistantModel.instance.addGlobalChatMessage({ type: ChatMessageType.User, content: prompt });

    AiAssistantModel.instance.addGlobalChatMessage({
      type: ChatMessageType.Assistant,
      content: 'Waiting on AI...'
    });

    const chatRes = await chat({
      templateId: 'ui-generation',
      userPrompt: prompt,
      model: AiStore.getGeminiModel(),
      context: parentNode?.toJSON()
    });

    const responseContent =
      chatRes?.data?.responseMessage?.parts?.[0]?.text ?? chatRes?.responseMessage?.parts?.[0]?.text ?? null;
    if (!responseContent) throw new Error('AI returned an empty response.');

    AiAssistantModel.instance.addGlobalChatMessage({
      type: ChatMessageType.Assistant,
      content: 'Parsing AI response...'
    });

    console.log('response', responseContent);
    const patch = parseAiPatch(responseContent);

    console.log('parsed patch', patch);
    const createdNodes = buildNodesFromPatch(patch, graph, undoGroup);
    applyHierarchy(patch, createdNodes, graph, undoGroup);

    // If the AI created new root-level nodes, attach them to the determined parent node
    // if they haven't been attached somewhere else already.
    if (parentNode) {
      for (const nodeJson of patch) {
        const node = createdNodes.get(nodeJson.id);
        // If the node was created, doesn't have a parent, and is not already a child of the target parent, add it.
        if (node && !node.parent && !graph.findNodeWithId(node.id)) {
          parentNode.addChild(node, { disableSelect: true });
        }
      }
    }

    /* Removed connection handling for now
    statusCallback('Wiring connections...');
    connectNodes(graph, connections);
*/
    await handleImageNodes(patch, createdNodes);

    // Finalize the chat: clear the streaming message and add the final response.
    AiAssistantModel.instance.addGlobalChatMessage({
      type: ChatMessageType.Assistant,
      content: 'UI generated successfully!'
    });

    if (!undoGroup.isEmpty()) {
      UndoQueue.instance.push(undoGroup);
    }
  } catch (error: any) {
    const errorMessage = `Error: Failed to generate UI. ${error.message || 'An unknown error occurred.'}`;
    statusCallback(errorMessage);
    // Also show the error in the chat window
    AiAssistantModel.instance.setGlobalChatStreamingContent('');
    AiAssistantModel.instance.addGlobalChatMessage({ type: ChatMessageType.Assistant, content: errorMessage });
    console.error('AI UI Generation Error:', error);
  }
}

//
// Helper functions
//

function collectUserContext() {
  const components = ProjectModel.instance.components.filter((comp) =>
    comp.graph.commentsModel.getComments().some((comment) => comment.text.toLowerCase().startsWith('ai:'))
  );

  const comments = ProjectModel.instance.components.flatMap((comp) => comp.graph.commentsModel.getComments());

  const uiPrimer = comments.find((c) => c.text.toLowerCase().startsWith('ai ui primer:'))?.text;

  const userComponents = components.map((comp) => {
    const comment = comp.graph.commentsModel.getComments().find((c) => c.text.toLowerCase().startsWith('ai:'));
    const description = comment?.text.substring(3).trim() ?? '';

    return {
      name: comp.localName.toLowerCase().replaceAll(' ', '-'),
      fullName: comp.fullName,
      description,
      canHaveChildren: comp.allowChildrenWithCategory?.includes('Visual')
    };
  });

  return { userComponents, uiPrimer };
}

function parseAiPatch(content: string): NodeGraphNodeJSON[] {
  function clean(str: string) {
    return str
      .replace(/^```json/i, '')
      .replace(/```$/i, '')
      .trim();
  }

  if (!content) throw new Error('Empty AI response.');

  const cleaned = clean(content);

  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.error('Invalid JSON:', cleaned);
    throw new Error('AI returned invalid JSON.');
  }

  if (!parsed || !Array.isArray(parsed.nodes)) {
    throw new Error('AI returned unsupported format. Expected { nodes: [...] }.');
  }

  // Validate structure
  for (const n of parsed.nodes) {
    if (!n.id || typeof n !== 'object') {
      throw new Error('AI returned a node missing id.');
    }
  }

  return normalizePatch(parsed.nodes as NodeGraphNodeJSON[]);
}

function normalizePatch(patch: NodeGraphNodeJSON[]): NodeGraphNodeJSON[] {
  const idMap: Record<string, string> = {};

  for (const n of patch) {
    if (n.id.startsWith('new-uuid-')) {
      idMap[n.id] = guid();
    }
    if (Array.isArray(n.children)) {
      for (const c of n.children) {
        if (c.id && c.id.startsWith('new-uuid-')) {
          idMap[c.id] = guid();
        }
      }
    }
  }

  if (Object.keys(idMap).length === 0) return patch;

  // Replace IDs
  for (const n of patch) {
    if (idMap[n.id]) n.id = idMap[n.id];

    if (Array.isArray(n.children)) {
      for (const c of n.children) {
        if (idMap[c.id]) c.id = idMap[c.id];
      }
    }
  }

  return patch;
}

enum NodeStatus {
  ADDED = 'added',
  MODIFIED = 'modified',
  UNCHANGED = 'unchanged'
}

function buildNodesFromPatch(
  patch: NodeGraphNodeJSON[],
  nodeGraphModel: NodeGraphModel,
  undoGroup: UndoActionGroup
): Map<string, NodeGraphNode> {
  if (!Array.isArray(patch)) {
    throw new Error('AI patch must be an array of nodes.');
  }

  const created = new Map<string, NodeGraphNode>();

  const index = new Map<string, NodeGraphNodeJSON>();
  for (const n of patch) index.set(n.id, n);

  function applyParams(node: NodeGraphNode, params?: any, state?: string) {
    if (!params) return;
    for (const k in params) {
      node.setParameter(k, params[k], state ? { state } : undefined);
    }
  }

  function applyTransitions(node: NodeGraphNode, transitions?: Record<string, any>) {
    if (!transitions) return;
    for (const state in transitions) {
      for (const param in transitions[state]) {
        node.setStateTransition(state, param, transitions[state][param]);
      }
    }
  }

  for (const json of patch) {
    const status = (json.status ?? '').toLowerCase();

    // Always resolve type
    const typeName = transformComponentName(json.type);
    if (!typeName) continue;

    let node = nodeGraphModel.findNodeWithId(json.id);

    if (!node && status === NodeStatus.ADDED) {
      const data: NodeGraphNodeJSON = {
        ...json,
        type: typeName,
        children: [],
        x: json.x ?? 0,
        y: json.y ?? 0
      };

      setDefaultValues(data);
      node = NodeGraphNode.fromJSON(data);

      Object.defineProperty(node, 'owner', {
        value: nodeGraphModel,
        writable: true,
        configurable: true
      });

      const nref = node;
      undoGroup.push({
        undo: () => {
          if (!nref.parent) nodeGraphModel.removeNode(nref);
        }
      });
    } else if (node && status === NodeStatus.MODIFIED) {
      applyParams(node, json.parameters);
    }

    if (!node) continue;

    applyTransitions(node, json.stateTransitions);

    if (json.stateParameters) {
      for (const state in json.stateParameters) {
        applyParams(node, json.stateParameters[state], state);
      }
    }

    created.set(json.id, node);
  }

  return created;
}

function applyHierarchy(
  patch: NodeGraphNodeJSON[],
  created: Map<string, NodeGraphNode>,
  graph: NodeGraphModel,
  undoGroup: UndoActionGroup
) {
  const index = new Map<string, NodeGraphNodeJSON>();
  for (const n of patch) index.set(n.id, n);

  for (const parentJson of patch) {
    const parentNode = created.get(parentJson.id) || graph.findNodeWithId(parentJson.id);

    if (!parentNode) continue;

    if (Array.isArray(parentJson.children)) {
      for (const childRef of parentJson.children) {
        const childNode = created.get(childRef.id) || graph.findNodeWithId(childRef.id);

        if (!childNode) continue;

        if (childNode.parent !== parentNode) {
          parentNode.addChild(childNode, {
            disableSelect: true,
            undo: undoGroup
          });
        }
      }
    }
  }
}

// TODO - implement handling of connections
function connectNodes(nodeGraphModel: NodeGraphModel, connections: ConnectionDef[]) {
  for (const conn of connections) {
    const alreadyExists = nodeGraphModel.connections.some(
      (c) =>
        c.fromId === conn.fromId &&
        c.fromProperty === conn.fromProperty &&
        c.toId === conn.toId &&
        c.toProperty === conn.toProperty
    );

    if (!alreadyExists) {
      nodeGraphModel.addConnection(
        { fromId: conn.fromId, fromProperty: conn.fromProperty, toId: conn.toId, toProperty: conn.toProperty },
        {}
      );
    }
  }
}

async function handleImageNodes(patch: NodeGraphNodeJSON[], createdNodes: Map<string, NodeGraphNode>) {
  const patchMap = new Map(patch.map((p) => [p.id, p]));
  const generationPromises: Promise<void>[] = []; // Array to hold all individual promises

  createdNodes.forEach((node, id) => {
    const originalJson = patchMap.get(id);
    if (!originalJson || !originalJson.parameters) {
      return; // Skip if no originalJson or parameters
    }

    // Skip if node is not added or modified
    if (originalJson.status !== NodeStatus.ADDED && originalJson.status !== NodeStatus.MODIFIED) {
      return;
    }

    const userPrompt = originalJson.parameters.prompt;
    // Skip if no prompt is provided
    if (!userPrompt) {
      return;
    }

    AiAssistantModel.instance.addGlobalChatMessage({
      type: ChatMessageType.Assistant,
      content: 'Generating images...'
    });

    // Handle image generation for 'src' port
    if (node.findPortWithName('src')) {
      const generationPromise = generateImage({ userPrompt })
        .then((imageData) => saveImageDataToDisk(imageData))
        .then((url) => node.setParameter('src', url))
        .catch((err) => {
          console.error(`Image generation failed for node ${id} (prompt: "${userPrompt}"):`, err);
          throw err;
        });
      generationPromises.push(generationPromise);
    }

    // Check styleCss for image-new-uuid patterns
    const styleCss = originalJson.parameters.styleCss;
    if (styleCss) {
      if (/image-new-uuid/.test(styleCss)) {
        const generationPromise = generateImage({ userPrompt })
          .then((imageData) => saveImageDataToDisk(imageData))
          .then((url) => {
            node.setParameter('styleCss', replaceImageUuid(styleCss, url));
          })
          .catch((err) => {
            console.error(
              `Image generation failed for node ${id} (styleCss replacement, prompt: "${userPrompt}"):`,
              err
            );
            throw err;
          });
        generationPromises.push(generationPromise);
      }
    }
  });
  // Wait for all image generations to complete.
  await Promise.allSettled(generationPromises);
}

function replaceImageUuid(styleCss: string, newUrl: string) {
  // Extract just the filename from the new URL
  const newFileName = newUrl.split(/[/\\]/).pop(); // handles both / and \ paths

  // Replace only the filename part that starts with "image-new-uuid"
  return styleCss.replace(/image-new-uuid[\w-]*\.\w+/g, newFileName);
}

function transformComponentName(name: string) {
  const component = ProjectModel.instance.components.find(
    (c) => c.fullName.toLocaleLowerCase() === name.toLocaleLowerCase()
  );

  return component?.fullName || name;
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
  if (node.type === 'net.noodl.controls.textinput') {
    node.parameters.useLabel = false;
  }
}
