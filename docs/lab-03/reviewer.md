# Lab 3 Reviewer Record

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

> My partner reviewed the following PRs that I submitted to `lab3-staging`.

### PR 1 — `feature/11-lab3-spec-docs` → `lab3-staging`

| Field | Detail |
|---|---|
| **Related Issue** | #11 — Lab 3 specification and test-plan documents |
| **PR Link** | [PR #26](https://github.com/JeffMerry/toktickit/pull/26) |
| **Reviewer** | Thanatip Nitinantakul ([@THN4](https://github.com/THN4)) |
| **Review Comment** | "Everything is done." |
| **My Response** | Continued implementation using the approved specification, API contract, UI specification, and test plan. |
| **Outcome** | Approved and merged on 2026-09-15. |

---

### PR 2 — `feature/12-lab3-user-database` → `lab3-staging`

| Field | Detail |
|---|---|
| **Related Issue** | #12 — Lab 3 User Database |
| **PR Link** | [PR #28](https://github.com/JeffMerry/toktickit/pull/28) |
| **Reviewer** | Thanatip Nitinantakul ([@THN4](https://github.com/THN4)) |
| **Review Comment** | Requested an unassigned seed Ticket for the claim workflow and a separate Requester-owned resolution indication that does not change the formal Ticket status. |
| **My Response** | Added nullable owner handling, an unassigned Ticket fixture, `requesterResolvedAt`, the migration, documentation, and regression coverage in `2fa94c5`. |
| **Outcome** | Changes requested, then approved and merged on 2026-09-15. |

---

### PR 3 — `feature/13-lab3-authentication` → `lab3-staging`

| Field | Detail |
|---|---|
| **Related Issue** | #13 — Lab 3 Authentication and Role Shell |
| **PR Link** | [PR #30](https://github.com/JeffMerry/toktickit/pull/30) |
| **Reviewer** | Thanatip Nitinantakul ([@THN4](https://github.com/THN4)) |
| **Review Comment** | Requested role-specific navigation so Requesters see Ticket actions, IT Staff see Queue actions, and Administrators see User Management, with client coverage. |
| **My Response** | Implemented role-specific navigation and client coverage in `c4021a6`; staff/admin sessions no longer expose Requester Ticket actions. |
| **Outcome** | Changes requested, then approved and merged on 2026-09-16. |

---

### PR 4 — `feature/14-lab3-staff-ticket-workflow` → `lab3-staging`

| Field | Detail |
|---|---|
| **Related Issue** | #31 — Staff Ticket Queue and Workflow |
| **PR Link** | [PR #32](https://github.com/JeffMerry/toktickit/pull/32) |
| **Reviewer** | Thanatip Nitinantakul ([@THN4](https://github.com/THN4)) |
| **Review Comment** | Requested clarification of the Administrator operational Ticket authorization decision. |
| **My Response** | Confirmed that the approved authorization matrix permits Administrator operational Ticket access while primary Admin navigation remains focused on User Management. |
| **Outcome** | Approved and merged on 2026-09-17. |

---

### PR 5 — `feature/15-lab3-user-management` → `lab3-staging`

| Field | Detail |
|---|---|
| **Related Issue** | #33 — Administrator User Management |
| **PR Link** | [PR #35](https://github.com/JeffMerry/toktickit/pull/35) |
| **Reviewer** | Thanatip Nitinantakul ([@THN4](https://github.com/THN4)) |
| **Review Comment** | Requested a concurrency-safe safeguard preventing concurrent requests from removing all active Administrators, plus a regression test. |
| **My Response** | Moved the active-Administrator check and update into one PostgreSQL transaction guarded by an advisory lock, and added concurrent deactivation regression coverage in `618e150`. |
| **Outcome** | Feedback addressed and merged on 2026-09-17. |

---

### PR 6 — `feature/16-lab3-release-integration` → `lab3-staging`

| Field | Detail |
|---|---|
| **Related Issue** | #34 — Release Integration and Evidence |
| **PR Link** | [PR #36](https://github.com/JeffMerry/toktickit/pull/36) |
| **Reviewer** | Thanatip Nitinantakul ([@THN4](https://github.com/THN4)) |
| **Review Comment** | "The content is comprehensive." |
| **My Response** | Confirmed the integrated release documentation, test plan, and evidence were ready for the next verification increment. |
| **Outcome** | Approved and merged on 2026-09-17. |

---

### PR 7 — `feature/17-lab3-final-evidence` → `lab3-staging`

| Field | Detail |
|---|---|
| **Related Issue** | #34 — Release Integration and Evidence |
| **PR Link** | [PR #37](https://github.com/JeffMerry/toktickit/pull/37) |
| **Reviewer** | Thanatip Nitinantakul ([@THN4](https://github.com/THN4)) |
| **Review Comment** | Requested Staff Ticket Detail screenshots at tablet/mobile widths and traceability statuses that match the implemented, executed test files. |
| **My Response** | Added the missing tablet/mobile screenshots; updated `tests.md` to mark executed coverage as `Pass`, retain unimplemented coverage as `Planned`, and recorded the follow-up capture/E2E results in `5113c0e`. |
| **Outcome** | Changes requested, then approved and merged on 2026-09-18. |

---

## Pull Requests I Reviewed for My Partner

> I reviewed the following PRs submitted by Thanatip Nitinantakul ([@THN4](https://github.com/THN4)).

### PR A — `feature/3-lab3-authorization-requester-regression` → `lab3-staging`

| Field | Detail |
|---|---|
| **PR Link** | [THN4 PR #40](https://github.com/THN4/toktickit/pull/40) |
| **My Review Comment** | Confirmed server-derived Requester identity and concealed cross-requester data; suggested explicit spoofed `requesterId` regression coverage for Ticket creation and attachment routes. |
| **Partner Response** | Added the requested regression coverage and follow-up corrections. |
| **Outcome** | Approved and merged on 2026-09-16. |

---

### PR B — `feature/4-lab3-staff-queue` → `lab3-staging`

| Field | Detail |
|---|---|
| **PR Link** | [THN4 PR #41](https://github.com/THN4/toktickit/pull/41) |
| **My Review Comment** | Requested complete Queue controls, metadata-driven pagination, Queue UI coverage, a safe Forbidden state, unique fixtures, no-results/error/retry/page-size coverage, and a mobile-safe card layout. |
| **Partner Response** | Added the missing controls and coverage, used unique fixtures, rendered a safe Forbidden state, and fixed mobile cards in `be3756c`. |
| **Outcome** | Approved and merged on 2026-09-17. |

---

### PR C — `feature/5-lab3-staff-ticket-operations` → `lab3-staging`

| Field | Detail |
|---|---|
| **PR Link** | [THN4 PR #42](https://github.com/THN4/toktickit/pull/42) |
| **My Review Comment** | Verified migration, authorization, atomic Ticket claim, workflow transitions, Public Comments/Internal Notes privacy, connected UI, and relevant tests. |
| **Partner Response** | No follow-up was required. |
| **Outcome** | Approved and merged on 2026-09-17. |

---

### PR D — `feature/6-lab3-user-management` → `lab3-staging`

| Field | Detail |
|---|---|
| **PR Link** | [THN4 PR #43](https://github.com/THN4/toktickit/pull/43) |
| **My Review Comment** | Requested a mobile card/list layout without horizontal table scrolling and accessible field-level validation for user forms. |
| **Partner Response** | Added mobile cards, field-specific API errors, accessible `aria-invalid`/`aria-describedby` feedback, and responsive/validation tests. |
| **Outcome** | Approved and merged on 2026-09-18. |

---

### PR E — `feature/7-lab3-quality-evidence` → `lab3-staging`

| Field | Detail |
|---|---|
| **PR Link** | [THN4 PR #44](https://github.com/THN4/toktickit/pull/44) |
| **My Review Comment** | Requested that `page.route()` browser tests be classified as mocked UI integration rather than real server/session/database E2E evidence. |
| **Partner Response** | Reclassified the mocked browser tests, kept real E2E entries pending, and updated README/traceability and responsive visual evidence. |
| **Outcome** | Approved and merged on 2026-09-18. |

---

### PR F — `feature/8-lab3-real-e2e` → `lab3-staging`

| Field | Detail |
|---|---|
| **PR Link** | [THN4 PR #45](https://github.com/THN4/toktickit/pull/45) |
| **My Review Comment** | Verified that the real suite uses the Vite client, Express server, PostgreSQL-backed fixtures, and session cookies without API mocking. |
| **Partner Response** | No follow-up was required. |
| **Outcome** | Approved and merged on 2026-09-19. |

---

## Release Pull Request

### `lab3-staging` → `main`

| Field | Detail |
|---|---|
| **PR Link** | Pending — create after final documentation review. |
| **Final Commit SHA** | Pending — record the tested `main` candidate SHA. |
| **Reviewer** | Pending |
| **Review Comment(s)** | Pending |
| **My Response(s)** | Pending |
| **Test Evidence** | Re-run the documented build, server/client test, real E2E, and evidence commands from the final release candidate. |
| **Outcome** | Pending review |

## Final Review Evidence Checklist

- [x] Completed Lab 3 feature PRs are linked.
- [x] Reviewer identity is recorded.
- [x] Meaningful review comments and responses are recorded.
- [x] Resulting changes and merge outcomes are recorded.
- [x] Partner PR reviews are recorded.
- [ ] Final `lab3-staging` → `main` PR, tested SHA, and final review outcome are recorded.
