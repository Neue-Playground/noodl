import { OpenAiStore } from '@noodl-store/AiAssistantStore';

import { ChatMessageType } from '@noodl-models/AiAssistant/ChatHistory';
import { AiNodeTemplate } from '@noodl-models/AiAssistant/interfaces';

import { ToastLayer } from '../../../views/ToastLayer/ToastLayer';

export const template: AiNodeTemplate = {
  type: 'pink',
  // Create a Script node (Javascript2) to support Script.Inputs/Outputs/Signals API
  name: 'Javascript2',
  // Show "Simulator" as the type label in the node UI
  nodeDisplayName: 'Simulator',
  onMessage: async (context) => {
    const activityId = 'processing';
    context.chatHistory.addActivity({
      id: activityId,
      name: 'Processing'
    });
    try {
      // Get the selected AI model and route accordingly
      const selectedAiModel = OpenAiStore.getAiSelectedModel();

      if (selectedAiModel === 'disabled') {
        throw new Error('AI is disabled. Please enable an AI model in the editor settings.');
      }

      if (selectedAiModel === 'openai') {
        // Use OpenAI
        const apiKey = OpenAiStore.getOpenAiApiKey();
        const model = OpenAiStore.getOpenAiModel();

        if (!apiKey) {
          throw new Error('OpenAI is not properly configured. Please check your API key and model selection.');
        }

        // Import OpenAI chat functionality
        const {
          Ai: { chatStream }
        } = await import('../context/ai-api');

        // First OpenAI call with conversation history included in prompt
        context.chatHistory.add({ content: 'Calling OpenAI...', metadata: { system: true } });

        const lastUserMsg = [...context.chatHistory.messages].reverse().find((m) => m.metadata?.user);
        const prompt = lastUserMsg ? lastUserMsg.content : '';

        // Prepare the conversation history for context
        const conversationHistory = context.chatHistory.messages
          .filter((msg) => msg.metadata?.user || msg.type === ChatMessageType.Assistant)
          .map((msg) => ({
            role: msg.metadata?.user ? 'user' : 'assistant',
            content: msg.content
          }))
          .slice(-10); // Keep last 10 messages for context

        // Build context-aware prompt with conversation history
        const contextPrompt =
          conversationHistory.length > 0
            ? `###Conversation History###
${conversationHistory.map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n')}

###Current Request###
${prompt}

###Instructions###
You are an assistant for generating virtual IoT device simulators for the Neue Playground (based on Noodl) low-code software.
Users describe a device in natural language. You must generate JavaScript code for a Script node that simulates the described device.

The code should:
1. Use Script.Inputs to define input parameters (e.g., ranges, intervals, etc.)
2. Use Script.Outputs to define output values (e.g., sensor readings, status)
3. Use Script.Signals to define functions that can be triggered as an input, or sent as an output.
4. Include realistic simulation logic (random variations, time-based changes, etc.)
5. Be well-commented and easy to understand

Example structure:
\`\`\`javascript
Script.Inputs = {
  // Define your inputs here
};

Script.Outputs = {
  // Define your outputs here
};

Script.Signals.YourSignal = function() {
  // Your simulation logic here
};
\`\`\`

Output ONLY the JavaScript code for a Script node using Script.Inputs, Script.Outputs, and Script.Signals.`
            : `You are an assistant for generating virtual IoT device simulators for Playgrounds Script nodes.

Users describe a device in natural language. You must generate JavaScript code for a Script node that simulates the described device.

The code should:
1. Use Script.Inputs to define input parameters (e.g., ranges, intervals, etc.)
2. Use Script.Outputs to define output values (e.g., sensor readings, status)
3. Use Script.Signals to define functions that can be triggered
4. Include realistic simulation logic (random variations, time-based changes, etc.)
5. Be well-commented and easy to understand

Example structure:
\`\`\`javascript
Script.Inputs = {
  // Define your inputs here
};

Script.Outputs = {
  // Define your outputs here
};

Script.Signals.YourSignal = function() {
  // Your simulation logic here
};
\`\`\`

User request: ${prompt}

Output ONLY the JavaScript code for a Script node using Script.Inputs, Script.Outputs, and Script.Signals.`;

        const response = await chatStream({
          messages: [
            {
              role: 'system',
              content: contextPrompt
            }
          ],
          provider: {
            model: model,
            temperature: 0.7,
            max_tokens: 2048
          },
          onStream(fullText) {
            console.log('OpenAI response:', fullText);
          }
        });

        context.chatHistory.add({ content: 'OpenAI response received. Processing...', metadata: { system: true } });

        // Extract JavaScript code block
        let javascriptCode = '';
        if (response) {
          // Look for code blocks in the response
          const codeBlockMatch = response.match(/```(?:javascript|js)?\s*([\s\S]*?)\s*```/);
          if (codeBlockMatch) {
            javascriptCode = codeBlockMatch[1].trim();
          } else {
            // If no code block found, try to extract code from the response
            javascriptCode = response.trim();
          }
        }

        if (!javascriptCode) {
          throw new Error('Failed to generate simulator code. Please try again.');
        }

        // Set the code parameter for the Script node
        context.node.setParameter('code', javascriptCode);

        // Second OpenAI call to generate explanation
        const explanationPrompt = `Analyze this JavaScript code for a virtual IoT device simulator and provide:

1. A concise label (2-5 words) describing what the simulator does
2. A clear explanation (2-5 sentences) of how the simulator works

Code to analyze:
\`\`\`javascript
${javascriptCode}
\`\`\`

Format your response as:
<label>Your Label Here</label>
<explain>Your explanation here</explain>`;

        const explanationResponse = await chatStream({
          messages: [
            {
              role: 'system',
              content: explanationPrompt
            }
          ],
          provider: {
            model: model,
            temperature: 0.3,
            max_tokens: 256
          },
          onStream(fullText) {
            console.log('Explanation response:', fullText);
          }
        });

        // Parse the explanation response
        const labelMatch = explanationResponse.match(/<label>(.*?)<\/label>/);
        const explainMatch = explanationResponse.match(/<explain>(.*?)<\/explain>/);

        if (labelMatch && explainMatch) {
          const label = labelMatch[1].trim();
          const explanation = explainMatch[1].trim();

          // Add the explanation to chat history
          context.chatHistory.add({
            content: `**${label}**\n\n${explanation}`,
            type: ChatMessageType.Assistant
          });
        }
      } else if (selectedAiModel === 'gemini') {
        // Use Gemini (existing logic)
        const apiKey = OpenAiStore.getGeminiApiKey();
        const model = OpenAiStore.getGeminiModel();
        const { callGeminiApi } = await import('../api');

        // Compose the system prompt to generate a Script node compatible code
        const systemPrompt = `You generate JavaScript for a Noodl JavaScript node that simulates virtual IoT sensors.
From the user's device description, extract each sensor and its type, set realistic default ranges and units, and include them as simulation parameters (min, max, noise, etc.) in your Script.Inputs—all with sensible defaults.

- Structure your code with clear, commented sections: "// --- Inputs ---", "// --- Outputs ---", "// --- Internal State ---", "// --- Utility Functions ---", "// --- Setters ---", "// --- Signals ---", and "// --- Main Simulation Loop ---".
- Maintain an internal state using "let" variables to hold the current, live values of all simulation parameters. This decouples the simulation loop from the initial input definitions.
- Simulate realistic temporal behavior: slow trends (sine waves) + random short-term noise. Include an optional "FaultMode" input which, if true, disables clamping and can introduce anomalies.
- Model number outputs as sine waves plus random noise. Always clamp numeric outputs to their [min,max] range unless FaultMode is true. Round all numeric outputs to two decimal places.
- Model boolean sensors with random toggles at a configurable probability per tick.
- Model string outputs to reflect the logical/physical state of the device.
- For GPS, use "Script.Outputs.Latitude" and "Script.Outputs.Longitude" as separate numbers.
- Use a recursive "setTimeout" simulation loop. Never use "setInterval".
- Use cross-sensor correlation where physically reasonable (e.g., temperature and humidity should be inversely correlated by default).
- All output must be one valid, runnable JavaScript code block, fenced with \`\`\`javascript ... \`\`\`.

Required Script node contract:
- Script.Inputs: Define input ports with a "type" and a "default" value (e.g., "Tick: { type: "number", default: 1000 }").
- Script.Outputs: Define output ports (e.g., "Temperature: "number"").
- Script.Setters: For every input defined in "Script.Inputs", create a corresponding function in the "Script.Setters" object. This function is triggered on value changes and is responsible for updating the corresponding internal state variable.
- Implement setters defensively. Use a helper function ("withDefault") to ensure that if a "null" or "undefined" value is passed, you fall back safely to the default value defined in "Script.Inputs".
- Script.Signals: Define signal handlers for "Start" and "Stop".
    - The "Start" signal must initialize the simulation state (e.g., reset timers and simulation time) and start the simulation loop.
    - The "Stop" signal must clear any pending "setTimeout" calls to halt the simulation.

At the end, review the generated code to verify that:
- Default values, units, and simulation ranges are sensible for the device type.
- The "Script.Setters" object correctly maps to every entry in "Script.Inputs".
- The simulation loop reads from the internal state variables, not directly from "Script.Inputs".
- The simulation logic is robust and stops/starts cleanly via the "Start" and "Stop" signals.

*** Example JavaScript generated output from a user description of "Simulate a greenhouse sensor with temperature, humidity, and motion detection" ***
\`\`\`javascript
// == IoT Device Simulator for Neue Playground (Noodl) ==

// --- Inputs ---
Script.Inputs = {
  Tick:             { type: "number", default: 1000  },
  FaultMode:        { type: "boolean", default: false },
  GlobalPeriod:     { type: "number", default: 43200000 },

  TempMin:          { type: "number", default: 5   },
  TempMax:          { type: "number", default: 30  },
  TempNoise:        { type: "number", default: 1.5 },

  HumidityMin:      { type: "number", default: 30 },
  HumidityMax:      { type: "number", default: 95 },
  HumidityNoise:    { type: "number", default: 5  },

  RainMin:          { type: "number", default: 0   },
  RainMax:          { type: "number", default: 15  },
  RainNoise:        { type: "number", default: 0.8 },
  RainPeriodFactor: { type: "number", default: 2   }
};

// --- Outputs ---
Script.Outputs = {
  Temperature:   "number",
  Humidity:      "number",
  RainfallRate:  "number",
  Status:        "string"
};

// --- Internal State ---
let tick             = 1000;
let faultMode        = false;
let period           = 43200000;

let tempMin          = 5;
let tempMax          = 30;
let tempNoise        = 1.5;

let humidityMin      = 30;
let humidityMax      = 95;
let humidityNoise    = 5;

let rMin             = 0;
let rMax             = 15;
let rNoise           = 0.8;
let rainPeriodFactor = 2;

let timer;
let started  = false;
let simTime  = 0;

let tempPhase     = Math.random() * 2 * Math.PI;
let humidityPhase = tempPhase + Math.PI;
let rainPhase     = Math.random() * 2 * Math.PI;

// --- Utility: Clamp ---
function clamp(val, min, max, fault) {
  if (fault) return val;
  return Math.max(min, Math.min(max, val));
}

// --- Safe Fallback Helper ---
function withDefault(value, inputName, hardFallback) {
  if (value != null) return value;
  const inputDef = Script.Inputs[inputName];
  if (inputDef && inputDef.default != null) return inputDef.default;
  return hardFallback;
}

// --- Setters ---
Script.Setters = {
  Tick(value) {
    tick = withDefault(value, "Tick", 1000);
    if (started) {
      clearTimeout(timer);
      startLoop();
    }
  },
  FaultMode(value)        { faultMode = withDefault(value, "FaultMode", false); },
  GlobalPeriod(value)     { period = withDefault(value, "GlobalPeriod", 43200000); },

  TempMin(value)          { tempMin = withDefault(value, "TempMin", 5); },
  TempMax(value)          { tempMax = withDefault(value, "TempMax", 30); },
  TempNoise(value)        { tempNoise = withDefault(value, "TempNoise", 1.5); },

  HumidityMin(value)      { humidityMin = withDefault(value, "HumidityMin", 30); },
  HumidityMax(value)      { humidityMax = withDefault(value, "HumidityMax", 95); },
  HumidityNoise(value)    { humidityNoise = withDefault(value, "HumidityNoise", 5); },

  RainMin(value)          { rMin = withDefault(value, "RainMin", 0); },
  RainMax(value)          { rMax = withDefault(value, "RainMax", 15); },
  RainNoise(value)        { rNoise = withDefault(value, "RainNoise", 0.8); },
  RainPeriodFactor(value) { rainPeriodFactor = withDefault(value, "RainPeriodFactor", 2); }
};

// --- Signals ---
Script.Signals = {
  Start() {
    if (started) return;
    started = true;
    simTime = 0;
    clearTimeout(timer);
    startLoop();
  },
  Stop() {
    clearTimeout(timer);
    started = false;
  }
};

// --- Main Simulation Loop ---
function startLoop() {
  simTime += tick;

  // ---- Temperature ----
  let temp = ((tempMax + tempMin) / 2) +
             ((tempMax - tempMin) / 2) * Math.sin(2 * Math.PI * simTime / period + tempPhase) +
             (Math.random() - 0.5) * 2 * tempNoise;
  temp = clamp(temp, tempMin, tempMax, faultMode);
  Script.Outputs.Temperature = parseFloat(temp.toFixed(2));

  // ---- Humidity ----
  let hum = ((humidityMax + humidityMin) / 2) +
            ((humidityMax - humidityMin) / 2) * Math.sin(2 * Math.PI * simTime / period + humidityPhase) +
            (Math.random() - 0.5) * 2 * humidityNoise;
  hum = clamp(hum, humidityMin, humidityMax, faultMode);
  Script.Outputs.Humidity = parseFloat(hum.toFixed(2));

  // ---- Rainfall ----
  const rainCyclePeriod = period / rainPeriodFactor;
  let rainfall = rMax * 0.4 + rMax * 0.6 * Math.sin(2 * Math.PI * simTime / rainCyclePeriod + rainPhase) +
                 (Math.random() - 0.5) * 2 * rNoise;
  rainfall = clamp(rainfall, rMin, rMax, faultMode);
  Script.Outputs.RainfallRate = parseFloat(rainfall.toFixed(2));

  // ---- Status ----
  const status = [];
  if (faultMode) {
    status.push("FAULT MODE ACTIVE: Data may be erratic");
  } else {
    if (rainfall > rMax * 0.7)       status.push("Heavy Rain");
    else if (rainfall > rMax * 0.3)  status.push("Moderate Rain");
    else if (rainfall > 0.1)         status.push("Light Rain");
    else                             status.push("No Rain");
  }
  Script.Outputs.Status = status.join(", ");

  // ---- Next Tick ----
  if (started) {
    timer = setTimeout(startLoop, tick);
  }
}
\`\`\``;

        const lastUserMsg = [...context.chatHistory.messages].reverse().find((m) => m.metadata?.user);
        const prompt = lastUserMsg ? lastUserMsg.content : '';

        // Prepare the conversation history for context
        const conversationHistory = context.chatHistory.messages
          .filter((msg) => msg.metadata?.user || msg.type === ChatMessageType.Assistant)
          .map((msg) => ({
            role: msg.metadata?.user ? 'user' : 'assistant',
            content: msg.content
          }))
          .slice(-10); // Keep last 10 messages for context

        // Build context-aware prompt with conversation history
        const contextPrompt =
          conversationHistory.length > 0
            ? `###Conversation History###
${conversationHistory.map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n')}

###Current Request###
${prompt}

###Instructions###
${systemPrompt}`
            : `${systemPrompt}\n\nUser request: ${prompt}`;

        // First Gemini call with conversation history included in prompt
        context.chatHistory.add({ content: 'Calling Gemini...', metadata: { system: true } });
        const response = await callGeminiApi(apiKey, model, contextPrompt);
        context.chatHistory.add({ content: 'Gemini response received. Processing...', metadata: { system: true } });

        // Extract JavaScript code block
        let javascriptCode = '';
        if (response) {
          // Look for code blocks in the response
          const codeBlockMatch = response.match(/```(?:javascript|js)?\s*([\s\S]*?)\s*```/);
          if (codeBlockMatch) {
            javascriptCode = codeBlockMatch[1].trim();
          } else {
            // If no code block found, try to extract code from the response
            javascriptCode = response.trim();
          }
        }

        if (!javascriptCode) {
          throw new Error('Failed to generate simulator code. Please try again.');
        }

        // Set the code parameter for the Script node
        context.node.setParameter('code', javascriptCode);

        // Second Gemini call with conversation history and generated code included in prompt
        const explanationPrompt = `Analyze this JavaScript code for a virtual IoT device simulator and provide:

1. A concise label (2-5 words) describing what the simulator does
2. A clear explanation (2-5 sentences) of how the simulator works

Code to analyze:
\`\`\`javascript
${javascriptCode}
\`\`\`

Format your response as:
<label>Your Label Here</label>
<explain>Your explanation here</explain>`;

        const explanationContextPrompt =
          conversationHistory.length > 0
            ? `###Conversation History###
${conversationHistory.map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n')}

###User's Original Request###
${prompt}

###Generated Simulator Code###
\`\`\`javascript
${javascriptCode}
\`\`\`

${explanationPrompt}`
            : `${explanationPrompt}

###Generated Simulator Code###
\`\`\`javascript
${javascriptCode}
\`\`\``;

        const explanationResponse = await callGeminiApi(apiKey, model, explanationContextPrompt);

        // Parse the explanation response
        const labelMatch = explanationResponse.match(/<label>(.*?)<\/label>/);
        const explainMatch = explanationResponse.match(/<explain>(.*?)<\/explain>/);

        if (labelMatch && explainMatch) {
          const label = labelMatch[1].trim();
          const explanation = explainMatch[1].trim();

          // Update the label of the node to match the explanation label
          context.node.setLabel(label);

          // Add the explanation to chat history
          context.chatHistory.add({
            content: `**${label}**\n\n${explanation}`,
            type: ChatMessageType.Assistant
          });
        }
      } else {
        throw new Error('Invalid AI model selection. Please check your editor settings.');
      }

      context.chatHistory.removeActivity(activityId);
    } catch (error) {
      ToastLayer.showError(error.message || 'Failed to generate simulator');
      context.chatHistory.clearActivities();
    }
  }
};
