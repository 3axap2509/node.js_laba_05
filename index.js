const http = require('http');
const fs = require('fs');
var j_buf;
var articles = [];
const j_a = "D://УЧЁБА//5 семестр//Нод.жс//Лабы//node.js_laba_05//artickles.json";
const hostname = '127.0.0.1';
const port = 3000;
var log_file;

const handlers = {
  '/sum': sum,
  '/articles/readall': readall,
  '/articles/read': read,
  '/articles/create': acreate,
  '/articles/update': update,
  '/articles/delete': adelete,
  '/comments/create': ccreate,
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
  log_file = fs.openSync(`log.txt`, "w+", 0644);
  j_buf = fs.readFileSync(j_a, 'utf-8');
  articles = JSON.parse(j_buf);
  console.log(`Server running at http://${hostname}:${port}/`);
  fs.appendFileSync(log_file, "Start Logging " + Date.now());
  fs.appendFileSync(log_file, "===============================================");
});

server.on('close', ()=>
{
  console.log("stop server");
  fs.appendFileSync(log_file, "===============================================");
  fs.appendFileSync(log_file, "End Logging " + Date.now());
})

function getHandler(url) 
{
  return handlers[url] || notFound;
}

function sum(req, res, payload, cb) 
{
  const result = { c: payload.a + payload.b };
  fs.appendFileSync(log_file, "Response:");
  fs.appendFileSync(log_file, result);
  cb(null, result);
}

function acreate(req, res, payload, cb)
{
  let isexist = false;
  let result = "id is already exist";
  articles.forEach(element => 
  {
    if(element.id == payload.id)
    {
      isexist = true;
    }
  });
  if(!isexist)
  {
    result = {
                    id: payload.id,
                    title: payload.title,
                    text: payload.text,
                    date: payload.date,
                    author:payload.author,
                    comments: []
                  };
    articles.push(result);
    fs.writeFile(j_a, JSON.stringify(articles), (err) => {if(err)console.error(err)});
  }
  fs.appendFileSync(log_file, "Response:");
  fs.appendFileSync(log_file, result);
  cb(null, result);
}

function readall(req, res, payload, cb)
{
  let result = JSON.stringify(articles);
  fs.appendFileSync(log_file, "Response:");
  fs.appendFileSync(log_file, result);
  cb(null, result);
}

function read(req, res, payload, cb)
{
  var result = "wrong id";
  articles.forEach(element => 
  {
    if(element.id == payload.id)
    {
      result = JSON.stringify(element);
    }
  });
  fs.appendFileSync(log_file, "Response:");
  fs.appendFileSync(log_file, result);

  cb(null, result);
}

function adelete(req, res, payload, cb)
{
  let isok = false;
  articles.forEach((element, index) => 
  {
    if(element.id == payload.id)
    {
      articles.splice(index, 1);
      isok = true;
    }
  });
  if(isok)
  {
    let result = `article with id №${payload.id} deleted`;
    fs.appendFileSync(log_file, "Response:");
    fs.appendFileSync(log_file, result);
    fs.writeFile(j_a, JSON.stringify(articles), (err) => {if(err)console.error(err)});
    cb(null, result);
  }
  else
  {
    fs.appendFileSync(log_file, "Response:");
    fs.appendFileSync(log_file, result);
    let result = "Wrong id";
    cb(null, result);
  }
}

function ccreate(req, res, payload, cb)
{
  var result =  {
                  id: payload.id,
                  articleId: payload.articleId,
                  text: payload.text,
                  date: payload.date,
                  author: payload.author
                }
  let is_ok = false;
  let is_ex = false;
  articles.forEach(item =>
  {
    if(item.id == payload.articleId)
    {
      item.comments.forEach(element => 
      {
        if(element.id == payload.id)
          is_ex = true;
      });
      if(!is_ex)
      {
        item.comments.push(result);
        is_ok = true;
      }
    }
  });
  if(!is_ok)
  {
    result = "error: uncorrect id of artcle or comment"
  }
  fs.appendFileSync(log_file, "Response:");
  fs.appendFileSync(log_file, result);
  fs.writeFile(j_a, JSON.stringify(articles), (err) => {if(err)console.error(err)});
  cb(null, result);
}

function cdelete(req, res, payload, cb)
{
  var io = false;
  var result;
  articles.forEach(item => 
  {
    if(item.id = payload.articleId)
    {
      item.comments.forEach((element, index) => 
      {
        if(element.id == payload.id)
        {
          item.comments.splice(index, 1);
          io = true;
        }
      });
    }
  });
  if(io)
  {
    result = "comment was successfully deleted";
  }
  else
  {
    result = "comment isn't exist"
  }
  fs.appendFileSync(log_file, "Response:");
  fs.appendFileSync(log_file, result);
  fs.writeFile(j_a, JSON.stringify(articles), (err) => {if(err)console.error(err)});
  cb(null, result);
}

function update(req, res, payload, cb)
{
  let ind = payload.id;
  let is_ex = false;
  let result = `article with id №${ind} isn't exist`
  let obj_ind;
  articles.forEach((element, index) => 
  {
    if(element.id == ind)
    {
      is_ex = true;
      obj_ind = index;
    }    
  });
  if(is_ex)
  {
    articles[obj_ind] = {
                          id: payload.id,
                          title: payload.title,
                          text: payload.text,
                          date: payload.date,
                          author: payload.author,
                          comments: articles[obj_ind].comments
                        }
    result = articles[obj_ind];
    fs.writeFile(j_a, JSON.stringify(articles), (err) => {if(err)console.error(err)});
  }
  fs.appendFileSync(log_file, "Response:");
  fs.appendFileSync(log_file, result);
  cb(null, result);
}

function notFound(req, res, payload, cb) 
{
  fs.appendFileSync(log_file, "Response:");
  fs.appendFileSync(log_file, "Not found");
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
    fs.appendFileSync(log_file, Date.now())
    fs.appendFileSync(log_file, " Request:");
    fs.appendFileSync(log_file, body);
    body = Buffer.concat(body).toString();
    let params = JSON.parse(body);
    cb(null, params);
  });
}