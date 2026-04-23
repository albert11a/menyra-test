# Menyra Profile Instant Load Fix - Phase 1 (Safe Execution)

## Status: ✅ EXECUTING Steps 1-2b

### ✅ Step 1: PUBLIC PROFILE - Skeleton → Posts → Menu
**Target:** `apps/menyra-social/core/profile/public-profile-runtime-controller.js`
```
Status: ⏳ PENDING → read_file → edit_file
```

### ✅ Step 2a: SELF PROFILE - Loading Overlay (No Wipe)
**Target:** `apps/menyra-social/core/app-shell/session-runtime-cluster.js`
```
Status: ⏳ PENDING → read_file → edit_file  
```

### ✅ Step 2b: Background Parallel (Pure)
**Target:** `apps/menyra-social/core/auth/tab-auth-load-utils.js`
```
Status: ⏳ PENDING → read_file → edit_file
```

## Execution Safeguards Applied
```
✅ Posts/menu parallel start (no sequential hostage)
✅ loading cleared in finally blocks  
✅ Overlay > wipe (preserve good data)
✅ Scope: 3 files only
✅ No new caches/truth sources
```

## Success Metrics
```
Target TTI: 100-200ms skeleton
Profile posts: Visible < 800ms  
No flicker/stuck loading
Menu fills without blocking
```

## Next After Completion
```
1. Test: `npm run dev` → Profile open timing
2. Measure: DevTools Performance tab
3. Verify: No loading stuck, correct refresh
4. Phase 2 → Leads tab (if approved)
```

**Current Phase:** Executing Step 1 → Parallel read_file calls

