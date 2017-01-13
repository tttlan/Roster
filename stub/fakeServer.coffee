'use strict'
_ = require 'lodash'
fs = require 'fs-extra'
path = require 'path'
url = require 'url'
app = require('express')()
argv = require('yargs')
  .default('write', false)
  .default('read-on-startup', true)
  .default('read-only-data', 'data')
  .default('proxy', false)
  .usage('Usage: $0 [--no-write] [--no-read-on-startup] [--no-read-only-data] [--read-only-data <file|directory>] [--proxy <address>]')
  .describe('write', 'Persist state to disk after each request')
  .describe('read-only-data', 'Data to read on server startup. This data source is never written to. Can be a file or directory.')
  .describe('read-on-startup', 'Whether to read data.json on startup')
  .describe('proxy', 'Proxy unmatched requests to the given address')
  .help('help')
  .alias('h', 'help')
  .alias('d', 'read-only-data'  )
  .argv

conf = require('rc')('fakeserver',
  write: true
  readOnlyData: 'data'
  readOnStartup: true
  tryAllFieldsForId: true
  dataFile: 'data.json'
  bypassFile: 'bypass.json'
, argv)

maxId = null
meta = {}

if conf.readOnlyData
  if fs.existsSync conf.readOnlyData
    stats = fs.statSync(conf.readOnlyData)
    if stats.isDirectory()
      data = {}
      data = _.merge data, fs.readJsonSync(path.join(conf.readOnlyData, k)) for k in fs.readdirSync(conf.readOnlyData) when k.match /.json$/i
    else
      data = fs.readJsonSync conf.readOnlyData
  else
    console.log "#{conf.readOnlyData} not found. Continuing without read-only-data."

dataFile = conf.dataFile

if not fs.existsSync dataFile
  fs.writeSync fs.openSync(dataFile, 'w'), JSON.stringify({})

if conf.readOnStartup
  console.log "Reading #{dataFile} on startup, as configured"
  data = _.merge data or {}, fs.readJsonSync(dataFile)

data ?= {}

findRecord = (target, id) ->
  record = data[target]
  record = data[target] = [] if not record
  record = record[id] if id?
  record = _(data[target]).compact().find(id: id) if not record and id?
  record = _(data[target]).compact().find(id: +id) if not record and id?
  # Fallback to trying any property match
  record = _(data[target]).compact().find( (it) -> _(it).some( (v) -> v == id ) ) if conf.tryAllFieldsForId and (not record and id?)
  # Type insensitive match, last try
  record = _(data[target]).compact().find( (it) -> _(it).some( (v) -> `v == id` ) ) if conf.tryAllFieldsForId and (not record and id?)
  record = data[ _.toArray(arguments).join('/') ] unless record?
  record = null if record == undefined || record.length == 0
  record

addHeaders = (data, req, res) ->
  #Hack to add the sherpa x-pagination headers from the pagination body component *rolls_eyes*
  pagination = data["Pagination"]
  res.setHeader 'x-pagination', JSON.stringify(pagination) if pagination
  #CORS
  res.setHeader('access-control-allow-origin', req.headers["origin"]);
  res.setHeader('access-control-expose-headers', 'X-Pagination,X-TAK');
  res.setHeader('access-control-allow-credentials', 'true');
  res.setHeader('access-control-allow-headers', 'access-control-expose-headers,authorization');
  #cache
  res.setHeader('cache-control', 'no-cache');


proxy = require('http-proxy-middleware')(
  target: conf.proxy
  changeOrigin: true
  onProxyReq : (proxyReq, req, res) ->
    console.log "proxying #{req.method} request to #{conf.proxy}#{url.parse(req.url).path}"
)

bypass = _.map fs.readJsonSync(conf.bypassFile), (str) -> new RegExp(str)

app.use(require('method-override')())
app.route('/*')
  .all (req, res, next) ->
    if conf.readBeforeRequest
      console.log "Reading #{dataFile} before processing request, as configured"
      # Intentionally crash if non existant
      data = fs.readJsonSync(dataFile)
    list = _.compact(url.parse(req.originalUrl.replace ///\/v\d+\////, '/').pathname.replace(/\/v[0-9]+\//, '/').split '/')
    req.params =
      apiPath: ( type: list[i], id: list[i+1] for val, i in list by 2 )
      list: list
    console.log "Request for #{req.params.list.join '/'} received"
    next()
  .all (req, res, next) ->
    path = req.params.list.join '/'
    if _.some(bypass, (item) -> item.test(path))
      proxy(req, res, next)
    else
      next()
  .options (req, res, next) ->
    id = _.last(req.params.apiPath).id
    target = if id? then _(req.params.list).initial().join '/' else req.params.list.join '/'
    d = findRecord(target, id)
    if d?
      addHeaders(d, req, res)
    else unless conf.proxy
      res.status(404).end()
    next()
  .get (req, res, next) ->
    id = _.last(req.params.apiPath).id
    target = if id? then _(req.params.list).initial().join '/' else req.params.list.join '/'
    d = findRecord(target, id)
    if d?
      addHeaders(d, req, res)
      res.json(if _.isArray(d) then _.compact(d) else d).end()
    else unless conf.proxy
      res.status(404).end()
    next()
  .all require('body-parser').json() # Note bodyParser after any proxied posts to avoid stream hang
  .post (req, res, next) ->
    if _.last(req.params.apiPath).id?
      res.status(500).json({message: 'Post cannot specify an id, use put instead'}).end()
      return
    target = req.params.list.join '/'
    d = data[target] = data[target] or []
    id = d.length
    d[id] = _.extend {}, req.body, {id: id}
    console.log "Created #{req.params.list.join '/'} as #{JSON.stringify(req.body)}"
    res.json({id: id}).end()
    next()
  .put (req, res, next) ->
    if req.params.list.length == 1
      res.status(500).json({message: 'Put requires an id, use post instead'}).end()
      return
    id = _.last(req.params.apiPath).id
    target = _(req.params.list).initial().join '/'
    if id?
      record = findRecord(target, id)
      if record
        _(record).keys().each (k) ->
          delete record[k]
        _.extend record, req.body, {id: id}
      else
        data[target].push(_.extend {}, req.body, {id: id})
    else
      data[req.params.list.join '/'] = req.body
    console.log "Updated #{req.params.list.join '/'} as #{JSON.stringify(req.body)}"
    res.json({}).end()
    next()
  .patch (req, res, next) ->
    if req.params.list.length == 1
      res.status(500).json({message: 'Patch requires an id'}).end()
      return
    id = _.last(req.params.apiPath).id
    target = _(req.params.list).initial().join '/'
    if id?
      record = findRecord(target, id)
      _.extend record, req.body, {id: id} if record
    if record
      console.log "Patched #{req.params.list.join '/'} as #{JSON.stringify(record)}"
      res.json({}).end()
    else
      res.status(404).end()
    next()
  .delete (req, res, next) ->
    if req.params.list.length == 1
      res.status(500).json({message: 'Delete requires an id'}).end()
      return
    id = _.last(req.params.apiPath).id
    if id
      target = _(req.params.list).initial().join '/'
      d = data[target]
      model = d[id]
      d[id] = undefined
    else
      target = req.params.list.join '/'
      model = data[target]
      delete data[target]
    model = findRecord(target, id) if not model?
    # Fake a delete for an object that we couldn't really delete (due to data structure limitations)
    model._deleted = true if model?
    if model
      console.log "Deleted #{req.params.list.join '/'}"
      res.status(200).json({})
    else
      res.status(404).end()
    next()
  .all (req, res, next) ->
    if conf.write
      fs.outputJsonSync dataFile, data
    if conf.proxy and not res.headersSent
      proxy(req, res, next)
    else
      next()

app.listen 9010, ->
  console.log "Listening"
