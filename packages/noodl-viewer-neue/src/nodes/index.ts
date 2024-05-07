import NoodlRuntime from '@noodl/runtime';

export function registerNodes(runtime: NoodlRuntime) {
  [
    require('./shNodes/accelerometer'),
    // require('./shNodes/commandinput'),
    // require('./shNodes/hardwareclock'),
    // require('./shNodes/MQTT'),
    require('./shNodes/savetelemetry'),
    // require('./shNodes/tempsensor'),
    require('./shNodes/sendevent'),
    // require('./shNodes/rgbLed'),
    // require('./shNodes/iO'),
    require('./logic/range'),
    require('./logic/generator'),
    require('./logic/timer'),
    require('./logic/toggle'),
    require('./logic/stepper'),
    require('./logic/threshold'),
    require('./logic/compare')
  ].forEach(function (nodeDefinition) {
    runtime.registerNode(nodeDefinition);
  });
}
