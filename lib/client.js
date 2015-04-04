/*

Copyright (c) 2013 Nuno Santos
          (c) 2015 Brannon Dorsey (Modifications)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the 'Software'), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

 */


var Queue = require('./queue'),
    wigle_api = require("./api");

var Client = exports.Client = function Client (username, password) {
  var self = this;

  this.logged_in = false;
  this.queuedCommandHistory = new Queue();

  // login, and flush queued commands after successful login
  wigle_api.login(username, password, function() {
    _flushQueuedCommands.call(self);
  });

  // private methods
  var _flushQueuedCommands = function() {
    var queuedCommands = this.queuedCommandHistory;

    while ((command = queuedCommands.shift())) {
      if (command) command();
    }
  };
};

/*
 * parameters:
 *   - lat_south [-90, 90]
 *   - lat_north [-90, 90]
 *   - lng_east [-180, 180]
 *   - lng_west [-180, 180]
 *   - ssid
 *   - offset (pagestart, e.g. 1000)
 */
Client.prototype.query = function(parameters, callback) {

  if (!this.logged_in) {
    var self = this;
    this.queuedCommandHistory.push(function(){ wigle_api.query(parameters, callback); });
  }
  else {
    wigle_api.query(parameters, callback);
  }
};

