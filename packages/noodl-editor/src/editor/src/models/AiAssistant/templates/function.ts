import { ChatMessageType } from '@noodl-models/AiAssistant/ChatHistory';
import { AiNodeTemplate } from '@noodl-models/AiAssistant/interfaces';

import { ToastLayer } from '../../../views/ToastLayer/ToastLayer';
import { LocalUserIdentity } from '@noodl-utils/LocalUserIdentity';
import { chatStream as cloudChatStream } from '../cloud/CloudAiClient';
import { conversationStore } from '../conversationStore';

export const template: AiNodeTemplate = {
  type: 'pink',
  name: 'JavaScriptFunction',
  nodeDisplayName: 'Function Generator',
  onMessage: async (context) => {
    const activityId = 'processing';
    context.chatHistory.addActivity({ id: activityId, name: 'Processing' });

    try {
      const lastUserMsg = [...context.chatHistory.messages].reverse().find((m) => m.metadata?.user);
      const prompt = lastUserMsg ? lastUserMsg.content : '';

			// Create a placeholder assistant message to stream into
			context.chatHistory.add({
				content: '',
				type: ChatMessageType.Assistant,
				metadata: { streaming: true }
			});

			// Generate code via cloud template 'function'
			const userInfo = LocalUserIdentity.getUserInfo();
			const userId = userInfo?.id || 'local';
			const existingConversationId = conversationStore.getConversationIdForNode(context.node.id) || undefined;
			const { fullText: response, conversation } = await cloudChatStream({
				userId,
				templateId: 'function',
				userPrompt: `Current request:\n${prompt}\n\nRespond only with valid JavaScript code.`,
				conversationId: existingConversationId,
				signal: context.abortController.signal,
				onStream(fullText) {
					context.chatHistory.updateLast({ content: fullText, metadata: { streaming: true } });
				}
			});
			if (!existingConversationId && conversation?.conversationId) {
				conversationStore.linkConversationToNode(context.node.id, conversation.conversationId);
			}

      let javascriptCode = '';
      const codeBlockMatch = response.match(/```(?:javascript|js)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        javascriptCode = codeBlockMatch[1].trim();
      } else {
        javascriptCode = response.trim();
      }

      if (!javascriptCode) throw new Error('No function code generated');

			context.node.setParameter('functionScript', javascriptCode);
			// Mark streaming complete on the assistant message
			context.chatHistory.updateLast({ metadata: { streaming: false } });

      // Generate explanation and label in separate roles
      const explanationPrompt = FUNCTION_CODE_EXPLAIN(false).replace('%{code}%', javascriptCode);

			const nextConversationId =
				existingConversationId || conversation?.conversationId || conversationStore.getConversationIdForNode(context.node.id) || undefined;
			const { fullText: explanationResponse } = await cloudChatStream({
				userId,
				templateId: 'function',
				userPrompt: explanationPrompt,
				conversationId: nextConversationId,
				signal: context.abortController.signal,
				onStream(fullText) {
					console.log('Explanation response:', fullText);
				}
			});

      const labelMatch = explanationResponse.match(/<label>(.*?)<\/label>/);
      const explainMatch = explanationResponse.match(/<explain>([\s\S]*?)<\/explain>/);

      if (labelMatch && explainMatch) {
        const label = labelMatch[1].trim();
        const explanation = explainMatch[1].trim();

        context.node.setLabel(label);

        context.chatHistory.add({
          content: `**${label}**\n\n${explanation}`,
          type: ChatMessageType.Assistant
        });
      }

      context.chatHistory.removeActivity(activityId);
    } catch (error) {
      ToastLayer.showError(error.message || 'Failed to generate function');
      context.chatHistory.clearActivities();
    }
  }
};

export const FUNCTION_CODE_CONTEXT = `###Instructions###
You are writing Noodl Javascript functions with the following rules:
Inputs follow "Inputs[InputName]" format and are read-only. 

Outputs follow "Outputs[OutputName] = value" format, and variables don't store outputs. 

Signals are sent using "Outputs.SignalName()" without passing values. 

Inputs and Outputs are global, and const should use Noodl inputs with OR operator and default value. 

Call "Success" or "Failure" output signals accordingly. 

Inputs and outputs can have human-readable string names. 

Do not explain each input and output outside the code block.

Functions can use resources from a CDN and access APIs with "fetch." For API handling, make API keys inputs, throw an error for invalid keys, add queries as inputs, and send primitive values to outputs.

Write helpful comments in the code block, so anyone can understand the code.

###Example###
\`\`\`javascript
const city = Inputs.City || 'Malmö';
if (!city) return;

const apiKey = Inputs.ApiKey || '';
if (!apiKey) throw new Error('Invalid API key');
const url = \`https://api.openweathermap.org/data/2.5/weather?q=\${city}&appid=\${apiKey}\`;

try {
  const response = await fetch(url);
  const data = await response.json();
  Outputs.Temperature = data.main.temp;
  Outputs.Success();
} catch (error) {
  Outputs.error = error;
  Outputs.Failure();
}
\`\`\`

###Task###
ONLY respond with javascript code following the instructions and starting and ending with \`\`\`
`;

export const FUNCTION_CODE_CONTEXT_EDIT = `###Instructions###
You are writing Noodl Javascript functions with the following rules:
Inputs follow "Inputs[InputName]" format and are read-only. 

Outputs follow "Outputs[OutputName] = value" format, and variables don't store outputs. 

Signals are sent using "Outputs.SignalName()" without passing values. 

Inputs and Outputs are global, and const should use Noodl inputs with OR operator and default value. 

Call "Success" or "Failure" output signals accordingly. 

Inputs and outputs can have human-readable string names. 

Do not explain each input and output outside the code block.

Functions can use resources from a CDN and access APIs with "fetch." For API handling, make API keys inputs, throw an error for invalid keys, add queries as inputs, and send primitive values to outputs.

Write helpful comments in the code block, so anyone can understand the code.

We are starting from this code and will only modify it:
\`\`\`
%{code}%
\`\`\`

###Task###
ONLY respond with javascript code following the instructions and starting and ending with \`\`\`
`;

export const FUNCTION_CODE_EXPLAIN = (enableSuggestions: boolean) => {
  return `###Context###
- This function is a Function node in Noodl.
- We are currently inside a Component with this node created, the node have the function inside.
- All the variables from the Inputs object is defined on the node as inputs which can be set via the properties on input connection.
- All the variables on the Outputs object is defined on the node as outputs which can be connected to another node.
- Do not show code blocks.

###Instructions###
Analyse the function and create an explanation${
    enableSuggestions ? ' and a maximum of 3 follow-up questions related to the code' : ''
  }.

###Explanation###
Explain with 2-5 sentences what the function does.
- Always include the property names of the Inputs and Outputs objects.
- Always format the property names of the Inputs like this: <Input>input name</Input>
- Always format the property names of the Outputs like this: <Output>output name</Output>

###Label###
Create a label that summarises what the function does.

###Example###
<label>Data To Excel</label>
<explain>
This function converts a JSON data array to an Excel file and initiates a download.

It takes <Input>Data</Input> and <Input>FileName</Input> as inputs, creates a new workbook and worksheet using the XLSX library, converts the JSON data to a sheet, and appends the sheet to the workbook.

It then converts the workbook to a binary string, creates a Blob, and generates a download link. Finally, it triggers the <Output>Success</Output> output signal after the download is initiated.

If the request is successful, it triggers the Outputs.Success output signal.

If there's an error, it sets the Outputs.error output and triggers the Outputs.Failure output signal.
</explain>
${
  enableSuggestions
    ? `<question>What is the format of the required JSON data array?</question>
<question>How do I connect this node to other nodes in my Noodl project?</question>
<question>Are there any limitations or required libraries for this function to work properly?</question>`
    : ''
}

###Task###
Respond only with this specific format, and nothing else:
<label>The label</label>
<explain>
Markdown text.
</explain>
${enableSuggestions ? '<question>Maximum of 3 follow-up questions</question>' : ''}`;
};

export const FUNCTION_CODE_EXPLAIN_PROMPT = (question: string, answer: string, code: string) => {
  return `I got this information with the code, is there something important here that I should think about? Include this in the <explain> element, starting with a new paragraph.

user: ""${question}""
assistant: ""
${answer}
""

###Current code###
\`\`\`
${code}
\`\`\`
`;
};

export const FUNCTION_CODE_QUESTION = () => {
  return `###Context###
- This function is a Function node in Noodl.
- We are currently inside a Component with this node created, the node have the function inside.
- All the variables from the Inputs object is defined on the node as inputs which can be set via the properties on input connection.
- All the variables on the Outputs object is defined on the node as outputs which can be connected to another node.

###Current code###
\`\`\`
%{code}%
\`\`\`
`;
};
