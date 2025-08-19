export type AiAssistantModel = {
  name: string;
  displayName: string;
  promptTokenCost: number;
  completionTokenCost: number;
};

export interface AiAssistantConfig {
  version: string;
  models: AiAssistantModel[];
}

export async function verifyOpenAiApiKey(apiKey: string): Promise<Record<string, { id: string }> | null> {
  const response = await fetch(`https://api.openai.com/v1/models`, {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + apiKey
    }
  });

  if (response.status !== 200) {
    return null;
  }

  const json = await response.json();

  const models = json.data.reduce((acc: Record<string, { id: string }>, item: any) => {
    acc[item.id] = { id: item.id };
    return acc;
  }, {});

  return models;
}

export async function verifyGeminiApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
      method: 'GET'
    });

    if (response.status !== 200) {
      return false;
    }

    const json = await response.json();
    return json.models && json.models.length > 0;
  } catch (error) {
    return false;
  }
}

export async function callGeminiApi(apiKey: string, model: string, prompt: string): Promise<string> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      }
    );

    if (response.status === 429) {
      throw new Error('Gemini is overloaded or you are being rate limited. Please try again later.');
    } else if (response.status === 401) {
      throw new Error('Gemini API key is invalid or unauthorized.');
    } else if (response.status === 500 || response.status === 503) {
      throw new Error('Gemini service is temporarily unavailable. Please try again later.');
    } else if (response.status !== 200) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    return json.candidates[0].content.parts[0].text;
  } catch (error) {
    throw new Error(`Failed to call Gemini API: ${error.message}`);
  }
}
