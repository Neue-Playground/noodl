import { NodeGraphContextTmp } from '@noodl-contexts/NodeGraphContext/NodeGraphContext';

import { NodeGraphNode } from '@noodl-models/nodegraphmodel';
import { guid } from '@noodl-utils/utils';

import { generateImage } from '../../../models/AiAssistant/cloud/CloudAiClient';
import { saveImageDataToDisk } from './utils';

export async function handleImageCommand(userPrompt: string, statusCallback: (status: string) => void) {
  statusCallback('Generating image...');
  const imageData = await generateImage({ userPrompt });
  // Log the returned shape to aid debugging if the write fails
  try {
    const imageUrl = await saveImageDataToDisk(imageData);

    const selectedNodes = NodeGraphContextTmp.nodeGraph.getSelectedNodes();
    const nodeModel = selectedNodes[0]?.model;

    //if the selected node has a "src" input, set that input directly...
    if (nodeModel && nodeModel.findPortWithName('src')) {
      nodeModel.setParameter('src', imageUrl);
    } else {
      // ...otherwise create a new node
      addNodeToGraph(
        NodeGraphNode.fromJSON({
          x: 0,
          y: 0,
          id: guid(),
          type: 'Image',
          parameters: {
            src: imageUrl
          }
        })
      );
    }
  } catch (err) {
    console.error('Failed to save generated image:', err, imageData);
    throw err;
  }
}

function addNodeToGraph(node) {
  const nodeGraphModel = NodeGraphContextTmp.nodeGraph.model;

  for (const root of nodeGraphModel.roots) {
    if (root.canAcceptChildren([node])) {
      root.addChild(node, { undo: true, label: 'create' });
    }
  }

  if (node.parent === undefined) {
    // Couldn't find compatiable root
    nodeGraphModel.addRoot(node, { undo: true, label: 'create' });
  }
}
