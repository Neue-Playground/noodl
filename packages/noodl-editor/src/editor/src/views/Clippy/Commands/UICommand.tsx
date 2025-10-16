import { NodeGraphContextTmp } from '@noodl-contexts/NodeGraphContext/NodeGraphContext';
import { AiStore } from '@noodl-store/AiAssistantStore';

import { AiAssistantModel } from '@noodl-models/AiAssistant';
import { Ai } from '@noodl-models/AiAssistant/api';
import { ChatMessageType } from '@noodl-models/AiAssistant/ChatHistory';
import { NodeGraphModel, NodeGraphNode, NodeGraphNodeJSON } from '@noodl-models/nodegraphmodel';
import { ProjectModel } from '@noodl-models/projectmodel';
import { UndoActionGroup, UndoQueue } from '@noodl-models/undo-queue-model';
import { guid } from '@noodl-utils/utils';

import { generateUiPrimer } from './ui-primer';
import { saveImageDataToDisk } from './utils';

type UICommandOptions = {
  allowImageNode?: boolean;
  allowImageGeneration?: boolean;
  nodeGraphModel?: NodeGraphModel;
};

type ConnectionDef = {
  fromId: string;
  fromProperty: string;
  toId: string;
  toProperty: string;
};

export async function handleUICommand(
  prompt: string,
  statusCallback: (status: string) => void,
  options?: UICommandOptions
) {
  const nodeGraphModel = options?.nodeGraphModel || NodeGraphContextTmp.nodeGraph.model;
  const parentNode = nodeGraphModel.roots.find((root) => root.type.allowChildrenWithCategory?.includes('Visual'));

  console.log('parentNode', parentNode);

  try {
    statusCallback('Collecting context...');
    const { userComponents, uiPrimer } = collectUserContext();

    const messages = [
      {
        role: 'system',
        content: generateUiPrimer({
          ...options,
          userComponents,
          parentNode: parentNode?.id,
          uiPrimer,
          nodeGraphModel
        })
      },
      { role: 'user', content: prompt }
    ];

    AiAssistantModel.instance.addGlobalChatMessage({ type: ChatMessageType.User, content: prompt });

    const responseContent = await Ai.chat({
      messages,
      provider: { model: AiStore.getGeminiModel() } as any // removed responseSchema due to error in Gemini parsing for now
    });

    if (!responseContent) throw new Error('AI returned an empty response.');

    AiAssistantModel.instance.addGlobalChatMessage({
      type: ChatMessageType.Assistant,
      content: 'Parsing AI response...'
    });
    const patch = parseAiPatch(responseContent);

    const createdNodes = buildNodesFromPatch(patch, nodeGraphModel);
    applyHierarchy(patch, createdNodes, nodeGraphModel);

    // If the AI created new root-level nodes, attach them to the determined parent node
    // if they haven't been attached somewhere else already.
    if (parentNode) {
      for (const nodeJson of patch) {
        const node = createdNodes.get(nodeJson.id);
        // If the node was created, doesn't have a parent, and is not already a child of the target parent, add it.
        if (node && !node.parent && !nodeGraphModel.findNodeWithId(node.id)) {
          parentNode.addChild(node, { disableSelect: true });
        }
      }
    }

    /* Removed connection handling for now
    statusCallback('Wiring connections...');
    connectNodes(nodeGraphModel, connections);
*/
    await handleImageNodes(patch, createdNodes);

    // Finalize the chat: clear the streaming message and add the final response.
    AiAssistantModel.instance.addGlobalChatMessage({
      type: ChatMessageType.Assistant,
      content: 'UI generated successfully!'
    });
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
  function cleanJsonResponse(str) {
    return str
      .replace(/^```json\s*/, '') // remove leading ```json
      .replace(/^```\s*/, '') // remove leading ```
      .replace(/\s*```$/, '') // remove trailing ```
      .trim();
  }

  const raw = content; // whatever comes back
  const cleaned = cleanJsonResponse(raw);

  let parsed: NodeGraphNodeJSON[];
  try {
    parsed = JSON.parse(cleaned) as NodeGraphNodeJSON[];
  } catch (err) {
    throw new Error('Invalid JSON returned by AI.');
  }

  // TODO: validate with schema (e.g. AJV)
  return normalizePatch(parsed);
}

function normalizePatch(patch: NodeGraphNodeJSON[]): NodeGraphNodeJSON[] {
  const idMap: Record<string, string> = {};

  // First pass: collect all placeholder IDs and map them to new GUIDs
  function collectIds(nodes: NodeGraphNodeJSON[]) {
    if (!nodes) return;
    for (const node of nodes) {
      if (node.id?.startsWith('new-uuid-')) {
        idMap[node.id] = guid();
      }
      collectIds(node.children);
    }
  }
  collectIds(patch);

  if (Object.keys(idMap).length === 0) return patch;

  // Second pass: traverse the whole patch and replace any string that is a placeholder ID
  function replaceIn(obj: any) {
    if (!obj) return;
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        const value = obj[i];
        if (typeof value === 'string' && idMap[value]) {
          obj[i] = idMap[value];
        } else {
          replaceIn(value);
        }
      }
    } else if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const value = obj[key];
          if (typeof value === 'string' && idMap[value]) {
            obj[key] = idMap[value];
          } else {
            replaceIn(value);
          }
        }
      }
    }
  }

  replaceIn(patch);
  return patch;
}

enum NodeStatus {
  ADDED = 'added',
  MODIFIED = 'modified',
  UNCHANGED = 'unchanged'
}

function buildNodesFromPatch(
  patch: Partial<NodeGraphNodeJSON>[],
  nodeGraphModel: NodeGraphModel
): Map<string, NodeGraphNode> {
  const createdNodes = new Map<string, NodeGraphNode>();
  const visited = new Set<string>();

  function applyParameters(node: NodeGraphNode, params?: Record<string, any>, state?: string) {
    if (!params) return;
    for (const key in params) {
      node.setParameter(key, params[key], state ? { state } : undefined);
    }
  }

  function applyStateTransitions(node: NodeGraphNode, transitions?: Record<string, Record<string, any>>) {
    if (!transitions) return;

    Object.entries(transitions).forEach(([stateName, transitionParams]) => {
      Object.entries(transitionParams).forEach(([parameterName, curve]) => {
        node.setStateTransition(stateName, parameterName, curve);
      });
    });
  }

  /**
   * Process a node from the patch, handling it according to its status:
   * - UNCHANGED: Skip processing entirely
   * - MODIFIED: Update only existing nodes with new properties
   * - ADDED: Create new nodes only if they don't exist
   */
  function processNode(nodeJson: Partial<NodeGraphNodeJSON>): NodeGraphNode | null {
    if (!nodeJson?.id) return null;
    if (visited.has(nodeJson.id)) return null;
    visited.add(nodeJson.id);
    console.log('Processing node:', nodeJson);

    // Skip unchanged nodes
    if (nodeJson.status === NodeStatus.UNCHANGED) return null;

    const typeName = nodeJson.type ? transformComponentName(nodeJson.type) : undefined;
    if (!typeName) {
      console.warn('Skipping node with no type:', nodeJson);
      return null;
    }

    let node = nodeGraphModel.findNodeWithId(nodeJson.id);

    if (node) {
      // Only update if node is marked as modified
      if (nodeJson.status === NodeStatus.MODIFIED) {
        setTimeout(() => {
          if (nodeJson.label) node.setLabel(nodeJson.label);
          applyParameters(node, nodeJson.parameters);
        }, 0);
      }
    } else {
      // Only create if node is marked as added
      if (nodeJson.status !== NodeStatus.ADDED) {
        console.warn('Skipping non-added node creation:', nodeJson);
        return null;
      }
      const nodeData: NodeGraphNodeJSON = {
        ...nodeJson,
        type: typeName,
        children: [], // attach later
        x: nodeJson.x ?? 0,
        y: nodeJson.y ?? 0
      } as NodeGraphNodeJSON;

      setDefaultValues(nodeData);
      node = NodeGraphNode.fromJSON(nodeData);

      Object.defineProperty(node, 'owner', {
        value: nodeGraphModel,
        writable: true,
        configurable: true,
        enumerable: false
      });
    }

    applyStateTransitions(node, nodeJson.stateTransitions);
    if (nodeJson.stateParameters) {
      for (const stateName in nodeJson.stateParameters) {
        applyParameters(node, nodeJson.stateParameters[stateName], stateName);
      }
    }

    createdNodes.set(node.id, node);

    if (Array.isArray(nodeJson.children)) {
      for (const childJson of nodeJson.children) {
        processNode(childJson);
      }
    }

    return node;
  }

  for (const nodeJson of patch) {
    processNode(nodeJson);
  }

  return createdNodes;
}

function applyHierarchy(
  patch: NodeGraphNodeJSON[],
  createdNodes: Map<string, NodeGraphNode>,
  nodeGraphModel: NodeGraphModel
) {
  const visited = new Set<string>();

  function linkChildren(nodeJson: NodeGraphNodeJSON, parentNode?: NodeGraphNode) {
    if (!nodeJson?.id || visited.has(nodeJson.id)) return;
    visited.add(nodeJson.id);

    // Prefer created node, fall back to existing model node
    const node = createdNodes.get(nodeJson.id) || nodeGraphModel.findNodeWithId(nodeJson.id);
    if (!node) {
      console.warn('Could not find or create node with id:', nodeJson.id);
      return;
    }

    if (parentNode) {
      // Only add if not already attached
      if (!parentNode.children.includes(node)) {
        parentNode.addChild(node, { disableSelect: true });
      }
    }

    if (Array.isArray(nodeJson.children)) {
      for (const childJson of nodeJson.children) {
        linkChildren(childJson, node);
      }
    }
  }

  for (const nodeJson of patch) {
    linkChildren(nodeJson, undefined);
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

    const prompt = originalJson.parameters.prompt;
    // Skip if no prompt is provided
    if (!prompt) {
      return;
    }

    AiAssistantModel.instance.addGlobalChatMessage({
      type: ChatMessageType.Assistant,
      content: 'Generating images...'
    });

    // Handle image generation for 'src' port
    if (node.findPortWithName('src')) {
      const generationPromise = Ai.makeImageGenerationRequest(prompt)
        .then((imageData) => saveImageDataToDisk(imageData))
        .then((url) => node.setParameter('src', url))
        .catch((err) => {
          console.error(`Image generation failed for node ${id} (prompt: "${prompt}"):`, err);
          throw err;
        });
      generationPromises.push(generationPromise);
    }

    // Check styleCss for image-new-uuid patterns
    const styleCss = originalJson.parameters.styleCss;
    if (styleCss) {
      if (/image-new-uuid/.test(styleCss)) {
        const generationPromise = Ai.makeImageGenerationRequest(prompt)
          .then((imageData) => saveImageDataToDisk(imageData))
          .then((url) => {
            node.setParameter('styleCss', replaceImageUuid(styleCss, url));
          })
          .catch((err) => {
            console.error(`Image generation failed for node ${id} (styleCss replacement, prompt: "${prompt}"):`, err);
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
