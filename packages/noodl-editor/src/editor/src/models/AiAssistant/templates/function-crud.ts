import { OpenAiStore } from '@noodl-store/AiAssistantStore';

import { ChatMessageType } from '@noodl-models/AiAssistant/ChatHistory';
import { extractDatabaseSchema } from '@noodl-models/AiAssistant/DatabaseSchemaExtractor';
import { AiNodeTemplate, IAiCopilotContext } from '@noodl-models/AiAssistant/interfaces';

// Define constants inline to avoid circular imports
const FUNCTION_CRUD_CONTEXT = `
With these functions you can read, write and delete records in the cloud database. All functions are async and will throw an exception if they fail.

- An input in a Noodl function must follow the format "Inputs.InputName".
- An input in a Noodl function is only read, never written to.
- An output in a Noodl function must follow the format "Outputs.OutputName = value".
- A variable in a Noodl function never stores an output.
- Sending a signal from a Noodl function must follow the format "Outputs.SignalName()".
- Signals can not be passed values. All output values must be set as a Noodl function output.
- Inputs and Outputs in a Noodl function are global.
- Noodl functions do not use import statements.
- Noodl functions do not use export statements.
- Noodl functions can use recources from a CDN.
- Noodl functions can access API endpoints with "fetch".
- Define constants as Noodl function inputs.
- All const should be using Noodl inputs with an OR operator to a default value.
- When the request is successful call "Success" output signal.
- When something fails in the code the "Failure" output signal.

Here is the schema of the database:
%{database-schema}%

Respond only with this specific format, and nothing else:
<function>output the code</function>
<explain>short description</explain>`;

const FUNCTION_CRUD_CONTEXT_EDIT = `
With these functions you can read, write and delete records in the cloud database. All functions are async and will throw an exception if they fail.

- An input in a Noodl function must follow the format "Inputs.InputName".
- An input in a Noodl function is only read, never written to.
- An output in a Noodl function must follow the format "Outputs.OutputName = value".
- A variable in a Noodl function never stores an output.
- Sending a signal from a Noodl function must follow the format "Outputs.SignalName()".
- Signals can not be passed values. All output values must be set as a Noodl function output.
- Inputs and Outputs in a Noodl function are global.
- Noodl functions do not use import statements.
- Noodl functions do not use export statements.
- Noodl functions can use recources from a CDN.
- Noodl functions can access API endpoints with "fetch".
- Define constants as Noodl function inputs.
- All const should be using Noodl inputs with an OR operator to a default value.
- When the request is successful call "Success" output signal.
- When something fails in the code the "Failure" output signal.

Here is the schema of the database:
%{database-schema}%

We are starting from this code and will only modify it:
\`\`\`
%{code}%
\`\`\`

Respond only with this specific format, and nothing else:
<function>output the code</function>
<explain>short description</explain>`;

export const template: AiNodeTemplate = {
  type: 'green',
  name: 'JavaScriptFunction',
  nodeDisplayName: 'Write to Database',
  onMessage: async ({ node, chatHistory, chatStreamXml }: IAiCopilotContext) => {
    const activityId = 'processing';
    const activityCodeGenId = 'code-generation';

    chatHistory.addActivity({
      id: activityId,
      name: 'Processing'
    });

    chatHistory.addActivity({
      id: activityCodeGenId,
      name: 'Generating code...'
    });

    // ---
    // Database
    const dbCollectionsSource = await extractDatabaseSchema();
    console.log('database schema', dbCollectionsSource);

    const currentScript = node.getParameter('functionScript');

    // Convert chat history to messages format
    const history = chatHistory.messages.map((x) => ({
      role: String(x.type),
      content: x.content
    }));

    const messages = currentScript
      ? [
          {
            role: 'system',
            content: FUNCTION_CRUD_CONTEXT_EDIT.replace('%{database-schema}%', dbCollectionsSource).replace(
              '%{code}%',
              currentScript
            )
          },
          history[history.length - 1]
        ]
      : [
          {
            role: 'system',
            content: FUNCTION_CRUD_CONTEXT.replace('%{database-schema}%', dbCollectionsSource)
          },
          ...history
        ];

    // Get the selected AI model and route accordingly
    const selectedAiModel = OpenAiStore.getAiSelectedModel();

    if (selectedAiModel === 'disabled') {
      throw new Error('AI is disabled. Please enable an AI model in the editor settings.');
    }

    if (selectedAiModel === 'openai') {
      // Use OpenAI (existing logic)
      const result = [''];

      const fullText = await chatStreamXml({
        messages,
        provider: {
          model: OpenAiStore.getOpenAiModel(),
          temperature: 0.5,
          max_tokens: 2048
        },
        onStream(tagName, text) {
          // TODO: It calls an empty string at the end, why?
          if (text.length === 0) {
            return;
          }

          console.log('[stream]', tagName, text);

          switch (tagName) {
            case 'explain': {
              chatHistory.updateLast({
                content: text
              });
              break;
            }
          }
        },
        onTagOpen(tagName) {
          switch (tagName) {
            case 'Input':
            case 'Output': {
              result.push('');
              break;
            }
          }
        },
        onTagEnd(tagName, fullText) {
          console.log('[done]', tagName, fullText);

          switch (tagName) {
            case 'label': {
              node.setLabel(fullText);
              break;
            }

            case 'explain': {
              result[result.length - 1] = fullText;
              result.push('');
              break;
            }

            case 'Input': {
              result[result.length - 1] = fullText;
              result.push('');
              break;
            }

            case 'Output': {
              result[result.length - 1] = fullText;
              result.push('');
              break;
            }
          }

          if (['explain', 'Input', 'Output'].includes(tagName)) {
            chatHistory.updateLast({
              content: result.join('')
            });
          }
        }
      });
    } else if (selectedAiModel === 'gemini') {
      // Use Gemini
      const { callGeminiApi } = await import('../api');
      const apiKey = OpenAiStore.getGeminiApiKey();
      const model = OpenAiStore.getGeminiModel();

      if (!apiKey) {
        throw new Error('Gemini is not properly configured. Please check your API key.');
      }

      // For now, use a simple approach with Gemini
      // TODO: Implement full Gemini CRUD template logic
      const lastUserMsg = [...chatHistory.messages].reverse().find((m) => m.metadata?.user);
      const prompt = lastUserMsg ? lastUserMsg.content : '';

      const systemPrompt = `You are an AI assistant that helps create database CRUD (Create, Read, Update, Delete) functions for Noodl nodes.

Users describe what database operation they want to perform, and you generate JavaScript code that:
1. Uses Noodl.Records to perform database operations
2. Defines inputs using the Inputs object
3. Defines outputs using the Outputs object  
4. Implements the requested database CRUD functionality
5. Uses proper JavaScript syntax and best practices

Available database collections: ${JSON.stringify(dbCollectionsSource, null, 2)}

Example structure:
\`\`\`javascript
// Define inputs
Inputs.YourInput = "string";

// Define outputs  
Outputs.YourOutput = "string";

// Your database CRUD logic here
const result = Noodl.Records.create('CollectionName', { /* data */ });
Outputs.YourOutput = result;
\`\`\`

Generate ONLY the JavaScript code for the database CRUD function.`;

      const response = await callGeminiApi(apiKey, model, `${systemPrompt}\n\nUser request: ${prompt}`);

      // Extract and set the function script
      if (response) {
        const codeBlockMatch = response.match(/```(?:javascript|js)?\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch) {
          const functionScript = codeBlockMatch[1].trim();
          node.setParameter('functionScript', functionScript);

          // Add the generated code to chat history
          chatHistory.add({
            content: `Generated database CRUD function:\n\`\`\`javascript\n${functionScript}\n\`\`\``,
            type: ChatMessageType.Assistant
          });
        }
      }
    } else {
      throw new Error('Invalid AI model selection. Please check your editor settings.');
    }

    chatHistory.removeActivity(activityCodeGenId);
    chatHistory.removeActivity(activityId);
  }
};
