(() => {
 const start=document.getElementById('start'),error=document.getElementById('error'),retry=document.getElementById('retryLoad');
 let failed=false;
 function fail(reason){if(failed)return;failed=true;clearTimeout(watchdog);start.disabled=true;start.textContent='GAME COULD NOT START';const detail=String(reason?.message||reason||'Unknown loading error');error.textContent=/WebGL|graphics context/i.test(detail)?'3D graphics are unavailable in this browser. On a laptop, enable graphics acceleration in Chrome and restart it. On iPad, open the link directly in Safari.':`Startup error: ${detail}. Tap Reload game to try again.`;retry.hidden=false;}
 const watchdog=setTimeout(()=>{if(!window.gameReady)fail('Loading took too long. Check your connection');},60000);
 retry.onclick=()=>{const u=new URL(location.href);u.searchParams.set('reload',Date.now());location.replace(u.href);};
 window.addEventListener('error',e=>fail(e.error||e.message));
 window.addEventListener('unhandledrejection',e=>fail(e.reason));
 window.addEventListener('game-ready',()=>{clearTimeout(watchdog);failed=false;retry.hidden=true;error.textContent='';});
 window.reportGameError=fail;
 import('./game.js?v=7').catch(fail);
})();
