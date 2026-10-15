import {chromium} from 'playwright';
const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});
await p.goto(process.argv[2],{waitUntil:'networkidle'});await p.screenshot({path:process.argv[3],clip:{x:0,y:0,width:390,height:200}});await b.close();
