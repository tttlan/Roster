# Sherpa ui stub server
This is the first attempt at a mock server to assist ui dev. If the requirements becomre more complicated that what has been acheived perhaps look into mountebank, wiremocks or apiary.

## install
```
npm i && npm i coffee-script -g
```

## run
The idea is for the stub server to stub requests (primarilly GET) that are not yet available from the server. Any requets that have not had mocks configured will be proxied to a real server. The proxy can passed on the command line with the `--proxy` option (this can also be supplied in `.fakeserverrc`)
```
coffee fakeServer.coffee --proxy=http://api.test3.sherpasystems.net.au:80
```

## mock data
Mocks are defined either in individual json files in the `/data` directory or in the `data.json`. The format for each data file should be a single object where the keys match the URL that the mock should resond to. The corresponding values are the response bodies. For example
```json
{
    "/api/some/path": {
        "foo": 1,
        "bar": true,
        "baz": "Luhrmann"
        },
    "/api/some/list/resource": [
        { "foo": "bar"},
        { "foo": "baz"}
    ]
    ...
}
```

## bypassing POST/PUT requests
By default all POST and PUT requests will go straight to the mock's in memory persistence. If instead you want the request to be proxied to the real server add a pattern matching the requests url in the `bypass.json` file.