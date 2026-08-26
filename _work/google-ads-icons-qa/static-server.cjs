const http=require('http');const fs=require('fs');const path=require('path');
const root=path.resolve(__dirname,'..','..','..','site_mirror');
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'application/javascript','.mjs':'application/javascript','.json':'application/json','.webp':'image/webp','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.gif':'image/gif','.ico':'image/x-icon','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.xml':'application/xml','.txt':'text/plain; charset=utf-8'};
http.createServer((req,res)=>{
  let u=decodeURIComponent(req.url.split('?')[0]);
  if(u.endsWith('/'))u+='index.html';
  let f=path.join(root,u);
  fs.stat(f,(e,st)=>{
    if(!e&&st.isDirectory()){f=path.join(f,'index.html');}
    fs.readFile(f,(err,data)=>{
      if(err){res.writeHead(404,{'Content-Type':'text/plain'});res.end('404 '+u);return;}
      res.writeHead(200,{'Content-Type':types[path.extname(f).toLowerCase()]||'application/octet-stream','Cache-Control':'no-cache'});
      res.end(data);
    });
  });
}).listen(4179,'127.0.0.1',()=>console.log('READY http://127.0.0.1:4179'));