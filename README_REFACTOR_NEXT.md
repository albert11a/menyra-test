# MNYRA Refactor Next

Last updated: 2026-03-11 20:35:37 +01:00

Current local completed batch (uncommitted):
- Batch A - Self Profile / Account / Avatar Runtime Extraction.
- Local runtime extraction plus tracking updates only.
- No commit.

Current committed safe checkpoint:
- `4ebadb2` - `refactor(social): extract public bootstrap runtime`

Current exact next step:
- Review and smoke-test the local Batch A extraction.
- If approved, execute Batch B - Restaurant / Lead / Auth Resolution + Role Switch Extraction.

Current recommended next batch:
- Batch B - Restaurant / Lead / Auth Resolution + Role Switch Extraction

Why this is next:
- Batch A is now moved out locally into `core/profile/self-profile-runtime-controller.js`.
- The next untouched load-bearing profile/auth cluster in the roadmap is restaurant/lead/auth resolution plus role switching.
- It keeps the auth/profile domain moving without mixing CRM, commerce, or upload runtime.

Recommended follow-up order after Batch A:
1. Batch B - Restaurant / Lead / Auth Resolution + Role Switch Extraction
2. Batch C - Menu / Focus Public Catalog Runtime Extraction
3. Batch D - Orders Runtime + Orders View Extraction

Not the default next batch anymore:
- The pre-blueprint "Batch 16 - startup bootstrap entry sequencing reduction" label is superseded.
- The startup entry left in `social-app.js` is already relatively lean compared with the heavier runtime clusters still inside the file.

Batch A must not break:
- guest load and signed-in restore
- user profile load
- business profile load
- avatar persistence and shell avatar refresh
- settings save
- live self-profile listener updates
- comment avatar refresh for self-authored content
