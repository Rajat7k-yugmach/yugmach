# Architecture Decision Records

## ADR-001 — Design system owned in-repo (no Design-Prompt handoff)

**Date:** 2026-08-08  
**Status:** Accepted  
**Context:** Build prompt prefers design-phase HTML/Tailwind output; none was attached. Client directed: decide UI/UX without depending on `YUGMACH-Design-Prompt.md`.  
**Decision:** Lock an industrial charcoal + safety-amber system with Sora / IBM Plex Sans / Noto Sans Devanagari. Documented in `frontend/docs/design-system.md` and encoded in `frontend` CSS tokens.  
**Consequences:** Visual work proceeds in Phase 0. Design Prompt file is reference-only, not authoritative.

## ADR-002 — Two sibling repos under `YugMach Projects`

**Date:** 2026-08-08  
**Status:** Accepted  
**Context:** Architecture specifies `yugmach-backend` + `yugmach-web`. Client asked for folder names `frontend` / `backend`.  
**Decision:** Paths are `YugMach Projects/backend` and `YugMach Projects/frontend` (mirrors ThePgCompany layout). Package/project names remain `yugmach-backend` / `yugmach-web`.  
**Consequences:** Separate git roots; multi-root Cursor workspace.

## ADR-003 — Specs as JSONB + global SpecField registry

**Date:** 2026-08-08  
**Status:** Accepted (from Architecture §2b)  
**Decision:** `Product.specs` JSONField + GIN index; global `SpecField` registry with optional MachineType/Application narrowing. Not OldMachine EAV.  
**Consequences:** Faster SSG reads; admin adds specs without migrations.

## ADR-004 — Celery eager in local Phase 0 when Redis absent

**Date:** 2026-08-08  
**Status:** Accepted  
**Context:** Redis not installed locally; Docker unavailable.  
**Decision:** `CELERY_TASK_ALWAYS_EAGER=True` in `dev` settings until Redis is available. Revalidation still runs (synchronously). Production uses Celery + ElastiCache.  
**Consequences:** Admin saves block briefly on webhook; acceptable for local Phase 0 only.
