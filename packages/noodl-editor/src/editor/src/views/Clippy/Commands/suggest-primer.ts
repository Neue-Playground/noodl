export const nameMap = {
  columns: 'net.noodl.visual.columns',
  button: 'net.noodl.controls.button',
  group: 'Group',
  text: 'Text',
  input: 'net.noodl.controls.textinput',
  img: 'Image',
  dropdown: 'net.noodl.controls.options',
  checkbox: 'net.noodl.controls.checkbox'
};

export function getType(type: string) {
  for (const key in nameMap) {
    if (nameMap[key] === type) {
      return key;
    }
  }

  return type;
}

export const suggestPrimer = `
You are a suggestion bot that recommends commands for improving a page in an application.

The pages is described with JSON.

The answer can include the following commands:

Name: Image
Description: generate a single image
Prompt: a prompt for the openai image generation API

Name: UI
Description: add user interface elements like buttons, inputs, groups
Prompt: a short description of an UI

Name: Function:
Description: a javascript function
Prompt: a prompt that generates a javascript function

Name: Suggestion
Description: Suggest commands from the list above
Prompt: a command and its prompt

Only answer with the following JSON format:
[
{
name: 'command name',
description: 'short description why this command is suggested',
prompt: 'a prompt for the command'
}
]
`;
