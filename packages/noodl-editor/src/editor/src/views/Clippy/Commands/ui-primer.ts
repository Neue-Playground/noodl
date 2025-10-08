import { NodeGraphModel } from '@noodl-models/nodegraphmodel';

export type PrimerUserComponent = {
  name: string;
  fullName: string;
  description: string;
  canHaveChildren: boolean;
};

export type PrimerOptions = {
  allowImageNode?: boolean;
  allowImageGeneration?: boolean;
  nodeGraphModel?: NodeGraphModel;
  userComponents: PrimerUserComponent[];
  parentNode: string;
  uiPrimer?: string;
  responseSchema?: string;
};

export function generateUiPrimer(options: PrimerOptions): string {
  const userComponentsPrimer = options.userComponents
    .map((c) => {
      return `- ${c.fullName}: (user component) ${c.description}. Use this as the "type" or "typename".`;
    })
    .join('\n');

  const parentNode = options.parentNode ? options.parentNode : options.nodeGraphModel?.getVisualRootIds()?.[0];
  const nodeGraphJson = options.nodeGraphModel ? options.nodeGraphModel.toJSON() : undefined;
  const nodeGraphPrimer = nodeGraphJson
    ? `
The current UI that you are editing is defined by the following JSON structure:
${JSON.stringify(nodeGraphJson, null, 2)}
`
    : '';

  const schemaPrimer =
    'Expected output JSON format: ' +
    JSON.stringify(
      {
        type: 'ARRAY',
        description:
          'A list of nodes representing a hierarchical UI structure, similar to a scene graph or a component tree.',
        items: {
          type: 'OBJECT',
          description:
            'Represents a single node or component in the hierarchy. It can contain other nodes as children, forming a tree.',
          properties: {
            id: {
              type: 'STRING',
              description: 'Unique identifier (UUID). Always insert new-uuid- prefix for new nodes'
            },
            label: { type: 'STRING', description: 'Short explanation for why this node was created.' },
            type: {
              type: 'STRING',
              description:
                "Specifies the component type of the node, e.g., 'Group', 'Text', 'Button', 'Image', 'Input', or a custom path."
            },
            variant: { type: 'STRING', description: 'Optional variant, e.g., Button Primary.' },
            parameters: {
              type: 'OBJECT',
              description:
                'Configuration parameters. Not all parameters apply to all node types; use appliesTo for guidance.',
              properties: {
                visible: { type: 'BOOLEAN', description: 'Controls whether the node is shown. Default: true.' },
                opacity: { type: 'NUMBER', description: 'Transparency 0-1.' },
                zIndex: { type: 'NUMBER', description: 'Stacking order, higher numbers appear on top.' },
                mixBlendMode: {
                  type: 'ENUM',
                  options: [
                    'normal',
                    'multiply',
                    'screen',
                    'overlay',
                    'darken',
                    'lighten',
                    'color-dodge',
                    'color-burn',
                    'hard-light',
                    'soft-light',
                    'difference',
                    'exclusion',
                    'hue',
                    'saturation',
                    'color',
                    'luminosity'
                  ],
                  description: 'Blend mode for compositing.'
                },

                sizeMode: {
                  type: 'ENUM',
                  options: ['explicit', 'contentWidth', 'contentHeight', 'contentSize'],
                  description: 'Size mode.'
                },
                position: {
                  type: 'ENUM',
                  options: ['relative', 'absolute', 'sticky', 'fixed'],
                  description: 'Positioning method.'
                },
                alignX: { type: 'ENUM', options: ['left', 'center', 'right'], description: 'Horizontal alignment.' },
                alignY: { type: 'ENUM', options: ['top', 'center', 'bottom'], description: 'Vertical alignment.' },
                width: { type: 'NUMBER', units: ['%', 'px', 'vw', 'vh'], defaultUnit: 'px', description: 'Width.' },
                height: { type: 'NUMBER', units: ['%', 'px', 'vh', 'vw'], defaultUnit: 'px', description: 'Height.' },
                minWidth: { type: 'NUMBER', units: ['%', 'px'], defaultUnit: 'px', description: 'Minimum width.' },
                minHeight: { type: 'NUMBER', units: ['%', 'px'], defaultUnit: 'px', description: 'Minimum height.' },
                maxWidth: { type: 'NUMBER', units: ['%', 'px'], defaultUnit: 'px', description: 'Maximum width.' },
                maxHeight: { type: 'NUMBER', units: ['%', 'px'], defaultUnit: 'px', description: 'Maximum height.' },

                marginTop: { type: 'NUMBER', options: [0, 4, 8, 12, 16, 24, 32, 48, 64], description: 'Top margin.' },
                marginBottom: {
                  type: 'NUMBER',
                  options: [0, 4, 8, 12, 16, 24, 32, 48, 64],
                  description: 'Bottom margin.'
                },
                marginLeft: { type: 'NUMBER', options: [0, 4, 8, 12, 16, 24, 32, 48, 64], description: 'Left margin.' },
                marginRight: {
                  type: 'NUMBER',
                  options: [0, 4, 8, 12, 16, 24, 32, 48, 64],
                  description: 'Right margin.'
                },
                padding: { type: 'NUMBER', description: 'Uniform padding (px).' },
                paddingTop: { type: 'NUMBER', options: [0, 4, 8, 12, 16, 24, 32, 48, 64], description: 'Top padding.' },
                paddingBottom: {
                  type: 'NUMBER',
                  options: [0, 4, 8, 12, 16, 24, 32, 48, 64],
                  description: 'Bottom padding.'
                },
                paddingLeft: {
                  type: 'NUMBER',
                  options: [0, 4, 8, 12, 16, 24, 32, 48, 64],
                  description: 'Left padding.'
                },
                paddingRight: {
                  type: 'NUMBER',
                  options: [0, 4, 8, 12, 16, 24, 32, 48, 64],
                  description: 'Right padding.'
                },

                transformX: { type: 'NUMBER', units: ['px', '%'], description: 'Translate along X.' },
                transformY: { type: 'NUMBER', units: ['px', '%'], description: 'Translate along Y.' },
                transformRotation: { type: 'NUMBER', units: ['deg'], description: 'Rotation in degrees.' },
                transformScale: { type: 'NUMBER', description: 'Scale factor (1=normal, 2=double, 0.5=half).' },
                transformOriginX: {
                  type: 'NUMBER',
                  units: ['%'],
                  defaultUnit: '%',
                  description: 'Transform origin X. Default: 50%.'
                },
                transformOriginY: {
                  type: 'NUMBER',
                  units: ['%'],
                  defaultUnit: '%',
                  description: 'Transform origin Y. Default: 50%.'
                },

                backgroundColor: { type: 'STRING', description: "Background color, e.g., '#FEFFCE'." },
                backgroundImage: { type: 'STRING', description: 'Background image URL.' },
                color: { type: 'STRING', description: 'Text or foreground color.' },
                borderRadius: { type: 'NUMBER', description: 'Corner radius in px.' },
                borderWidth: { type: 'NUMBER', description: 'Border width in px.' },
                borderColor: { type: 'STRING', description: 'Border color.' },
                boxShadow: { type: 'STRING', description: 'CSS box-shadow string.' },
                overflow: { type: 'ENUM', options: ['visible', 'hidden', 'scroll'], description: 'Overflow behavior.' },

                flexDirection: { type: 'ENUM', options: ['row', 'column'], description: 'Flex direction.' },
                justifyContent: {
                  type: 'ENUM',
                  options: ['flex-start', 'center', 'space-between', 'space-around', 'space-evenly'],
                  description: 'Flex justify.'
                },
                alignItems: {
                  type: 'ENUM',
                  options: ['flex-start', 'center', 'flex-end', 'stretch'],
                  description: 'Flex alignment.'
                },
                flexWrap: { type: 'ENUM', options: ['nowrap', 'wrap'], description: 'Flex wrap.' },
                columnGap: { type: 'NUMBER', description: 'Gap between columns (px).' },
                rowGap: { type: 'NUMBER', description: 'Gap between rows (px).' },
                layoutString: { type: 'STRING', description: "Column layout string (e.g., '1 2 1')." },
                responsiveLayoutString: { type: 'STRING', description: 'Responsive column widths.' },

                text: { type: 'STRING', description: 'Text content, only used for Text type' },
                fontSize: { type: 'NUMBER', units: ['px', 'em', 'rem'], defaultUnit: 'px', description: 'Font size.' },
                fontWeight: {
                  type: 'ENUM',
                  options: ['normal', 'medium', 'bold', 'lighter'],
                  description: 'Font weight or numeric.'
                },
                lineHeight: { type: 'NUMBER', description: 'Line height.' },
                letterSpacing: { type: 'NUMBER', description: 'Letter spacing.' },
                textAlign: { type: 'ENUM', options: ['left', 'center', 'right'], description: 'Text alignment.' },
                textTransform: {
                  type: 'ENUM',
                  options: ['none', 'uppercase', 'lowercase', 'capitalize'],
                  description: 'Text transform.'
                },
                ellipsis: { type: 'BOOLEAN', description: 'Truncate text with ellipsis.' },
                label: { type: 'STRING', description: 'Label text. Used for text in all other types than Text' },
                placeholder: { type: 'STRING', description: 'Placeholder text.' },
                type: { type: 'STRING', description: "Input type, e.g., 'text', 'password', 'email', 'number'." },
                variant: {
                  type: 'STRING',
                  description:
                    "Style variant, e.g., 'primary', 'secondary', 'ghost', 'link', 'filled', 'outlined', 'underline'."
                },
                required: { type: 'BOOLEAN', description: 'Whether field is required.' },
                disabled: { type: 'BOOLEAN', description: 'Whether control is disabled.' },
                checked: { type: 'BOOLEAN', description: 'Whether checkbox or radio is checked.' },
                errorText: { type: 'STRING', description: 'Error message.' },
                items: {
                  type: 'ARRAY',
                  description: 'Array of {label, value} for dropdown.',
                  items: {
                    type: 'OBJECT',
                    properties: {
                      Label: {
                        type: 'STRING',
                        description: 'Option 1'
                      },
                      Value: {
                        type: 'STRING',
                        description: 'Value 1'
                      }
                    },
                    required: ['Label', 'Value']
                  }
                },
                searchable: { type: 'BOOLEAN', description: 'Whether dropdown is searchable.' },
                iconLeft: { type: 'STRING', description: 'Icon URL for left side.' },
                iconRight: { type: 'STRING', description: 'Icon URL for right side.' },
                hoverStyle: { type: 'OBJECT', description: 'Style overrides on hover.' },
                activeStyle: { type: 'OBJECT', description: 'Style overrides when active.' },
                disabledStyle: { type: 'OBJECT', description: 'Style overrides when disabled.' },

                src: { type: 'STRING', description: 'Image source URL.' },
                alt: { type: 'STRING', description: 'Alt text for image.' },
                objectFit: { type: 'ENUM', options: ['cover', 'contain', 'fill'], description: 'Image fit mode.' },
                prompt: { type: 'STRING', description: 'AI-generated image prompt.' },

                scrollEnabled: { type: 'BOOLEAN', description: 'Enable scrolling.' },
                scrollSnapEnabled: { type: 'BOOLEAN', description: 'Enable snap scrolling.' },

                transitionDuration: {
                  type: 'NUMBER',
                  units: ['ms'],
                  defaultUnit: 'ms',
                  description: 'Transition duration.'
                },
                animation: { type: 'STRING', description: 'Animation name or keyframes.' },

                as: { type: 'STRING', description: "Rendered element type, e.g., 'div', 'nav', 'header', 'section'." }
              }
            },
            stateParameters: {
              type: 'OBJECT',
              description:
                'A mapping of state names (e.g., "hover", "pressed", "focused") to parameter overrides that apply in that state. Each value is a parameters object with the same structure as "parameters".',
              additionalProperties: {
                type: 'OBJECT',
                description: 'Overrides for parameters in this state.',
                properties: {
                  backgroundColor: { type: 'STRING' },
                  color: { type: 'STRING' },
                  borderColor: { type: 'STRING' }
                  // … all parameter types allowed here, same as in "parameters"
                }
              }
            },
            stateTransitions: {
              type: 'ARRAY',
              description:
                'Defines how the component transitions between states. Each item describes a source state, a target state, and optional transition parameters (e.g., animation).',
              items: {
                type: 'OBJECT',
                properties: {
                  from: {
                    type: 'STRING',
                    description: 'The source state, e.g., "default".'
                  },
                  to: {
                    type: 'STRING',
                    description: 'The target state, e.g., "hover".'
                  },
                  animation: {
                    type: 'STRING',
                    description: 'Optional animation style or timing function for the transition.'
                  },
                  duration: {
                    type: 'NUMBER',
                    description: 'Optional duration of the transition in milliseconds.'
                  }
                },
                required: ['from', 'to']
              }
            },
            ports: {
              type: 'ARRAY',
              description: 'Data flow ports.',
              items: { type: 'OBJECT', properties: { name: { type: 'STRING' }, type: { type: 'STRING' } } }
            },
            dynamicports: {
              type: 'ARRAY',
              description: 'Dynamic data flow ports.',
              items: { type: 'OBJECT', properties: { name: { type: 'STRING' }, type: { type: 'STRING' } } }
            },
            children: {
              type: 'ARRAY',
              description: 'Child nodes.',
              items: { type: 'OBJECT', properties: { id: { type: 'STRING' }, type: { type: 'STRING' } } }
            }
          },
          required: ['id', 'label', 'type', 'parameters', 'children']
        }
      },
      null,
      2
    );

  const primer = `
You are an web designing API that edits and generates JSON graph structures for Noodl Playground, a low-code platform.
The graph defines a web application made of visual and functional nodes. Your task is to design and update web components to create a complete, usable, and visually appealing part of the web application.

{responseSchema}

Supported Types (and their mappings)
net.noodl.controls.button → <button>
net.noodl.controls.checkbox → <input type="checkbox">
net.noodl.controls.options → <select>
net.noodl.controls.radiobutton → <input type="radio">
Radio Button Group → grouped radios (<fieldset>)
net.noodl.controls.range → <input type="range">
net.noodl.controls.textinput → <input type="text"> or <textarea>
Group → <div>
net.noodl.visual.columns → flex/grid columns
Text → <p>, <span>, <h*>
Image → <img>
Circle → <div style="border-radius:50%">
net.noodl.visual.icon → <i class="material-icons"> or <svg>

Rules for Parameters
Dimensions should always be given with value and unit: { "value": 40, "unit": "px" } or { "value": 100, "unit": "%" }
Colors: hex codes (#FFFFFF) or tokens ("Primary", "Dark")
Text: string values with "textStyle", "fontSize", "fontFamily"

States
hover → :hover
pressed → :active
focused → :focus
disabled → :disabled
checked → :checked

Design and Usability Rules
- Always create well-designed and user-friendly layouts, not just raw components.
- Consider spacing, alignment, padding, and hierarchy.
- Use consistent colors, fonts, and styles to create a professional look.
- Group related elements (e.g., input + label + button) into logical Group or Columns nodes.
- Radio buttons must belong to a radio group
- Use state styling (hover, pressed, focused) to improve interactivity.
- Favor readable typography and proper contrast.
- When in doubt, choose defaults that are simple, modern, and visually appealing.
- Think in terms of complete UI sections (e.g., a full login form with input fields, labels, and a submit button styled consistently).

Design Tokens
- Box shadow: use modern subtle shadows for elevation

Defaults
- Always include a "label" explaining why the node exists
- Groups with a backgroundColor must have padding >= 16
- Prefer emoji for decorative icons instead of separate image nodes
- Ensure good contrast for text on colored backgrounds

Interactivity & Animation
- Use "stateParameters" and "stateTransitions" for hover, pressed, focused, disabled states
- Common transitions: fadeIn, fadeOut, slideUp, slideDown, scaleIn, scaleOut
- Favor simple, modern easing: ease, ease-in-out

Output Rules
- Return only valid JSON that conforms to the provided schema, with no explanations or extra text.
- Always add a suitable prompt with an instuction for an AI to generate an image, in the "prompt" property for any new image nodes.
- Always insert new-uuid- prefix for new nodes in the id
- Do not regenerate the whole project only the new nodes or modified nodes and the parent.
- Do not include \`\`\`, do not add "json" labels, do not add commentary.
- Place new nodes in the correct parent. Use the node object with this ID as the root node: {parentNode}

{nodeGraphPrimer}
{userComponentPrimers}`;

  return (options.uiPrimer || primer)
    .replace('{userComponentPrimers}', userComponentsPrimer)
    .replace('{parentNode}', parentNode)
    .replace('{responseSchema}', schemaPrimer || '')
    .replace('{nodeGraphPrimer}', nodeGraphPrimer);
}
