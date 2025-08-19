import { OpenAiStore } from '@noodl-store/AiAssistantStore';

import { ChatMessageType } from '@noodl-models/AiAssistant/ChatHistory';
import { AiUtils } from '@noodl-models/AiAssistant/context/ai-utils';
import { AiNodeTemplate } from '@noodl-models/AiAssistant/interfaces';
import { extractCodeBlock, wrapInput, wrapOutput } from '@noodl-models/AiAssistant/templates/helper';
import { ConnectionInspector } from '@noodl-utils/connectionInspector';

export const template: AiNodeTemplate = {
  type: 'blue',
  name: 'noodl.chart-js.chart',
  onMessage: async ({ node, chatHistory, chatStream, chatStreamXml }) => {
    const activityId = 'processing';
    const activityCodeGenId = 'code-generation';

    chatHistory.addActivity({
      id: activityId,
      name: 'Processing'
    });

    // ---
    // Generate the code

    chatHistory.addActivity({
      id: activityCodeGenId,
      name: 'Generating code...'
    });

    const history = chatHistory.messages.map((x) => ({
      role: String(x.type),
      content: x.content
    }));

    const data = await ConnectionInspector.instance.getConnectionValue(node, 'input', 'data');
    console.log('fullData', data);

    const shortData = Array.isArray(data) ? data.slice(0, 3) : data;
    const shortDataJson = JSON.stringify(shortData);
    console.log('data', shortDataJson);

    const currentScript = node.getParameter('functionScript');
    const messages = currentScript
      ? [
          {
            role: 'system',
            content: CONTEXT_EDIT.replace('%{code}%', currentScript).replace('%{data}%', shortDataJson)
          },
          history.at(-1)
        ]
      : [{ role: 'system', content: CONTEXT.replace('%{data}%', shortDataJson) }, ...history];

    // Get the selected AI model and route accordingly
    const selectedAiModel = OpenAiStore.getAiSelectedModel();

    if (selectedAiModel === 'disabled') {
      throw new Error('AI is disabled. Please enable an AI model in the editor settings.');
    }

    if (selectedAiModel === 'openai') {
      // Use OpenAI (existing logic)
      const fullCodeText = await chatStream({
        provider: {
          model: OpenAiStore.getOpenAiModel(),
          temperature: 0.0,
          max_tokens: 2048
        },
        messages,
        onStream(fullText) {
          console.log('code:', fullText);
        }
      });

      const codeText = extractCodeBlock(fullCodeText);
      if (codeText) {
        node.setParameter('functionScript', codeText);
      }
    } else if (selectedAiModel === 'gemini') {
      // Use Gemini
      const { callGeminiApi } = await import('../api');
      const apiKey = OpenAiStore.getGeminiApiKey();
      const model = OpenAiStore.getGeminiModel();

      if (!apiKey) {
        throw new Error('Gemini is not properly configured. Please check your API key.');
      }

      // Convert messages to Gemini format
      const geminiPrompt = messages.map((msg) => `${msg.role}: ${msg.content}`).join('\n\n');

      const response = await callGeminiApi(apiKey, model, geminiPrompt);

      if (response) {
        const codeBlockMatch = response.match(/```(?:javascript|js)?\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch) {
          const codeText = codeBlockMatch[1].trim();
          node.setParameter('functionScript', codeText);
        }
      }
    } else {
      throw new Error('Invalid AI model selection. Please check your editor settings.');
    }

    chatHistory.removeActivity(activityCodeGenId);
    chatHistory.removeActivity(activityId);
  }
};

const CONTEXT = `###Instructions###
- You will be creating javascript config objects for the chartjs library.
- You ONLY need to provide the config object.
- An input in the javascript code must follow the format "Inputs.InputName".
- An input in the javascript code is only read, never written to.
- Don't use features that require external libraries, like date adapters.

### Examples ###
A chart showing number of votes for different colors:
\`\`\`
if (!Inputs.data) return;

config  = {
  type: 'bar',
  data: {
    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
    datasets: [{
      label: '# of Votes',
      data: [12, 19, 3, 5, 2, 3],
      borderWidth: 1
    }]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
}
\`\`\`

Here is my input data:
\`\`\`
Inputs.data = %{data}%
\`\`\`

###Task###
ONLY respond with javascript code following the instructions and starting and ending with \`\`\`
`;

const CONTEXT_EDIT = `###Instructions###
- You will be creating javascript config objects for the chartjs library.
- You ONLY need to provide the config object.
- An input in the javascript code must follow the format "Inputs.InputName".
- An input in the javascript code is only read, never written to.
- Don't use features that require external libraries, like date adapters.

Here is my input data:
\`\`\`
Inputs.data = %{data}%
\`\`\`

We are starting from this code and will only modify it:
\`\`\`
%{code}%
\`\`\`

###Task###
ONLY respond with javascript code following the instructions and starting and ending with \`\`\`
`;

const CONTEXT_EXPLAIN = `###Context###
- This is a Chart node in Noodl using Chart.js.
- We are currently inside a Component with this node created, the node have the function inside.

###Instructions###
Analyse the function and create an explanation related to the code.

###Explanation###
Explain with 2-5 sentences what the function does.
- Always include the property names of the Inputs and Outputs objects.
- Always format the property names of the Inputs like this: <Input>input name</Input>
- Always format the property names of the Outputs like this: <Output>output name</Output>

###Label###
Create a label that summarises what the function does.

###Example###
<label>Show a bar chart of cars</label>
<explain></explain>`;
