const ge="crm-admin-business-account-write-facade.v1",ve=Object.freeze(["saveBusinessAccountFromView","toggleBusinessAccountActive"]);function Y(e,a){return function(...d){if(typeof a!="function")throw new Error(`CRM admin business account write facade handler missing: ${e}`);return a(...d)}}function xe({saveBusinessAccount:e,updateBusinessAccount:a,saveBusinessAccountFromView:c,toggleBusinessAccountActive:d}={}){const o=Y("saveBusinessAccountFromView",typeof e=="function"?e:c),A=Y("toggleBusinessAccountActive",typeof a=="function"?a:d);return Object.freeze({version:ge,operations:ve,saveCrmBusinessAccount:o,updateCrmBusinessAccount:A,saveBusinessAccount:o,updateBusinessAccount:A,saveBusinessAccountFromView:o,toggleBusinessAccountActive:A})}function f(e=""){return String(e||"").trim()}function se(e={},a=""){const c=e&&typeof e=="object"?e:{},d=c.permissions&&typeof c.permissions=="object"?c.permissions:{},o=f(c.firstName),A=f(c.lastName),x=f(c.name||`${o} ${A}`.trim()||c.displayName),$=f(c.status||(c.active===!1?"disabled":"active")).toLowerCase(),b=c.active===!1?!1:$!=="disabled",g=f(c.role||c.staffRole).toLowerCase();return{uid:f(a||c.uid||c.userId),userId:f(c.userId||c.uid||a),restaurantId:f(c.restaurantId),firstName:o,lastName:A,name:x,email:f(c.email),role:g==="manager"?"manager":"waiter",businessAccess:c.businessAccess===!0||d.businessAccess===!0,waiterAccess:c.waiterAccess===!0||d.waiterAccess===!0,active:b,status:b?"active":"disabled",createdAt:c.createdAt||null,updatedAt:c.updatedAt||null}}async function we({db:e,collectionFn:a,getDocsFn:c,restaurantId:d="",normalizeBusinessAccountEntryFn:o=se}={}){const A=f(d),x=[];if(e||x.push("db"),typeof a!="function"&&x.push("collection"),typeof c!="function"&&x.push("getDocs"),A||x.push("restaurantId"),x.length)throw new Error(`loadCrmBusinessAccountsCore missing read deps: ${x.join(", ")}`);const $=await c(a(e,"restaurants",A,"staff")),b=[];return $?.forEach&&$.forEach(g=>{const w=o(g.data?.()||{},g.id);w.uid&&b.push(w)}),b.sort((g,w)=>{const S=`${f(g.firstName)} ${f(g.lastName)}`.trim().toLowerCase(),I=`${f(w.firstName)} ${f(w.lastName)}`.trim().toLowerCase();return S.localeCompare(I)}),{rows:b,items:b,hasMore:!1,knownCount:b.length,countExact:!0,restaurantId:A}}function r(e=""){return String(e||"").trim()}function R(e=""){return r(e).toLowerCase()==="manager"?"manager":"waiter"}function he({businessAccess:e=!1,waiterAccess:a=!1}={}){return e&&a?"Beides":e?"Business":a?"Waiter":"Kein Zugriff"}function F(){return{firstName:"",lastName:"",email:"",password:"",role:"waiter",businessAccess:!1,waiterAccess:!0,active:!0}}function ee(e={},a=""){return se(e,a)}function ye(e={}){return e.active?'<span class="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-widest">Aktiv</span>':'<span class="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest">Deaktiviert</span>'}function Ne({state:e,icon:a,escapeHtml:c,db:d,auth:o,collection:A,getDocs:x,getDoc:$,doc:b,setDoc:g,serverTimestamp:w,createAuthUser:S,signOut:I,saveUserProfileToStorage:z,render:T,getRestaurantMetaById:D,isBusinessOwnerProfile:K,isPlaceholderUrl:ke,getOptimizedImageUrl:Be,PLACEHOLDER_IMAGE:$e=""}={}){const N=typeof a=="function"?a:(()=>""),u=typeof c=="function"?c:((n="")=>String(n||"")),p=typeof T=="function"?T:(()=>{}),te=typeof D=="function"?D:(()=>null),ne=typeof S=="function"?S:(async()=>null),ce=typeof I=="function"?I:(async()=>{}),ie=typeof z=="function"?z:(()=>{}),re=typeof K=="function"?K:(()=>!1);function h(){(!e.businessAccounts||typeof e.businessAccounts!="object")&&(e.businessAccounts={items:[],view:"list",editorUid:"",loading:!1,saving:!1,deleting:!1,loaded:!1,error:"",status:"",form:F()})}function V(){return re(e?.userProfile)}function C(){return V()?r(e?.userProfile?.restaurantId):""}function O(n=""){h(),e.businessAccounts={...e.businessAccounts,view:"list",editorUid:"",saving:!1,deleting:!1,error:"",status:r(n),form:F()}}function P(n="create",t=null){h();const s=t?ee(t,t.uid||t.userId||""):null;e.businessAccounts={...e.businessAccounts,view:"form",editorUid:s?.uid||"",deleting:!1,error:"",status:"",form:s?{firstName:s.firstName,lastName:s.lastName,email:s.email,password:"",role:s.role,businessAccess:s.businessAccess,waiterAccess:s.waiterAccess,active:s.active}:F()},p()}function H(n=""){O(n),p()}function _(n=document){h();const t=n||document,s=m=>{const l=t?.getElementById(m);return l&&"value"in l?String(l.value||""):""},i=m=>!!t?.getElementById(m)?.checked;e.businessAccounts.form={...e.businessAccounts.form,firstName:s("businessAccountFirstName").trim(),lastName:s("businessAccountLastName").trim(),email:s("businessAccountEmail").trim().toLowerCase(),password:s("businessAccountPassword"),role:R(s("businessAccountRole")),businessAccess:i("businessAccountBusinessAccess"),waiterAccess:i("businessAccountWaiterAccess"),active:i("businessAccountActive")}}async function M({force:n=!1}={}){h();const t=C();if(!t)return e.businessAccounts.error="Staff-Bereich nicht verfuegbar.",p(),[];if(e.businessAccounts.loading)return e.businessAccounts.items||[];if(e.businessAccounts.loaded&&!n)return e.businessAccounts.items||[];e.businessAccounts.loading=!0,e.businessAccounts.error="",p();try{const s=await we({db:d,collectionFn:A,getDocsFn:x,restaurantId:t,normalizeBusinessAccountEntryFn:ee}),i=Array.isArray(s.items)?s.items:[];return e.businessAccounts.items=i,e.businessAccounts.loaded=!0,e.businessAccounts.loading=!1,e.businessAccounts.error="",p(),i}catch(s){return console.error(s),e.businessAccounts.loading=!1,e.businessAccounts.error=s?.message||"Staff konnte nicht geladen werden.",p(),[]}}async function ae(){h();const n=C();if(!n||!e?.user?.uid)return;_();const t=e.businessAccounts.form||{},s=!!r(e.businessAccounts.editorUid),i=r(t.firstName),m=r(t.lastName),l=r(t.email).toLowerCase(),k=String(t.password||""),U=R(t.role),y=t.businessAccess===!0,B=t.waiterAccess===!0,E=t.active!==!1,W=r(`${i} ${m}`.trim()),G=te(n)||{},me=r(G.name||G.restaurantName||e.userProfile?.name||"Business");if(!i||!m||!l||!s&&!k){e.businessAccounts.error=s?"Vorname, Nachname und Email sind erforderlich.":"Vorname, Nachname, Email und Passwort sind erforderlich.",p();return}if(!l.includes("@")){e.businessAccounts.error="Bitte eine gueltige Email eingeben.",p();return}if(!y&&!B){e.businessAccounts.error="Mindestens ein Zugriff muss aktiv sein.",p();return}e.businessAccounts.saving=!0,e.businessAccounts.deleting=!1,e.businessAccounts.error="",e.businessAccounts.status=s?"Account wird gespeichert...":"Account wird erstellt...",p();const L=o?.currentUser||null;try{let v=r(e.businessAccounts.editorUid);if(!v){const Ae=await ne(l,k);v=r(Ae?.uid)}if(!v)throw new Error("Account konnte nicht erstellt werden.");const j=w(),J={businessAccess:y,waiterAccess:B},Q={uid:v,userId:v,restaurantId:n,restaurantName:me,firstName:i,lastName:m,name:W,email:l,role:U,permissions:J,businessAccess:y,waiterAccess:B,active:E,status:E?"active":"disabled",createdByUid:r(e.user.uid),createdByName:r(e.userProfile?.name||e.user.displayName||""),updatedAt:j},X={uid:v,displayName:W,name:W,firstName:i,lastName:m,email:l,role:"staff",roles:["staff"],status:E?"active":"disabled",staffRole:U,permissions:J,businessAccess:y,waiterAccess:B,staffActive:E,staffStatus:E?"active":"disabled",staffRestaurantId:n,waiterRestaurantId:n,restaurantId:y?n:"",businessOwnerUid:r(e.user.uid),updatedAt:j};s||(Q.createdAt=j,X.createdAt=j),await g(b(d,"restaurants",n,"staff",v),Q,{merge:!0}),await g(b(d,"users",v),X,{merge:!0}),L&&o?.currentUser&&r(o.currentUser.uid)!==r(L.uid)&&await ce(o).catch(()=>{}),L&&(!o?.currentUser||r(o.currentUser.uid)!==r(L.uid))&&ie(),O(s?"Account gespeichert.":"Account erstellt."),await M({force:!0})}catch(v){console.error(v),e.businessAccounts.saving=!1,e.businessAccounts.deleting=!1,e.businessAccounts.error=v?.message||"Account konnte nicht gespeichert werden.",e.businessAccounts.status="",p()}}async function ue(){h();const n=r(e.businessAccounts.editorUid),t=C();if(!(!n||!t)){_(),e.businessAccounts.form.active=!e.businessAccounts.form.active,e.businessAccounts.deleting=!0,e.businessAccounts.saving=!1,e.businessAccounts.error="",e.businessAccounts.status=e.businessAccounts.form.active?"Account wird aktiviert...":"Account wird deaktiviert...",p();try{const s=e.businessAccounts.form.active!==!1,i={businessAccess:e.businessAccounts.form.businessAccess===!0,waiterAccess:e.businessAccounts.form.waiterAccess===!0};await g(b(d,"restaurants",t,"staff",n),{active:s,status:s?"active":"disabled",businessAccess:i.businessAccess,waiterAccess:i.waiterAccess,permissions:i,updatedAt:w()},{merge:!0}),await g(b(d,"users",n),{businessAccess:i.businessAccess,waiterAccess:i.waiterAccess,permissions:i,staffActive:s,staffStatus:s?"active":"disabled",status:s?"active":"disabled",restaurantId:i.businessAccess?t:"",updatedAt:w()},{merge:!0}),e.businessAccounts.deleting=!1,e.businessAccounts.status=s?"Account aktiviert.":"Account deaktiviert.",await M({force:!0})}catch(s){console.error(s),e.businessAccounts.deleting=!1,e.businessAccounts.error=s?.message||"Status konnte nicht aktualisiert werden.",e.businessAccounts.status="",p()}}}const oe=xe({saveBusinessAccountFromView:ae,toggleBusinessAccountActive:ue}),{saveCrmBusinessAccount:Z,updateCrmBusinessAccount:q}=oe;function le(){return`
      <div id="businessAccountsView" class="p-6 animate-in slide-in-from-right-10 duration-500">
        <div class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
          <div class="w-20 h-20 rounded-[2rem] bg-slate-100 mx-auto flex items-center justify-center text-slate-300 mb-6">
            ${N("lock","w-8 h-8")}
          </div>
          <h2 class="text-lg font-black tracking-tight text-slate-900">Staff</h2>
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">Nur fuer Business Owner</p>
        </div>
      </div>
    `}function de(){const n=e.businessAccounts.form||F(),t=!!r(e.businessAccounts.editorUid),s=e.businessAccounts.saving?t?"Speichern...":"Erstellen...":t?"Account speichern":"Account erstellen",i=n.active!==!1;return`
      <div id="businessAccountsView" class="p-6 animate-in slide-in-from-right-10 duration-500 pb-24">
        <div class="flex items-center justify-between mb-6">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Business</span>
            <h2 class="text-2xl font-black italic uppercase tracking-tighter">${u(t?"Staff bearbeiten":"Neuer Staff")}</h2>
          </div>
          <button type="button" data-business-account-back="true" class="w-12 h-12 rounded-2xl bg-white text-slate-600 border border-slate-100 shadow-sm flex items-center justify-center active:scale-95">
            ${N("arrow-left","w-4 h-4")}
          </button>
        </div>

        <div class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Vorname</label>
              <input id="businessAccountFirstName" type="text" value="${u(n.firstName||"")}" placeholder="Vorname" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Nachname</label>
              <input id="businessAccountLastName" type="text" value="${u(n.lastName||"")}" placeholder="Nachname" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Email</label>
            <input id="businessAccountEmail" type="email" value="${u(n.email||"")}" placeholder="staff@business.com" ${t?"readonly":""} class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold ${t?"text-slate-500":""} border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Passwort</label>
            <input id="businessAccountPassword" type="password" value="" placeholder="${u(t?"Passwort bleibt unveraendert":"Passwort eingeben")}" ${t?"disabled":""} class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold ${t?"text-slate-400":""} border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Rolle</label>
            <div class="relative mt-2">
              <select id="businessAccountRole" class="w-full px-5 py-4 pr-12 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none appearance-none focus:ring-2 focus:ring-indigo-100">
                <option value="manager" ${R(n.role)==="manager"?"selected":""}>Manager</option>
                <option value="waiter" ${R(n.role)==="waiter"?"selected":""}>Kellner</option>
              </select>
              <div class="absolute inset-y-0 right-5 flex items-center text-slate-400 pointer-events-none">${N("chevron-down","w-4 h-4")}</div>
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
                  <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Live Orders und Benachrichtigungen</p>
                </div>
                <input id="businessAccountWaiterAccess" type="checkbox" ${n.waiterAccess?"checked":""} class="w-5 h-5 accent-indigo-600" />
              </label>
            </div>
          </div>

          <label class="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 border border-slate-100 px-4 py-4">
            <div>
              <p class="text-sm font-black text-slate-900">Status</p>
              <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">${i?"Aktiv":"Deaktiviert"}</p>
            </div>
            <input id="businessAccountActive" type="checkbox" ${i?"checked":""} class="w-5 h-5 accent-emerald-600" />
          </label>

          ${e.businessAccounts.error?`<div class="text-center text-[10px] font-black uppercase tracking-widest text-rose-500">${u(e.businessAccounts.error)}</div>`:""}
          ${e.businessAccounts.status?`<div class="text-center text-[10px] font-black uppercase tracking-widest text-slate-500">${u(e.businessAccounts.status)}</div>`:""}

          <button id="businessAccountSaveBtn" type="button" class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${e.businessAccounts.saving?"disabled":""}>
            ${u(s)}
          </button>
          ${t?`
            <button id="businessAccountToggleStatusBtn" type="button" class="w-full py-4 rounded-[1.8rem] ${i?"bg-amber-50 text-amber-700 border border-amber-100":"bg-emerald-50 text-emerald-700 border border-emerald-100"} text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform" ${e.businessAccounts.deleting?"disabled":""}>
              ${u(e.businessAccounts.deleting?"Speichern...":i?"Account deaktivieren":"Account aktivieren")}
            </button>
          `:""}
        </div>
      </div>
    `}function fe(){const n=Array.isArray(e.businessAccounts.items)?e.businessAccounts.items:[],t=e.businessAccounts.loading?'<div class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-16">Accounts laden...</div>':n.length?n.map(s=>{const i=he(s);return`
            <button type="button" data-business-account-edit="${u(s.uid)}" class="w-full text-left bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm active:scale-[0.99] transition-transform">
              <div class="flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${u(s.name||"Staff")}</p>
                  <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">${u(s.email||"")}</p>
                </div>
                ${ye(s)}
              </div>
              <div class="flex flex-wrap gap-2 mt-4">
                <span class="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest">${u(s.role==="manager"?"Manager":"Kellner")}</span>
                <span class="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest">${u(i)}</span>
              </div>
              <div class="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
                <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Tippen zum Bearbeiten</span>
                <span class="w-9 h-9 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center">${N("chevron-right","w-4 h-4")}</span>
              </div>
            </button>
          `}).join(""):'<div class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-16">Noch kein Staff vorhanden</div>';return`
      <div id="businessAccountsView" class="p-6 animate-in slide-in-from-right-10 duration-500 pb-24">
        <div class="flex items-center justify-between mb-6">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Business</span>
            <h2 class="text-2xl font-black italic uppercase tracking-tighter">Staff</h2>
          </div>
          <button id="businessAccountNewBtn" type="button" class="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl shadow-slate-200/60 active:scale-95">
            ${N("plus","w-4 h-4")}
          </button>
        </div>
        ${e.businessAccounts.error?`<div class="text-center text-[10px] font-black uppercase tracking-widest text-rose-500 mb-4">${u(e.businessAccounts.error)}</div>`:""}
        ${e.businessAccounts.status?`<div class="text-center text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">${u(e.businessAccounts.status)}</div>`:""}
        <div class="space-y-4">${t}</div>
      </div>
    `}function be(){return h(),V()?e.businessAccounts.view==="form"?de():fe():le()}function pe(n=document){h();const t=n||document;if(!t||e.activeTab!=="businessAccounts")return;const s=t.getElementById("businessAccountNewBtn");s&&s.dataset.bound!=="true"&&(s.dataset.bound="true",s.addEventListener("click",()=>P("create"))),t.querySelectorAll("[data-business-account-edit]").forEach(k=>{k.dataset.bound!=="true"&&(k.dataset.bound="true",k.addEventListener("click",()=>{const U=r(k.getAttribute("data-business-account-edit")),y=(e.businessAccounts.items||[]).find(B=>r(B.uid)===U);y&&P("edit",y)}))});const i=t.querySelector("[data-business-account-back]");i&&i.dataset.bound!=="true"&&(i.dataset.bound="true",i.addEventListener("click",()=>H()));const m=t.getElementById("businessAccountSaveBtn");m&&m.dataset.bound!=="true"&&(m.dataset.bound="true",m.addEventListener("click",()=>{e.businessAccounts.saving||Z()}));const l=t.getElementById("businessAccountToggleStatusBtn");l&&l.dataset.bound!=="true"&&(l.dataset.bound="true",l.addEventListener("click",()=>{e.businessAccounts.deleting||q()}))}return{ensureState:h,isBusinessOwnerUser:V,getManagedRestaurantId:C,resetForm:O,openEditor:P,closeEditor:H,syncFormFromDom:_,loadBusinessAccounts:M,saveBusinessAccountFromView:Z,toggleBusinessAccountActive:q,renderBusinessAccountsView:be,bindBusinessAccountsEvents:pe}}export{Ne as c};
