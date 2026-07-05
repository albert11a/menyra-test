import{t as y}from"./domain-app-events-DDnY58xk.js";import"./domain-auth-GDqJX7rW.js";function z({state:o,getOptimizedImageUrl:p,escapeHtml:x,icon:u,formatRelative:v,toDateSafe:b}={}){if(!o?.chatModal?.open||!o?.chatModal?.profile)return"";const h=typeof p=="function"?p:(l=>l||""),d=typeof x=="function"?x:(l=>String(l??"")),m=typeof u=="function"?u:(()=>""),t=(l,$=l,e={})=>y(l,{fallback:$,params:e}),w=typeof v=="function"?v:(l=>String(l??"")),a=typeof b=="function"?b:(l=>l),s=o.chatModal.profile,f=h(s.avatar,"avatar"),g=Array.isArray(o.chatModal.messages)?o.chatModal.messages:[];return`
    <div class="fixed inset-0 z-[65] modal-overlay" data-modal-surface="#ffffff" style="--modal-surface:#ffffff;">
      <div id="chatModalOverlay" class="absolute inset-0 bg-black/60"></div>
      <div class="modal-frame">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100 modal-sheet-85 flex flex-col overflow-hidden modal-sheet">
          <div class="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <button id="chatModalClose" class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">${m("arrow-left","w-4 h-4")}</button>
            <img src="${d(f)}" class="w-12 h-12 rounded-2xl object-cover shadow-sm" />
            <div class="min-w-0 flex-1">
              <div class="text-sm font-black text-slate-900 truncate">${d(s.name||"User")}</div>
              <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">@${d(String(s.handle||"user").replace(/^@/,""))}</div>
            </div>
          </div>
          <div id="chatMessages" class="flex-1 min-h-0 overflow-y-auto no-scrollbar modal-scroll px-5 py-4 space-y-3 bg-slate-50">
            ${g.length?g.map(l=>`
              <div class="flex ${l.from==="self"?"justify-end":"justify-start"}">
                <div class="max-w-[82%] rounded-[1.6rem] px-4 py-3 ${l.from==="self"?"bg-slate-900 text-white":"bg-white text-slate-700 border border-slate-100"}">
                  <div class="text-sm font-medium leading-relaxed whitespace-pre-wrap">${d(l.text||"")}</div>
                  <div class="text-[9px] font-bold uppercase tracking-widest mt-2 ${l.from==="self"?"text-slate-300":"text-slate-400"}">${d(w(a(l.createdAt)||new Date))}</div>
                </div>
              </div>
            `).join(""):`
              <div class="h-full flex items-center justify-center text-center py-16">
                <div>
                  <div class="w-14 h-14 rounded-[1.4rem] bg-white border border-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
                    ${m("message-circle","w-6 h-6")}
                  </div>
                  <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">${d(t("chat.empty","Noch keine Nachrichten"))}</p>
                </div>
              </div>
            `}
          </div>
          <div class="p-4 border-t border-slate-100 bg-white modal-footer-safe">
            <div class="flex items-end gap-3">
              <textarea id="chatMessageInput" rows="1" placeholder="${d(t("chat.placeholder","Nachricht..."))}" class="flex-1 p-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-medium outline-none resize-none">${d(o.chatModal.draft||"")}</textarea>
              <button id="chatSendBtn" class="px-5 h-[52px] rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest active:scale-95">${d(t("chat.send","Senden"))}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `}function K({state:o,isFollowingProfile:p,getOptimizedImageUrl:x,formatCount:u,escapeHtml:v,icon:b}={}){if(!o?.profileModal?.open||!o?.profileModal?.profile)return"";const h=typeof p=="function"?p:(()=>!1),d=typeof x=="function"?x:(i=>i||""),m=typeof u=="function"?u:(i=>String(i??"0")),t=typeof v=="function"?v:(i=>String(i??"")),w=typeof b=="function"?b:(()=>""),a=(i,c=i,n={})=>y(i,{fallback:c,params:n}),s=o.profileModal.profile,f=h(s),g=!!s.pendingFollowRequest&&!f,l=!!s.privateAccount&&s.uid&&String(s.uid)!==String(o.user?.uid||"")&&!f,$=s.restaurantId?a("profile.business","Business"):a("profile.user","User"),e=d(s.avatar,"avatar");return`
    <div class="fixed inset-0 z-[60] modal-overlay" data-modal-surface="#ffffff" style="--modal-surface:#ffffff;">
      <div id="profileModalOverlay" class="absolute inset-0 bg-black/60"></div>
      <div class="modal-frame">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100 modal-sheet-85 flex flex-col overflow-hidden modal-sheet">
          <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll p-7">
            <div class="flex justify-end mb-4">
              <button id="profileModalClose" class="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">${w("x","w-4 h-4")}</button>
            </div>

            <div class="flex items-center gap-4">
              <img src="${t(e)}" class="w-16 h-16 rounded-2xl object-cover shadow" />
              <div class="flex-1 min-w-0">
                <p class="text-xs font-black">@${t(s.handle)}</p>
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">${t(s.location)} / ${$}</p>
              </div>
              <div class="flex items-center gap-2">

                <button id="profileFollowBtn" data-handle="${t(s.handle)}" data-target-type="${t(s.restaurantId?"restaurant":s.uid?"user":"")}" data-target-id="${t(s.restaurantId||s.uid||"")}" data-target-name="${t(s.name||"")}" data-target-avatar="${t(s.avatar||"")}" ${g?"disabled":""} class="px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform ${f?"bg-slate-100 text-slate-700":g?"bg-amber-50 text-amber-700 border border-amber-200":"bg-indigo-600 text-white shadow-xl shadow-indigo-500/20"} ${g?"cursor-default":""}">
                  ${t(f?a("profile.following","Folge ich"):g?a("profile.requested","Angefragt"):l?a("profile.request","Anfragen"):a("profile.follow","Folgen"))}
                </button>
              </div>
            </div>

            <p class="mt-5 text-sm font-medium text-slate-600 leading-relaxed">${t(s.bio)}</p>

            <div class="flex gap-3 mt-6">
              <div class="flex-1 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <div class="text-lg font-black text-slate-900">${t(m(s.posts?.length||0))}</div>
                <div class="text-[9px] font-bold text-slate-400 uppercase">${t(a("profile.posts","Beitraege"))}</div>
              </div>
              <div class="flex-1 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <div class="text-lg font-black text-slate-900">${t(m(s.followers))}</div>
                <div class="text-[9px] font-bold text-slate-400 uppercase">${t(a("profile.followers","Follower"))}</div>
              </div>
              <div class="flex-1 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <div class="text-lg font-black text-slate-900">${t(m(s.following))}</div>
                <div class="text-[9px] font-bold text-slate-400 uppercase">${t(a("profile.followingCount","Folgt"))}</div>
              </div>
            </div>

            <div class="h-2"></div>
          </div>
        </div>
      </div>
    </div>
  `}function R({state:o,ensurePostMeta:p,findPostById:x,resolveLikeAvatar:u,escapeHtml:v,icon:b}={}){if(!o?.likesModal?.open||!o?.likesModal?.postId)return"";const h=typeof p=="function"?p:(()=>({})),d=typeof x=="function"?x:(()=>null),m=typeof u=="function"?u:(()=>""),t=typeof v=="function"?v:(e=>String(e??"")),w=typeof b=="function"?b:(()=>""),a=(e,i=e,c={})=>y(e,{fallback:i,params:c}),f=h(o.likesModal.postId).likes||[],g=d(o.likesModal.postId),l=Number(g?.likes)||f.length;return`
      <div class="fixed inset-0 z-[80] modal-overlay" data-modal-surface="#ffffff" style="--modal-surface:#ffffff;">
        <div id="likesModalOverlay" class="absolute inset-0 bg-black/70"></div>
      <div class="modal-frame">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100  flex flex-col modal-sheet-85 overflow-hidden modal-sheet">
          <div class="p-7 pb-4 flex items-center justify-between">
            <div>
              <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${t(a("likes.count","Likes"))}</span>
              <h3 class="text-xl font-black italic tracking-tighter">${l} ${t(a("likes.count","Likes"))}</h3>
            </div>
            <button id="likesModalClose" class="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">${w("x","w-4 h-4")}</button>
          </div>

          <div class="px-7 pb-7 space-y-3 overflow-y-auto no-scrollbar modal-scroll flex-1">
            ${f.length?f.map(e=>{const i=m(e);return`
              <div class="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <img src="${t(i)}" class="w-10 h-10 rounded-2xl object-cover" />
                <div>
                  <div class="text-xs font-black">${t(e.name)}</div>
                  <div class="text-[9px] font-bold text-slate-400 uppercase">@${t(e.handle)}</div>
                </div>
              </div>
            `}).join(""):`
              <div class="text-center text-[10px] font-bold uppercase text-slate-400">${t(a("likes.empty","Noch keine Likes"))}</div>
            `}
          </div>
        </div>
      </div>
    </div>
  `}function D({state:o,ensurePostMeta:p,resolvePostCounts:x,getOptimizedImageUrl:u,ensureCommentShape:v,currentUserBadge:b,renderPostComments:h,formatDateLabel:d,escapeHtml:m,icon:t}={}){if(!o?.postModal?.open||!o?.postModal?.post)return"";const w=typeof p=="function"?p:(()=>({})),a=typeof x=="function"?x:(()=>({likeLabel:"0",commentLabel:"0"})),s=typeof u=="function"?u:(r=>r||""),f=typeof v=="function"?v:(r=>r||{}),g=typeof b=="function"?b:(()=>({uid:"",handle:""})),l=typeof h=="function"?h:(()=>""),$=typeof d=="function"?d:(r=>String(r??"")),e=typeof m=="function"?m:(r=>String(r??"")),i=typeof t=="function"?t:(()=>""),c=(r,B=r,N={})=>y(r,{fallback:B,params:N}),n=o.postModal.post,k=w(n.id),M=a(n),j=n.caption||n.title||"",A=n.url||n.image||"",I=s(A,"large",{stableKey:n?.id?`post-modal:${String(n.id)}`:""}),C=(k.comments||[]).map(f),L=g(),F=k.likes?.some(r=>r.uid===L.uid||r.handle===L.handle),S=C.find(r=>r.id===o.postModal.replyTo);return`
      <div class="fixed inset-0 z-[70] modal-overlay" data-modal-surface="#ffffff" style="--modal-surface:#ffffff;">
        <div id="postModalOverlay" class="absolute inset-0 bg-black/60"></div>
        <div class="modal-frame">
          <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100  flex flex-col modal-sheet-85 overflow-hidden modal-sheet">
            <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll p-7">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${e(c("post.title","Post"))}</span>
                  <h3 class="text-xl font-black italic tracking-tighter">${e($(n.createdAt||new Date))}</h3>
                  <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">${e(c("post.photo","Foto"))}</p>
                </div>
                <button id="postModalClose" type="button" class="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">${i("x","w-4 h-4")}</button>
              </div>

              <div class="rounded-[2.5rem] overflow-hidden shadow-lg border border-slate-100">
                <img src="${e(I)}" data-img-key="post-modal:${e(n.id)}" class="w-full h-[22rem] object-cover" loading="eager" fetchpriority="high" decoding="sync" />
              </div>

              ${j?`
                <div class="mt-4 text-sm text-slate-600 leading-relaxed">${e(j)}</div>
              `:""}

              <div class="mt-4 flex items-center justify-between">
                <button id="postLikeBtn" data-post-id="${e(n.id)}" class="flex items-center gap-2 text-sm font-black ${F?"text-rose-500":"text-slate-700"}">
                  ${i("heart","w-5 h-5")} ${e(F?c("likes.liked","Gefaellt"):c("likes.like","Like"))}
                </button>
                <div class="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <button id="postLikesBtn" data-post-id="${e(n.id)}" class="hover:text-slate-700">${e(M.likeLabel)} ${e(c("likes.count","Likes"))}</button>
                  <span id="postCommentsCount">${e(M.commentLabel)} ${e(c("comments.count","Kommentare"))}</span>
                </div>
              </div>

              <div id="postModalComments" class="mt-5 space-y-4">
                ${l(C)}
              </div>

              ${S?`
                <div class="mt-4 flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div class="text-[10px] font-bold uppercase text-slate-400">${e(c("post.replyTo","Antwort an @{handle}",{handle:S.handle}))}</div>
                  <button id="postReplyCancel" class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">${e(c("common.cancel","Abbrechen"))}</button>
                </div>
              `:""}
            </div>

            <div class="p-7 pt-4 border-t border-slate-100 bg-white modal-footer-safe">
              <div class="flex gap-3">
                <textarea id="postCommentInput" placeholder="${e(c("menu.commentPlaceholder","Schreib einen Kommentar..."))}" class="flex-1 p-4 rounded-2xl border border-slate-100 bg-white text-sm font-medium outline-none resize-none" rows="2">${e(o.postModal.commentText||"")}</textarea>
                <button id="postCommentSend" type="button" data-post-id="${e(n.id)}" class="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-500/20">
                  ${i("send","w-4 h-4")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `}export{z as renderChatModalCore,R as renderLikesModalCore,D as renderPostModalCore,K as renderProfileModalCore};
