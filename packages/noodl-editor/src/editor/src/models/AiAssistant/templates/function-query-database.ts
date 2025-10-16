import { AiStore } from '@noodl-store/AiAssistantStore';

import { Ai } from '@noodl-models/AiAssistant/api';
import { ChatMessageType } from '@noodl-models/AiAssistant/ChatHistory';
import { extractDatabaseSchema } from '@noodl-models/AiAssistant/DatabaseSchemaExtractor';
import { AiNodeTemplate } from '@noodl-models/AiAssistant/interfaces';

export const template: AiNodeTemplate = {
  type: 'green',
  name: 'JavaScriptFunction',
  nodeDisplayName: 'Read Database',
  onMessage: async (context) => {
    const activityId = 'processing';
    const activityCodeGenId = 'code-generation';

    context.chatHistory.addActivity({
      id: activityId,
      name: 'Processing'
    });

    context.chatHistory.addActivity({
      id: activityCodeGenId,
      name: 'Generating code...'
    });

    // ---
    // Database
    const dbCollectionsSource = await extractDatabaseSchema();
    console.log('database schema', dbCollectionsSource);

    const systemPrompt = `You are an AI assistant that helps create database query functions for Noodl nodes.
    Users describe what database query they want to perform, and you generate JavaScript code that:
    1. Uses Noodl.Records.query to query the database
    2. Defines inputs using the Inputs object
    3. Defines outputs using the Outputs object  
    4. Implements the requested database query functionality
    5. Uses proper JavaScript syntax and best practices

    Available database collections: ${JSON.stringify(dbCollectionsSource, null, 2)}

    Example structure:
    \`\`\`javascript
    // Define inputs
    Inputs.YourInput = "string";

    // Define outputs  
    Outputs.YourOutput = "string";

    // Your database query logic here
    const results = Noodl.Records.query('CollectionName', { /* query params */ });
    Outputs.YourOutput = results;
    \`\`\`

    Generate ONLY the JavaScript code for the database query function.`;

    // TODO: implement genereic AI calls    } else if (selectedAiModel === 'gemini') {
    // TODO: Implement full Gemini database query template logic

    /*
      // Extract and set the function script
      if (response) {
        const codeBlockMatch = response.match(/```(?:javascript|js)?\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch) {
          const functionScript = codeBlockMatch[1].trim();
          context.node.setParameter('functionScript', functionScript);

          // Add the generated code to chat history
          context.chatHistory.add({
            content: `Generated database query function:\n\`\`\`javascript\n${functionScript}\n\`\`\``,
            type: ChatMessageType.Assistant
          });
        }
      }
    } else {
      throw new Error('Invalid AI model selection. Please check your editor settings.');
    }

    context.chatHistory.removeActivity(activityCodeGenId);
    context.chatHistory.removeActivity(activityId);
  }
    */
  }
};
