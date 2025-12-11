export function extractCodeBlock(text: string) {
  if (text.includes('```javascript')) {
    const a = text.indexOf('```javascript');
    const b = text.indexOf('```', a + 13);

    if (b === -1) {
      throw new Error('Failed to parse');
    }
    return text.substring(a + 13, b);
  } else if (text.includes('```xml')) {
    const a = text.indexOf('```xml');
    const b = text.indexOf('```', a + 6);

    if (b === -1) {
      throw new Error('Failed to parse');
    }
    return text.substring(a + 6, b);
  } else if (text.includes('```')) {
    const a = text.indexOf('```');
    const b = text.indexOf('```', a + 3);

    if (b === -1) {
      throw new Error('Failed to parse');
    }
    return text.substring(a + 3, b);
  }

  return text;
}

export function parseAIResponse(text: string) {
  const labelMatch = text.match(/<label>([\s\S]*?)<\/label>/i);
  if (!labelMatch) throw new Error('Missing <label> field');
  const label = labelMatch[1].trim();
  if (!label.length) throw new Error('Label is empty');

  const explainMatch = text.match(/<explain>([\s\S]*?)<\/explain>/i);
  if (!explainMatch) throw new Error('Missing <explain> field');
  const explain = explainMatch[1].trim();
  if (!explain.length) throw new Error('Explanation is empty');

  const codeMatch = text.match(/```(?:javascript|js)\s*([\s\S]*?)\s*```/i);
  if (!codeMatch) throw new Error('Missing JavaScript code fence');
  const code = codeMatch[1].trim();
  if (!code.length) throw new Error('Code block is empty');

  return { label, explain, code };
}

export function extractCodeBlockWithText(text: string, replaceCodeBlock = '{current-code}') {
  const codeBlockRegex = /```[\s\S]*?```/g;
  const codeContentRegex = /```.*\n([\s\S]*?)```/;
  const codeBlocks = [];
  let match: RegExpExecArray;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    const contentMatch = codeContentRegex.exec(match[0]);
    if (contentMatch) {
      codeBlocks.push(contentMatch[1]);
    }
  }

  return { codeBlocks, cleanedText: text.replaceAll(codeBlockRegex, replaceCodeBlock) };
}

// --base-color-yellow-400
// --base-color-teal-400
export function wrapInput(text: string) {
  return ` <span style="color: var(--base-color-yellow-400);">Inputs.${text}</span>`;
}
export function wrapOutput(text: string) {
  return ` <span style="color: var(--base-color-yellow-400);">Outputs.${text}</span>`;
}
