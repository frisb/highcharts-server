# highcharts [![Build Status](https://travis-ci.org/frisb/highcharts.png)](http://travis-ci.org/frisb/highcharts)

[![npm status badge](https://nodei.co/npm/highcharts.png?stars=true&downloads=true)](https://nodei.co/npm/highcharts/)

highcharts for node.js wraps the highcharts-convert module in a simple to use web server which is run locally.

contributions are welcome.

## features

* `simple api` - Simplifies existing useage.

## Class: Highcharts

Highcharts has the following methods.

### new Highcharts(port)

* `port` Number. Port to bind webserver to localhost.

Constructor for creating a Highcharts web server instance.

### render(options, callback)

* `options` Object. General Highcharts options.
* `callback` Function. The callback has argument `(base64png)`, a base64 PNG data string.

## usage

``` js
var Highcharts = require('highcharts');
var server = new Highcharts(3003);

var options = {
  title: {
    text: 'Monthly Average Temperature',
    x: -20 //center
  },
  subtitle: {
    text: 'Source: WorldClimate.com',
    x: -20
  },
  xAxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  },
  yAxis: {
    title: {
      text: 'Temperature (°C)'
    },
    plotLines: [{
      value: 0,
      width: 1,
      color: '#808080'
    }]
  },
  tooltip: {
    valueSuffix: '°C'
  },
  legend: {
    layout: 'vertical',
    align: 'right',
    verticalAlign: 'middle',
    borderWidth: 0
  },
  series: [
		{
	    name: 'Tokyo',
	    data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
	  },
		{
      name: 'New York',
      data: [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8, 24.1, 20.1, 14.1, 8.6, 2.5]
	  },
		{
      name: 'Berlin',
      data: [-0.9, 0.6, 3.5, 8.4, 13.5, 17.0, 18.6, 17.9, 14.3, 9.0, 3.9, 1.0]
	  },
		{
      name: 'London',
      data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
	  }
	]
};

server.render({ width: 640, scale: 2 }, options, callback)
```

## installation

```
npm install highcharts
```

## License

(The MIT License)

Copyright (c) frisB.com &lt;play@frisb.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[![Analytics](https://ga-beacon.appspot.com/UA-40562957-3/highcharts/readme)](https://github.com/igrigorik/ga-beacon)
