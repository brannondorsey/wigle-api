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

var API = {};

var request = require('request').defaults({jar:true}),
    http_request = require('http').request,
    qs = require('querystring');

API.base_url  = 'https://wigle.net';

// Login API
// http://www5.musatcha.com/musatcha/computers/wigleapi.htm
API.login_url = '/gps/gps/GPSDB/login';
API.login_username = 'credential_0';
API.login_password = 'credential_1';
API.login_noexpire = 'noexpire';
API.session_cookie = null;

// Query API

API.query_url       = '/gpsopen/gps/GPSDB/confirmquery/';
API.query_lat_south = 'latrange1';
API.query_lat_north = 'latrange2';
API.query_lng_east  = 'longrange1';
API.query_lng_west  = 'longrange2';
API.query_ssid      = 'ssid';
API.query_offset    = 'pagestart';

// returns javascript object representing network
API.parseResultRow = function(rowString) {
  
  var fields = rowString.split('~');
  if (fields.length == 18) {
    var network = {};
    network['netid']          = fields[0];
    network['ssid']           = fields[1];
    network['comment']        = fields[2];
    network['name']           = fields[3];
    network['type']           = fields[4];
    network['freenet']        = fields[5];
    network['paynet']         = fields[6];
    network['firsttime']      = fields[7];
    network['lasttime']       = fields[8];
    network['flags']          = fields[9];
    network['wep']            = fields[10];
    network['trilat']         = fields[11];
    network['trilong']        = fields[12];
    network['lastupdt']       = fields[13];
    network['channel']        = fields[14];
    network['bcninterval']    = fields[15];
    network['qos']            = fields[16];
    network['userfound']      = fields[17];
    return network;
  }
  
  return false;
  
}

API.queryScrapper = function(res, body, callback) {
  
  var self = this;
  var ts = new Date();
  var result = {};
  result.timestamp = ts;
  result.networks = [];

  var newLineIndex = body.indexOf('\n');
  var firstLine = body.substring(0, newLineIndex);

  // if these are the tilde delimited results that we expect
  if (newLineIndex != -1 && 
      body.substring(0, newLineIndex).split('~').length == 18) {
    var resultRows = body.split('\n');
    resultRows.shift();
    
    for (var i = 0; i < resultRows.length; i++) {
      var network = self.parseResultRow(resultRows[i]);
      if (network) result.networks.push(network);
    }
  } else {
    throw new Error('Unexpected query results received from Wigle.net:\n' + body);
  }

  callback(null, result);

};

API.loginScraper = function(res, body, callback) {
  var self = this;
  var err;
  if (!res || !res.headers) {
    err = new Error('Error trying to log in.');
    if (callback) callback(err);
    else throw err;
  }
  else if (!res.headers['set-cookie']) {
    err = new Error('Wrong log in credentials.');
    if (callback) callback(err);
    else throw err;
  }
  else if (callback) {
    self.session_cookie = res.headers['set-cookie'][0];
    callback();
  }
};


API.login = function(username, password, callback) {
  
  var self = this;

  // login data
  data = {};
  data[API.login_username] = username;
  data[API.login_password] = password;
  data[API.login_noexpire] = 'on';

  request.post({
    url: API.base_url + API.login_url,
    form: data
  }, function(err, req, body) {
    if (err) throw err;
    self.loginScraper(req, body, function(err) {
      if (err) throw err;

      if (callback) callback();
    });
  });
};


API.query = function(parameters, callback) {
  
  var self = this;

// EXAMPLE HEADER (from curl)
// > GET /gpsopen/gps/GPSDB/confirmquery?longrange1=-87.627769&longrange2=-87.624421&latrange1=41.879462&latrange2=41.882034&simple=true&variance=0.010 HTTP/1.1
// > User-Agent: curl/7.37.1
// > Host: wigle.net
// > Accept: */*
// > Cookie: auth=brannon%3A187800837%3A1428181485%3A3iiyiJyG4fr7j6ugapgxrw

  // IF WIGLE.NET DROPS POST SUPPORT AND BELOW DOESN'T WORK, THIS SHOULD SUFFICE
  // request({
  //   url: API.base_url + API.query_url + '?' + qs.stringify(parameters),
  //   headers: {
  //     'User-Agent': 'request',
  //     'HOST': 'wigle.net',
  //     'Accept': '*/*',
  //     'Content-Length': qs.stringify(data).length,
  //     'Cookie': self.session_cookie
  //   }
  // }, function(err, req, body) {
  //   if (err) throw err;
  //   console.log(req);
  //   self.queryScrapper(req, body, callback);
  // });
  request.post({
    url: API.base_url + API.query_url,
    form: parameters
  }, function(err, req, body) {
    if (err) throw err;
    self.queryScrapper(req, body, callback);
  });
};

module.exports = API;
