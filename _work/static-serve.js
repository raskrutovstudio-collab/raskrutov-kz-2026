const http = require("http");
const fs = require("fs");
const path = require("path");
const root = process.argv[2];
const port = Number(process.argv[3] || 8765);
const mime = { ".html":"text/html; charset=utf-8", ".css":"text/css", ".js":"application/javascript", ".webp":"image/webp", ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".png":"image/png", ".svg":"image/svg+xml", ".woff2":"font/woff2", ".ico":"image/x-icon", ".json":"application/json" };
http.createServer((req,res)=>{
  let urlPath = decodeURIComponent((req.url||"/").split("?")[0]);
  if (urlPath.endsWith("/")) urlPath += "index.html";
  const file = path.normalize(path.join(root, urlPath));
  if (!file.startsWith(root)) { res.writeHead(403); return res.end("forbidden"); }
  fs.readFile(file, (err, data)=>{
    if (err) { res.writeHead(404); return res.end("not found"); }
    res.writeHead(200, {"Content-Type": mime[path.extname(file).toLowerCase()] || "application/octet-stream"});
    res.end(data);
  });
}).listen(port, "127.0.0.1", ()=>console.log("listening "+port));
