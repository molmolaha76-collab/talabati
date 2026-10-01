(function(){
  var KEY="talabati-orders", orders=[], filter="all";
  var LABEL={"new":"جديد","paid":"مخلص","done":"تسلم"};
  var NEXT={"new":"paid","paid":"done","done":"new"};

  function load(){try{var r=localStorage.getItem(KEY);orders=r?JSON.parse(r):[];if(!Array.isArray(orders))orders=[]}catch(e){orders=[]}}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(orders))}catch(e){}}
  function $(id){return document.getElementById(id)}
  function el(tag,cls,txt){var n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n}

  function waLink(o){
    var d=(o.phone||"").replace(/\D/g,"");
    if(!d)return null;
    if(d.charAt(0)==="0")d="212"+d.slice(1);
    var msg="السلام عليكم "+o.name+"، بخصوص طلبك ("+o.prod+") بثمن "+o.price+" درهم. ";
    msg+=o.status==="new"?"مازال ما توصلناش بالأداء، عافاك أكد لينا.":o.status==="paid"?"الأداء توصلنا، غادي نجهزو ليك الطلب.":"الطلب تسلم، شكراً على ثقتك!";
    return "https://wa.me/"+d+"?text="+encodeURIComponent(msg);
  }

  function renderChips(){
    var box=$("chips");box.textContent="";
    [["all","الكل"],["new","جديد"],["paid","مخلص"],["done","تسلم"]].forEach(function(c){
      var b=el("button","chip",c[1]);b.type="button";b.setAttribute("aria-pressed",filter===c[0]);
      b.onclick=function(){filter=c[0];render()};box.appendChild(b);
    });
  }

  function render(){
    var unpaid=0,active=0;
    orders.forEach(function(o){if(o.status==="new")unpaid+=Number(o.price)||0;if(o.status!=="done")active++});
    $("sUnpaid").textContent=unpaid.toLocaleString("en");
    $("sCount").textContent=active;
    renderChips();
    var list=$("list");list.textContent="";
    var shown=orders.filter(function(o){return filter==="all"||o.status===filter});
    if(!shown.length){list.appendChild(el("div","empty",orders.length?"ما كاين حتى طلب فهاد الحالة.":"مازال ما زدتي حتى طلب. عمر الاستمارة لفوق وزيد أول طلب."));return}
    shown.forEach(function(o){
      var c=el("div","order"),top=el("div","top"),info=el("div");
      info.appendChild(el("div","name",o.name));info.appendChild(el("div","prod",o.prod));
      top.appendChild(info);top.appendChild(el("div","price",o.price+" د"));c.appendChild(top);
      var a=el("div","acts");
      var s=el("button","st "+o.status,LABEL[o.status]);s.type="button";s.title="بدل الحالة";
      s.onclick=function(){o.status=NEXT[o.status];save();render()};a.appendChild(s);
      var w=waLink(o);
      if(w){var l=el("a","wa","واتساب");l.href=w;l.target="_blank";l.rel="noopener";a.appendChild(l)}
      var r=el("button","rm","حذف");r.type="button";
      r.onclick=function(){
        if(r.className.indexOf("sure")<0){r.className="rm sure";r.textContent="متأكد؟";setTimeout(function(){r.className="rm";r.textContent="حذف"},3000)}
        else{orders=orders.filter(function(x){return x.id!==o.id});save();render()}
      };
      a.appendChild(r);c.appendChild(a);list.appendChild(c);
    });
  }

  $("f").addEventListener("submit",function(e){
    e.preventDefault();
    orders.unshift({id:Date.now(),name:$("name").value.trim(),prod:$("prod").value.trim(),price:Number($("price").value)||0,phone:$("phone").value.trim(),status:"new"});
    save();$("f").reset();filter="all";render();$("name").focus();
  });

  load();render();
})();