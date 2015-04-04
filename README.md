
# wigle-api: A Wigle.net API for Node.js

An easy way to access [Wigle.net](http://wigle.net) with [Node.js](http://nodejs.org). Requires a user account.

- Original version (C) 2013 Nuno Santos
- Fork that uses older Wigle.net API (C) 2015 Brannon Dorsey


## Installation

TODO: npm/git

## Usage

```javascript
var wigle = require('wigle-api');
var client = wigle.createClient(
    'yourAccessLogin',
    'yourAccessPassword'
);

client.query({
  ssid: "linksys",
  offset: 100
}, function(err, result) {
  if (err) throw err;
  console.log('Timestamp:', r.timestamp);
  console.log('Number of networks found:', r.networks.length);
  console.log('Networks:', r.networks);
});
```

## API reference

### wigle.createClient(username, password)

Creates a new Client instance, and logs in to Wigle.net using the given credentials. The credentials are transmitted using an `https` connection.

### client.query(parameters, callback)

Sends a query to Wigle.net with the given parameters, and passes the response on to the callback. The responses from Wigle.net are always limited to 100 per request, but an offset can be used to retrieve further results.

The parameters are:
 * `lat_north` northern latitude range (between [-90, 90], max length 14)
 * `lat_south` southern latitude range (between [-90, 90], max length 14)
 * `lng_east` eastern longitude range (between [-180, 180], max length 14)
 * `lng_west` western longitude range (between [-180, 180], max length 14)
 * `netid` BSSID / AP Max Address, expects either just the colon delimited vendor code or a full MAC such as either 0A:2C:EF or 0A:2C:EF:3D:25:1B, max length 14
 * `ssid` network SSID / Network Name
 * `offset` search result offset

After the query is executed, a callback is called with the signature `callback(err, result)`, where err is an Error

## License

Wigle-api is released under the [MIT License](http://opensource.org/licenses/MIT).

See LICENSE for more details.

## Author

Copyright (C) 2013 Nuno Santos, [http://nunosantos.org](http://nunosantos.org)