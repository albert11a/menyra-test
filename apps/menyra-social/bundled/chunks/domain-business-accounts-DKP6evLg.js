const ge="crm-admin-business-account-write-facade.v1",ve=Object.freeze(["saveBusinessAccountFromView","toggleBusinessAccountActive"]);function Y(e,a){return function(...d){if(typeof a!="function")throw new Error(`CRM admin business account write facade handler missing: ${e}`);return a(...d)}}function xe({saveBusinessAccount:e,updateBusinessAccount:a,saveBusinessAccountFromView:i,toggleBusinessAccountActive:d}={}){const o=Y("saveBusinessAccountFromView",typeof e=="function"?e:i),A=Y("toggleBusinessAccountActive",typeof a=="function"?a:d);return Object.freeze({version:ge,operations:ve,saveCrmBusinessAccount:o,updateCrmBusinessAccount:A,saveBusinessAccount:o,updateBusinessAccount:A,saveBusinessAccountFromView:o,toggleBusinessAccountActive:A})}function b(e=""){return String(e||"").trim()}function se(e={},a=""){const i=e&&typeof e=="object"?e:{},d=i.permissions&&typeof i.permissions=="object"?i.permissions:{},o=b(i.firstName),A=b(i.lastName),x=b(i.name||`${o} ${A}`.trim()||i.displayName),$=b(i.status||(i.active===!1?"disabled":"active")).toLowerCase(),f=i.active===!1?!1:$!=="disabled",g=b(i.role||i.staffRole).toLowerCase();return{uid:b(a||i.uid||i.userId),userId:b(i.userId||i.uid||a),restaurantId:b(i.restaurantId),firstName:o,lastName:A,name:x,email:b(i.email),role:g==="manager"?"manager":"waiter",businessAccess:i.businessAccess===!0||d.businessAccess===!0,waiterAccess:i.waiterAccess===!0||d.waiterAccess===!0,active:f,status:f?"active":"disabled",createdAt:i.createdAt||null,updatedAt:i.updatedAt||null}}async function we({db:e,collectionFn:a,getDocsFn:i,restaurantId:d="",normalizeBusinessAccountEntryFn:o=se}={}){const A=b(d),x=[];if(e||x.push("db"),typeof a!="function"&&x.push("collection"),typeof i!="function"&&x.push("getDocs"),A||x.push("restaurantId"),x.length)throw new Error(`loadCrmBusinessAccountsCore missing read deps: ${x.join(", ")}`);const $=await i(a(e,"restaurants",A,"staff")),f=[];return $?.forEach&&$.forEach(g=>{const w=o(g.data?.()||{},g.id);w.uid&&f.push(w)}),f.sort((g,w)=>{const E=`${b(g.firstName)} ${b(g.lastName)}`.trim().toLowerCase(),I=`${b(w.firstName)} ${b(w.lastName)}`.trim().toLowerCase();return E.localeCompare(I)}),{rows:f,items:f,hasMore:!1,knownCount:f.length,countExact:!0,restaurantId:A}}function r(e=""){return String(e||"").trim()}function F(e=""){return r(e).toLowerCase()==="manager"?"manager":"waiter"}function ke({businessAccess:e=!1,waiterAccess:a=!1}={}){return e&&a?"Beides":e?"Business":a?"Waiter":"Pa qasje"}function R(){return{firstName:"",lastName:"",email:"",password:"",role:"waiter",businessAccess:!1,waiterAccess:!0,active:!0}}function ee(e={},a=""){return se(e,a)}function he(e={}){return e.active?'<span class="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-widest">Aktiv</span>':'<span class="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest">Deaktiviert</span>'}function je({state:e,icon:a,escapeHtml:i,db:d,auth:o,collection:A,getDocs:x,getDoc:$,doc:f,setDoc:g,serverTimestamp:w,createAuthUser:E,signOut:I,saveUserProfileToStorage:D,render:W,getRestaurantMetaById:T,isBusinessOwnerProfile:K,isPlaceholderUrl:ye,getOptimizedImageUrl:Be,PLACEHOLDER_IMAGE:$e=""}={}){const j=typeof a=="function"?a:(()=>""),u=typeof i=="function"?i:((n="")=>String(n||"")),p=typeof W=="function"?W:(()=>{}),te=typeof T=="function"?T:(()=>null),ne=typeof E=="function"?E:(async()=>null),ie=typeof I=="function"?I:(async()=>{}),ce=typeof D=="function"?D:(()=>{}),re=typeof K=="function"?K:(()=>!1);function k(){(!e.businessAccounts||typeof e.businessAccounts!="object")&&(e.businessAccounts={items:[],view:"list",editorUid:"",loading:!1,saving:!1,deleting:!1,loaded:!1,error:"",status:"",form:R()})}function z(){return re(e?.userProfile)}function L(){return z()?r(e?.userProfile?.restaurantId):""}function V(n=""){k(),e.businessAccounts={...e.businessAccounts,view:"list",editorUid:"",saving:!1,deleting:!1,error:"",status:r(n),form:R()}}function O(n="create",t=null){k();const s=t?ee(t,t.uid||t.userId||""):null;e.businessAccounts={...e.businessAccounts,view:"form",editorUid:s?.uid||"",deleting:!1,error:"",status:"",form:s?{firstName:s.firstName,lastName:s.lastName,email:s.email,password:"",role:s.role,businessAccess:s.businessAccess,waiterAccess:s.waiterAccess,active:s.active}:R()},p()}function q(n=""){V(n),p()}function P(n=document){k();const t=n||document,s=m=>{const l=t?.getElementById(m);return l&&"value"in l?String(l.value||""):""},c=m=>!!t?.getElementById(m)?.checked;e.businessAccounts.form={...e.businessAccounts.form,firstName:s("businessAccountFirstName").trim(),lastName:s("businessAccountLastName").trim(),email:s("businessAccountEmail").trim().toLowerCase(),password:s("businessAccountPassword"),role:F(s("businessAccountRole")),businessAccess:c("businessAccountBusinessAccess"),waiterAccess:c("businessAccountWaiterAccess"),active:c("businessAccountActive")}}async function _({force:n=!1}={}){k();const t=L();if(!t)return e.businessAccounts.error="Zona e stafit nuk eshte e disponueshme.",p(),[];if(e.businessAccounts.loading)return e.businessAccounts.items||[];if(e.businessAccounts.loaded&&!n)return e.businessAccounts.items||[];e.businessAccounts.loading=!0,e.businessAccounts.error="",p();try{const s=await we({db:d,collectionFn:A,getDocsFn:x,restaurantId:t,normalizeBusinessAccountEntryFn:ee}),c=Array.isArray(s.items)?s.items:[];return e.businessAccounts.items=c,e.businessAccounts.loaded=!0,e.businessAccounts.loading=!1,e.businessAccounts.error="",p(),c}catch(s){return console.error(s),e.businessAccounts.loading=!1,e.businessAccounts.error=s?.message||"Stafi nuk mund te ngarkohej.",p(),[]}}async function ae(){k();const n=L();if(!n||!e?.user?.uid)return;P();const t=e.businessAccounts.form||{},s=!!r(e.businessAccounts.editorUid),c=r(t.firstName),m=r(t.lastName),l=r(t.email).toLowerCase(),y=String(t.password||""),S=F(t.role),h=t.businessAccess===!0,B=t.waiterAccess===!0,N=t.active!==!1,M=r(`${c} ${m}`.trim()),Z=te(n)||{},me=r(Z.name||Z.restaurantName||e.userProfile?.name||"Business");if(!c||!m||!l||!s&&!y){e.businessAccounts.error=s?"Emri, mbiemri dhe email jane te detyrueshme.":"Emri, mbiemri, email dhe fjalekalimi jane te detyrueshme.",p();return}if(!l.includes("@")){e.businessAccounts.error="Ju lutem shkruani nje email te vlefshem.",p();return}if(!h&&!B){e.businessAccounts.error="Te pakten nje qasje duhet te jete aktive.",p();return}e.businessAccounts.saving=!0,e.businessAccounts.deleting=!1,e.businessAccounts.error="",e.businessAccounts.status=s?"Llogaria po ruhet...":"Llogaria po krijohet...",p();const C=o?.currentUser||null;try{let v=r(e.businessAccounts.editorUid);if(!v){const Ae=await ne(l,y);v=r(Ae?.uid)}if(!v)throw new Error("Llogaria nuk mund te krijohej.");const U=w(),J={businessAccess:h,waiterAccess:B},Q={uid:v,userId:v,restaurantId:n,restaurantName:me,firstName:c,lastName:m,name:M,email:l,role:S,permissions:J,businessAccess:h,waiterAccess:B,active:N,status:N?"active":"disabled",createdByUid:r(e.user.uid),createdByName:r(e.userProfile?.name||e.user.displayName||""),updatedAt:U},X={uid:v,displayName:M,name:M,firstName:c,lastName:m,email:l,role:"staff",roles:["staff"],status:N?"active":"disabled",staffRole:S,permissions:J,businessAccess:h,waiterAccess:B,staffActive:N,staffStatus:N?"active":"disabled",staffRestaurantId:n,waiterRestaurantId:n,restaurantId:h?n:"",businessOwnerUid:r(e.user.uid),updatedAt:U};s||(Q.createdAt=U,X.createdAt=U),await g(f(d,"restaurants",n,"staff",v),Q,{merge:!0}),await g(f(d,"users",v),X,{merge:!0}),C&&o?.currentUser&&r(o.currentUser.uid)!==r(C.uid)&&await ie(o).catch(()=>{}),C&&(!o?.currentUser||r(o.currentUser.uid)!==r(C.uid))&&ce(),V(s?"Llogaria u ruajt.":"Llogaria u krijua."),await _({force:!0})}catch(v){console.error(v),e.businessAccounts.saving=!1,e.businessAccounts.deleting=!1,e.businessAccounts.error=v?.message||"Llogaria nuk mund te ruhej.",e.businessAccounts.status="",p()}}async function ue(){k();const n=r(e.businessAccounts.editorUid),t=L();if(!(!n||!t)){P(),e.businessAccounts.form.active=!e.businessAccounts.form.active,e.businessAccounts.deleting=!0,e.businessAccounts.saving=!1,e.businessAccounts.error="",e.businessAccounts.status=e.businessAccounts.form.active?"Llogaria po aktivizohet...":"Llogaria po deaktivizohet...",p();try{const s=e.businessAccounts.form.active!==!1,c={businessAccess:e.businessAccounts.form.businessAccess===!0,waiterAccess:e.businessAccounts.form.waiterAccess===!0};await g(f(d,"restaurants",t,"staff",n),{active:s,status:s?"active":"disabled",businessAccess:c.businessAccess,waiterAccess:c.waiterAccess,permissions:c,updatedAt:w()},{merge:!0}),await g(f(d,"users",n),{businessAccess:c.businessAccess,waiterAccess:c.waiterAccess,permissions:c,staffActive:s,staffStatus:s?"active":"disabled",status:s?"active":"disabled",restaurantId:c.businessAccess?t:"",updatedAt:w()},{merge:!0}),e.businessAccounts.deleting=!1,e.businessAccounts.status=s?"Llogaria u aktivizua.":"Llogaria u deaktivizua.",await _({force:!0})}catch(s){console.error(s),e.businessAccounts.deleting=!1,e.businessAccounts.error=s?.message||"Statusi nuk mund te perditesohej.",e.businessAccounts.status="",p()}}}const oe=xe({saveBusinessAccountFromView:ae,toggleBusinessAccountActive:ue}),{saveCrmBusinessAccount:H,updateCrmBusinessAccount:G}=oe;function le(){return`
      <div id="businessAccountsView" class="p-6 animate-in slide-in-from-right-10 duration-500">
        <div class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
          <div class="w-20 h-20 rounded-[2rem] bg-slate-100 mx-auto flex items-center justify-center text-slate-300 mb-6">
            ${j("lock","w-8 h-8")}
          </div>
          <h2 class="text-lg font-black tracking-tight text-slate-900">Staff</h2>
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">Vetem per pronarin e biznesit</p>
        </div>
      </div>
    `}function de(){const n=e.businessAccounts.form||R(),t=!!r(e.businessAccounts.editorUid),s=e.businessAccounts.saving?t?"Duke ruajtur...":"Duke krijuar...":t?"Ruaj llogarine":"Krijo llogari",c=n.active!==!1;return`
      <div id="businessAccountsView" class="p-6 animate-in slide-in-from-right-10 duration-500 pb-24">
        <div class="flex items-center justify-between mb-6">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Business</span>
            <h2 class="text-2xl font-black italic uppercase tracking-tighter">${u(t?"Ndrysho stafin":"Staf i ri")}</h2>
          </div>
          <button type="button" data-business-account-back="true" class="w-12 h-12 rounded-2xl bg-white text-slate-600 border border-slate-100 shadow-sm flex items-center justify-center active:scale-95">
            ${j("arrow-left","w-4 h-4")}
          </button>
        </div>

        <div class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Vorname</label>
              <input id="businessAccountFirstName" type="text" value="${u(n.firstName||"")}" placeholder="Emri" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Nachname</label>
              <input id="businessAccountLastName" type="text" value="${u(n.lastName||"")}" placeholder="Mbiemri" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Email</label>
            <input id="businessAccountEmail" type="email" value="${u(n.email||"")}" placeholder="staff@business.com" ${t?"readonly":""} class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold ${t?"text-slate-500":""} border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Fjalekalimi</label>
            <input id="businessAccountPassword" type="password" value="" placeholder="${u(t?"Fjalekalimi mbetet i pandryshuar":"Shkruaj fjalekalimin")}" ${t?"disabled":""} class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold ${t?"text-slate-400":""} border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Rolle</label>
            <div class="relative mt-2">
              <select id="businessAccountRole" class="w-full px-5 py-4 pr-12 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none appearance-none focus:ring-2 focus:ring-indigo-100">
                <option value="manager" ${F(n.role)==="manager"?"selected":""}>Manager</option>
                <option value="waiter" ${F(n.role)==="waiter"?"selected":""}>Kamarier</option>
              </select>
              <div class="absolute inset-y-0 right-5 flex items-center text-slate-400 pointer-events-none">${j("chevron-down","w-4 h-4")}</div>
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
                <input id="businessAccountBusinessAccess" type="checkbox" ${n.businessAccess?"checked":""} class="w-5 h-5 accent-indigo-600" />
              </label>
              <label class="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-4 border border-slate-100">
                <div>
                  <p class="text-sm font-black text-slate-900">Waiter App</p>
                  <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Porosite live dhe njoftimet</p>
                </div>
                <input id="businessAccountWaiterAccess" type="checkbox" ${n.waiterAccess?"checked":""} class="w-5 h-5 accent-indigo-600" />
              </label>
            </div>
          </div>

          <label class="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 border border-slate-100 px-4 py-4">
            <div>
              <p class="text-sm font-black text-slate-900">Status</p>
              <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">${c?"Aktiv":"Deaktivizuar"}</p>
            </div>
            <input id="businessAccountActive" type="checkbox" ${c?"checked":""} class="w-5 h-5 accent-emerald-600" />
          </label>

          ${e.businessAccounts.error?`<div class="text-center text-[10px] font-black uppercase tracking-widest text-rose-500">${u(e.businessAccounts.error)}</div>`:""}
          ${e.businessAccounts.status?`<div class="text-center text-[10px] font-black uppercase tracking-widest text-slate-500">${u(e.businessAccounts.status)}</div>`:""}

          <button id="businessAccountSaveBtn" type="button" class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${e.businessAccounts.saving?"disabled":""}>
            ${u(s)}
          </button>
          ${t?`
            <button id="businessAccountToggleStatusBtn" type="button" class="w-full py-4 rounded-[1.8rem] ${c?"bg-amber-50 text-amber-700 border border-amber-100":"bg-emerald-50 text-emerald-700 border border-emerald-100"} text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform" ${e.businessAccounts.deleting?"disabled":""}>
              ${u(e.businessAccounts.deleting?"Duke ruajtur...":c?"Deaktivizo llogarine":"Aktivizo llogarine")}
            </button>
          `:""}
        </div>
      </div>
    `}function be(){const n=Array.isArray(e.businessAccounts.items)?e.businessAccounts.items:[],t=e.businessAccounts.loading?'<div class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-16">Llogarite po ngarkohen...</div>':n.length?n.map(s=>{const c=ke(s);return`
            <button type="button" data-business-account-edit="${u(s.uid)}" class="w-full text-left bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm active:scale-[0.99] transition-transform">
              <div class="flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${u(s.name||"Staff")}</p>
                  <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">${u(s.email||"")}</p>
                </div>
                ${he(s)}
              </div>
              <div class="flex flex-wrap gap-2 mt-4">
                <span class="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest">${u(s.role==="manager"?"Manager":"Kamarier")}</span>
                <span class="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest">${u(c)}</span>
              </div>
              <div class="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
                <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Prek per te ndryshuar</span>
                <span class="w-9 h-9 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center">${j("chevron-right","w-4 h-4")}</span>
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
            ${j("plus","w-4 h-4")}
          </button>
        </div>
        ${e.businessAccounts.error?`<div class="text-center text-[10px] font-black uppercase tracking-widest text-rose-500 mb-4">${u(e.businessAccounts.error)}</div>`:""}
        ${e.businessAccounts.status?`<div class="text-center text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">${u(e.businessAccounts.status)}</div>`:""}
        <div class="space-y-4">${t}</div>
      </div>
    `}function fe(){return k(),z()?e.businessAccounts.view==="form"?de():be():le()}function pe(n=document){k();const t=n||document;if(!t||e.activeTab!=="businessAccounts")return;const s=t.getElementById("businessAccountNewBtn");s&&s.dataset.bound!=="true"&&(s.dataset.bound="true",s.addEventListener("click",()=>O("create"))),t.querySelectorAll("[data-business-account-edit]").forEach(y=>{y.dataset.bound!=="true"&&(y.dataset.bound="true",y.addEventListener("click",()=>{const S=r(y.getAttribute("data-business-account-edit")),h=(e.businessAccounts.items||[]).find(B=>r(B.uid)===S);h&&O("edit",h)}))});const c=t.querySelector("[data-business-account-back]");c&&c.dataset.bound!=="true"&&(c.dataset.bound="true",c.addEventListener("click",()=>q()));const m=t.getElementById("businessAccountSaveBtn");m&&m.dataset.bound!=="true"&&(m.dataset.bound="true",m.addEventListener("click",()=>{e.businessAccounts.saving||H()}));const l=t.getElementById("businessAccountToggleStatusBtn");l&&l.dataset.bound!=="true"&&(l.dataset.bound="true",l.addEventListener("click",()=>{e.businessAccounts.deleting||G()}))}return{ensureState:k,isBusinessOwnerUser:z,getManagedRestaurantId:L,resetForm:V,openEditor:O,closeEditor:q,syncFormFromDom:P,loadBusinessAccounts:_,saveBusinessAccountFromView:H,toggleBusinessAccountActive:G,renderBusinessAccountsView:fe,bindBusinessAccountsEvents:pe}}export{je as c};
