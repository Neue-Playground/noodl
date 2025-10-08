import { extractDatabaseSchema } from '@noodl-models/AiAssistant/DatabaseSchemaExtractor';
import { AiNodeTemplate, IAiCopilotContext } from '@noodl-models/AiAssistant/interfaces';

import { Ai } from '../api';

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
/*
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
const result = Noodl.Records.create('CollectionName', { *data* });
Outputs.YourOutput = result;
\`\`\`

Generate ONLY the JavaScript code for the database CRUD function.`;
*/
export const template: AiNodeTemplate = {
  type: 'green',
  name: 'JavaScriptFunction',
  nodeDisplayName: 'Write to Database',
  onMessage: async ({ node, chatHistory }: IAiCopilotContext) => {
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

    await Ai.chatStream({
      messages,
      onStream(fullText) {
        const functionMatch = fullText.match(/<function>([\s\S]*?)<\/function>/);
        if (functionMatch) {
          node.setParameter('functionScript', functionMatch[1].trim());
        }

        const explainMatch = fullText.match(/<explain>([\s\S]*?)<\/explain>/);
        if (explainMatch) {
          const explainText = explainMatch[1].trim();
          chatHistory.updateLast({
            content: explainText
          });
        }

        const labelMatch = fullText.match(/<label>([\s\S]*?)<\/label>/);
        if (labelMatch) {
          node.setLabel(labelMatch[1].trim());
        }
      }
    });

    chatHistory.removeActivity(activityCodeGenId);
    chatHistory.removeActivity(activityId);
  }
};
