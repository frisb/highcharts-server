import path from 'path';
import request from 'request';
import events from 'events';
import child_process from 'child_process';
import _ from 'lodash';
import phantomjs from 'phantomjs-prebuilt';
const highchartsjs = path.join(__dirname, '../scripts/highcharts-convert.js');
const binPath = phantomjs.path;

class HighchartsServer extends events.EventEmitter {
    constructor(port = 3001, phantomjsTimeout = 60000, sleepTime = 300000) {
        super();
        this.port = port;
        this.args = [highchartsjs, '-host', '127.0.0.1', '-port', port];
        this.ready = true;
        this.phantomProcess = null;
        this.starting = false;
        this.phantomjsTimeout = phantomjsTimeout;
        this.sleepTime = sleepTime;
        this.queue = [];
        this.processing = 0;

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
            this.emit('started');
            this.resetSleepTimer();
            while (this.queue.length > 0) {
                this.serve(this.queue.shift());
            }
        }, 4000);
    }

    stop(clearQueue) {
        if (this.phantomProcess) {
            this.phantomProcess.kill('SIGKILL');
            this.phantomProcess = null;
            if (clearQueue) {
                this.queue = [];
            }
            this.processing = 0;
            setTimeout(() => {
                this.emit('stopped');
            }, 2000);
        } else {
            this.emit('stopped');
        }
    }

    serve(obj) {
        const defaults = {
            infile: JSON.stringify(obj.chartOptions),
            constr: 'Chart'
        };
        const postdata = JSON.stringify(_.extend(defaults, obj.renderOptions));
        if (!this.ready) {
            this.queue.push(obj);
            return;
        } else {
            this.processing++;
        }

        request.post(`http://localhost:${this.port}/`, {
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postdata, 'utf8')
            },
            body: postdata,
            timeout: this.phantomjsTimeout
        }, (err, r, body) => {
            if (err) {
                this.processing--;
                this.queue.push(obj);
                if (err.code === 'ECONNREFUSED') {
                  // no server running currently, start one
                    this.ready = false;
                    if (!this.starting) {
                        this.start();
                    }
                } else if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT') {
                    // phantomjs occasionally goes into a zombie state where
                    // it's still running and will accept a connection/request
                    // but never responds to the request
                    this.emit('timeout');
                    this.once('stopped', () => {
                        this.start();
                    });
                    this.stop();
                } else {
                    console.error(err);
                }
                return;
            } else {
                obj.callback(body);
                this.processing--;
                this.resetSleepTimer();
            }
        });
    }

    stopSleepTimer() {
        if (this.sleepTime && this.sleepTimer) {
            clearTimeout(this.sleepTimer);
        }
    }

    resetSleepTimer() {
        this.stopSleepTimer();
        this.sleepTimer = setTimeout(() => {
            if (this.queue.length === 0 && this.processing === 0) {
                // if there is nothing in the queue and nothing
                // currently processing, stop phantomjs
                this.stop();
            } else {
                // otherwise wait and check again (default 5 minutes)
                this.resetSleepTimer();
            }
        }, this.sleepTime);
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
}
export default HighchartsServer;
