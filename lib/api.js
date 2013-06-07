/*

Copyright (c) 2013 Nuno Santos

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

var request = require('request'),
    jsdom = require('jsdom').jsdom,
    jquery = require('jquery');



API.base_url  = 'https://wigle.net';

// Login API
// http://www5.musatcha.com/musatcha/computers/wigleapi.htm
API.login_url = '/gps/gps/main/login';
API.login_username = 'credential_0';
API.login_password = 'credential_1';
API.login_noexpire = 'noexpire';

// Query API

API.query_url       = '/gps/gps/main/confirmquery/';
API.query_lat_south = 'latrange1';
API.query_lat_north = 'latrange2';
API.query_lng_east  = 'longrange1';
API.query_lng_west  = 'longrange2';
API.query_ssid      = 'ssid';
API.query_offset    = 'pagestart';


API.queryScrapper = function(res, body, callback) {
  var ts = new Date();

  jsdom.env({
    html: body
  }, function(err, window) {
      $ = jquery.create(window);
      var isResults = $('.launchinner').size();

      if (callback && !isResults) {
        callback(new Error('Not logged in.'));
      }
      else if (callback && isResults) {
        var result = {};
        result.timestamp = ts;
        result.networks = [];
        // scrape
        var $networks = $('.launchinner tr.search');
        $networks.each(function (i, item) {
          var tds = $(item).find('td');
          if (tds.length == 20) {
            result.networks.push({
              netid:        tds.eq(1).text().trim(),
              ssid:         tds.eq(2).text().trim(),
              comment:      tds.eq(3).text().trim(),
              name:         tds.eq(4).text().trim(),
              type:         tds.eq(5).text().trim(),
              freenet:      tds.eq(6).text().trim(),
              paynet:       tds.eq(7).text().trim(),
              firsttime:    tds.eq(8).text().trim(),
              lasttime:     tds.eq(9).text().trim(),
              flags:        tds.eq(10).text().trim(),
              wep:          tds.eq(11).text().trim(),
              trilat:       tds.eq(12).text().trim(),
              trilong:      tds.eq(13).text().trim(),
              dhcp:         tds.eq(14).text().trim(),
              lastupdt:     tds.eq(15).text().trim(),
              channel:      tds.eq(16).text().trim(),
              bcninterval:  tds.eq(17).text().trim(),
              qos:          tds.eq(18).text().trim(),
              userfound:    tds.eq(19).text().trim()
            });
          }
        });

        callback(null, result);
      }

  });
};

API.loginScraper = function(res, body, callback) {
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

      self.logged_in = true;
      if (callback) callback();
    });
  });
};


API.query = function(parameters, callback) {
  var self = this;
  var data = {};

  if (parameters.lat_south) data[API.query_lat_south] = parameters.lat_south;
  if (parameters.lat_north) data[API.query_lat_north] = parameters.lat_north;
  if (parameters.lng_east) data[API.query_lng_east] = parameters.lng_east;
  if (parameters.lng_east) data[API.query_lng_east] = parameters.lng_east;
  if (parameters.ssid) data[API.query_ssid] = parameters.ssid;
  if (parameters.offset) data[API.query_offset] = parameters.offset;

  request.post({
    url: API.base_url + API.query_url,
    form: data
  }, function(err, req, body) {
    if (err) throw err;
    self.queryScrapper(req, body, callback);
  });
};

module.exports = API;
