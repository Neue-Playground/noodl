import NoodlRuntime from '@noodl/runtime';

export function registerNodes(runtime: NoodlRuntime) {
  [
    require('./shNodes/accelerometer'),
    // require('./shNodes/commandinput'),
    // require('./shNodes/hardwareclock'),
    require('./shNodes/MQTT'),
    require('./shNodes/HTTP'),
    require('./shNodes/savetelemetry'),
    require('./shNodes/tempsensor'),
    require('./shNodes/sendevent'),
    require('./shNodes/rgbLed'),
    // require('./shNodes/iO'),
    require('./logic/range'),
    require('./logic/generator'),
    require('./logic/timer'),
    require('./logic/time'),
    require('./logic/json'),
    require('./logic/toggle'),
    require('./logic/stepper'),
    require('./logic/threshold'),
    require('./logic/compare'),
    // NEW NODES
    require('./logic/button'),
    require('./logic/calibrategyro'),
    require('./logic/convert'),
    require('./logic/flag'),
    require('./logic/flow'),
    require('./logic/funnel'),
    require('./logic/hue'),
    require('./logic/iOSnotification'),
    require('./logic/listbuilder'),
    require('./logic/location'),
    require('./logic/math'),
    require('./logic/motion'),
    require('./logic/numbertostring'),
    require('./logic/roundable'),
    require('./logic/splitlist'),
    require('./logic/state'),
    require('./logic/stringnumber'),
    require('./logic/stringoperations'),
    require('./logic/switch'),
    require('./logic/vibrate'),
    require('./logic/waveform')
  ].forEach(function (nodeDefinition) {
    runtime.registerNode(nodeDefinition);
  });
}
