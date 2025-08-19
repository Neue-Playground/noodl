import { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';

import { PropertyPanelSelectInput } from './PropertyPanelSelectInput';

export default {
  title: 'Property Panel/Select',
  component: PropertyPanelSelectInput,
  argTypes: {}
} as ComponentMeta<typeof PropertyPanelSelectInput>;

const Template: ComponentStory<typeof PropertyPanelSelectInput> = (args) => (
  <div style={{ width: 280 }}>
    <PropertyPanelSelectInput {...args} />
  </div>
);

export const Common = Template.bind({});
Common.args = {
  value: 'gpt-5-mini',
  properties: {
    options: [
      { label: 'GPT-5', value: 'gpt-5' },
      { label: 'GPT-5 mini', value: 'gpt-5-mini' },
      { label: 'GPT-5 nano', value: 'gpt-5-nano' }
    ]
  }
};

export const hasSmallText = Template.bind({});
hasSmallText.args = {
  value: 'gpt-5-mini',
  properties: {
    options: [
      { label: 'GPT-5', value: 'gpt-5' },
      { label: 'GPT-5 mini', value: 'gpt-5-mini' },
      { label: 'GPT-5 nano', value: 'gpt-5-nano' }
    ]
  },
  hasSmallText: true
};
