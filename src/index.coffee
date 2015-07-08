_ = require('underscore')
child_process = require('child_process')
http = require('http')
path = require('path')
phantomjs = require('phantomjs')

binPath = phantomjs.path
highchartsjs = path.join(__dirname, '../scripts/highcharts-convert.js')

module.exports = class HighchartsServer
  constructor: (@port) ->
    @ready = false
    @Q = []

    args = [highchartsjs, '-host', '127.0.0.1', '-port', @port]

    callback = (err, stdout, stderr) ->
      console.log('127.0.0.1:' + @port)
      console.log('phantom')
      console.log(err)
      console.log(stderr)
      console.log(stdout)

    child_process.execFile(binPath, args, callback)

    setTimeout =>
      @ready = true
      @serve(@Q.shift()) for obj, i in @Q
    , 10000


  render: (renderOptions, chartOptions, callback) ->
    obj =
      renderOptions: renderOptions
      chartOptions: chartOptions
      callback: callback

    if (@ready)
      @serve(obj)
    else
      @Q.push(obj)

  serve: (obj) ->
    defaults =
      infile: JSON.stringify(obj.chartOptions)
      constr: 'Chart'
      # callback: 'function (chart) { console.log(chart); }'

    postdata = JSON.stringify(_.extend(defaults, obj.renderOptions))

    options =
  		host: '127.0.0.1'
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
        if chunk then (data += chunk.toString('utf8')) else data

      res.on 'end', ->
        try
          obj.callback(data)
        catch e
          console.log(e.stack + '\n\n' + data)

    req = http.request(options, reqCallback)
    req.on 'error', (err) ->
      console.log(err)
      console.log(options)

    req.write(postdata)
    req.end()
