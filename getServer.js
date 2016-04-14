
"use strict"
var http            = require('http'),
    io              = require('socket.io'),
    path            = require('path'),
    fs              = require('fs'),
    url             = require('url'),
    qs              = require('querystring');
    

var getServer = function(){
    this.sub_domain = {get:[], post:[]};
    this.host = null;
    this.port = null;
    this.file_path = null;
    this.index_file = null;
    this.server_io = null;
}

getServer.prototype.start = function(options){
    
    var self = this;
    
    this.host = (options.host) ? options.host : "localhost";
    this.port = (options.port) ? options.port : 8780;
    this.file_path = (options.path) ? options.path : "";
    this.index_file = (options.index) ? options.index : "index.html";
    
    
    var server = http.createServer(
        function (req, res) {
            
            switch(req.method){
                
                case "OPTIONS":
                    res.writeHead(200, {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers" : "api-key, Content-Type",
                        "Access-Control-Request-Method" : "GET"
                    });
                    res.end();
                    break;
                
                case "GET":
                    res.setHeader("Access-Control-Allow-Origin", "*");
                    res.setHeader("Access-Control-Allow-Headers","api-key, Content-Type");
                    res.setHeader("Access-Control-Request-Method", "GET");
                    
                    var pathname = url.parse(req.url,true).pathname.trim();
                    //console.log(pathname);
                    if (pathname == "/") {
                        return_file(self.index_file, res, self.file_path);
                    }
                    else if(pathname.match("(css|js|png|jpeg|jpg|gif|html|ico)$")){
                        return_file(pathname, res, self.file_path);
                    }
                    else {
                        //find the right function
                        for (var row in self.sub_domain.get) {
                            if (pathname.match(self.sub_domain.get[row].domain)) {
                                self.sub_domain.get[row].callback(req, res);
                                break;
                            }
                        }
                    }
                    break;
                
                case "POST":                    
                    var body = '';
                    req.on('data', function (data) {
                        body += data;
                    });
                    req.on('end', function () {
                        req.body = body;
                        req.POST = null;
                        try {
                            req.POST = JSON.parse(body);
                        }catch(err){}
                        
                        var pathname = url.parse(req.url,true).pathname.trim();
                        res.writeHead(200, {'Content-Type': 'text/html'});
                        //find the right function
                        for (var row in self.sub_domain.post) {
                            
                            if (pathname.match(self.sub_domain.post[row].domain)) {
                                self.sub_domain.post[row].callback(req, res);
                                break;
                            }
                        }
                    });
                    
                    break;
                
                default:
                    res.end();
            }
        })
        .on('connection', function(socket) {
            socket.setTimeout(0);
        })
        .listen(this.port, this.host);
        
    this.server_io = io(server);
    console.log('Server running at '+this.host+':'+this.port+'/');
}

getServer.prototype.create_sub_domain = function(type, domain, cb){
    this.sub_domain[type].push({"domain": domain, "callback": cb })
}

function return_file(uri, response, file_path) {
    
    var filename = path.join(process.cwd(), file_path, uri);
    //console.log(filename);
    fs.exists(filename, function(exists) {
        
        if(!exists) {
          response.writeHead(404, {"Content-Type": "text/plain"});
          response.write("404 Not Found\n");
          response.end();
          return;
        }
        
        //if (fs.statSync(filename).isDirectory()) filename += '/'+=;
    
        fs.readFile(filename, "binary", function(err, file) {
          if(err) {        
            response.writeHead(500, {"Content-Type": "text/plain"});
            response.write(err + "\n");
            response.end();
            return;
          }
    
          response.writeHead(200);
          response.write(file, "binary");
          response.end();
        });
      });
}


module.exports = getServer;