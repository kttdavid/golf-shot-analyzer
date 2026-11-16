const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('file://'+require('path').resolve(__dirname,'../../public/index.html'));
const t=process.argv.slice(2);console.log(await p.evaluate(t=>t.map(x=>x+'\n  => '+__tz(x)).join('\n'),t));await b.close()})();
