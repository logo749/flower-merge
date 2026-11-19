(function(){
'use strict';
var COLS=9,ROWS=7,N=63,KEY='fm-v1';
var SER=[{n:'星露花',c:'#7FA97E',l:'#EAF3E2',d:'#4d7a56',m:1,x:0},
{n:'月铃穗',c:'#8E84C4',l:'#EFECFA',d:'#67609e',m:2,x:0},
{n:'焰心菊',c:'#C8764B',l:'#FBEADF',d:'#9d5334',m:1,x:1}];
var LNN=['','花苗','花苞','花枝','花束','花篮','花艺作品'];
var LVV=[0,1,2,4,8,16,32];
var TPL=[{i:'D1',t:'日常',need:[[2,2],[3,1]],lv:0},
{i:'D2',t:'日常',need:[[3,2]],lv:0},
{i:'D3',t:'日常',need:[[3,3]],lv:0},
{i:'P1',t:'进阶',need:[[4,2]],lv:1},
{i:'P2',t:'进阶',need:[[4,1],[3,2]],lv:1},
{i:'P3',t:'精品',need:[[5,1]],lv:2},
{i:'P4',t:'精品',need:[[4,2],[3,2]],lv:3},
{i:'P5',t:'典藏',need:[[6,1]],lv:4},
{i:'P6',t:'典藏',need:[[6,1],[5,1]],lv:4}];
var COEF={'日常':6,'进阶':7,'精品':8,'典藏':9};
var LVC=[200,1500,6000,16000,30000];
var BEDS=[{i:54,s:0,u:0},{i:58,s:1,u:1},{i:62,s:2,u:3}];
var WEBS=[[0,0],[0,3],[0,7],[1,5],[2,1],[2,6],[3,3],[3,8],[4,0],[5,4],[5,7],[6,5]];
var CACHE={},S=null,sel=-1,hov=-1,down=false,sx=0,sy=0,moved=false,dragFrom=-1;
function $(id){return document.getElementById(id);}
function fresh(){var cells=new Array(N).fill(null);
 WEBS.forEach(function(p){cells[p[0]*COLS+p[1]]={k:'web',s:0,lv:1};});
 BEDS.forEach(function(b){cells[b.i]=b.u<=0?{k:'bed',s:b.s,lv:1}:{k:'lock',s:b.s,u:b.u};});
 return {cells:cells,energy:100,eAt:Date.now(),coins:0,level:0,orders:[],seq:0,demo:true};}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
function load(){try{var d=JSON.parse(localStorage.getItem(KEY));if(d&&d.cells&&d.cells.length===N)return d;}catch(e){}return null;}
function tickMs(){return S.demo?6000:120000;}
function sync(){var t=tickMs();
 if(S.energy>=100){S.eAt=Date.now();return;}
 var g=Math.floor((Date.now()-S.eAt)/t);
 if(g>0){S.energy=Math.min(100,S.energy+g);S.eAt=S.energy>=100?Date.now():S.eAt+g*t;}}
function cd(){if(S.energy>=100)return '已满';
 var rem=Math.ceil((tickMs()-((Date.now()-S.eAt)%tickMs()))/1000),m=Math.floor(rem/60),se=rem%60;
 return '下一点 '+(m?m+'分'+String(se).padStart(2,'0')+'秒':se+'秒');}
function crit(){return Math.min(0.2,0.08+S.level*0.03);}
function servN(){return S.level>=3?3:(S.level>=1?2:1);}
function empty(){var a=[],i;for(i=0;i<N;i++)if(!S.cells[i])a.push(i);return a;}
function cntF(){var n=0,i,c;for(i=0;i<N;i++){c=S.cells[i];if(c&&c.k==='f')n++;}return n;}
function fcount(s,lv){var n=0,i,c;for(i=0;i<N;i++){c=S.cells[i];if(c&&c.k==='f'&&c.s===s&&c.lv===lv)n++;}return n;}
function units(n){var u=0;n.forEach(function(p){u+=LVV[p[0]]*p[1];});return u;}
function coins(o){return Math.ceil(units(o.t.need)*COEF[o.t.t]/5)*5;}
function fsvg(s,lv){var k='f'+s+'-'+lv;if(CACHE[k])return CACHE[k];
 var c=SER[s],p=[0,6,7,8,9,10,12][lv]||6,sc=0.62+lv*0.055,rx=10+lv*0.6,ry=17+lv*0.9,g='',i,a;
 for(i=0;i<p;i++){a=(360/p)*i;g+=`<ellipse cx='0' cy='-${ry}' rx='${rx}' ry='${ry}' fill='${c.c}' opacity='${(0.92-lv*0.02).toFixed(2)}' transform='rotate(${a})'/>`;}
 g+=`<circle r='${8+lv*0.5}' fill='${c.l}' stroke='${c.d}' stroke-width='1'/>`;
 if(lv>=4)g+=`<circle r='${3.6+lv*0.4}' fill='#F3DE9C'/>`;
 CACHE[k]=`<svg viewBox='-48 -48 96 96'><g transform='scale(${sc})'>${g}</g></svg>`;return CACHE[k];}
function wsvg(){if(CACHE.w)return CACHE.w;
 var l='',i,k,a,r,pts;
 for(i=0;i<8;i++){a=i*45*Math.PI/180;l+=`<line x1='0' y1='0' x2='${(Math.cos(a)*44).toFixed(1)}' y2='${(Math.sin(a)*44).toFixed(1)}' stroke='#C9C3B4' stroke-width='2' opacity='0.55'/>`;}
 for(r=1;r<=3;r++){pts='';for(k=0;k<8;k++){a=k*45*Math.PI/180;pts+=`${(Math.cos(a)*r*14).toFixed(1)},${(Math.sin(a)*r*14).toFixed(1)} `;}
  l+=`<polygon points='${pts}' fill='none' stroke='#C9C3B4' stroke-width='1.6' opacity='0.5'/>`;}
 CACHE.w=`<svg viewBox='-48 -48 96 96'>${l}</svg>`;return CACHE.w;}
function bsvg(s,lv,locked){var k='b'+s+lv+(locked?'L':'');if(CACHE[k])return CACHE[k];
 var c=SER[s],b='',i,x,y;
 for(i=0;i<lv*2+1;i++){x=-15+i*8;y=-8-(i%2)*4;
  b+=`<circle cx='${x}' cy='${y}' r='4.4' fill='${locked?'#cfd6c8':c.c}'/>`;
  b+=`<circle cx='${x}' cy='${y}' r='1.6' fill='${locked?'#e6e9e0':'#F3DE9C'}'/>`;}
 var pot=`<path d='M-21 3 h42 l-5 18 h-32 z' fill='#E6D7BA' stroke='#CBB795' stroke-width='1.3'/><rect x='-24' y='1' width='48' height='4' rx='2' fill='#EADCC2' stroke='#CBB795' stroke-width='1'/>`;
 CACHE[k]=`<svg viewBox='-30 -30 60 56'>${pot}${b}</svg>`;return CACHE[k];}
function lsvg(){if(CACHE.L)return CACHE.L;
 CACHE.L=`<svg viewBox='0 0 40 40'><rect x='12' y='18' width='16' height='13' rx='3' fill='#B9C0AE'/><path d='M15 18 v-4 a5 5 0 0 1 10 0 v4' fill='none' stroke='#B9C0AE' stroke-width='2.4'/><circle cx='20' cy='24' r='2' fill='#F4F7EF'/></svg>`;
 return CACHE.L;}
function toast(m){var el=$('toast');el.textContent=m;el.classList.add('on');clearTimeout(el._t);el._t=setTimeout(function(){el.classList.remove('on');},1900);}
function mkOrder(){var pool=TPL.filter(function(t){return t.lv<=S.level;}),used=S.orders.map(function(o){return o&&o.t.i;}),cand=pool.filter(function(t){return used.indexOf(t.i)<0;});
 if(!cand.length)cand=pool;
 var t=cand[Math.floor(Math.random()*cand.length)],s=Math.floor(Math.random()*servN());
 S.seq++;return {key:S.seq,t:t,s:s,done:false};}
function fill(){while(S.orders.length<3)S.orders.push(mkOrder());}
function ok(o){var a=true;o.t.need.forEach(function(p){if(fcount(o.s,p[0])<p[1])a=false;});return a;}
function deliver(i){var o=S.orders[i];if(!o||o.done||!ok(o)){toast('花材还没凑齐');return;}
 o.t.need.forEach(function(p){var lv=p[0],want=p[1],k;
  for(k=N-1;k>=0&&want>0;k--){var c=S.cells[k];if(c&&c.k==='f'&&c.s===o.s&&c.lv===lv){S.cells[k]=null;want--;}}});
 var g=coins(o);S.coins+=g;o.done=true;toast('+'+g+' 金币');render();save();
 setTimeout(function(){S.orders[i]=mkOrder();render();save();},1500);}
function bestE(s,lv){var e=empty(),best=-1,bs=-1;if(!e.length)return -1;
 e.forEach(function(i){var r=Math.floor(i/COLS),c=i%COLS,sc=r*100+(COLS-c);
  [[-1,0],[1,0],[0,-1],[0,1]].forEach(function(d){var rr=r+d[0],cc=c+d[1];if(rr<0||rr>=ROWS||cc<0||cc>=COLS)return;
   var nb=S.cells[rr*COLS+cc];if(nb&&(nb.k==='f'||nb.k==='web')&&nb.s===s&&nb.lv===lv)sc+=28;});
  if(sc>bs){bs=sc;best=i;}});
 return best;}
function place(s,lv){var i=bestE(s,lv);if(i<0)return false;S.cells[i]={k:'f',s:s,lv:lv};return true;}
function produce(cell){var c=SER[cell.s];
 if(S.energy<1){toast('体力不足，等一等');return;}
 var cap=empty().length;
 if(cap===0){toast('棋盘已满：合并腾格，或拆束');return;}
 S.energy--;var n=cell.lv*c.m+c.x;if(n>cap)n=cap;
 var made=[],i;for(i=0;i<n;i++)made.push(1);
 if(Math.random()<crit()){made[0]=3;toast('暴击！直接产出花枝');}
 made.forEach(function(lv){place(cell.s,lv);});
 render();save();}
function canMerge(a,b){if(!a||!b)return false;
 if((a.k==='f'||a.k==='web')&&(b.k==='f'||b.k==='web'))return a.s===b.s&&a.lv===b.lv&&a.lv<6;
 if(a.k==='bed'&&b.k==='bed')return a.s===b.s&&a.lv===b.lv&&a.lv<3;
 return false;}
function merge(from,to){var a=S.cells[from],b=S.cells[to];if(!canMerge(a,b))return false;
 if(a.k==='bed'){S.cells[to]={k:'bed',s:b.s,lv:b.lv+1};S.cells[from]=null;toast(SER[b.s].n+'花圃升到 L'+(b.lv+1));}
 else {S.cells[to]={k:'f',s:b.s,lv:b.lv+1};S.cells[from]=null;
  if(a.k==='web'||b.k==='web')toast('蛛网解开，格子解锁');
  else if(b.lv+1===6)toast('合出花艺作品 L6：可点击拆束');}
 return true;}
function shatter(i){var c=S.cells[i];if(!c||c.k!=='f'||c.lv!==6)return;
 if(empty().length<4){toast('空格不足 4 格，无法拆束');return;}
 S.cells[i]=null;for(var k=0;k<4;k++)place(c.s,1);
 toast('拆束：花艺作品 → 4 株花苗');render();save();}
function drop(from,to){if(to<0||to===from)return;var a=S.cells[from],b=S.cells[to];if(!a)return;
 if(a.k==='bed'){if(b&&b.k==='bed'&&canMerge(a,b)){merge(from,to);render();save();}else toast('花圃只能和同级同系花圃合并');return;}
 if(b){if(canMerge(a,b)){merge(from,to);render();save();}else toast('同花系同阶才能合');return;}
 if(a.k==='f'){S.cells[to]=a;S.cells[from]=null;render();save();}}
function tapAt(i){var c=S.cells[i];
 if(!c){sel=-1;renderBoard();renderStatus();return;}
 if(c.k==='lock'){toast('Lv'+c.u+' 解锁');return;}
 if(c.k==='bed'){produce(c);sel=-1;render();return;}
 if(sel<0){if(c.k==='f'&&c.lv===6){shatter(i);return;}sel=i;renderBoard();renderStatus();return;}
 if(sel===i){if(c.k==='f'&&c.lv===6){shatter(i);return;}sel=-1;renderBoard();renderStatus();return;}
 var a=S.cells[sel];
 if(canMerge(c,a)){merge(i,sel);sel=-1;render();save();return;}
 sel=i;renderBoard();renderStatus();}
function upgrade(){if(S.level>=5){toast('已满级');return;}
 var n=LVC[S.level];
 if(S.coins<n){toast('金币不够，还差 '+(n-S.coins));return;}
 S.coins-=n;S.level++;
 BEDS.forEach(function(b){if(b.u===S.level&&S.cells[b.i]&&S.cells[b.i].k==='lock')S.cells[b.i]={k:'bed',s:b.s,lv:1};});
 toast('花店升到 Lv'+S.level+'：暴击 '+Math.round(crit()*100)+'%');render();save();}
function fmt(n){return n.toLocaleString('en-US');}
function renderHUD(){$('e').textContent=S.energy;$('es').textContent=cd();$('c').textContent=fmt(S.coins);
 var u=$('up');
 if(S.level>=5){u.disabled=true;u.textContent='满级';$('cs').textContent='已满级';}
 else{var nx=LVC[S.level];u.disabled=false;u.textContent='升级 '+fmt(nx);$('cs').textContent=S.coins>=nx?'可以升级了':'还差 '+fmt(nx-S.coins);}
 $('lvl').textContent='Lv'+S.level;$('crit').textContent='暴击 '+Math.round(crit()*100)+'%';
 var t=['今天的订单有点多，慢慢来','花圃可以两两相合，试过吗','蛛网里的花苗，跟旁边合一合','L6 不能合了，点它能拆成 4 株'];
 $('bubble').textContent=t[(S.level+cntF())%t.length];}
function renderOrders(){var row=$('ord'),html='',i,o;
 for(i=0;i<S.orders.length;i++){o=S.orders[i];
  if(o.done){html+=`<div class='order done'><div class='t'><span>已交付</span><span>+${coins(o)}</span></div><div class='n' style='height:34px;align-items:center;justify-content:center;color:#6d8a72;font-size:11px'>下一位客人马上来</div><div class='c'>${o.t.t} · ${o.t.i}</div></div>`;}
  else{var nh='';o.t.need.forEach(function(p){var en=fcount(o.s,p[0])>=p[1];nh+=`<div class='ni'>${fsvg(o.s,p[0])}<i class='${en?'':'bad'}'>×${p[1]}</i></div>`;});
   var can=ok(o);
   html+=`<div class='order'><div class='t'><span>${o.t.t}</span><span>${SER[o.s].n}</span></div><div class='n'>${nh}</div><button data-i='${i}' ${can?'':'disabled'}>${can?'交付':'未凑齐'}</button><div class='c'>+${coins(o)} 金币</div></div>`;}}
 row.innerHTML=html;
 var bs=row.querySelectorAll('button');for(i=0;i<bs.length;i++){bs[i].onclick=(function(k){return function(){deliver(k);};})(parseInt(bs[i].getAttribute('data-i'),10));}}
function renderBoard(){var bd=$('bd'),html='',i,c,cl,inner;
 for(i=0;i<N;i++){c=S.cells[i];cl='cell';
  if(c){if(c.k==='bed')cl+=' bed';if(c.k==='lock')cl+=' lock';}
  if(i===sel)cl+=' sel';if(i===hov)cl+=' drop';
  inner='';
  if(c){if(c.k==='web')inner=`<div class='pic'>${fsvg(c.s,c.lv)}</div><div class='web'>${wsvg()}</div>`;
   else if(c.k==='bed')inner=`<div class='pic'>${bsvg(c.s,c.lv,false)}</div><div class='tag'>${SER[c.s].n.slice(0,2)} L${c.lv}</div>`;
   else if(c.k==='lock')inner=`<div class='pic'>${lsvg()}</div><div class='tag'>Lv${c.u} 解锁</div>`;
   else inner=`<div class='pic'>${fsvg(c.s,c.lv)}</div><div class='lv'>L${c.lv}</div>`;}
  html+=`<div class='${cl}' data-i='${i}'>${inner}</div>`;}
 bd.innerHTML=html;}
function renderStatus(){var c=sel>=0?S.cells[sel]:null;
 if(c&&c.k==='f'){
  var mates=0;i0(STATE());}
}
function STATE(){return S;}
function i0(){}
function statusInit(){}
function render(){sync();renderHUD();renderOrders();renderBoard();renderStatus2();}
function renderStatus2(){var s1=$('s1'),s2=$('s2'),c=sel>=0?S.cells[sel]:null,i,cc,beds=0,mx=0,mates=0,f1;
 if(c&&c.k==='f'){mates=0;for(i=0;i<N;i++){f1=S.cells[i];if(f1&&f1.k==='f'&&f1.s===c.s&&f1.lv===c.lv&&i!==sel&&c.lv<6)mates++;}
  s1.textContent='已选 '+SER[c.s].n+' · '+LNN[c.lv]+' L'+c.lv+(c.lv===6?'（满级，点它拆束）':'');
  s2.textContent=c.lv===6?'再点一下这件花艺作品，拆成 4 株花苗':('同阶可合 '+mates+' 处 · 再点另一件同级的花即可合并');return;}
 if(c&&c.k==='bed'){s1.textContent='已选 '+SER[c.s].n+'花圃 L'+c.lv;s2.textContent='点它产出 '+(c.lv*SER[c.s].m+SER[c.s].x)+' 株，扣 1 点体力';return;}
 for(i=0;i<N;i++){cc=S.cells[i];if(cc&&cc.k==='bed'){beds++;mx=Math.max(mx,cc.lv);}}
 s1.textContent='点花圃出花 · 两两合并 · 凑满订单交付';
 s2.textContent='花圃 '+beds+' 个（最高 L'+mx+'）· 空格 '+empty().length+' · 暴击 '+Math.round(crit()*100)+'%';}
function cellAt(x,y){var el=document.elementFromPoint(x,y);if(!el||!el.closest)return -1;var c=el.closest('.cell');return c?parseInt(c.getAttribute('data-i'),10):-1;}
var bdEl=$('bd');
bdEl.addEventListener('pointerdown',function(ev){down=true;moved=false;sx=ev.clientX;sy=ev.clientY;dragFrom=cellAt(sx,sy);});
window.addEventListener('pointermove',function(ev){
 if(!down||dragFrom<0)return;
 if(Math.abs(ev.clientX-sx)>8||Math.abs(ev.clientY-sy)>8)moved=true;
 if(!moved)return;
 ev.preventDefault();
 var g=$('ghost'),c=S.cells[dragFrom];
 if(c&&c.k==='f'){g.src='data:image/svg+xml;utf8,'+encodeURIComponent(fsvg(c.s,c.lv));g.style.display='block';g.style.left=ev.clientX+'px';g.style.top=ev.clientY+'px';}
 var h=cellAt(ev.clientX,ev.clientY);
 if(h!==hov){hov=h;renderBoard();}
},{passive:false});
window.addEventListener('pointerup',function(ev){
 if(!down)return;down=false;$('ghost').style.display='none';
 var to=cellAt(ev.clientX,ev.clientY),from=dragFrom;dragFrom=-1;
 if(hov>=0){hov=-1;renderBoard();}
 if(from<0)return;
 if(moved){if(to>=0&&to!==from)drop(from,to);return;}
 tapAt(from);});
function open(tab){var box=$('sb'),h='';
 if(tab==='bed'){h='<h3>花圃</h3><p>花圃是棋盘上唯一的产出源：点一次扣 1 点体力，产 1 株一级花苗。两个同级同系花圃拖动相合，单次产出 1 → 2 → 3 株。</p>';
  BEDS.forEach(function(b){var cur=S.cells[b.i];h+=`<div class='row'><span>${SER[b.s].n}花圃</span><span>${cur&&cur.k==='bed'?'L'+cur.lv+' · 单次 '+(cur.lv*SER[b.s].m+SER[b.s].x)+' 株':'Lv'+b.u+' 解锁'}</span></div>`;});
  h+='<h4>体力</h4>'+`<div class='row'><span>上限 / 恢复</span><span>100 / ${S.demo?'体验 6 秒 1 点':'正式 2 分钟 1 点'}</span></div>`+`<div class='row'><span>暴击</span><span>${Math.round(crit()*100)}%（直接产 L3）</span></div>`;}
 else if(tab==='dex'){h='<h3>花材图鉴</h3><p>同阶两两合并，阶数越高价值越高。六阶不可再合，点它可以拆成 4 株花苗保底。</p>';
  for(var lv=1;lv<=6;lv++)h+=`<div class='row'><span>L${lv} · ${LNN[lv]}</span><span>${LVV[lv]} 单位</span></div>`;
  h+='<h4>花系</h4>';
  SER.forEach(function(s,idx){h+=`<div class='row'><span>${s.n}</span><span>${idx<servN()?'已解锁 · 单次 ×'+s.m+(s.x?' +'+s.x+' 株':''):'未解锁'}</span></div>`;});}
 else if(tab==='shop'){h='<h3>花店装修</h3><p>金币只有一个去处：升级花店。每级暴击 +3 个百分点、解锁新花系、订单换更高档，棋盘格数不变。</p>';
  h+=`<div class='row'><span>当前等级</span><span>Lv${S.level}</span></div><div class='row'><span>暴击率</span><span>${Math.round(crit()*100)}%</span></div><div class='row'><span>金币</span><span>${fmt(S.coins)}</span></div>`;
  if(S.level<5)h+=`<div class='row'><span>下一级</span><span>${fmt(LVC[S.level])} 金币</span></div>`;
  h+='<h4>等级解锁</h4><div class="row"><span>Lv1 · 200</span><span>月铃穗花圃</span></div><div class="row"><span>Lv2 · 1500</span><span>剧情段二、装修件</span></div><div class="row"><span>Lv3 · 6000</span><span>焰心菊花圃</span></div><div class="row"><span>Lv4 · 16000</span><span>典藏订单</span></div><div class="row"><span>Lv5 · 30000</span><span>满级</span></div>';
  h+=`<div style='margin-top:12px'><button class='btn' id='doUp'>${S.level>=5?'已满级':'升级（'+fmt(LVC[S.level])+'）'}</button></div>`;}
 else {h='<h3>任务与设置</h3><p>点花圃出花、同阶两两合并、凑满订单交付。体力只买产出，合并与交付永远免费。</p>';
  h+=`<div class='row'><span>已解锁花系</span><span>${servN()} / 3</span></div><div class='row'><span>棋盘</span><span>花材 ${cntF()} 件 · 空格 ${empty().length}</span></div><div class='row'><span>已发订单</span><span>${S.seq} 张</span></div>`;
  h+=`<h4>试玩开关</h4><div class='row'><span>体力加速</span><span><button class='btn gb' id='tog'>${S.demo?'已开启 6 秒/点':'已关闭 2 分钟/点'}</button></span></div>`;
  h+=`<div style='display:flex;gap:8px;margin-top:10px;flex-wrap:wrap'><button class='btn gb' id='fe'>加满体力</button><button class='btn gb' id='ac'>+1000 金币</button><button class='btn gb' id='rs'>重置存档</button></div>`;
  h+='<p style=\'margin-top:10px;color:#8d9a8b\'>按 GDD v0.2 做的可玩原型：9×7 棋盘、六阶花材、3 槽订单、五级花店、蛛网与拆束都在。存档在本地浏览器。</p>';}
 box.innerHTML=h;$('sheet').classList.add('on');
 var b1=box.querySelector('#doUp');if(b1)b1.onclick=function(){upgrade();open('shop');};
 var b2=box.querySelector('#tog');if(b2)b2.onclick=function(){S.demo=!S.demo;S.eAt=Date.now();save();open('task');render();};
 var b3=box.querySelector('#fe');if(b3)b3.onclick=function(){S.energy=100;S.eAt=Date.now();save();render();open('task');};
 var b4=box.querySelector('#ac');if(b4)b4.onclick=function(){S.coins+=1000;save();render();open('task');};
 var b5=box.querySelector('#rs');if(b5)b5.onclick=function(){if(confirm('清空本地存档，重新开局？')){localStorage.removeItem(KEY);location.reload();}};}
$('sheet').addEventListener('click',function(ev){if(ev.target.id==='sheet')this.classList.remove('on');});
Array.prototype.forEach.call(document.querySelectorAll('#tools button'),function(b){b.onclick=function(){open(b.getAttribute('data-tab'));};});
function boot(){S=load()||fresh();
 S.orders=(S.orders||[]).map(function(o){return o&&!o.done?o:mkOrder();});
 fill();sync();render();save();
 setInterval(function(){sync();renderHUD();},1000);
 window.addEventListener('beforeunload',save);
 document.addEventListener('visibilitychange',function(){if(document.hidden)save();else{sync();render();}});
 window.__FM__={get:function(){return JSON.parse(JSON.stringify(S));},set:function(o){S=o;render();save();},render:render};}
boot();
})();
