_ = require('underscore')
child_process = require('child_process')
http = require('http')
path = require('path')
phantomjs = require('phantomjs')

binPath = phantomjs.path
highchartsjs = path.join(__dirname, 'scripts/highcharts-convert.js')

module.exports = class HighchartsServer
  constructor: (@port) ->
    args = [highchartsjs, '-host', '127.0.0.1', '-port', @port]

    callback = (err, stdout, stderr) ->
      console.log('phantom')
      console.log(err)
      console.log(stderr)
      console.log(stdout)

    child_process.execFile(binPath, args, callback)

  render: (renderOptions, chartOptions, callback) ->
    defaults =
      infile: JSON.stringify(chartOptions)
      constr: 'Chart'
      # callback: 'function (chart) { console.log(chart); }'

    postdata = JSON.stringify(_.extend(defaults, renderOptions))

    options =
  		host: 'localhost'
  		port: @port
  		path: '/'
  		method: 'POST'
  		headers:
        'Content-Type': 'application/json'
        'Content-Length': postdata.length

    reqCallback = (res) ->
      data = ''

      res.on 'readable', ->
        chunk = res.read()
        data += chunk.toString('utf8')

      res.on 'end', ->
        try
          callback(data)
        catch e
          console.log(e.stack + '\n\n' + data)

    req = http.request(options, reqCallback)
    req.on('error', console.log)
    req.write(postdata)
    req.end()
