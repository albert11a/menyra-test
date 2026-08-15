import{t as $}from"./domain-feed-social-eager-DgYWBYpV.js";import"./domain-auth-CdW0dNSS.js";import"./domain-public-profile-mLQti0eH.js";import"./domain-media-eager-DAUyCk2O.js";import"./domain-menu-eager-CaxlJ-Ao.js";function P({state:a,getOptimizedImageUrl:p,escapeHtml:u,icon:x,formatRelative:v,toDateSafe:b}={}){if(!a?.chatModal?.open||!a?.chatModal?.profile)return"";const h=typeof p=="function"?p:(l=>l||""),n=typeof u=="function"?u:(l=>String(l??"")),m=typeof x=="function"?x:(()=>""),t=(l,y=l,e={})=>$(l,{fallback:y,params:e}),w=typeof v=="function"?v:(l=>String(l??"")),i=typeof b=="function"?b:(l=>l),o=a.chatModal.profile,f=h(o.avatar,"avatar"),g=Array.isArray(a.chatModal.messages)?a.chatModal.messages:[];return`
    <div class="fixed inset-0 z-[65] modal-overlay" data-modal-surface="#ffffff" style="--modal-surface:#ffffff;">
      <div id="chatModalOverlay" class="absolute inset-0 bg-black/60"></div>
      <div class="modal-frame">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100 modal-sheet-85 flex flex-col overflow-hidden modal-sheet">
          <div class="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <button id="chatModalClose" class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">${m("arrow-left","w-4 h-4")}</button>
            <img src="${n(f)}" class="w-12 h-12 rounded-2xl object-cover shadow-sm" />
            <div class="min-w-0 flex-1">
              <div class="text-sm font-black text-slate-900 truncate">${n(o.name||"User")}</div>
              <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">@${n(String(o.handle||"user").replace(/^@/,""))}</div>
            </div>
          </div>
          <div id="chatMessages" class="flex-1 min-h-0 overflow-y-auto no-scrollbar modal-scroll px-5 py-4 space-y-3 bg-slate-50">
            ${g.length?g.map(l=>`
              <div class="flex ${l.from==="self"?"justify-end":"justify-start"}">
                <div class="max-w-[82%] rounded-[1.6rem] px-4 py-3 ${l.from==="self"?"bg-slate-900 text-white":"bg-white text-slate-700 border border-slate-100"}">
                  <div class="text-sm font-medium leading-relaxed whitespace-pre-wrap">${n(l.text||"")}</div>
                  <div class="text-[9px] font-bold uppercase tracking-widest mt-2 ${l.from==="self"?"text-slate-300":"text-slate-400"}">${n(w(i(l.createdAt)||new Date))}</div>
                </div>
              </div>
            `).join(""):`
              <div class="h-full flex items-center justify-center text-center py-16">
                <div>
                  <div class="w-14 h-14 rounded-[1.4rem] bg-white border border-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
                    ${m("message-circle","w-6 h-6")}
                  </div>
                  <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">${n(t("chat.empty","Ende nuk ka mesazhe"))}</p>
                </div>
              </div>
            `}
          </div>
          <div class="p-4 border-t border-slate-100 bg-white modal-footer-safe">
            <div class="flex items-end gap-3">
              <textarea id="chatMessageInput" rows="1" placeholder="${n(t("chat.placeholder","Nachricht..."))}" class="flex-1 p-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-medium outline-none resize-none">${n(a.chatModal.draft||"")}</textarea>
              <button id="chatSendBtn" class="px-5 h-[52px] rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest active:scale-95">${n(t("chat.send","Senden"))}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `}function W({state:a,isFollowingProfile:p,getOptimizedImageUrl:u,formatCount:x,escapeHtml:v,icon:b}={}){if(!a?.profileModal?.open||!a?.profileModal?.profile)return"";const h=typeof p=="function"?p:(()=>!1),n=typeof u=="function"?u:(d=>d||""),m=typeof x=="function"?x:(d=>String(d??"0")),t=typeof v=="function"?v:(d=>String(d??"")),w=typeof b=="function"?b:(()=>""),i=(d,c=d,s={})=>$(d,{fallback:c,params:s}),o=a.profileModal.profile,f=h(o),g=!!o.pendingFollowRequest&&!f,l=!!o.privateAccount&&o.uid&&String(o.uid)!==String(a.user?.uid||"")&&!f,y=o.restaurantId?i("profile.business","Business"):i("profile.user","User"),e=n(o.avatar,"avatar");return`
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
                <p class="text-xs font-black">@${t(o.handle)}</p>
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">${t(o.location)} / ${y}</p>
              </div>
              <div class="flex items-center gap-2">

                <button id="profileFollowBtn" data-handle="${t(o.handle)}" data-target-type="${t(o.restaurantId?"restaurant":o.uid?"user":"")}" data-target-id="${t(o.restaurantId||o.uid||"")}" data-target-name="${t(o.name||"")}" data-target-avatar="${t(o.avatar||"")}" ${g?"disabled":""} class="px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform ${f?"bg-slate-100 text-slate-700":g?"bg-amber-50 text-amber-700 border border-amber-200":"bg-indigo-600 text-white shadow-xl shadow-indigo-500/20"} ${g?"cursor-default":""}">
                  ${t(f?i("profile.following","Folge ich"):g?i("profile.requested","Angefragt"):l?i("profile.request","Anfragen"):i("profile.follow","Folgen"))}
                </button>
              </div>
            </div>

            <p class="mt-5 text-sm font-medium text-slate-600 leading-relaxed">${t(o.bio)}</p>

            <div class="flex gap-3 mt-6">
              <div class="flex-1 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <div class="text-lg font-black text-slate-900">${t(m(o.posts?.length||0))}</div>
                <div class="text-[9px] font-bold text-slate-400 uppercase">${t(i("profile.posts","Beitraege"))}</div>
              </div>
              <div class="flex-1 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <div class="text-lg font-black text-slate-900">${t(m(o.followers))}</div>
                <div class="text-[9px] font-bold text-slate-400 uppercase">${t(i("profile.followers","Follower"))}</div>
              </div>
              <div class="flex-1 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <div class="text-lg font-black text-slate-900">${t(m(o.following))}</div>
                <div class="text-[9px] font-bold text-slate-400 uppercase">${t(i("profile.followingCount","Folgt"))}</div>
              </div>
            </div>

            <div class="h-2"></div>
          </div>
        </div>
      </div>
    </div>
  `}function J({state:a,ensurePostMeta:p,findPostById:u,resolveLikeAvatar:x,escapeHtml:v,icon:b}={}){if(!a?.likesModal?.open||!a?.likesModal?.postId)return"";const h=typeof p=="function"?p:(()=>({})),n=typeof u=="function"?u:(()=>null),m=typeof x=="function"?x:(()=>""),t=typeof v=="function"?v:(e=>String(e??"")),w=typeof b=="function"?b:(()=>""),i=(e,d=e,c={})=>$(e,{fallback:d,params:c}),f=h(a.likesModal.postId).likes||[],g=n(a.likesModal.postId),l=Number(g?.likes)||f.length;return`
      <div class="fixed inset-0 z-[80] modal-overlay" data-modal-surface="#ffffff" style="--modal-surface:#ffffff;">
        <div id="likesModalOverlay" class="absolute inset-0 bg-black/70"></div>
      <div class="modal-frame">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100  flex flex-col modal-sheet-85 overflow-hidden modal-sheet">
          <div class="p-7 pb-4 flex items-center justify-between">
            <div>
              <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${t(i("likes.count","Likes"))}</span>
              <h3 class="text-xl font-black italic tracking-tighter">${l} ${t(i("likes.count","Likes"))}</h3>
            </div>
            <button id="likesModalClose" class="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">${w("x","w-4 h-4")}</button>
          </div>

          <div class="px-7 pb-7 space-y-3 overflow-y-auto no-scrollbar modal-scroll flex-1">
            ${f.length?f.map(e=>{const d=m(e);return`
              <div class="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <img src="${t(d)}" class="w-10 h-10 rounded-2xl object-cover" />
                <div>
                  <div class="text-xs font-black">${t(e.name)}</div>
                  <div class="text-[9px] font-bold text-slate-400 uppercase">@${t(e.handle)}</div>
                </div>
              </div>
            `}).join(""):`
              <div class="text-center text-[10px] font-bold uppercase text-slate-400">${t(i("likes.empty","Ende nuk ka likes"))}</div>
            `}
          </div>
        </div>
      </div>
    </div>
  `}function Q({state:a,ensurePostMeta:p,resolvePostCounts:u,getOptimizedImageUrl:x,ensureCommentShape:v,currentUserBadge:b,renderPostComments:h,formatDateLabel:n,escapeHtml:m,icon:t}={}){if(!a?.postModal?.open||!a?.postModal?.post)return"";const w=typeof p=="function"?p:(()=>({})),i=typeof u=="function"?u:(()=>({likeLabel:"0",commentLabel:"0"})),o=typeof x=="function"?x:(r=>r||""),f=typeof v=="function"?v:(r=>r||{}),g=typeof b=="function"?b:(()=>({uid:"",handle:""})),l=typeof h=="function"?h:(()=>""),y=typeof n=="function"?n:(r=>String(r??"")),e=typeof m=="function"?m:(r=>String(r??"")),d=typeof t=="function"?t:(()=>""),c=(r,q=r,K={})=>$(r,{fallback:q,params:K}),s=a.postModal.post,M=w(s.id),j=i(s),C=s.caption||s.title||"",T=s.url||s.image||"",z=o(T,"large",{stableKey:s?.id?`post-modal:${String(s.id)}`:""}),S=s.isVideo===!0||String(s.mediaType||"").trim().toLowerCase()==="video",L=S?String(s.videoUrl||s.url||"").trim():"",F=String(s.posterUrl||s.poster||s.thumbUrl||"").trim(),k=F?o(F,"large",{stableKey:s?.id?`post-modal-poster:${String(s.id)}`:""}):"",R=!!k&&!k.startsWith("data:"),A=(M.comments||[]).map(f),I=g(),U=M.likes?.some(r=>r.uid===I.uid||r.handle===I.handle),B=A.find(r=>r.id===a.postModal.replyTo);return`
      <div class="fixed inset-0 z-[70] modal-overlay" data-modal-surface="#ffffff" style="--modal-surface:#ffffff;">
        <div id="postModalOverlay" class="absolute inset-0 bg-black/60"></div>
        <div class="modal-frame">
          <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100  flex flex-col modal-sheet-85 overflow-hidden modal-sheet">
            <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll p-7">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${e(c("post.title","Post"))}</span>
                  <h3 class="text-xl font-black italic tracking-tighter">${e(y(s.createdAt||new Date))}</h3>
                  <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">${e(c("post.photo","Foto"))}</p>
                </div>
                <button id="postModalClose" type="button" class="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">${d("x","w-4 h-4")}</button>
              </div>

              <div class="rounded-[2.5rem] overflow-hidden shadow-lg border border-slate-100 relative">
                ${S&&L?`
                  <video id="postModalVideo" src="${e(L)}" ${R?`poster="${e(k)}"`:""} preload="auto" autoplay muted loop playsinline webkit-playsinline class="w-full h-[22rem] object-cover block"></video>
                  <button type="button" data-post-modal-video-toggle aria-label="Ndalo videon" class="absolute top-4 left-4 z-10 w-11 h-11 rounded-full bg-black/45 text-white border border-white/20 shadow-lg backdrop-blur-md flex items-center justify-center">
                    <span data-post-modal-video-icon="play" class="hidden">${d("play","w-4 h-4")}</span>
                    <span data-post-modal-video-icon="pause">${d("pause","w-4 h-4")}</span>
                  </button>
                `:`
                  <img src="${e(z)}" data-img-key="post-modal:${e(s.id)}" class="w-full h-[22rem] object-cover" loading="eager" fetchpriority="high" decoding="sync" />
                `}
              </div>

              ${C?`
                <div class="mt-4 text-sm text-slate-600 leading-relaxed">${e(C)}</div>
              `:""}

              <div class="mt-4 flex items-center justify-between">
                <button id="postLikeBtn" data-post-id="${e(s.id)}" class="flex items-center gap-2 text-sm font-black ${U?"text-rose-500":"text-slate-700"}">
                  ${d("heart","w-5 h-5")} ${e(U?c("likes.liked","Gefaellt"):c("likes.like","Like"))}
                </button>
                <div class="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <button id="postLikesBtn" data-post-id="${e(s.id)}" class="hover:text-slate-700">${e(j.likeLabel)} ${e(c("likes.count","Likes"))}</button>
                  <span id="postCommentsCount">${e(j.commentLabel)} ${e(c("comments.count","Kommentare"))}</span>
                </div>
              </div>

              <div id="postModalComments" class="mt-5 space-y-4">
                ${l(A)}
              </div>

              ${B?`
                <div class="mt-4 flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div class="text-[10px] font-bold uppercase text-slate-400">${e(c("post.replyTo","Antwort an @{handle}",{handle:B.handle}))}</div>
                  <button id="postReplyCancel" class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">${e(c("common.cancel","Abbrechen"))}</button>
                </div>
              `:""}
            </div>

            <div class="p-7 pt-4 border-t border-slate-100 bg-white modal-footer-safe">
              <div class="flex gap-3">
                <textarea id="postCommentInput" placeholder="${e(c("menu.commentPlaceholder","Schreib einen Kommentar..."))}" class="flex-1 p-4 rounded-2xl border border-slate-100 bg-white text-sm font-medium outline-none resize-none" rows="2">${e(a.postModal.commentText||"")}</textarea>
                <button id="postCommentSend" type="button" data-post-id="${e(s.id)}" class="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-500/20">
                  ${d("send","w-4 h-4")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `}export{P as renderChatModalCore,J as renderLikesModalCore,Q as renderPostModalCore,W as renderProfileModalCore};
