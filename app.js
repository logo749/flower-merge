(function(){
"use strict";
var COLS=7,ROWS=9,N=COLS*ROWS;
var SERIES=[
 {name:"星露花",p1:"#fdf1e0",p2:"#e3c9b0",core:"#e8b34e"},
 {name:"蜜穗花",p1:"#f2c65c",p2:"#cfa03a",core:"#fff3cf"},
 {name:"月铃花",p1:"#b990db",p2:"#8d5fbd",core:"#f2d071"},
 {name:"夜莺花",p1:"#e2738f",p2:"#b03f60",core:"#f5c76a"},
 {name:"幽兰花",p1:"#8fb8e8",p2:"#5d86bd",core:"#f0d38a"}
];
var LNAME=["花苗","花苞","花枝","花束","花篮","花艺作品"];
var VAL=[1,2,4,8,16,32];
var C={line:"#3c4f3f",stem:"#5f8b57",leaf:"#79a768",leaf2:"#98c184",acc:"#d8b268",acc2:"#b3894a",paper:"#efe6d2"};
var BEDS=[{i:57,s:0,need:0},{i:59,s:1,need:1},{i:61,s:2,need:3}];
var WEBS=[0,3,6,8,11,13,14,16,19,24,27,28,30,33,35,36,39,42,45,48,50,53,55,56,58,62];
var LVCOST=[200,1500,6000,16000,30000];
var TPL=[
 {t:0,items:[[2,2],[3,1]]},{t:0,items:[[3,2]]},{t:0,items:[[3,3]]},
 {t:1,items:[[4,2]]},{t:1,items:[[4,1],[3,2]]},{t:1,items:[[5,1]]},
 {t:2,items:[[4,2],[3,2]]},{t:2,items:[[6,1]]},{t:2,items:[[6,1],[5,1]]}
];
var KEY="fm_flower_v2";
var S=null,drag=null,tick=0;

function r1(v){return Math.round(v*10)/10;}
function bloom(cx,cy,r,o){
  var d="",i,st=r1(r*0.92),ry=r1(r*1.3);
  for(i=0;i<5;i++){d+='<ellipse cx="'+cx+'" cy="'+r1(cy-st)+'" rx="'+st+'" ry="'+ry+'" fill="'+o.p1+'" stroke="'+C.line+'" stroke-width="1.1" transform="rotate('+(i*72)+' '+cx+' '+cy+')"/>';}
  return d+'<circle cx="'+cx+'" cy="'+cy+'" r="'+r1(r*0.52)+'" fill="'+o.core+'" stroke="'+C.line+'" stroke-width=".9"/>';
}
function stem(cx,by,h){return '<path d="M'+cx+' '+by+' V'+r1(by-h)+'" stroke="'+C.line+'" stroke-width="2.2" fill="none" stroke-linecap="round"/>';}
function leaves(cx,by,h){
  var y=r1(by-h*0.42);
  return '<ellipse cx="'+r1(cx-6.4)+'" cy="'+y+'" rx="5.6" ry="2.9" fill="'+C.leaf+'" stroke="'+C.line+'" stroke-width="1.1" transform="rotate(-20 '+r1(cx-6.4)+' '+y+')"/>'
    +'<ellipse cx="'+r1(cx+6.4)+'" cy="'+r1(y+1.6)+'" rx="5.6" ry="2.9" fill="'+C.leaf2+'" stroke="'+C.line+'" stroke-width="1.1" transform="rotate(20 '+r1(cx+6.4)+' '+r1(y+1.6)+')"/>';
}
function art(s,lv){
  var o=SERIES[s],b=45,g="";
  if(lv===1){g=stem(24,b,13)+leaves(24,b,13)+'<ellipse cx="24" cy="29.4" rx="2.6" ry="3.5" fill="'+o.p1+'" stroke="'+C.line+'" stroke-width="1.2"/><ellipse cx="24" cy="30.6" rx="1.3" ry="1.5" fill="'+o.p2+'"/>';}
  else if(lv===2){g=stem(24,b,18)+leaves(24,b,18)+'<ellipse cx="24" cy="23.4" rx="7.2" ry="8.8" fill="'+o.p1+'" stroke="'+C.line+'" stroke-width="1.3"/><ellipse cx="24" cy="23.6" rx="2.4" ry="6.2" fill="'+o.p2+'"/><path d="M24 33 C19.6 31 17.4 26.6 17.9 21.6 C20.8 25.4 22.6 29 24 32.4 Z" fill="'+C.leaf+'" stroke="'+C.line+'" stroke-width="1.1"/><path d="M24 33 C28.4 31 30.6 26.6 30.1 21.6 C27.2 25.4 25.4 29 24 32.4 Z" fill="'+C.leaf2+'" stroke="'+C.line+'" stroke-width="1.1"/><ellipse cx="24" cy="15.4" rx="1.7" ry="1.2" fill="'+o.p2+'"/>';}
  else if(lv===3){g=stem(24,b,17)+leaves(24,b,17)+bloom(24,19,6.2,o);}
  else if(lv===4){g='<path d="M24 45 L16.6 30 L31.4 30 Z" fill="'+C.paper+'" stroke="'+C.line+'" stroke-width="1.3"/><path d="M24 45 L21.6 30.6 L24 32.2 L26.4 30.6 Z" fill="'+o.p2+'"/><path d="M24 31 V19 M18.6 30 L16.6 19.6 M29.4 30 L31.4 19.6" stroke="'+C.stem+'" stroke-width="2" fill="none" stroke-linecap="round"/>'+bloom(16.2,17.4,4.6,o)+bloom(31.8,17.4,4.6,o)+bloom(24,12.6,5.2,o)+'<path d="M17 31 q7-3.2 14 0 q-7 3.1-14 0" fill="'+o.p2+'" stroke="'+C.line+'" stroke-width="1.2"/>';}
  else if(lv===5){g='<path d="M15 34 h18 l-2.6 11 h-12.8 Z" fill="'+C.acc+'" stroke="'+C.line+'" stroke-width="1.4"/><path d="M16.4 38 h15.2 M17.6 41.4 h12.8" stroke="'+C.acc2+'" stroke-width="1.3" fill="none"/><path d="M18 34 q6-9 12 0" stroke="'+C.line+'" stroke-width="1.6" fill="none"/>'+stem(24,33,7)+'<ellipse cx="12.6" cy="27.6" rx="4.6" ry="2.6" fill="'+C.leaf+'" stroke="'+C.line+'" stroke-width="1"/><ellipse cx="35.4" cy="27.6" rx="4.6" ry="2.6" fill="'+C.leaf2+'" stroke="'+C.line+'" stroke-width="1"/>'+bloom(14.8,26,4,o)+bloom(33.2,26,4,o)+bloom(19.2,20.6,4.2,o)+bloom(28.8,20.6,4.2,o)+bloom(24,17,4.6,o);}
  else {g='<path d="M17.5 32.6 h13 l-1.6 12.4 h-9.8 Z" fill="'+C.paper+'" stroke="'+C.line+'" stroke-width="1.4"/><path d="M17.5 32.6 h13" stroke="'+C.line+'" stroke-width="1.4"/><path d="M24 30 V12 M24 30 L14 16 M24 30 L34 16 M24 30 L10.5 22 M24 30 L37.5 22 M24 30 L18.5 11 M24 30 L29.5 11" stroke="'+C.stem+'" stroke-width="1.8" fill="none" stroke-linecap="round"/>'+bloom(24,11.4,4.6,o)+bloom(14,15,4,o)+bloom(34,15,4,o)+bloom(10.5,21,3.4,o)+bloom(37.5,21,3.4,o)+bloom(18.5,9.6,3.8,o)+bloom(29.5,9.6,3.8,o);}
  return '<svg viewBox="5 7 38 42" preserveAspectRatio="xMidYMid meet">'+g+'</svg>';
}
function webSVG(){
  return '<div class="web" style="opacity:.62"><svg viewBox="0 0 40 40"><g stroke="#aab3a4" stroke-width="1" fill="none"><path d="M2 2 L38 38 M38 2 L2 38 M20 1 V39 M1 20 H39"/><path d="M9 9 Q20 12 31 9"/><path d="M7 15 Q20 19 33 15"/><path d="M7 24 Q20 28 33 24"/></g></svg></div>';
}

function fresh(){
  var cells=new Array(N).fill(null),k;
  for(k=0;k<BEDS.length;k++){var b=BEDS[k];cells[b.i]={k:"bed",s:b.s,lv:1};}
  for(k=0;k<WEBS.length;k++){cells[WEBS[k]]={k:"web",s:0,lv:1};}
  return {coins:0,energy:100,crit:0.08,lv:0,cells:cells,orders:[],sel:-1,tmax:0,sales:0,day:1};
}
function load(){
  try{var raw=localStorage.getItem(KEY);if(!raw)return fresh();var o=JSON.parse(raw);
    if(!o||!o.cells||o.cells.length!==N)return fresh();return o;}catch(e){return fresh();}
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}

function bedsOpen(){var n=0;for(var k=0;k<BEDS.length;k++)if(S.lv>=BEDS[k].need)n++;return n;}
function critPct(){return Math.round((0.08+0.03*S.lv)*100);}

function tplFor(lv){
  var pool=TPL.slice(0,3);
  if(lv===0||lv===1)pool=TPL.slice(0,3);
  else if(lv===2||lv===3)pool=TPL.slice(3,6);
  else pool=TPL.slice(6,9);
  return pool[Math.floor(Math.random()*pool.length)];
}
function makeOrder(forceSeries){
  var open=bedsOpen(),s=forceSeries!=null?forceSeries:Math.floor(Math.random()*open);
  if(s>=open)s=0;
  var tp=tplFor(S.lv),v=0,k;
  for(k=0;k<tp.items.length;k++)v+=VAL[tp.items[k][0]-1]*tp.items[k][1];
  var coins=Math.ceil(v*(6+tp.t)/5)*5;
  return {s:s,items:tp.items,coins:coins,t:tp.t};
}
function fillOrders(){
  var open=bedsOpen();
  while(S.orders.length<3)S.orders.push(makeOrder());
  for(var k=0;k<S.orders.length;k++)if(S.orders[k].s>=open)S.orders[k]=makeOrder();
}

function $(id){return document.getElementById(id);}
function toast(msg){var t=$("toast");t.textContent=msg;t.classList.add("on");clearTimeout(toast.tm);toast.tm=setTimeout(function(){t.classList.remove("on");},1500);}

function renderHUD(){
  $("e").textContent=S.energy;
  $("c").textContent=S.coins;
  var cost=S.lv<5?LVCOST[S.lv]:0;
  var up=$("up");
  up.disabled=!cost||S.coins<cost;
  $("upv").textContent=cost?cost:"满";
  $("lvl").textContent="Lv"+S.lv;
  $("crit").textContent="暴击 "+critPct()+"%";
}
function renderOrders(){
  var h="",k,m;
  for(k=0;k<S.orders.length;k++){
    var o=S.orders[k],ok=canDeliver(o),ns="";
    for(m=0;m<o.items.length;m++){
      var lv=o.items[m][0],n=o.items[m][1],have=countFlowers(o.s,lv),bad=have<n?" bad":"";
      ns+='<div class="ni">'+art(o.s,lv)+'<i class="'+bad.trim()+'">×'+n+'</i></div>';
    }
    h+='<div class="order'+(ok?" done":"")+'"><div class="t"><span>'+["日常","进阶","精品","典藏"][Math.min(o.t+ (S.lv>3?1:0),3)]+'</span><span>'+SERIES[o.s].name+'</span></div>'
      +'<div class="n">'+ns+'</div>'
      +'<button data-del="'+k+'"'+(ok?"":" disabled")+'>'+(ok?"交付":"未凑齐")+'</button>'
      +'<div class="c">+'+o.coins+' 金币</div></div>';
  }
  $("ord").innerHTML=h;
}
function countFlowers(s,lv){var n=0;for(var i=0;i<N;i++){var c=S.cells[i];if(c&&c.k==="f"&&c.s===s&&c.lv===lv)n++;}return n;}
function canDeliver(o){
  for(var m=0;m<o.items.length;m++)if(countFlowers(o.s,o.items[m][0])<o.items[m][1])return false;
  return true;
}
function cellHTML(i){
  var c=S.cells[i],cls="cell",inner="";
  if(c){
    if(c.k==="bed"){
      var need=BEDS.filter(function(b){return b.i===i;})[0];
      var locked=need&&S.lv<need.need;
      cls+=" bed"+(locked?" lock":"");
      inner='<div class="pic">'+art(c.s,1)+'</div><div class="tag">'+SERIES[c.s].name+" L"+c.lv+"</div>";
      if(locked)inner='<div class="pic" style="opacity:.35">'+art(c.s,1)+'</div><div class="tag" style="top:1px;bottom:auto">Lv'+need.need+' 解锁</div>';
    } else if(c.k==="web"){
      inner='<div class="pic">'+art(c.s,c.lv)+'</div>'+webSVG();
    } else {
      inner='<div class="pic">'+art(c.s,c.lv)+'</div><div class="lv">L'+c.lv+"</div>";
    }
  }
  if(S.sel===i)cls+=" sel";
  return '<div class="'+cls+'" data-i="'+i+'">'+inner+'</div>';
}
function renderBoard(){
  var h="";
  for(var i=0;i<N;i++)h+=cellHTML(i);
  $("bd").innerHTML=h;
}
function renderStatus(){
  var txt1="点花圃出花 · 两两合并 · 凑满订单交付",txt2="";
  if(S.sel>=0&&S.cells[S.sel]){
    var c=S.cells[S.sel];
    txt1="已选中 "+SERIES[c.s].name+" · "+LNAME[c.lv-1]+(c.k==="web"?"（蛛网）":"");
    txt2="再点一个同种同阶的花材合并；点六阶可拆成 4 株花苗";
  } else {
    txt2="花圃 "+bedsOpen()+"/3 · 空格 "+S.cells.filter(function(x){return !x;}).length+" · 暴击 "+critPct()+"%";
  }
  $("s1").textContent=txt1;$("s2").textContent=txt2;
}
function render(){renderHUD();renderOrders();renderBoard();renderStatus();}

function ringEmpty(bed){
  var br=Math.floor(bed/COLS),bc=bed%COLS,out=[];
  for(var d=1;d<=6;d++)for(var r=br-d;r<=br+d;r++)for(var c=bc-d;c<=bc+d;c++){
    if(Math.max(Math.abs(r-br),Math.abs(c-bc))!==d)continue;
    if(r<0||r>=ROWS||c<0||c>=COLS)continue;
    var i=r*COLS+c;if(!S.cells[i])out.push(i);
  }
  return out;
}
function produce(bed,n){
  if(S.energy<=0){toast("体力不足，等一会儿再来");return;}
  var b=null,k;
  for(k=0;k<BEDS.length;k++)if(BEDS[k].i===bed)b=BEDS[k];
  if(!b)return;
  if(S.lv<b.need){toast("这一圃要 Lv"+b.need+" 才解锁");return;}
  var cnt=S.cells[bed].lv>3?3:S.cells[bed].lv,sp=ringEmpty(bed);
  if(sp.length===0){toast("棋盘满了，先合并腾出空位");return;}
  var crit=Math.random()<S.crit,lv=crit?3:1,made=0;
  for(k=0;k<cnt&&k<sp.length;k++){S.cells[sp[k]]={k:"f",s:b.s,lv:lv};made++;}
  S.energy-=1;S.tmax=S.tmax||Date.now();
  render();
  for(k=0;k<made;k++)flash(sp[k],"drop2");
  toast(crit?"暴击！直接产出花枝":"+花产出 ×"+made);
  save();
}
function mergeInto(si,ti){
  var sc=S.cells[si],tc=S.cells[ti];
  if(!sc)return false;
  if(tc&&tc.k==="web"&&tc.s===sc.s&&tc.lv===sc.lv){S.cells[ti]={k:"f",s:sc.s,lv:sc.lv+1};S.cells[si]=null;return true;}
  if(tc&&tc.k==="f"&&tc.s===sc.s&&tc.lv===sc.lv&&tc.lv<6){S.cells[ti]={k:"f",s:sc.s,lv:tc.lv+1};S.cells[si]=null;return true;}
  return false;
}
function moveTo(si,ti){
  if(!S.cells[si]||S.cells[ti])return false;
  S.cells[ti]=S.cells[si];S.cells[si]=null;return true;
}
function bedMerge(si,ti){
  var a=S.cells[si],b=S.cells[ti];
  if(!a||!b||a.k!=="bed"||b.k!=="bed")return false;
  if(a.s!==b.s||a.lv!==b.lv||a.lv>=3)return false;
  S.cells[ti]={k:"bed",s:b.s,lv:b.lv+1};S.cells[si]=null;return true;
}
function split(si){
  var c=S.cells[si];if(!c||c.k!=="f"||c.lv!==6)return false;
  var sp=ringEmpty(si).slice(0,4);if(!sp.length){toast("没有空位可拆");return false;}
  for(var k=0;k<sp.length;k++)S.cells[sp[k]]={k:"f",s:c.s,lv:1};
  S.cells[si]=null;toast("拆成 "+sp.length+" 株花苗");return true;
}
function deliver(k){
  var o=S.orders[k];if(!o||!canDeliver(o))return;
  for(var m=0;m<o.items.length;m++){
    var lv=o.items[m][0],left=o.items[m][1];
    for(var i=0;i<N&&left>0;i++){var c=S.cells[i];if(c&&c.k==="f"&&c.s===o.s&&c.lv===lv){S.cells[i]=null;left--;}}
  }
  S.coins+=o.coins;S.sales++;
  S.orders[k]=makeOrder();
  toast("交付成功 +"+o.coins+" 金币");
  render();save();
}
function upgrade(){
  var cost=S.lv<5?LVCOST[S.lv]:0;if(!cost||S.coins<cost)return;
  S.coins-=cost;S.lv++;S.crit=Math.min(0.2,0.08+0.03*S.lv);
  var msg="花店升级到 Lv"+S.lv+"，暴击 "+critPct()+"%";
  if(bedsOpen()>0)msg+="，新花圃解锁";
  toast(msg);fillOrders();render();save();
}
function flash(i,cls){var bd=$("bd");if(!bd||!bd.children[i])return;var el=bd.children[i];el.classList.add(cls);setTimeout(function(){el.classList.remove(cls);},450);}
function syncSel(){var k,bd=$("bd").children;for(k=0;k<bd.length;k++)bd[k].classList.toggle("sel",k===S.sel);}
function tapAt(i){
  var c=S.cells[i];
  if(!c){
    if(S.sel>=0&&moveTo(S.sel,i)){S.sel=-1;render();flash(i,"pop");save();return;}
    S.sel=-1;renderStatus();syncSel();return;
  }
  if(c.k==="bed"){produce(i);return;}
  if(c.k==="web"){
    if(S.sel>=0&&S.cells[S.sel]&&S.cells[S.sel].k==="f"&&mergeInto(S.sel,i)){
      var lv=S.cells[i].lv;S.sel=-1;render();flash(i,"pop");
      toast("清网！"+SERIES[c.s].name+" → "+LNAME[lv-1]);save();return;
    }
    toast("蛛网封住了：拉同种同阶的花过来解");return;
  }
  if(S.sel>=0&&S.sel!==i){
    var sc=S.cells[S.sel];
    if(sc&&mergeInto(S.sel,i)){S.sel=-1;render();flash(i,"pop");toast("合并成功");save();return;}
  }
  if(c.lv===6&&S.sel<0){split(i);render();save();return;}
  S.sel=(S.sel===i?-1:i);
  renderStatus();syncSel();
}

function bind(){
  var bd=$("bd"),hover=-1;
  function clearDrop(){if(hover>=0&&bd.children[hover])bd.children[hover].classList.remove("drop");hover=-1;}
  function onMove(e){
    if(!drag||drag.lock)return;
    var el=document.elementFromPoint(e.clientX,e.clientY);
    var t=el&&el.closest?el.closest(".cell"):null;
    var ti=t?+t.dataset.i:-1;
    if(ti===hover)return;
    clearDrop();
    if(ti>=0&&ti!==drag.i&&bd.children[ti]){bd.children[ti].classList.add("drop");hover=ti;}
  }
  bd.addEventListener("pointerdown",function(e){
    var el=e.target.closest?e.target.closest(".cell"):null;if(!el)return;
    var i=+el.dataset.i,c=S.cells[i];
    drag={i:i,lock:!!(c&&c.k==="web")};
    if(!drag.lock)el.classList.add("drag");
    document.addEventListener("pointermove",onMove);
    e.preventDefault();
  });
  document.addEventListener("pointerup",function(e){
    if(!drag)return;
    document.removeEventListener("pointermove",onMove);
    var d=drag;drag=null;clearDrop();
    if(bd.children[d.i])bd.children[d.i].classList.remove("drag");
    if(d.lock){tapAt(d.i);return;}
    var el=document.elementFromPoint(e.clientX,e.clientY);
    var t=el&&el.closest?el.closest(".cell"):null;
    var ti=t?+t.dataset.i:d.i;
    if(ti!==d.i){
      var sc=S.cells[d.i];
      if(sc&&sc.k==="bed"){
        if(bedMerge(d.i,ti)){toast("花圃合成 L"+S.cells[ti].lv);render();flash(ti,"pop");save();return;}
        tapAt(d.i);return;
      }
      if(sc&&sc.k==="f"){
        var locked=S.cells[ti]&&S.cells[ti].k==="web";
        if(mergeInto(d.i,ti)){S.sel=-1;render();flash(ti,"pop");toast(locked?"清网成功":"合并成功");save();return;}
        if(moveTo(d.i,ti)){render();flash(ti,"pop");save();return;}
        toast("这里放不下");return;
      }
      return;
    }
    tapAt(d.i);
  });
  $("ord").addEventListener("click",function(e){var b=e.target.closest?e.target.closest("[data-del]"):null;if(b)deliver(+b.dataset.del);});
  $("up").addEventListener("click",upgrade);
  $("tools").addEventListener("click",function(e){var b=e.target.closest?e.target.closest("[data-tab]"):null;if(b)openSheet(b.dataset.tab);});
  $("sheet").addEventListener("click",function(e){if(e.target.id==="sheet")$("sheet").classList.remove("on");});
  document.addEventListener("visibilitychange",function(){if(document.hidden)save();});
  window.addEventListener("pagehide",save);
}
function openSheet(tab){
  var sb=$("sb"),h="";
  if(tab==="bed"){
    h="<h3>花圃</h3><p>点花圃：扣 1 体力，产出该花系的 1 株花苗；花圃升到 L2/L3 后一次产 2/3 株。花苗落在花圃旁的空格。</p>";
    for(var k=0;k<BEDS.length;k++){
      var b=BEDS[k],ok=S.lv>=b.need;
      h+='<div class="row"><span>'+SERIES[b.s].name+" · "+["一圃","二圃","三圃"][k]+"</span><span>"+(ok?"已开放 · L"+S.cells[b.i].lv:"Lv"+b.need+" 解锁")+"</span></div>";
    }
    h+="<h4>怎么升花圃</h4><p>把一圃拖到另一圃同阶花圃上，两圃合成一圃高一阶，产出翻倍。合并不耗体力。</p>";
  } else if(tab==="dex"){
    h="<h3>花谱图鉴</h3><p>五种花系，每系六阶；同种同阶两两合并：花苗→花苞→花枝→花束→花篮→花艺作品。</p>";
    for(var s=0;s<SERIES.length;s++){
      var un=s<=2,row='<div style="display:flex;align-items:center;gap:6px;background:#fff;border:1px solid #d9e2d6;border-radius:12px;padding:6px;margin-bottom:8px">';
      row+='<div style="width:52px;font-size:11px;font-weight:700;color:#2c4d3a">'+SERIES[s].name+'<div style="font-size:8px;font-weight:500;color:#8a988b">'+(un?"已开放":"待开放")+'</div></div>';
      row+='<div style="display:flex;flex:1;justify-content:space-between">';
      for(var q=1;q<=6;q++)row+='<div style="width:36px;text-align:center"><div style="width:34px;height:34px;margin:0 auto">'+art(s,q)+'</div><div style="font-size:7.5px;color:#5f7268">'+LNAME[q-1]+'</div></div>';
      h+=row+"</div></div>";
    }
  } else if(tab==="shop"){
    h="<h3>装修</h3><p>金币先用来升级花店：解锁新花圃、暴击 +3%，后期再装饰店面。</p>";
    for(var i2=0;i2<LVCOST.length;i2++){
      h+='<div class="row"><span>Lv'+i2+" → Lv"+(i2+1)+"</span><span>"+(S.lv>i2?"已完成":LVCOST[i2]+" 金币")+"</span></div>";
    }
  } else {
    h="<h3>任务 · 设置</h3>"+'<div class="row"><span>本日交付</span><span>'+S.sales+" 单</span></div>"
      +'<div class="row"><span>体力</span><span>'+S.energy+"/100</span></div>"
      +"<h4>试玩开关</h4>"
      +'<p><button class="btn gb" id="dA">+1000 金币</button> <button class="btn gb" id="dB">加满体力</button></p>'
      +'<p><button class="btn gb" id="dC">重置存档</button></p>'
      +"<p>试玩版体力 6 秒回 1 点（正式版 2 分钟 1 点）。</p>";
  }
  sb.innerHTML=h;
  $("sheet").classList.add("on");
  var A=$("dA"),B2=$("dB"),C2=$("dC");
  if(A)A.onclick=function(){S.coins+=1000;render();save();toast("+1000 金币");};
  if(B2)B2.onclick=function(){S.energy=100;render();save();toast("体力已满");};
  if(C2)C2.onclick=function(){S=fresh();fillOrders();render();save();$("sheet").classList.remove("on");toast("已重置");};
}

function loop(){
  if(S.energy<100){
    if(!S.tmax)S.tmax=Date.now();
    if(Date.now()-S.tmax>=6000){var add=Math.floor((Date.now()-S.tmax)/6000);S.energy=Math.min(100,S.energy+add);S.tmax=Date.now();renderHUD();save();}
  } else S.tmax=0;
}

function init(){
  S=load();
  if(!S.orders||!S.orders.length)S.orders=[];
  fillOrders();
  bind();render();
  setInterval(loop,1000);
  window.__FM__={get:function(){return S;},set:function(o){for(var k in o)S[k]=o[k];render();save();},art:art};
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
