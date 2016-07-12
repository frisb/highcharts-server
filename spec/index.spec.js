/* eslint-env jasmine */
import 'babel-polyfill';
require('babel-register')({
    ignore: /^((?!find-process).)*$/
});
import Highcharts from '../src/index';
import resemble from 'node-resemble-js';
import path from 'path';
import http from 'http';
import fs from 'fs';
const find = require('find-process');

import { chartOptions, imgOptions } from './support/fixture';

describe('highcharts-server', () => {
    let server = null;

    beforeAll(() => {
        server = new Highcharts(3003, 5000);
    });

    afterEach((done) => {
        server.once('stopped', () => {
            done();
        });
        server.stop(true);
    });

    it('should restart phantomjs if a request timeouts', (done) => {
        server.once('stopped', () => {
            var fakeServer = http.createServer(() => {});
            fakeServer.listen(3003);
            server.ready = true;
            server.on('timeout', () => {
                expect(true).toEqual(true);
                fakeServer.once('close', () => {
                    done();
                });
                fakeServer.close();
            });

            server.render(imgOptions, chartOptions, () => {
                expect(false).toEqual(true); // we shouldn't get here
            });
        });
        server.stop();
    }, 20000);

    it('generates a chart that matches the original with < 9% difference', (done) => {
        server.render(imgOptions, chartOptions, (base64png) => {
            const generatedChart = new Buffer(base64png, 'base64');

            const originalChart = fs.readFileSync(path.join(__dirname, 'support/original.png'));
            resemble(generatedChart).compareTo(originalChart).onComplete(function(data) {
                data.getDiffImage().pack().pipe(fs.createWriteStream(path.join(__dirname, 'support/diff.png')));
                expect(Number(data.misMatchPercentage)).toBeLessThan(9);
                done();
            });
        });
    }, 20000);

    it('starts phantomjs if it is not running', (done) => {
        find('name', /.*phantomjs.*highcharts-convert\.js.*/)
        .then((list) => {
            expect(list.length).toEqual(0);
            server.render(imgOptions, chartOptions, () => {
                find('name', /.*phantomjs.*highcharts-convert\.js.*/)
                .then((afterProcesses) => {
                    expect(afterProcesses.length).toBeGreaterThan(0);
                    done();
                });
            });
        });
    }, 20000);

    it('stops phantomjs if there is no work for a specific amount of time', (done) => {
        find('name', /.*phantomjs.*highcharts-convert\.js.*/)
        .then((list) => {
            expect(list.length).toEqual(0);
            server.start();
            server.once('started', () => {
                find('name', /.*phantomjs.*highcharts-convert\.js.*/)
                .then((afterProcesses) => {
                    expect(afterProcesses.length).toBeGreaterThan(0);
                    setTimeout(() => {
                        find('port', /.*phantomjs.*highcharts-convert\.js.*/)
                        .then((finalProcesses) => {
                            expect(finalProcesses.length).toEqual(0);
                        });
                    }, 6000);
                    done();
                });
            });
        });
    }, 20000);
});
