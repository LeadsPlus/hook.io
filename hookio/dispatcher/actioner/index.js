
/*
 * hookio/actioner
 * Handles all actions. 'Sink' for actions.
 */

var hookIO = require('../../hookio').hookIO,
  fs = require('fs'),
  Mu = require('../lib/Mu/lib/mu');


var actions = exports.actions = {};

var updateDefinitions = exports.update = function(callback) {
  var result = {};
  fs.readdir(hookIO.config.PATH + '/definitions/actions', function(error, files) {
    files.forEach(function(action) {
      if ('.js' !== action.slice(-3))
        return;

      action = action.slice(0, -3);
      action = require(hookIO.config.PATH + '/definitions/actions/' + action);

      try {
        action = action.action;

        result[action.name] = action;
      } catch (error) {}
    });

    actions = exports.actions = result;

    if ('function' === typeof callback)
      callback(actions);

    hookIO.emit('ActionDefinitionsUpdated', actions);
  });
};

hookIO.addListener('ActionTrigger', function(hook, definition) {
  hookIO.db.getActions(hook.get('actions'), function(actions) {
    actions.forEach(function(action) {
      var actionDefinition = exports.actions[action.get('type')],
          protocol = actionDefinition.protocol[0].toUpperCase() +
                     actionDefinition.protocol.slice(1);

      actionDefinition.handle(action, hook, definition);

      var key,
        compiled,
        count = 0,
        config = action.get('config'),
        params = hook.get('params');
      for (key in actionDefinition.config) {
        if (actionDefinition[key].template && config[key]) {
          count++;
          compiled = Mu.compileText(config[key], {})(params);

          (function(key) {
            var text = '';
            compiled.addListener('data', function(chunk) {
              text += chunk;
            });
            compiled.addListener('end', function() {
              config[key] = text;
              count--;
              if (0 === count)
                done();
            });
          })(key);
        }
      }

      if (0 === count)
        done();

      function done() {
        actions.set('config', config);
        hookIO.emit(protocol + 'ActionTrigger', action, actionDefinition);
      }
    });
  });
});


// Protocol specific stuff
require('./http');

