/* Lets index.html run outside Claude. Inside Claude the real `claude` object exists and this file does nothing.
   Outside Claude it provides the same small interface (claude.use('sample') -> limits(), json()) and sends
   the request to our own backend (/api/analyze), which holds the API key. */
(function(){
  if(typeof window.claude!=='undefined'&&window.claude&&window.claude.use)return;
  var zh=function(){try{return window.LANG_GET&&window.LANG_GET()==='zh'}catch(e){return false}};
  var M=function(en,cn){return zh()?cn:en};
  function bad(en,cn){var e=new Error(M(en,cn));e.shim=true;return e}
  async function toJpegB64(file){
    var bmp=await createImageBitmap(file);
    var sc=Math.min(1,1600/Math.max(bmp.width,bmp.height));
    var c=document.createElement('canvas');c.width=Math.round(bmp.width*sc);c.height=Math.round(bmp.height*sc);
    c.getContext('2d').drawImage(bmp,0,0,c.width,c.height);
    return c.toDataURL('image/jpeg',0.85).split(',')[1];
  }
  function getCode(){try{return localStorage.getItem('gsa_code')||''}catch(e){return ''}}
  function setCode(v){try{localStorage.setItem('gsa_code',v)}catch(e){}}
  async function call(body,retry){
    body.code=getCode();
    var r;
    try{r=await fetch('/api/analyze',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)})}
    catch(e){throw bad('Could not reach the server. Check your connection and try again.','連不到伺服器，請確認網路後再試一次。')}
    var j=null;try{j=await r.json()}catch(e){}
    if(r.status===401&&!retry){
      var v=window.prompt(M('Enter your access code','請輸入存取碼'));
      if(!v)throw bad('An access code is needed to use this page.','需要存取碼才能使用。');
      setCode(v.trim());return call(body,true);
    }
    if(r.status===401)throw bad('That access code was not accepted.','存取碼不正確。');
    if(r.status===429)throw bad('You have reached today’s limit. Please try again tomorrow.','今天的使用次數已達上限，請明天再試。');
    if(r.status===503)throw bad('The analysis service is busy. Please try again in a minute.','分析服務目前忙碌中，請一分鐘後再試。');
    if(!r.ok||!j||j.json===undefined)throw bad('The analysis could not be completed. Please try again.','分析沒有完成，請再試一次。');
    return j.json;
  }
  var sample={
    limits:async function(){return{images:{maxCount:3}}},
    json:async function(prompt,opts){
      opts=opts||{};var imgs=[];
      for(var i=0;i<(opts.images||[]).length;i++)imgs.push({media_type:'image/jpeg',data:await toJpegB64(opts.images[i])});
      return call({prompt:String(prompt),images:imgs,tier:opts.modelTier==='complex'?'complex':'default'});
    }
  };
  window.claude={use:async function(n){return n==='sample'?sample:null}};
})();
