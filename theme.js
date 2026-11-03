(function(){
  var r=document.documentElement,t=document.getElementById("theme"),k="theme";
  var dark=function(){var s;try{s=localStorage.getItem(k)}catch(e){}return s?s==="dark":matchMedia("(prefers-color-scheme:dark)").matches};
  var apply=function(d){r.dataset.theme=d?"dark":"light";if(t)t.checked=!d};
  apply(dark());
  if(t)t.addEventListener("change",function(){var d=!t.checked;apply(d);try{localStorage.setItem(k,d?"dark":"light")}catch(e){}});
})();
