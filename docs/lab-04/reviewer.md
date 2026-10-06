# Lab 4 Reviewer Record

> Updated through PR #53 (merged on 2026-10-06). Final `lab4-staging` → `main` review is still pending.

## My Information

| Field | Detail |
|---|---|
| **Name** | Kittithat Disthanakornkun |
| **Student ID** | 67070501004 |
| **GitHub Username** | [JeffMerry](https://github.com/JeffMerry) |
| **Repository** | [JeffMerry/toktickit](https://github.com/JeffMerry/toktickit) |

---

## Peer Reviewer (Primary)

| Field | Detail |
|---|---|
| **Reviewer Name** | Thanatip Nitinantakul |
| **Reviewer Student ID** | 67070501023 |
| **Reviewer GitHub Username** | [THN4](https://github.com/THN4) |

---

## Pull Requests Reviewed

> My partner reviewed these PRs in [JeffMerry/toktickit](https://github.com/JeffMerry/toktickit). Each feature PR targeted `lab4-staging`.

### PR 1 — `feature/19-lab4-spec-docs` → `lab4-staging`

| Field | Detail |
|---|---|
| **Related Issue** | [#41 — Lab 4 engineering contract and delivery plan](https://github.com/JeffMerry/toktickit/issues/41) |
| **PR Link** | [PR #48](https://github.com/JeffMerry/toktickit/pull/48) |
| **Reviewer** | Thanatip Nitinantakul ([@THN4](https://github.com/THN4)) |
| **Review Comment** | Approved the Actions Taken, workflow, dashboard, migration, and test contracts; suggested clarifying active/recent dashboard metrics and related tests during implementation. |
| **My Response** | Continued implementation from the reviewed contract and refined dashboard calculations and test coverage in later work. |
| **Outcome** | Approved and merged on 2026-09-29 (UTC). |

---

### PR 2 — `feature/20-lab4-actions-api` → `lab4-staging`

| Field | Detail |
|---|---|
| **Related Issue** | [#42 — Lab 4 Actions Taken database and API foundation](https://github.com/JeffMerry/toktickit/issues/42) |
| **PR Link** | [PR #49](https://github.com/JeffMerry/toktickit/pull/49) |
| **Reviewer** | Thanatip Nitinantakul ([@THN4](https://github.com/THN4)) |
| **Review Comment** | Requested that reseeding preserve user-created Actions Taken and their audit events, plus regression coverage for cancellation and terminal-state behavior. |
| **My Response** | Changed the seed to upsert its own stable fixtures without deleting user-created Actions or audit history, and added the cancellation regression test. |
| **Outcome** | Changes requested, then approved and merged on 2026-10-01 (UTC). |

---

### PR 3 — `feature/21-lab4-actions-ui` → `lab4-staging`

| Field | Detail |
|---|---|
| **Related Issue** | [#43 — Lab 4 Actions Taken ticket detail UI](https://github.com/JeffMerry/toktickit/issues/43) |
| **PR Link** | [PR #50](https://github.com/JeffMerry/toktickit/pull/50) |
| **Reviewer** | Thanatip Nitinantakul ([@THN4](https://github.com/THN4)) |
| **Review Comment** | Requested safe conflict reload so stale form values cannot overwrite newer edits, and a separate retry path when assignee lookup fails. |
| **My Response** | Reloaded the latest Action values into the edit form and kept the Action list visible with an independent assignee-lookup retry; added client tests. |
| **Outcome** | Changes requested, then approved and merged on 2026-10-02 (UTC). |

---

### PR 4 — `feature/22-lab4-ticket-workflow` → `lab4-staging`

| Field | Detail |
|---|---|
| **Related Issue** | [#44 — Lab 4 final ticket workflow and resolution behavior](https://github.com/JeffMerry/toktickit/issues/44) |
| **PR Link** | [PR #51](https://github.com/JeffMerry/toktickit/pull/51) |
| **Reviewer** | Thanatip Nitinantakul ([@THN4](https://github.com/THN4)) |
| **Review Comment** | Identified a race in the resolution gate: an Action could change after qualification was checked but before the Ticket status update. |
| **My Response** | Made Action mutations update the parent Ticket timestamp in the same transaction and added a stale-resolution regression case returning `409`. |
| **Outcome** | Changes requested, then approved and merged on 2026-10-04 (UTC). |

---

### PR 5 — `feature/23-lab4-dashboards` → `lab4-staging`

| Field | Detail |
|---|---|
| **Related Issues** | [#45 — dashboard metrics/API](https://github.com/JeffMerry/toktickit/issues/45) and [#46 — dashboard UI](https://github.com/JeffMerry/toktickit/issues/46) |
| **PR Link** | [PR #52](https://github.com/JeffMerry/toktickit/pull/52) |
| **Reviewer** | Thanatip Nitinantakul ([@THN4](https://github.com/THN4)) |
| **Review Comment** | Confirmed session-scoped Requester data, server-calculated Staff metrics, and drill-down navigation. Suggested clearer API examples for the My Owned and Urgent Active filters. |
| **My Response** | Kept the approved implementation and recorded the documentation clarification for follow-up. Final browser and responsive checks were assigned to the verification branch. |
| **Outcome** | Approved and merged on 2026-10-06 (UTC). |

---

### PR 6 — `feature/24-lab4-final-verification` → `lab4-staging`

| Field | Detail |
|---|---|
| **Related Issue** | [#47 — Lab 4 regression, accessibility, release evidence, and final integration](https://github.com/JeffMerry/toktickit/issues/47) |
| **PR Link** | [PR #53](https://github.com/JeffMerry/toktickit/pull/53) |
| **Reviewer** | Thanatip Nitinantakul ([@THN4](https://github.com/THN4)) |
| **Review Comment** | Confirmed the Action form closes after save, Ticket details refresh after Action changes, the 320px Staff Detail layout does not overflow, and the documented server/client/browser/screenshot checks passed. Before final release, requested the Lab 3 database migration check, manual keyboard/focus review, and verification on the integrated `lab4-staging` branch. |
| **My Response** | Thanked the reviewer and confirmed the PR could be merged. The three pre-release checks remain open; feature-branch results are recorded in [tests.md](tests.md) and [release-evidence.md](release-evidence.md). |
| **Outcome** | Approved and merged into `lab4-staging` on 2026-10-06 (UTC). The final release checks above are not yet claimed as complete. |

---

## Pull Requests I Reviewed for My Partner

> I reviewed these PRs submitted by Thanatip Nitinantakul in [THN4/toktickit](https://github.com/THN4/toktickit).

| PR | My Review Comment | Partner Response / Outcome |
|---|---|---|
| [THN4 PR #55](https://github.com/THN4/toktickit/pull/55) — engineering contract | Checked the Actions Taken model, workflow, dashboard calculations, authorization, migration, API/UI contracts, and test plan. No blocking issue. | Approved and merged. |
| [THN4 PR #56](https://github.com/THN4/toktickit/pull/56) — Actions foundation | Checked additive migration, stable fixtures, server-derived actors, idempotency, version checks, lifecycle, and audit coverage. | Approved and merged. |
| [THN4 PR #57](https://github.com/THN4/toktickit/pull/57) — Actions UI | Requested that a failed assignee lookup not hide an otherwise readable Action list, with independent retry and regression coverage. | Partner fixed the failure isolation and tests; re-reviewed, approved, and merged. |
| [THN4 PR #58](https://github.com/THN4/toktickit/pull/58) — Ticket workflow | Checked transition rules, confirmation, resolution prerequisites, backend version checks, UI recovery, and tests. | Approved and merged. |
| [THN4 PR #59](https://github.com/THN4/toktickit/pull/59) — dashboards | Requested one globally ordered top-five attention query instead of concatenating two limited lists. | Partner changed the query and added regression coverage; re-reviewed, approved, and merged. |
| [THN4 PR #60](https://github.com/THN4/toktickit/pull/60) — final hardening | Checked accessible labels/errors, dialog focus handling, responsive checks, browser flows, and evidence. The unavailable PostgreSQL rerun was correctly left pending. | Approved and merged. |

---


## Final Review Evidence Checklist

- [x] Completed Lab 4 feature PRs #48–#53 and their reviewer feedback are linked.
- [x] Reviewer identity, requested changes, responses, and merge outcomes are recorded.
- [x] Partner PR reviews #55–#60 are recorded separately from my repository.
- [x] Final-verification PR for `feature/24-lab4-final-verification` is reviewed and merged.
