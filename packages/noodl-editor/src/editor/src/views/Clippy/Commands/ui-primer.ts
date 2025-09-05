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
  uiPrimer?: string;
};

export function generateUiPrimer(options: PrimerOptions): string {
  const userComponentsPrimer = options.userComponents
    .map((c) => {
      return `
${c.name}
${c.description}
The attribute "componentName" must always be set to "${c.fullName}" 
xml: <${c.name} componentName="${c.fullName}" />
${c.canHaveChildren ? 'Can contain children' : 'This element must have no child elements'}
  `;
    })
    .join('\n');

  const primer = `
AI Primer for Generating Noodl Low-Code UI Nodes
------------------------------------------------
This primer defines all available elements, attributes, best practices, and rules
for generating fully-featured, visually appealing, responsive webpages in Noodl.
Every element must include a "nodeLabel" attribute explaining why it exists.
Format the response as xml using the following elements:
  --- ELEMENT DEFINITIONS ---

  Group
  A powerful container for layout and structure. Use groups to create everything from simple containers to complex grids and scrollable areas.

  XML Syntax: <group>[children]</group>

  Attributes:
  - flexDirection: row | column
  - justifyContent: flex-start | center | flex-end | space-between
  - alignItems: flex-start | center | flex-end
  - flexWrap: wrap | nowrap
  - columnGap: number
  - rowGap: number
  - scrollEnabled: true | false
  - scrollSnapEnabled: true | false
  - as: div | nav | header | main | aside | footer | section
  - backgroundColor: hex
  - backgroundImage: url
  - borderRadius: number
  - borderWidth: number
  - borderColor: hex
  - boxShadow: string
  - minWidth, minHeight, maxWidth, maxHeight: number | %
  - overflow: visible | hidden | scroll
  - sizeMode: explicit | contentWidth | contentHeight | contentSize
  - width: number | % | vw | vh
  - height: number | % | vw | vh

  Rules:
  - Padding: 0, 8, 16, 32 (preferred), or extended scale: 0, 4, 8, 12, 16, 24, 32, 48, 64
  - A group with a backgroundColor must have padding=16

  ---------------------------

  Columns
  A layout container for dividing content into multiple columns.

  XML Syntax: <columns>[children]</columns>

  Attributes:
  - layoutString: string (values per column, separated by space, default 1)
  - responsiveLayoutString: optional string for responsive column widths

  ---------------------------

  Text
  Basic text display.

  XML Syntax: <text />

  Attributes:
  - text: string
  - fontSize: 12 | 14 | 16 | 20 | 24 | 32 (px)
  - fontWeight: normal | medium | bold
  - lineHeight: number
  - letterSpacing: number
  - color: hex
  - textAlign: left | center | right
  - textTransform: none | uppercase | lowercase | capitalize
  - ellipsis: true | false
  - backgroundColor: hex
  - sizeMode: explicit | contentWidth | contentHeight | contentSize
  - width: number | % | vw | vh
  - height: number | % | vw | vh

  ---------------------------

  Button
  Interactive button.

  XML Syntax: <button />

  Attributes:
  - label: string
  - variant: primary | secondary | ghost | link
  - disabled: true | false
  - iconLeft: url | null
  - iconRight: url | null
  - fontSize: 12 | 14 | 16 | 20 | 24 | 32 (px)
  - color: hex
  - backgroundColor: hex
  - hoverStyle, activeStyle, disabledStyle: style overrides
  - sizeMode: explicit | contentWidth | contentHeight | contentSize
  - width: number | % | vw | vh
  - height: number | % | vw | vh

  ---------------------------

  Input
  Text input field.

  XML Syntax: <input />

  Attributes:
  - label: string
  - type: text | email | password | number
  - placeholder: string
  - variant: filled | outlined | underline
  - required: true | false
  - disabled: true | false
  - errorText: string
  - fontSize: 12 | 14 | 16 | 20 | 24 | 32 (px)
  - color: hex
  - backgroundColor: hex
  - sizeMode: explicit | contentWidth | contentHeight | contentSize
  - width: number | % | vw | vh
  - height: number | % | vw | vh
  ---------------------------

  Checkbox
  Toggle checkbox.

  XML Syntax: <checkbox />

  Attributes:
  - label: string
  - checked: true | false (default false)
  - variant: standard | filled
  - disabled: true | false
  - errorText: string
  - color: hex
  - backgroundColor: hex
  - sizeMode: explicit | contentWidth | contentHeight | contentSize
  - width: number | % | vw | vh
  - height: number | % | vw | vh

  ---------------------------

  Image
  Displays an image.

  XML Syntax: <img />

  Attributes:
  - src: url
  - sizeMode: explicit | contentWidth | contentHeight | contentSize
  - width: number | % | vw | vh
  - height: number | % | vw | vh
  - prompt: string (for AI image generation)
  - objectFit: cover | contain | fill
  - borderRadius: number
  - boxShadow: string
  - backgroundColor: hex

  ---------------------------

  Dropdown
  Select menu.

  XML Syntax: <dropdown />

  Attributes:
  - items: array of {Label: string, Value: string}
  - label: string
  - placeholder: string
  - variant: filled | outlined
  - disabled: true | false
  - errorText: string
  - searchable: true | false
  - fontSize: 12 | 14 | 16 | 20 | 24 | 32 (px)
  - color: hex
  - backgroundColor: hex
  - sizeMode: explicit | contentWidth | contentHeight | contentSize
  - width: number | % | vw | vh
  - height: number | % | vw | vh

  --- UNIVERSAL ATTRIBUTES ---

  Visibility & Stacking
  - visible: true | false
  - opacity: 0-1
  - zIndex: number
  - mixBlendMode: normal | multiply | screen | overlay | darken | lighten | color-dodge | color-burn | hard-light | soft-light | difference | exclusion | hue | saturation | color | luminosity

  Position & Alignment
  - position: relative | absolute | sticky | fixed
  - alignX: left | center | right
  - alignY: top | center | bottom
  - width: number
  - height: number

  Spacing
  - marginTop, marginBottom, marginLeft, marginRight: 0, 4, 8, 12, 16, 24, 32, 48, 64
  - paddingTop, paddingBottom, paddingLeft, paddingRight: 0, 4, 8, 12, 16, 24, 32, 48, 64

  Transformations
  - transformX, transformY: px or %
  - transformRotation: deg
  - transformScale: number (1=original, 2=double, 0.5=half)
  - transformOriginX, transformOriginY: default 50%

  --- DESIGN SYSTEM TOKENS ---
  Spacing: 0, 4, 8, 12, 16, 24, 32, 48, 64
  Typography sizes (px): 12, 14, 16, 20, 24, 32
  - Widht and height: 


  --- SEMANTIC ROLES ---
  - as=nav: main navigation bar
  - as=header: page top banner
  - as=main: primary content
  - as=aside: sidebar
  - as=footer: bottom section
  - as=section: thematic block

  --- INTERACTIVITY & ANIMATION ---
  - hoverStyle, activeStyle, disabledStyle: per element style overrides
  - transitionDuration: number in ms
  - transitionTiming: ease | linear | ease-in | ease-out | ease-in-out
  - animation: fadeIn | fadeOut | slideUp | slideDown | slideLeft | slideRight | scaleIn | scaleOut

  Defaults:
  - Always provide nodeLabel
  - Always provide a text attribute for text elements
  - Prefer to use emoji in text elements instead of creating images
  - Encourage responsive and accessible defaults

Prefer to use these elements:
{userComponentPrimers}

Add a "nodeLabel" attribute to every node with a short explanation for why this node was created
Attributes with spaces should be formatted as camelCase, no spaces.
Response only contains XML with the elements listed above. Always start with a group.`;

  return (options.uiPrimer || primer).replace('{userComponentPrimers}', userComponentsPrimer);
}
