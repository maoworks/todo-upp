import http from 'node:http';
import {readFile} from 'node:fs/promises';
const root=new URL('./app/',import.meta.url);
const paths={'/':'index.html','/index.html':'index.html','/app.js':'app.js','/domain.js':'domain.js','/style.css':'style.css'};
http.createServer(async(req,res)=>{
  const file=paths[new URL(req.url,'http://localhost').pathname];
  if(!file){res.writeHead(404);return res.end('Not found');}
  try{const body=await readFile(new URL(file,root));res.writeHead(200,{'Content-Type':file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.css')?'text/css':'text/javascript','Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",'X-Content-Type-Options':'nosniff'});res.end(body);}catch{res.writeHead(500);res.end('読み込みに失敗しました');}
}).listen(Number(process.env.PORT||3000),'127.0.0.1',()=>console.log('http://127.0.0.1:'+(process.env.PORT||3000)));
