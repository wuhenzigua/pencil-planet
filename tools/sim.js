// v1.2 pacing sim. args: strategy (active|idle|clicky)
const strat=process.argv[2]||'active';
const P=[[15,.4],[100,3],[1100,20],[12000,120],[130000,660],[1.4e6,3600],[2e7,2e4],[3.3e8,1.8e5],[5.1e9,1.08e6],[7.5e10,6.6e6]];
const TN=[1,10,25,50,100,150,200,250],TM=[6,30,300,3e4,3e6,3e8,3e10,3e12];
const QC=[2e4,1e6,5e7,2.5e9,1.25e11,6.25e12,3.125e14], CC=[100,500,1e4,1e6,1e8,1e10,1e12,1e14];
const G=1.12, CARD_AT=[1e4,1e6,1e8,1e10,1e12];
function run(stickers, allInk0, mins){
 let ink=0,own=P.map(()=>0),ups={},t=0,allInk=allInk0,run=0,cards=0,frenzy=0,gIn=60;
 const pm=i=>{let m=1;for(let k=0;k<8;k++)if(ups['p'+i+'_'+k])m*=2; if(ups['s'+i]&&i<9) m*=1+0.01*own[i+1]; return m};
 const gm=()=>{let m=(1+.05*stickers)*1.15*(1+0.25*cards);for(let k=0;k<7;k++)if(ups['q'+k])m*=1.2;return m};
 const base=()=>P.reduce((s,p,i)=>s+own[i]*p[1]*pm(i),0)*gm();
 const clk=()=>{let b=1;if(ups.c0)b*=2;if(ups.c1)b*=2;let p=0;for(let k=2;k<8;k++)if(ups['c'+k])p+=.02;return b*gm()+p*base()*(frenzy>0?7:1)};
 const marks={};
 const cps = strat==='idle'?0: strat==='nogold'?(t)=>t<1800?4:1: strat==='clicky'?8:(t)=>t<1800?4:1;
 while(t<mins*60){
  const b=base(); let g=b*(frenzy>0?7:1); const c=typeof cps==='function'?cps(t):cps; g+=clk()*c;
  ink+=g;allInk+=g;run+=g;t+=1; if(frenzy>0)frenzy--;
  if(strat!=='idle' && strat!=='nogold'){ gIn--; if(gIn<=0){ gIn=105; if(Math.random()<0.7){ const r=Math.random(); if(r<0.5){const a=Math.min(ink*.15,b*900)+13; ink+=a;allInk+=a;run+=a;} else if(r<0.85) frenzy=77; } } }
  while(cards<CARD_AT.length && run>=CARD_AT[cards]) cards++;
  let bought=true;
  while(bought){bought=false;
   for(let i=0;i<10;i++)for(let k=0;k<8;k++){const id='p'+i+'_'+k;if(!ups[id]&&own[i]>=TN[k]&&ink>=P[i][0]*TM[k]){ink-=P[i][0]*TM[k];ups[id]=1;bought=true}}
   for(let i=0;i<9;i++){const id='s'+i, cost=P[i+1][0]*40; if(!ups[id]&&own[i]>=25&&own[i+1]>=10&&ink>=cost){ink-=cost;ups[id]=1;bought=true}}
   for(let k=0;k<7;k++){if(!ups['q'+k]&&run>=QC[k]*.3&&ink>=QC[k]){ink-=QC[k];ups['q'+k]=1;bought=true}}
   for(let k=0;k<8;k++){if(!ups['c'+k]&&run>=CC[k]*.3&&ink>=CC[k]){ink-=CC[k];ups['c'+k]=1;bought=true}}
   let best=-1,bv=0;for(let i=0;i<10;i++){const cc=P[i][0]*G**own[i];const v=P[i][1]*pm(i)/cc;if(v>bv){bv=v;best=i}}
   const cc=P[best][0]*G**own[best]; if(ink>=cc){ink-=cc;own[best]++;bought=true}
  }
  for(let e=4;e<=16;e++){const m=10**e; if(!marks[e]&&allInk>=m)marks[e]=t}
 }
 const out=[];let prev=0;for(const e of Object.keys(marks)){const v=marks[e]/60; if(v>0.01) out.push(`1e${e}:${v.toFixed(1)}(+${(v-prev).toFixed(1)})`); prev=v;}
 return out.join(' ')+' | stick '+Math.floor(Math.sqrt(allInk/1e7))+' own '+own.join(',');
}
console.log(strat, 'run1', run(0,0,150));
console.log(strat, 'run2(10★)', run(10,1e9,150));
console.log(strat, 'run3(60★)', run(60,3.6e10,150));
