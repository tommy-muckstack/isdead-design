import {chromium} from "playwright";
const [url,out,w=1440]=process.argv.slice(2);const b=await chromium.launch();const p=await b.newPage({viewport:{width:+w,height:900}});await p.goto(url,{waitUntil:"load"});await p.waitForTimeout(800);await p.screenshot({path:out,fullPage:true});await b.close();
