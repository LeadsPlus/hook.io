
/*
 * A action for sending http requests to things
 */

exports.action = {
  name: 'http',
  title: 'Send HTTP Request',
  protocol: 'http',
  keyField: 'url',
  config: {
    'method': {
      label: 'HTTP Method',
      type: 'list',
      description: 'HTTP Method to use',
      values: {
        'GET': 'GET Request',
        'POST': 'POST Request',
        'PUT': 'PUT Request',
        'DELETE': 'DELETE Request'
      }
    },
    'url': {
      label: 'Destination URI',
      type: 'text',
      description: 'Where to send the HTTP request',
      validate: function(input) {
        // TODO: Validate URL
        return input;
      }
    },
    'body': {
      label: 'Request Body',
      type: 'textarea',
      template: true,
      description: 'The data sent along with the HTTP request',
      validate: function(input) {
        return input;
      }
    }
  },
  handle: function(action, hook, definition) {
    // Modify hook as needed etc
    var params = hook.get('params');

    if ('string' !== typeof params.contentType)
      params.contentType = 'application/json';

    if ('http' !== definition.protocol) {
      // We didn't come from a HTTP hook
      // Convert time
      var ret = {
        'hook': hook.toObject(),
        'id': action.id
      };

      // The way this action deals with protocols
      switch (definition.protocol) {
        default:
          ret.result = '';
          break;
      }

      params.body = JSON.stringify(ret);
      ret = null;
    }

    action.set('params', {
      contentType: params.contentType,
      body: params.body
    });
  }
};
