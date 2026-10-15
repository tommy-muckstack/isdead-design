import {chromium} from "playwright";
const [url,re='log ?in|sign ?in|sign ?up|get started|try']=process.argv.slice(2);const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});await p.goto(url,{waitUntil:"load",timeout:45000}).catch(()=>{});await p.waitForTimeout(3000);
console.log(JSON.stringify(await p.evaluate((re)=>[...document.querySelectorAll('a')].filter(a=>new RegExp(re,'i').test(a.innerText)).map(a=>a.innerText.trim().slice(0,30)+' -> '+a.href).slice(0,12),re),null,1));await b.close();
