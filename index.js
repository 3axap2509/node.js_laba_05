const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const handlers = {
  '/sum': sum,
  '/articles/readall': readall,
  '/articles/read': read,
  '/articles/create': acreate,
  '/artickles/update': update,
  '/articles/delete': adelete,
  '/commemts/create': ccreate,
  '/comments/delete': cdelete
};

const server = http.createServer((req, res) => 
{
  parseBodyJson(req, (err, payload) =>
  {
    if(err)
    {
      console.error(err);
      return;
    }
    const handler = getHandler(req.url);
    handler(req, res, payload, (err, result) => 
    {
      if (err) 
      {
        res.statusCode = err.code;
        res.setHeader('Content-Type', 'application/json');
        res.end( JSON.stringify(err) );
        return;
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end( JSON.stringify(result) );
    });
  });
});

server.listen(port, hostname, () => 
{
  console.log(`Server running at http://${hostname}:${port}/`);
});

function getHandler(url) 
{
  return handlers[url] || notFound;
}

function sum(req, res, payload, cb) 
{
  const result = { c: payload.a + payload.b };
  cb(null, result);
}

function acreate(req, res, payload, cb)
{

}

function readall(req, res, payload, cb)
{
  
}

function read(req, res, payload, cb)
{
  
}

function adelete(req, res, payload, cb)
{
  
}

function ccreate(req, res, payload, cb)
{
  
}

function cdelete(req, res, payload, cb)
{
  
}

function update(req, res, payload, cb)
{
  
}

function notFound(req, res, payload, cb) 
{
  cb({ code: 404, message: 'Not found'});
}

function parseBodyJson(req, cb) 
{
  let body = [];
  req.on('data', function(chunk) 
  {
    body.push(chunk);
  }).on('end', function() 
  {
    body = Buffer.concat(body).toString();
    let params = JSON.parse(body);
    cb(null, params);
  });
}