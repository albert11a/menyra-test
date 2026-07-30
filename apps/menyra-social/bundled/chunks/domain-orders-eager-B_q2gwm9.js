function C({state:n=null,isLocalBusinessProfileFn:P=()=>!1,canAccessRestaurantOrdersFn:r=()=>!1,escapeHtmlFn:p=s=>String(s??""),getOptimizedImageUrlFn:d=s=>String(s||""),formatPriceFn:x=s=>String(s??""),parsePriceValueFn:u=()=>0,formatRelativeFn:f=s=>String(s||""),toDateSafeFn:b=s=>s}={}){const s=typeof r=="function"?r:()=>!1,e=typeof p=="function"?p:t=>String(t??""),w=typeof d=="function"?d:t=>String(t||""),v=typeof x=="function"?x:t=>String(t??""),$=typeof u=="function"?u:()=>0,y=typeof f=="function"?f:t=>String(t||""),h=typeof b=="function"?b:t=>t,i=s(n?.userProfile),g=Array.isArray(n?.orders?.items)?n.orders.items:[],c=g.length>0,m=n?.orders?.loading===!0,l=String(n?.orders?.error||"").trim(),S=c&&m?'<div class="mb-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Porosite po perditesohen...</div>':"",j=c&&l?`<div class="mb-4 text-center text-[10px] font-black uppercase tracking-widest text-rose-500">${e(l)}</div>`:"";return`
    <div id="ordersView" class="p-6 animate-in slide-in-from-right-10 duration-500">
      <div class="flex items-center justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Orders</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Porosite</h2>
        </div>
      </div>
      ${m&&!c?`
        <div class="text-center py-16 text-[10px] font-black uppercase tracking-widest text-slate-400">Porosite po ngarkohen...</div>
      `:l&&!c?`
        <div class="text-center py-16 text-[10px] font-black uppercase tracking-widest text-rose-500">${e(l)}</div>
      `:c?`
        ${S}
        ${j}
        <div class="space-y-4">
          ${g.map(t=>{const o=Array.isArray(t?.items)?t.items:[],A=i?t?.buyerAvatar:t?.businessAvatar,N=w(A,"avatar"),L=i?t?.contact?.name||t?.buyerName||"Kunde":t?.businessName||"Shop",k=t?.tableNumber?`Tavolina ${t.tableNumber}`:t?.tableLabel||t?.contact?.tableLabel||"",B=i?[k,t?.contact?.phone,t?.contact?.city].filter(Boolean).join(" / "):`${t?.itemCount||0} Artikel`;return`
              <div class="bg-white rounded-[2rem] p-4 border border-slate-100 shadow-sm">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                    <img src="${e(N)}" class="w-full h-full ${i?"object-cover":"object-contain bg-white"}" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-black text-slate-900 truncate">${e(L)}</p>
                    <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">${e(B)}</p>
                  </div>
                  <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700">${e(t?.status||"Neu")}</span>
                </div>
                <div class="space-y-2">
                  ${o.slice(0,3).map(a=>`
                    <div class="flex items-start justify-between gap-3 text-sm">
                      <div class="min-w-0">
                        <span class="font-semibold text-slate-700 block truncate pr-3">${e(a.quantity)}x ${e(a.name)}${a.selectedSize||a.selectedColor?` <span class="text-slate-400">(${e([a.selectedSize,a.selectedColor].filter(Boolean).join(" / "))})</span>`:""}</span>
                        ${a.comment?`<p class="text-[10px] font-semibold text-slate-400 mt-1 truncate">Koment: ${e(a.comment)}</p>`:""}
                      </div>
                      <span class="font-black text-slate-900 shrink-0">${e(v($(a.price)*a.quantity))}</span>
                    </div>
                  `).join("")}
                  ${o.length>3?`<p class="text-[10px] font-bold uppercase tracking-widest text-slate-300">+${e(o.length-3)} weitere</p>`:""}
                </div>
                <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    ${i?`<p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">${e([k,t?.contact?.city,t?.contact?.address].filter(Boolean).join(" / "))}</p>`:`<p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">@${e(t?.buyerHandle||"user")}</p>`}
                    <p class="text-[10px] font-bold uppercase tracking-widest text-slate-300 mt-1">${e(y(h(t?.createdAt)||new Date))}</p>
                  </div>
                  <span class="text-base font-black text-slate-900 shrink-0">${e(v(t?.total||0))}</span>
                </div>
              </div>
            `}).join("")}
        </div>
      `:`
        <div class="text-center py-16 text-[10px] font-black uppercase tracking-widest text-slate-300">Ende nuk ka porosi</div>
      `}
    </div>
  `}export{C as r};
