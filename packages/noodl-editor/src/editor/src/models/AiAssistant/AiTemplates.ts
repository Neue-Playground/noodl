import { AiNodeTemplate } from '@noodl-models/AiAssistant/interfaces';

import * as ChartTemplate from './templates/chart';
import * as FunctionTemplate from './templates/function';
import * as SimulatorTemplate from './templates/simulator';

export const aiNodeTemplates: Record<string, AiNodeTemplate> = {
  function: FunctionTemplate.template,
  chart: ChartTemplate.template,
  simulator: SimulatorTemplate.template
};
