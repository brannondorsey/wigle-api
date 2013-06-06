
# wigle-api: A Wigle.net API for Node.js

An easy way to access [Wigle.net](http://wigle.net) with [Node.js](http://nodejs.org). Requires a user account.


## Installation

TODO: npm/git

## Usage

```javascript
var wigle_api = require('wigle-api');
var wigle = wigle_api.createClient(
    'yourAccessLogin',
    'yourAccessPassword'
);

wigle.query({
    ssid: 'linksys'
}, function(err, response) {
    if (err) throw err;
    response.forEach(function(ap) {
        console.log('AP: ' + ap.ssid);
    });
});
```

## License

Wigle-api is released under the [MIT License](http://opensource.org/licenses/MIT).

See LICENSE for more details.

## Author

Copyright (C) 2013 Nuno Santos, [http://nunosantos.org](http://nunosantos.org)