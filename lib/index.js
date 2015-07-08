(function() {
  var HighchartsServer, binPath, child_process, highchartsjs, http, path, phantomjs, _;

  _ = require('underscore');

  child_process = require('child_process');

  http = require('http');

  path = require('path');

  phantomjs = require('phantomjs');

  binPath = phantomjs.path;

  highchartsjs = path.join(__dirname, '../scripts/highcharts-convert.js');

  module.exports = HighchartsServer = (function() {
    function HighchartsServer(port) {
      var args, callback;
      this.port = port;
      this.ready = false;
      this.Q = [];
      args = [highchartsjs, '-host', '127.0.0.1', '-port', this.port];
      callback = function(err, stdout, stderr) {
        console.log('127.0.0.1:' + this.port);
        console.log('phantom');
        console.log(err);
        console.log(stderr);
        return console.log(stdout);
      };
      child_process.execFile(binPath, args, callback);
      setTimeout((function(_this) {
        return function() {
          var i, obj, _i, _len, _ref, _results;
          _this.ready = true;
          _ref = _this.Q;
          _results = [];
          for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
            obj = _ref[i];
            _results.push(_this.serve(_this.Q.shift()));
          }
          return _results;
        };
      })(this), 10000);
    }

    HighchartsServer.prototype.render = function(renderOptions, chartOptions, callback) {
      var obj;
      obj = {
        renderOptions: renderOptions,
        chartOptions: chartOptions,
        callback: callback
      };
      if (this.ready) {
        return this.serve(obj);
      } else {
        return this.Q.push(obj);
      }
    };

    HighchartsServer.prototype.serve = function(obj) {
      var defaults, options, postdata, req, reqCallback;
      defaults = {
        infile: JSON.stringify(obj.chartOptions),
        constr: 'Chart'
      };
      postdata = JSON.stringify(_.extend(defaults, obj.renderOptions));
      options = {
        host: '127.0.0.1',
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
          if (chunk) {
            return data += chunk.toString('utf8');
          } else {
            return data;
          }
        });
        return res.on('end', function() {
          var e;
          try {
            return obj.callback(data);
          } catch (_error) {
            e = _error;
            return console.log(e.stack + '\n\n' + data);
          }
        });
      };
      req = http.request(options, reqCallback);
      req.on('error', function(err) {
        console.log(err);
        return console.log(options);
      });
      req.write(postdata);
      return req.end();
    };

    return HighchartsServer;

  })();

}).call(this);
