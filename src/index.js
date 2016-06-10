import path from 'path';
import http from 'http';
import child_process from 'child_process';
import _ from 'lodash';
import phantomjs from 'phantomjs-prebuilt';
const highchartsjs = path.join(__dirname, '../scripts/highcharts-convert.js');
const binPath = phantomjs.path;

class HighchartsServer {
    constructor(port) {
        this.port = port;
        this.args = [highchartsjs, '-host', '127.0.0.1', '-port', port];
        this.ready = true;
        this.phantomProcess = null;
        this.starting = false;
        this.queue = [];

        process.on('exit', () => {
            // cleanup highcharts process
            this.stop();
        });
    }

    start() {
        this.starting = true;
        this.phantomProcess = child_process.execFile(binPath, this.args);
        this.phantomProcess.on('exit', () => {
            this.phantomProcess = null;
        });
        setTimeout(() => {
            this.ready = true;
            this.starting = false;
            while (this.queue.length > 0) {
                this.serve(this.queue.shift());
            }
        }, 10000);
    }

    stop() {
        if (this.phantomProcess) {
            this.phantomProcess.kill('SIGQUIT');
            this.phantomProcess = null;
        }
    }

    serve(obj) {
        const defaults = {
            infile: JSON.stringify(obj.chartOptions),
            constr: 'Chart'
        };
        const postdata = JSON.stringify(_.extend(defaults, obj.renderOptions));
        const options = {
            host: '127.0.0.1',
            port: 3003,
            path: '/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postdata, 'utf8')
            }
        };
        if (!this.ready) {
            this.queue.push(obj);
            return;
        }
        const req = http.request(options, this.handleRenderComplete.bind(this, obj));
        req.on('error', (err) => {

            if (err.code === 'ECONNREFUSED') {
              // no server running currently, start one
                this.ready = false;
                this.queue.push(obj);
                if (!this.starting) {
                    this.start();
                }
            } else {
                console.error(err, options);
            }
        });

        req.write(postdata);
        req.end();
    }

    render(renderOptions, chartOptions, callback) {
        const obj = {
            renderOptions,
            chartOptions,
            callback
        };

        if (this.ready) {
            this.serve(obj);
        } else {
            this.queue.push(obj);
        }
    }

    handleRenderComplete(obj, res) {
        let data = '';

        res.on('readable', () => {
            const chunk = res.read();
            if (!_.isNull(chunk)) {
                data += chunk.toString('utf8');
            }
        });

        res.on('end', () => {
            try {
                obj.callback(data);
            } catch (err) {
                console.error(err, err.stack);
            }
        });
    }
}
export default HighchartsServer;
