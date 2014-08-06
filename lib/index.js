(function() {
  var HighchartsServer, binPath, child_process, highchartsjs, http, path, phantomjs, _;

  _ = require('underscore');

  child_process = require('child_process');

  http = require('http');

  path = require('path');

  phantomjs = require('phantomjs');

  binPath = phantomjs.path;

  highchartsjs = path.join(__dirname, 'scripts/highcharts-convert.js');

  module.exports = HighchartsServer = (function() {
    function HighchartsServer(port) {
      var args, callback;
      this.port = port;
      args = [highchartsjs, '-host', '127.0.0.1', '-port', this.port];
      callback = function(err, stdout, stderr) {
        console.log('phantom');
        console.log(err);
        console.log(stderr);
        return console.log(stdout);
      };
      child_process.execFile(binPath, args, callback);
    }

    HighchartsServer.prototype.render = function(renderOptions, chartOptions, callback) {
      var defaults, options, postdata, req, reqCallback;
      defaults = {
        infile: JSON.stringify(chartOptions),
        constr: 'Chart'
      };
      postdata = JSON.stringify(_.extend(defaults, renderOptions));
      options = {
        host: 'localhost',
        port: this.port,
        path: '/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': postdata.length
        }
      };
      reqCallback = function(res) {
        var data;
        data = '';
        res.on('readable', function() {
          var chunk;
          chunk = res.read();
          return data += chunk.toString('utf8');
        });
        return res.on('end', function() {
          var e;
          try {
            return callback(data);
          } catch (_error) {
            e = _error;
            return console.log(e.stack + '\n\n' + data);
          }
        });
      };
      req = http.request(options, reqCallback);
      req.on('error', console.log);
      req.write(postdata);
      return req.end();
    };

    return HighchartsServer;

  })();

}).call(this);
