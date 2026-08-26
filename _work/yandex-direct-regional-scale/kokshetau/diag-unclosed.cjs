const fs=require('fs');
function check(slug){
  const h=fs.readFileSync('site_mirror/web-studiya/kontekstnaya-reklama/yandex-direct/'+slug+'/index.html','utf8');
  const stack=[];
  const voidish=new Set(['meta','link','img','br','hr','input','source','area','base','col','embed','param','track','wbr']);
  const re=/<\/?([a-zA-Z0-9]+)(\s[^>]*)?>/g; let m;
  while((m=re.exec(h))){
    const full=m[0]; const name=m[1].toLowerCase();
    if(full.startsWith('</')){
      if(!stack.length){ console.log(slug,'extra close',name); continue; }
      const top=stack.pop();
      if(top!==name){ console.log(slug,'mismatch close',name,'expected',top,'at',m.index); stack.push(top); }
    } else if(voidish.has(name) || full.endsWith('/>')) {
      // skip
    } else {
      stack.push(name);
    }
  }
  console.log(slug,'unclosed',stack.slice(-20), 'depth', stack.length);
}
check('aktau'); check('kokshetau'); check('turkestan');
