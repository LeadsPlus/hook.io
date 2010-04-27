
/*
 * hookio/http.js
 *
 * The http stuff for hook.io
 * Initializes and sets up http related logic
 */

var http = require('http'),
  hookIO = require('../../hookio').hookIO,
  helper = require('../lib/helpers'),
  httpServer;


// Called when server needs to start
exports.start = function() {
  httpServer = http.createServer(function(request, response) {
    request.body = '';
    request.addListener('data', function(chunk) {
      request.body = request.body + chunk;
    });

    request.addListener('end', function() {
      hookIO.emit('HttpRequest', request, response);
    });
  });

  httpServer.listen(hookIO.config.HTTP.port);

  delete exports.start;
};


// HTTP client stuffz
var HttpClient = function(options) {
  var urlDetails = helper.parseURL(options.url);
  options.port = 'number' === typeof options.port ? options.port : 80;

  this._client = http.createClient(options.port,
                   urlDetails.host);

  this._path = urlDetails.path;
  this.method = options.method.toUpperCase() || 'GET';
  this.data = options.data || '';

  this.headers = {
    'host': urlDetails.host
  };

  // FIXME: Process.mixin depreciating
  if ('object' === typeof options.headers)
    process.mixin(this.headers, options.headers);

  this._callback = options.success || function() {};
  this._errback = options.error || function() {};

  return this._request();
};

HttpClient.prototype._request = function() {
  var self = this;

  var request = this._client.request(this.method, this._path, this.headers);

  request.addListener('response', function(response) {
    self.response = response;
    response.body = '';
    response.addListener('data', function(chunk) {
      response.body = response.body + chunk;
    });

    response.addListener('end', function() {
      self._callback(response);
    });
  });

  if ('POST' === this.method || 'PUT' === this.method ||
      'DELETE' === this.method)
    request.write(this.data);

  return request;
};

exports.Client = HttpClient;
