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

API.base_url  = 'https://api.wigle.net/api/v2';

// Login API
API.login_url = '/stats/user';

// Query API

API.query_url       = '/network/search';
API.query_lat_south = 'latrange1';
API.query_lat_north = 'latrange2';
API.query_lng_east  = 'longrange1';
API.query_lng_west  = 'longrange2';
API.query_ssid      = 'ssid';
API.query_offset    = 'pagestart';

// returns javascript object representing network
API.parseResultRow = function(rowString) {
  
  var network = {};
  network['netid']          = rowString['netid'];
  network['ssid']           = rowString['ssid'];
  network['comment']        = rowString['comment'];
  network['name']           = rowString['name'];
  network['type']           = rowString['type'];
  network['freenet']        = rowString['freenet'];
  network['paynet']         = rowString['paynet'];
  network['firsttime']      = rowString['firsttime'];
  network['lasttime']       = rowString['lasttime'];
  network['flags']          = rowString['flags'];
  network['wep']            = rowString['wep'];
  network['trilat']         = rowString['trilat'];
  network['trilong']        = rowString['trilong'];
  network['lastupdt']       = rowString['lastupdt'];
  network['channel']        = rowString['channel'];
  network['bcninterval']    = rowString['bcninterval'];
  network['qos']            = rowString['qos'];
  network['userfound']      = rowString['userfound'];

  return network;

}

API.queryScrapper = function(res, body, callback) {
  
  var self = this;
  var ts = new Date();
  var result = {};
  result.timestamp = ts;
  result.networks = [];

  // if these are valid response that we expect
  if (res.statusCode == 200 && body.success !== 'false' && body.results !== undefined) {

    var resultRows = body.results;
    
    for (var i = 0; i < resultRows.length; i++) {
      var network = self.parseResultRow(resultRows[i]);
      if (network) result.networks.push(network);
    }
  } else {
    var err = new Error('Unexpected query results received from Wigle.net: ' + body.error);
    callback(err, null);
  }

  callback(null, result);

};

API.loginScraper = function(res, body, auth, callback) {
  var self = this;
  var err;
  if (!res || !res.headers) {
    err = new Error('Error trying to validate user token.');
    if (callback) callback(err);
    else throw err;
  }
  else if (!res.statusCode == 200) {
    err = new Error('Wrong log in credentials.');
    if (callback) callback(err);
    else throw err;
  }
  else if (callback) {
    self.auth = auth;
    callback(null);
  }
};


API.login = function(api_token, callback) {
  
  var self = this;

  // login token
  credentials = new Buffer(api_token, 'base64').toString('ascii').split(":");
  data = { 'user': credentials[0], 'pass': credentials[1] }

  request.post({
    url: API.base_url + API.login_url,
    form: data
  }, function(err, req, body) {
    
    if (err) {
      if (callback) {
        callback(err);
      } else {
        throw err;
      }
    } 
    
    self.loginScraper(req, body, function(err) {
      
      if (err) {
        if (callback) {
          callback(err);
        } else {
          throw err;
        }
      } else {
        if (callback) callback(null);
      }
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
    if (err) {
      callback(err, null);
    }
    self.queryScrapper(req, body, callback);
  });
};

module.exports = API;
