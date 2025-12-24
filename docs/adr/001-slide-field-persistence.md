ADR 001 — Slide Field Persistence & Schema Evolution

Status: Accepted
Date: 2025-12-23

Context

Slide editor fields can be shown or hidden per slide type.
Hiding a field removes it from the editor UI but does not delete stored slide data.

This behavior allows:

non-destructive schema evolution

safe refactoring of activities

backward compatibility for existing lessons

Decision

The slide editor UI is a view layer only.
Stored slide data (props_json) is the source of truth and is never deleted by hiding fields.

When a field is re-enabled, previously stored values reappear automatically.

Consequences (Important)

Legacy data may exist for hidden or deprecated fields.

Player and scoring logic must not implicitly interpret unknown or legacy keys.

All activity logic must use explicit schemas (per version).

Old keys must be ignored unless intentionally migrated.

Required Safeguards

Activity schemas must be versioned (schemaVersion).

Runtime parsing must ignore unknown keys.

Deprecated fields must never influence new behavior.

If an activity is redesigned:

either keep legacy version support, or

provide an explicit migration.

Why this matters

Without these rules, legacy keys can cause "ghost bugs" that only affect old slides and are difficult to diagnose.

This behavior is intentional and correct, not a bug.

