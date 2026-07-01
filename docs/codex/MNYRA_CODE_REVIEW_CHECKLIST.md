# Mnyra Code Review Checklist

Status: CURRENT
Last updated: 2026-07-01

## Scope

- Is the step small and reversible?
- Is it inside the agreed branch and task scope?
- Are unrelated files untouched?
- Is there a clear rollback path?

## Product Safety

- No visible UI/design change unless approved.
- No route change unless approved.
- No Firestore collection rename.
- No old logic deletion hidden inside prep work.
- No production Firebase data or deploy command.

## Runtime Boundaries

- Does `shared` stay app-independent?
- Do browser apps avoid importing `functions` internals?
- Does Waiter stay staff/order scoped?
- Does Heart stay CRM/admin scoped?
- Do public runtimes avoid owner/editor/CRM dependencies?

## Data And Security

- Are direct client writes inventoried?
- Are counters protected?
- Are public reads intentionally public?
- Are private user fields protected?
- Are guest order writes constrained?

## Tests And Reports

- Unit tests relevant to the changed surface.
- Rules test TODO or implementation for security-sensitive surfaces.
- Architecture report updated when imports change.
- Bundle report updated when build shape changes.
- Manual test list included.

## Merge Readiness

- Checks are green or failures are documented.
- Skipped tests are explained.
- Feature flags default to false.
- Summary includes changed files, commands, risks and next step.
