function A({state:t,getOptimizedImageUrl:r,escapeHtml:c,icon:f,formatRelative:p,toDateSafe:x}={}){if(!t?.chatModal?.open||!t?.chatModal?.profile)return"";const m=typeof r=="function"?r:(a=>a||""),l=typeof c=="function"?c:(a=>String(a??"")),u=typeof f=="function"?f:(()=>""),s=typeof p=="function"?p:(a=>String(a??"")),g=typeof x=="function"?x:(a=>a),e=t.chatModal.profile,i=m(e.avatar,"avatar"),v=Array.isArray(t.chatModal.messages)?t.chatModal.messages:[];return`
    <div class="fixed inset-0 z-[65] modal-overlay" data-modal-surface="#ffffff" style="--modal-surface:#ffffff;">
      <div id="chatModalOverlay" class="absolute inset-0 bg-black/60"></div>
      <div class="modal-frame">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100 modal-sheet-85 flex flex-col overflow-hidden modal-sheet">
          <div class="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <button id="chatModalClose" class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">${u("arrow-left","w-4 h-4")}</button>
            <img src="${l(i)}" class="w-12 h-12 rounded-2xl object-cover shadow-sm" />
            <div class="min-w-0 flex-1">
              <div class="text-sm font-black text-slate-900 truncate">${l(e.name||"User")}</div>
              <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">@${l(String(e.handle||"user").replace(/^@/,""))}</div>
            </div>
          </div>
          <div id="chatMessages" class="flex-1 min-h-0 overflow-y-auto no-scrollbar modal-scroll px-5 py-4 space-y-3 bg-slate-50">
            ${v.length?v.map(a=>`
              <div class="flex ${a.from==="self"?"justify-end":"justify-start"}">
                <div class="max-w-[82%] rounded-[1.6rem] px-4 py-3 ${a.from==="self"?"bg-slate-900 text-white":"bg-white text-slate-700 border border-slate-100"}">
                  <div class="text-sm font-medium leading-relaxed whitespace-pre-wrap">${l(a.text||"")}</div>
                  <div class="text-[9px] font-bold uppercase tracking-widest mt-2 ${a.from==="self"?"text-slate-300":"text-slate-400"}">${l(s(g(a.createdAt)||new Date))}</div>
                </div>
              </div>
            `).join(""):`
              <div class="h-full flex items-center justify-center text-center py-16">
                <div>
                  <div class="w-14 h-14 rounded-[1.4rem] bg-white border border-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
                    ${u("message-circle","w-6 h-6")}
                  </div>
                  <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Noch keine Nachrichten</p>
                </div>
              </div>
            `}
          </div>
          <div class="p-4 border-t border-slate-100 bg-white modal-footer-safe">
            <div class="flex items-end gap-3">
              <textarea id="chatMessageInput" rows="1" placeholder="Nachricht..." class="flex-1 p-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-medium outline-none resize-none">${l(t.chatModal.draft||"")}</textarea>
              <button id="chatSendBtn" class="px-5 h-[52px] rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest active:scale-95">Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `}function B({state:t,isFollowingProfile:r,getOptimizedImageUrl:c,formatCount:f,escapeHtml:p,icon:x}={}){if(!t?.profileModal?.open||!t?.profileModal?.profile)return"";const m=typeof r=="function"?r:(()=>!1),l=typeof c=="function"?c:(o=>o||""),u=typeof f=="function"?f:(o=>String(o??"0")),s=typeof p=="function"?p:(o=>String(o??"")),g=typeof x=="function"?x:(()=>""),e=t.profileModal.profile,i=m(e),v=!!e.pendingFollowRequest&&!i,a=!!e.privateAccount&&e.uid&&String(e.uid)!==String(t.user?.uid||"")&&!i,h=e.restaurantId?"Business":"User",b=l(e.avatar,"avatar");return`
    <div class="fixed inset-0 z-[60] modal-overlay" data-modal-surface="#ffffff" style="--modal-surface:#ffffff;">
      <div id="profileModalOverlay" class="absolute inset-0 bg-black/60"></div>
      <div class="modal-frame">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100 modal-sheet-85 flex flex-col overflow-hidden modal-sheet">
          <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll p-7">
            <div class="flex justify-end mb-4">
              <button id="profileModalClose" class="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">${g("x","w-4 h-4")}</button>
            </div>

            <div class="flex items-center gap-4">
              <img src="${s(b)}" class="w-16 h-16 rounded-2xl object-cover shadow" />
              <div class="flex-1 min-w-0">
                <p class="text-xs font-black">@${s(e.handle)}</p>
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">${s(e.location)} / ${h}</p>
              </div>
              <div class="flex items-center gap-2">

                <button id="profileFollowBtn" data-handle="${s(e.handle)}" data-target-type="${s(e.restaurantId?"restaurant":e.uid?"user":"")}" data-target-id="${s(e.restaurantId||e.uid||"")}" data-target-name="${s(e.name||"")}" data-target-avatar="${s(e.avatar||"")}" ${v?"disabled":""} class="px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform ${i?"bg-slate-100 text-slate-700":v?"bg-amber-50 text-amber-700 border border-amber-200":"bg-indigo-600 text-white shadow-xl shadow-indigo-500/20"} ${v?"cursor-default":""}">
                  ${i?"Following":v?"Requested":a?"Request":"Follow"}
                </button>
              </div>
            </div>

            <p class="mt-5 text-sm font-medium text-slate-600 leading-relaxed">${s(e.bio)}</p>

            <div class="flex gap-3 mt-6">
              <div class="flex-1 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <div class="text-lg font-black text-slate-900">${s(u(e.posts?.length||0))}</div>
                <div class="text-[9px] font-bold text-slate-400 uppercase">Posts</div>
              </div>
              <div class="flex-1 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <div class="text-lg font-black text-slate-900">${s(u(e.followers))}</div>
                <div class="text-[9px] font-bold text-slate-400 uppercase">Follower</div>
              </div>
              <div class="flex-1 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <div class="text-lg font-black text-slate-900">${s(u(e.following))}</div>
                <div class="text-[9px] font-bold text-slate-400 uppercase">Following</div>
              </div>
            </div>

            <div class="h-2"></div>
          </div>
        </div>
      </div>
    </div>
  `}function N({state:t,ensurePostMeta:r,findPostById:c,resolveLikeAvatar:f,escapeHtml:p,icon:x}={}){if(!t?.likesModal?.open||!t?.likesModal?.postId)return"";const m=typeof r=="function"?r:(()=>({})),l=typeof c=="function"?c:(()=>null),u=typeof f=="function"?f:(()=>""),s=typeof p=="function"?p:(b=>String(b??"")),g=typeof x=="function"?x:(()=>""),i=m(t.likesModal.postId).likes||[],v=l(t.likesModal.postId);return`
      <div class="fixed inset-0 z-[80] modal-overlay" data-modal-surface="#ffffff" style="--modal-surface:#ffffff;">
        <div id="likesModalOverlay" class="absolute inset-0 bg-black/70"></div>
      <div class="modal-frame">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100  flex flex-col modal-sheet-85 overflow-hidden modal-sheet">
          <div class="p-7 pb-4 flex items-center justify-between">
            <div>
              <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Likes</span>
              <h3 class="text-xl font-black italic tracking-tighter">${Number(v?.likes)||i.length} Likes</h3>
            </div>
            <button id="likesModalClose" class="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">${g("x","w-4 h-4")}</button>
          </div>

          <div class="px-7 pb-7 space-y-3 overflow-y-auto no-scrollbar modal-scroll flex-1">
            ${i.length?i.map(b=>{const o=u(b);return`
              <div class="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <img src="${s(o)}" class="w-10 h-10 rounded-2xl object-cover" />
                <div>
                  <div class="text-xs font-black">${s(b.name)}</div>
                  <div class="text-[9px] font-bold text-slate-400 uppercase">@${s(b.handle)}</div>
                </div>
              </div>
            `}).join(""):`
              <div class="text-center text-[10px] font-bold uppercase text-slate-400">Noch keine Likes</div>
            `}
          </div>
        </div>
      </div>
    </div>
  `}function R({state:t,ensurePostMeta:r,resolvePostCounts:c,getOptimizedImageUrl:f,ensureCommentShape:p,currentUserBadge:x,renderPostComments:m,formatDateLabel:l,escapeHtml:u,icon:s}={}){if(!t?.postModal?.open||!t?.postModal?.post)return"";const g=typeof r=="function"?r:(()=>({})),e=typeof c=="function"?c:(()=>({likeLabel:"0",commentLabel:"0"})),i=typeof f=="function"?f:(n=>n||""),v=typeof p=="function"?p:(n=>n||{}),a=typeof x=="function"?x:(()=>({uid:"",handle:""})),h=typeof m=="function"?m:(()=>""),b=typeof l=="function"?l:(n=>String(n??"")),o=typeof u=="function"?u:(n=>String(n??"")),w=typeof s=="function"?s:(()=>""),d=t.postModal.post,y=g(d.id),$=e(d),k=d.caption||d.title||"",F=d.url||d.image||"",S=i(F,"large",{stableKey:d?.id?`post-modal:${String(d.id)}`:""}),M=(y.comments||[]).map(v),j=a(),C=y.likes?.some(n=>n.uid===j.uid||n.handle===j.handle),L=M.find(n=>n.id===t.postModal.replyTo);return`
      <div class="fixed inset-0 z-[70] modal-overlay" data-modal-surface="#ffffff" style="--modal-surface:#ffffff;">
        <div id="postModalOverlay" class="absolute inset-0 bg-black/60"></div>
        <div class="modal-frame">
          <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100  flex flex-col modal-sheet-85 overflow-hidden modal-sheet">
            <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll p-7">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Post</span>
                  <h3 class="text-xl font-black italic tracking-tighter">${o(b(d.createdAt||new Date))}</h3>
                  <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Foto</p>
                </div>
                <button id="postModalClose" type="button" class="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">${w("x","w-4 h-4")}</button>
              </div>

              <div class="rounded-[2.5rem] overflow-hidden shadow-lg border border-slate-100">
                <img src="${o(S)}" data-img-key="post-modal:${o(d.id)}" class="w-full h-[22rem] object-cover" loading="eager" fetchpriority="high" decoding="sync" />
              </div>

              ${k?`
                <div class="mt-4 text-sm text-slate-600 leading-relaxed">${o(k)}</div>
              `:""}

              <div class="mt-4 flex items-center justify-between">
                <button id="postLikeBtn" data-post-id="${o(d.id)}" class="flex items-center gap-2 text-sm font-black ${C?"text-rose-500":"text-slate-700"}">
                  ${w("heart","w-5 h-5")} ${C?"Gefaellt":"Like"}
                </button>
                <div class="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <button id="postLikesBtn" data-post-id="${o(d.id)}" class="hover:text-slate-700">${o($.likeLabel)} Likes</button>
                  <span id="postCommentsCount">${o($.commentLabel)} Kommentare</span>
                </div>
              </div>

              <div id="postModalComments" class="mt-5 space-y-4">
                ${h(M)}
              </div>

              ${L?`
                <div class="mt-4 flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div class="text-[10px] font-bold uppercase text-slate-400">Antwort an @${o(L.handle)}</div>
                  <button id="postReplyCancel" class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Abbrechen</button>
                </div>
              `:""}
            </div>

            <div class="p-7 pt-4 border-t border-slate-100 bg-white modal-footer-safe">
              <div class="flex gap-3">
                <textarea id="postCommentInput" placeholder="Schreib einen Kommentar..." class="flex-1 p-4 rounded-2xl border border-slate-100 bg-white text-sm font-medium outline-none resize-none" rows="2">${o(t.postModal.commentText||"")}</textarea>
                <button id="postCommentSend" type="button" data-post-id="${o(d.id)}" class="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-500/20">
                  ${w("send","w-4 h-4")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `}export{A as renderChatModalCore,N as renderLikesModalCore,R as renderPostModalCore,B as renderProfileModalCore};
