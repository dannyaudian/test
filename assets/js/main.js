(function(){
  var toggle=document.getElementById('navToggle');
  var side=document.getElementById('sidenav');
  if(toggle){
    toggle.addEventListener('click',function(){
      var open=document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded',open?'true':'false');
    });
    side.addEventListener('click',function(e){
      if(e.target.closest('a')){
        document.body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded','false');
      }
    });
  }
  var links=Array.prototype.slice.call(document.querySelectorAll('nav a'));
  var map={};
  links.forEach(function(a){ map[a.getAttribute('href').slice(1)]=a; });
  var targets=Object.keys(map).map(function(id){return document.getElementById(id);}).filter(Boolean);
  if('IntersectionObserver' in window){
    var seen={};
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){ seen[en.target.id]=en.isIntersecting?en.boundingClientRect.top:null; });
      var current=null;
      targets.forEach(function(t){
        var r=t.getBoundingClientRect();
        if(r.top<=140) current=t.id;
      });
      links.forEach(function(a){a.removeAttribute('aria-current');});
      if(current&&map[current]) map[current].setAttribute('aria-current','true');
    },{rootMargin:'-100px 0px -70% 0px',threshold:[0,1]});
    targets.forEach(function(t){io.observe(t);});
  }
})();
