# Glymphatic Capture: Fae's Filigree Materials Pricing

Date: 2026-05-26
Project: `faesfiligree`
PR: https://github.com/ProgrammingDrak/faesfiligree/pull/5
Merge commit: `9984fc2d140407d1c14d648fa4ffe710575edfc1`

## What Was Done

- Updated the admin Materials form so a user can enter either total `Price paid ($)` or `Cost/unit ($)` after entering purchase quantity.
- Added two-way UI math:
  - Total price / quantity fills cost per unit.
  - Cost per unit * quantity fills total price.
  - Quantity changes recalculate whichever companion value was not the last edited source.
- Updated the materials server action so it accepts either total purchase cost or cost per unit and still stores both `purchaseCost` and `costPerUnit`.
- Created branch `codex/material-price-inputs`, opened PR #5, and squash-merged it into `main`.
- Synced local `main` to `origin/main` after merge and deleted the local feature branch.

## Validation

- `npx tsc --noEmit` passed.
- `npm run build` compiled and typechecked locally, then failed during static page data collection because the local database was missing `faesfiligree.Product`; this looked unrelated to the materials form change.
- A fresh local dev server on `http://localhost:3010` returned `200` for `/admin/materials`.
- In-app browser verification timed out, so browser-level interaction QA was not completed.

## Deployment / Source Of Truth Notes

- The repo is currently configured for Render via `render.yaml`.
- Render deploys from `main`.
- Render build command includes `npm ci && npx prisma generate && npx prisma db push && npm run build`.
- Database source of truth is Supabase through configured `DATABASE_URL` / `DIRECT_URL`.
- GitHub still attached a stale Vercel status check to PR #5. That signal caused confusion and should not be treated as the deployment source of truth for this project.

## Follow-Up Tasks

- Confirm Render deploy for merge commit `9984fc2d140407d1c14d648fa4ffe710575edfc1` completed successfully.
- Remove or disable the stale Vercel GitHub integration/status check for `ProgrammingDrak/faesfiligree`, or document clearly that it is obsolete.
- Verify `/admin/materials` in the live Render app against Supabase data.
- Manually test the Materials form in browser:
  - Quantity `4`, total price `20.00` should fill unit price `5.00`.
  - Quantity `4`, unit price `5.00` should fill total price `20.00`.
  - Editing quantity after entering total should update unit price.
  - Editing quantity after entering unit price should update total.
  - Editing an existing material should preload both total and unit values correctly.
- Decide whether the remote branch `origin/codex/material-price-inputs` should be deleted after merge.
- Investigate why the Codex in-app browser timed out against local Next routes while direct HTTP checks succeeded.
- Consider adding focused tests for materials price parsing once the project has a frontend/server action test pattern.

## Lessons / Routing Candidates

- Deployment checks should be interpreted through the project's current source-of-truth matrix. For this repo, Render/Supabase signals matter; stale Vercel checks are noise unless explicitly reactivated.
- PR merge flow should include a quick deployment-provider sanity check before treating GitHub status names as authoritative.
- Local build failures caused by missing database state should be logged separately from code validation so they do not obscure the actual risk of a small UI/server-action change.
