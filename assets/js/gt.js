/* Giving Tuesday mockup: what the live site does with its inline scripts (FAQ accordion,
   reading progress), the guide contents rail, the hub filter and countdown, and link fixes
   that only the mockup needs. Runs after the theme's app.js has drawn the header and footer. */
(function(){
"use strict";
var LIVE='https://wearenotforsale.org', base=window.GT_BASE||'';
function perFrame(fn){var q=false;return function(){if(q)return;q=true;requestAnimationFrame(function(){q=false;fn();});};}

// Header, menu and footer links are written as site paths (/donate/, /projects/): send them to
// the live site, and the logo to the hub.
document.querySelectorAll('#hdr a[href], #mobileMenu a[href], .nl a[href], footer a[href]').forEach(function(a){
  var h=a.getAttribute('href');
  if(!h||h.charAt(0)!=='/'||h.charAt(1)==='/')return;
  if(a.classList.contains('brand')&&h==='/'){a.setAttribute('href',base);return;}
  a.setAttribute('href',LIVE+h);
});

// FAQ accordion, one open at a time (the live explainer's inline script)
var openOnes=[];
document.querySelectorAll('.nfs-exfaq').forEach(function(host){
  host.querySelectorAll('.qa').forEach(function(qa){
    var a=qa.querySelector('.a');
    if(qa.classList.contains('open')){a.style.maxHeight=a.scrollHeight+'px';openOnes.push(a);}
    qa.querySelector('.q').addEventListener('click',function(){
      var open=qa.classList.contains('open');
      host.querySelectorAll('.qa').forEach(function(o){o.classList.remove('open');o.querySelector('.a').style.maxHeight=null;});
      if(!open){qa.classList.add('open');a.style.maxHeight=a.scrollHeight+'px';}
    });
  });
});
// fonts change the height of an answer that starts open
function refit(){document.querySelectorAll('.nfs-exfaq .qa.open .a').forEach(function(a){a.style.maxHeight=a.scrollHeight+'px';});}
window.addEventListener('load',refit);
window.addEventListener('resize',perFrame(refit));

// Reading progress (the live explainer's inline script)
var prog=document.getElementById('exProg'), root=document.getElementById('exRoot');
if(prog&&root){
  var upd=function(){var st=window.pageYOffset||document.documentElement.scrollTop;var max=root.offsetTop+root.offsetHeight-window.innerHeight;prog.style.width=(max>0?Math.max(0,Math.min(1,st/max))*100:0)+'%';};
  window.addEventListener('scroll',perFrame(upd),{passive:true});window.addEventListener('resize',perFrame(upd));upd();
}

// Contents rail: mark the section being read, and keep that link in view inside the rail
var rail=document.querySelector('.gt-rail');
var links=[].slice.call(document.querySelectorAll('.gt-rail .post-toc-nav a'));
if(rail&&links.length){
  var targets=links.map(function(a){return document.getElementById(a.getAttribute('href').slice(1));});
  var cur=-1;
  var pick=function(){
    var navh=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--navh'))||80;
    var line=navh+140, idx=0;
    targets.forEach(function(t,i){if(t&&t.getBoundingClientRect().top<=line)idx=i;});
    if(idx===cur)return;cur=idx;
    links.forEach(function(a,i){a.classList.toggle('on',i===idx);if(i===idx){a.setAttribute('aria-current','true');}else{a.removeAttribute('aria-current');}});
    var a=links[idx], top=a.offsetTop;
    if(top<rail.scrollTop+20||top>rail.scrollTop+rail.clientHeight-60){rail.scrollTo({top:Math.max(0,top-rail.clientHeight/3),behavior:'smooth'});}
  };
  window.addEventListener('scroll',perFrame(pick),{passive:true});pick();
}
// The phone contents list closes once a section is chosen
document.querySelectorAll('.gt-toc-m a').forEach(function(a){a.addEventListener('click',function(){var d=a.closest('details');if(d)d.open=false;});});

// Hub: filter the guides by group
var chips=[].slice.call(document.querySelectorAll('.gt-hub .exa-chip'));
var cards=[].slice.call(document.querySelectorAll('.gt-card'));
var shown=document.querySelector('[data-gt-shown]');
chips.forEach(function(c){c.addEventListener('click',function(){
  var g=c.getAttribute('data-group'),n=0;
  chips.forEach(function(x){var on=x===c;x.classList.toggle('on',on);x.setAttribute('aria-pressed',String(on));});
  cards.forEach(function(k){var ok=g==='all'||k.getAttribute('data-group')===g;k.classList.toggle('exa-hide',!ok);if(ok)n++;});
  if(shown)shown.textContent=n;
});});

// Hub: days until Giving Tuesday (the build date's figure is printed in the HTML)
var dEl=document.querySelector('[data-gt-days]');
if(dEl){
  var now=new Date(), today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  var days=Math.round((new Date(2026,11,1)-today)/864e5), lab=document.querySelector('[data-gt-dayslabel]');
  var box=dEl.parentNode;
  if(days>1){dEl.textContent=days;lab.textContent='days to go';}
  else if(days===1){dEl.textContent='1';lab.textContent='day to go';}
  else if(days===0){dEl.textContent='Today';lab.textContent='is Giving Tuesday';}
  else{var dot=box.previousElementSibling;box.remove();if(dot&&dot.classList.contains('d'))dot.remove();}
}
})();
