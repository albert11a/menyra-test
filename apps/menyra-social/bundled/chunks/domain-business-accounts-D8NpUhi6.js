const we="crm-admin-business-account-write-facade.v1",ke=Object.freeze(["saveBusinessAccountFromView","toggleBusinessAccountActive"]);function se(e,c){return function(...a){if(typeof c!="function")throw new Error(`CRM admin business account write facade handler missing: ${e}`);return c(...a)}}function he({saveBusinessAccount:e,updateBusinessAccount:c,saveBusinessAccountFromView:n,toggleBusinessAccountActive:a}={}){const o=se("saveBusinessAccountFromView",typeof e=="function"?e:n),A=se("toggleBusinessAccountActive",typeof c=="function"?c:a);return Object.freeze({version:we,operations:ke,saveCrmBusinessAccount:o,updateCrmBusinessAccount:A,saveBusinessAccount:o,updateBusinessAccount:A,saveBusinessAccountFromView:o,toggleBusinessAccountActive:A})}function f(e=""){return String(e||"").trim()}function ne(e={},c=""){const n=e&&typeof e=="object"?e:{},a=n.permissions&&typeof n.permissions=="object"?n.permissions:{},o=f(n.firstName),A=f(n.lastName),x=f(n.name||`${o} ${A}`.trim()||n.displayName),j=f(n.status||(n.active===!1?"disabled":"active")).toLowerCase(),b=n.active===!1?!1:j!=="disabled",g=f(n.role||n.staffRole).toLowerCase();return{uid:f(c||n.uid||n.userId),userId:f(n.userId||n.uid||c),restaurantId:f(n.restaurantId),firstName:o,lastName:A,name:x,email:f(n.email),role:g==="manager"?"manager":"waiter",businessAccess:n.businessAccess===!0||a.businessAccess===!0,waiterAccess:n.waiterAccess===!0||a.waiterAccess===!0,active:b,status:b?"active":"disabled",createdAt:n.createdAt||null,updatedAt:n.updatedAt||null}}async function ye({db:e,collectionFn:c,getDocsFn:n,restaurantId:a="",normalizeBusinessAccountEntryFn:o=ne}={}){const A=f(a),x=[];if(e||x.push("db"),typeof c!="function"&&x.push("collection"),typeof n!="function"&&x.push("getDocs"),A||x.push("restaurantId"),x.length)throw new Error(`loadCrmBusinessAccountsCore missing read deps: ${x.join(", ")}`);const j=await n(c(e,"restaurants",A,"staff")),b=[];return j?.forEach&&j.forEach(g=>{const w=o(g.data?.()||{},g.id);w.uid&&b.push(w)}),b.sort((g,w)=>{const I=`${f(g.firstName)} ${f(g.lastName)}`.trim().toLowerCase(),C=`${f(w.firstName)} ${f(w.lastName)}`.trim().toLowerCase();return I.localeCompare(C)}),{rows:b,items:b,hasMore:!1,knownCount:b.length,countExact:!0,restaurantId:A}}function u(e=""){return String(e||"").trim()}function F(e=""){return u(e).toLowerCase()==="manager"?"manager":"waiter"}function Be({businessAccess:e=!1,waiterAccess:c=!1}={}){return e&&c?"Beides":e?"Business":c?"Waiter":"Pa qasje"}function O(){return{firstName:"",lastName:"",email:"",password:"",role:"waiter",businessAccess:!1,waiterAccess:!0,active:!0}}function te(e={},c=""){return ne(e,c)}function Ne(e={}){return e.active?'<span class="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-widest">Aktiv</span>':'<span class="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest">Deaktiviert</span>'}function Ue({state:e,icon:c,escapeHtml:n,db:a,auth:o,collection:A,getDocs:x,getDoc:j,doc:b,setDoc:g,serverTimestamp:w,createAuthUser:I,signOut:C,saveUserProfileToStorage:W,render:K,getRestaurantMetaById:q,isBusinessOwnerProfile:H,isPlaceholderUrl:Ie,getOptimizedImageUrl:Ce,PLACEHOLDER_IMAGE:Le=""}={}){const E=typeof c=="function"?c:(()=>""),l=typeof n=="function"?n:((i="")=>String(i||"")),p=typeof K=="function"?K:(()=>{}),re=typeof q=="function"?q:(()=>null),ce=typeof I=="function"?I:(async()=>null),ae=typeof C=="function"?C:(async()=>{}),ue=typeof W=="function"?W:(()=>{}),oe=typeof H=="function"?H:(()=>!1);function k(){(!e.businessAccounts||typeof e.businessAccounts!="object")&&(e.businessAccounts={items:[],view:"list",editorUid:"",loading:!1,saving:!1,deleting:!1,loaded:!1,error:"",status:"",form:O()})}function P(){return oe(e?.userProfile)}function L(){return P()?u(e?.userProfile?.restaurantId):""}function _(i=""){k(),e.businessAccounts={...e.businessAccounts,view:"list",editorUid:"",saving:!1,deleting:!1,error:"",status:u(i),form:O()}}function V(i="create",t=null){k();const s=t?te(t,t.uid||t.userId||""):null;e.businessAccounts={...e.businessAccounts,view:"form",editorUid:s?.uid||"",deleting:!1,error:"",status:"",form:s?{firstName:s.firstName,lastName:s.lastName,email:s.email,password:"",role:s.role,businessAccess:s.businessAccess,waiterAccess:s.waiterAccess,active:s.active}:O()},p()}function G(i=""){_(i),p()}function D(i=document){k();const t=i||document,s=m=>{const d=t?.getElementById(m);return d&&"value"in d?String(d.value||""):""},r=m=>!!t?.getElementById(m)?.checked;e.businessAccounts.form={...e.businessAccounts.form,firstName:s("businessAccountFirstName").trim(),lastName:s("businessAccountLastName").trim(),email:s("businessAccountEmail").trim().toLowerCase(),password:s("businessAccountPassword"),role:F(s("businessAccountRole")),businessAccess:r("businessAccountBusinessAccess"),waiterAccess:r("businessAccountWaiterAccess"),active:r("businessAccountActive")}}async function M({force:i=!1}={}){k();const t=L();if(!t)return e.businessAccounts.error="Zona e stafit nuk eshte e disponueshme.",p(),[];if(e.businessAccounts.loading)return e.businessAccounts.items||[];if(e.businessAccounts.loaded&&!i)return e.businessAccounts.items||[];e.businessAccounts.loading=!0,e.businessAccounts.error="",p();try{const s=await ye({db:a,collectionFn:A,getDocsFn:x,restaurantId:t,normalizeBusinessAccountEntryFn:te}),r=Array.isArray(s.items)?s.items:[];return e.businessAccounts.items=r,e.businessAccounts.loaded=!0,e.businessAccounts.loading=!1,e.businessAccounts.error="",p(),r}catch(s){return console.error(s),e.businessAccounts.loading=!1,e.businessAccounts.error=s?.message||"Stafi nuk mund te ngarkohej.",p(),[]}}async function le(){k();const i=L();if(!i||!e?.user?.uid)return;D();const t=e.businessAccounts.form||{},s=!!u(e.businessAccounts.editorUid),r=u(t.firstName),m=u(t.lastName),d=u(t.email).toLowerCase(),y=String(t.password||""),U=F(t.role),h=t.businessAccess===!0,N=t.waiterAccess===!0,$=t.active!==!1,T=u(`${r} ${m}`.trim()),Q=re(i)||{},ve=u(Q.name||Q.restaurantName||e.userProfile?.name||"Business");if(!r||!m||!d||!s&&!y){e.businessAccounts.error=s?"Emri, mbiemri dhe email jane te detyrueshme.":"Emri, mbiemri, email dhe fjalekalimi jane te detyrueshme.",p();return}if(!d.includes("@")){e.businessAccounts.error="Ju lutem shkruani nje email te vlefshem.",p();return}if(!h&&!N){e.businessAccounts.error="Te pakten nje qasje duhet te jete aktive.",p();return}e.businessAccounts.saving=!0,e.businessAccounts.deleting=!1,e.businessAccounts.error="",e.businessAccounts.status=s?"Llogaria po ruhet...":"Llogaria po krijohet...",p();const R=o?.currentUser||null;try{let v=u(e.businessAccounts.editorUid);if(!v){const xe=await ce(d,y);v=u(xe?.uid)}if(!v)throw new Error("Llogaria nuk mund te krijohej.");const z=w(),X={businessAccess:h,waiterAccess:N},Y={uid:v,userId:v,restaurantId:i,restaurantName:ve,firstName:r,lastName:m,name:T,email:d,role:U,permissions:X,businessAccess:h,waiterAccess:N,active:$,status:$?"active":"disabled",createdByUid:u(e.user.uid),createdByName:u(e.userProfile?.name||e.user.displayName||""),updatedAt:z},ee={uid:v,displayName:T,name:T,firstName:r,lastName:m,email:d,role:"staff",roles:["staff"],status:$?"active":"disabled",staffRole:U,permissions:X,businessAccess:h,waiterAccess:N,staffActive:$,staffStatus:$?"active":"disabled",staffRestaurantId:i,waiterRestaurantId:i,restaurantId:h?i:"",businessOwnerUid:u(e.user.uid),updatedAt:z};s||(Y.createdAt=z,ee.createdAt=z),await g(b(a,"restaurants",i,"staff",v),Y,{merge:!0}),await g(b(a,"users",v),ee,{merge:!0}),R&&o?.currentUser&&u(o.currentUser.uid)!==u(R.uid)&&await ae(o).catch(()=>{}),R&&(!o?.currentUser||u(o.currentUser.uid)!==u(R.uid))&&ue(),_(s?"Llogaria u ruajt.":"Llogaria u krijua."),await M({force:!0})}catch(v){console.error(v),e.businessAccounts.saving=!1,e.businessAccounts.deleting=!1,e.businessAccounts.error=v?.message||"Llogaria nuk mund te ruhej.",e.businessAccounts.status="",p()}}async function de(){k();const i=u(e.businessAccounts.editorUid),t=L();if(!(!i||!t)){D(),e.businessAccounts.form.active=!e.businessAccounts.form.active,e.businessAccounts.deleting=!0,e.businessAccounts.saving=!1,e.businessAccounts.error="",e.businessAccounts.status=e.businessAccounts.form.active?"Llogaria po aktivizohet...":"Llogaria po deaktivizohet...",p();try{const s=e.businessAccounts.form.active!==!1,r={businessAccess:e.businessAccounts.form.businessAccess===!0,waiterAccess:e.businessAccounts.form.waiterAccess===!0};await g(b(a,"restaurants",t,"staff",i),{active:s,status:s?"active":"disabled",businessAccess:r.businessAccess,waiterAccess:r.waiterAccess,permissions:r,updatedAt:w()},{merge:!0}),await g(b(a,"users",i),{businessAccess:r.businessAccess,waiterAccess:r.waiterAccess,permissions:r,staffActive:s,staffStatus:s?"active":"disabled",status:s?"active":"disabled",restaurantId:r.businessAccess?t:"",updatedAt:w()},{merge:!0}),e.businessAccounts.deleting=!1,e.businessAccounts.status=s?"Llogaria u aktivizua.":"Llogaria u deaktivizua.",await M({force:!0})}catch(s){console.error(s),e.businessAccounts.deleting=!1,e.businessAccounts.error=s?.message||"Statusi nuk mund te perditesohej.",e.businessAccounts.status="",p()}}}const fe=he({saveBusinessAccountFromView:le,toggleBusinessAccountActive:de}),{saveCrmBusinessAccount:Z,updateCrmBusinessAccount:J}=fe;function be(){return`
      <div id="businessAccountsView" class="p-6 animate-in slide-in-from-right-10 duration-500">
        <div class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
          <div class="w-20 h-20 rounded-[2rem] bg-slate-100 mx-auto flex items-center justify-center text-slate-300 mb-6">
            ${E("lock","w-8 h-8")}
          </div>
          <h2 class="text-lg font-black tracking-tight text-slate-900">Staff</h2>
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">Vetem per pronarin e biznesit</p>
        </div>
      </div>
    `}function pe(){const i=e.businessAccounts.form||O(),t=!!u(e.businessAccounts.editorUid),s=e.businessAccounts.saving?t?"Duke ruajtur...":"Duke krijuar...":t?"Ruaj llogarine":"Krijo llogari",r=i.active!==!1;return`
      <div id="businessAccountsView" class="p-6 animate-in slide-in-from-right-10 duration-500 pb-24">
        <div class="flex items-center justify-between mb-6">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Business</span>
            <h2 class="text-2xl font-black italic uppercase tracking-tighter">${l(t?"Ndrysho stafin":"Staf i ri")}</h2>
          </div>
          <button type="button" data-business-account-back="true" class="w-12 h-12 rounded-2xl bg-white text-slate-600 border border-slate-100 shadow-sm flex items-center justify-center active:scale-95">
            ${E("arrow-left","w-4 h-4")}
          </button>
        </div>

        <div class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Vorname</label>
              <input id="businessAccountFirstName" type="text" value="${l(i.firstName||"")}" placeholder="Emri" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Nachname</label>
              <input id="businessAccountLastName" type="text" value="${l(i.lastName||"")}" placeholder="Mbiemri" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Email</label>
            <input id="businessAccountEmail" type="email" value="${l(i.email||"")}" placeholder="staff@business.com" ${t?"readonly":""} class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold ${t?"text-slate-500":""} border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Fjalekalimi</label>
            <input id="businessAccountPassword" type="password" value="" placeholder="${l(t?"Fjalekalimi mbetet i pandryshuar":"Shkruaj fjalekalimin")}" ${t?"disabled":""} class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold ${t?"text-slate-400":""} border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Rolle</label>
            <div class="relative mt-2">
              <select id="businessAccountRole" class="w-full px-5 py-4 pr-12 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none appearance-none focus:ring-2 focus:ring-indigo-100">
                <option value="manager" ${F(i.role)==="manager"?"selected":""}>Manager</option>
                <option value="waiter" ${F(i.role)==="waiter"?"selected":""}>Kamarier</option>
              </select>
              <div class="absolute inset-y-0 right-5 flex items-center text-slate-400 pointer-events-none">${E("chevron-down","w-4 h-4")}</div>
            </div>
          </div>

          <div class="rounded-[2rem] bg-slate-50 border border-slate-100 p-5">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Zugriff</p>
            <div class="mt-4 space-y-3">
              <label class="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-4 border border-slate-100">
                <div>
                  <p class="text-sm font-black text-slate-900">Business Account</p>
                  <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Social Business Bereiche</p>
                </div>
                <input id="businessAccountBusinessAccess" type="checkbox" ${i.businessAccess?"checked":""} class="w-5 h-5 accent-indigo-600" />
              </label>
              <label class="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-4 border border-slate-100">
                <div>
                  <p class="text-sm font-black text-slate-900">Waiter App</p>
                  <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Porosite live dhe njoftimet</p>
                </div>
                <input id="businessAccountWaiterAccess" type="checkbox" ${i.waiterAccess?"checked":""} class="w-5 h-5 accent-indigo-600" />
              </label>
            </div>
          </div>

          <label class="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 border border-slate-100 px-4 py-4">
            <div>
              <p class="text-sm font-black text-slate-900">Status</p>
              <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">${r?"Aktiv":"Deaktivizuar"}</p>
            </div>
            <input id="businessAccountActive" type="checkbox" ${r?"checked":""} class="w-5 h-5 accent-emerald-600" />
          </label>

          ${e.businessAccounts.error?`<div class="text-center text-[10px] font-black uppercase tracking-widest text-rose-500">${l(e.businessAccounts.error)}</div>`:""}
          ${e.businessAccounts.status?`<div class="text-center text-[10px] font-black uppercase tracking-widest text-slate-500">${l(e.businessAccounts.status)}</div>`:""}

          <button id="businessAccountSaveBtn" type="button" class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${e.businessAccounts.saving?"disabled":""}>
            ${l(s)}
          </button>
          ${t?`
            <button id="businessAccountToggleStatusBtn" type="button" class="w-full py-4 rounded-[1.8rem] ${r?"bg-amber-50 text-amber-700 border border-amber-100":"bg-emerald-50 text-emerald-700 border border-emerald-100"} text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform" ${e.businessAccounts.deleting?"disabled":""}>
              ${l(e.businessAccounts.deleting?"Duke ruajtur...":r?"Deaktivizo llogarine":"Aktivizo llogarine")}
            </button>
          `:""}
        </div>
      </div>
    `}function me(){const i=Array.isArray(e.businessAccounts.items)?e.businessAccounts.items:[],t=e.businessAccounts.loading?'<div class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-16">Llogarite po ngarkohen...</div>':i.length?i.map(s=>{const r=Be(s);return`
            <button type="button" data-business-account-edit="${l(s.uid)}" class="w-full text-left bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm active:scale-[0.99] transition-transform">
              <div class="flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${l(s.name||"Staff")}</p>
                  <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">${l(s.email||"")}</p>
                </div>
                ${Ne(s)}
              </div>
              <div class="flex flex-wrap gap-2 mt-4">
                <span class="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest">${l(s.role==="manager"?"Manager":"Kamarier")}</span>
                <span class="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest">${l(r)}</span>
              </div>
              <div class="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
                <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Prek per te ndryshuar</span>
                <span class="w-9 h-9 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center">${E("chevron-right","w-4 h-4")}</span>
              </div>
            </button>
          `}).join(""):'<div class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-16">Ende nuk ka staf</div>';return`
      <div id="businessAccountsView" class="p-6 animate-in slide-in-from-right-10 duration-500 pb-24">
        <div class="flex items-center justify-between mb-6">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Business</span>
            <h2 class="text-2xl font-black italic uppercase tracking-tighter">Staff</h2>
          </div>
          <button id="businessAccountNewBtn" type="button" class="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl shadow-slate-200/60 active:scale-95">
            ${E("plus","w-4 h-4")}
          </button>
        </div>
        ${e.businessAccounts.error?`<div class="text-center text-[10px] font-black uppercase tracking-widest text-rose-500 mb-4">${l(e.businessAccounts.error)}</div>`:""}
        ${e.businessAccounts.status?`<div class="text-center text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">${l(e.businessAccounts.status)}</div>`:""}
        <div class="space-y-4">${t}</div>
      </div>
    `}function Ae(){return k(),P()?e.businessAccounts.view==="form"?pe():me():be()}function ge(i=document){k();const t=i||document;if(!t||e.activeTab!=="businessAccounts")return;const s=t.getElementById("businessAccountNewBtn");s&&s.dataset.bound!=="true"&&(s.dataset.bound="true",s.addEventListener("click",()=>V("create"))),t.querySelectorAll("[data-business-account-edit]").forEach(y=>{y.dataset.bound!=="true"&&(y.dataset.bound="true",y.addEventListener("click",()=>{const U=u(y.getAttribute("data-business-account-edit")),h=(e.businessAccounts.items||[]).find(N=>u(N.uid)===U);h&&V("edit",h)}))});const r=t.querySelector("[data-business-account-back]");r&&r.dataset.bound!=="true"&&(r.dataset.bound="true",r.addEventListener("click",()=>G()));const m=t.getElementById("businessAccountSaveBtn");m&&m.dataset.bound!=="true"&&(m.dataset.bound="true",m.addEventListener("click",()=>{e.businessAccounts.saving||Z()}));const d=t.getElementById("businessAccountToggleStatusBtn");d&&d.dataset.bound!=="true"&&(d.dataset.bound="true",d.addEventListener("click",()=>{e.businessAccounts.deleting||J()}))}return{ensureState:k,isBusinessOwnerUser:P,getManagedRestaurantId:L,resetForm:_,openEditor:V,closeEditor:G,syncFormFromDom:D,loadBusinessAccounts:M,saveBusinessAccountFromView:Z,toggleBusinessAccountActive:J,renderBusinessAccountsView:Ae,bindBusinessAccountsEvents:ge}}const S="free",B="standart",je=Object.freeze(["standart","standard","std","pro","premium","plus","business","paid","active"]),Ee=Object.freeze({posts:Object.freeze([S,B]),offers:Object.freeze([S,B]),menu:Object.freeze([B]),qr:Object.freeze([B])});function ie(e=""){if(e===!0)return B;const c=String(e??"").trim().toLowerCase();return c&&je.includes(c)?B:S}function $e({profile:e={},restaurant:c={}}={}){const n=[c||{},e||{}];for(const a of n){if(!a||typeof a!="object")continue;const o=a.plan??a.subscriptionPlan??a.planKey??a.subscriptionStatus;if(o!=null&&String(o).trim()!=="")return ie(o);if(a.subscriptionActive===!0||a.isSubscriber===!0||a.hasSubscription===!0)return B}return S}function Se(e="",c=""){const n=Ee[String(c||"").trim()];return n?n.includes(ie(e)):!0}function Re({profile:e={},restaurant:c={},feature:n=""}={}){return Se($e({profile:e,restaurant:c}),n)}export{Re as b,Ue as c,ie as n};
