# Lab 3 Reviewer Record

## My Information

| Field | Detail |
| :--- | :--- |
| Name | TODO |
| Student ID | TODO |
| GitHub Username | TODO |
| Repository | TODO |

## Primary Peer Reviewer

| Field | Detail |
| :--- | :--- |
| Reviewer Name | TODO |
| Reviewer Student ID | TODO |
| Reviewer GitHub Username | TODO |

## Pull Requests Reviewed by My Peer

Complete one record after each PR is reviewed. Preserve the real review comment, your response, requested changes, approval, and merge outcome.

### PR 1 - `feature/11-lab3-spec-docs` to `lab3-staging`

| Field | Detail |
| :--- | :--- |
| Related Issue | #11 — Lab 3 specification and test-plan documents |
| PR Link | [PR #26](https://github.com/JeffMerry/toktickit/pull/26) |
| Reviewer | THN4 |
| Review Comment(s) | Confirm client test-file locations before implementation; include `URGENT` throughout the Prisma/API/UI/seed/test contract. |
| My Response(s) | Confirmed the repository layout would be rechecked during implementation and committed to adding `URGENT` consistently in the Lab 3 database increment. |
| Changes After Review | The later database implementation added the `URGENT` priority contract across schema, migration, runtime behavior, seed data, and tests. |
| Outcome | Approved and merged 2026-09-15. |

### PR 2 - `feature/12-lab3-user-database` to `lab3-staging`

| Field | Detail |
| :--- | :--- |
| Related Issue | #12 — Lab 3 user database |
| PR Link | [PR #28](https://github.com/JeffMerry/toktickit/pull/28) |
| Reviewer | THN4 |
| Review Comment(s) | Add an unassigned seed ticket for claim workflow; persist Requester “problem appears resolved” separately from formal status. |
| My Response(s) | Addressed in `2fa94c5`: added an unassigned seed ticket, nullable owner handling, `requesterResolvedAt`, migration, documentation, and regression coverage. |
| Changes After Review | Queue seed data supports unassigned Tickets; requester resolution indication no longer changes formal Ticket status. |
| Outcome | Changes requested, then approved and merged 2026-09-15. |

### PR 3 - `feature/13-lab3-authentication` to `lab3-staging`

| Field | Detail |
| :--- | :--- |
| Related Issue | #13 — Lab 3 authentication and role shell |
| PR Link | [PR #30](https://github.com/JeffMerry/toktickit/pull/30) |
| Reviewer | THN4 |
| Review Comment(s) | Restrict navigation by role: Requesters only see Ticket actions, IT Staff see Queue, Administrators see User Management; add a client test. |
| My Response(s) | Addressed in `c4021a6`; documented Requester, IT Staff, and Administrator navigation and verified client build/tests. |
| Changes After Review | Role-specific navigation and client coverage added; staff/admin sessions no longer fetch Requester Ticket data. |
| Outcome | Changes requested, then approved and merged 2026-09-16. |

### PR 4 - `feature/14-lab3-staff-ticket-workflow` to `lab3-staging`

| Field | Detail |
| :--- | :--- |
| Related Issue | #31 — Staff Ticket Queue and Workflow |
| PR Link | [PR #32](https://github.com/JeffMerry/toktickit/pull/32) |
| Reviewer | THN4 |
| Review Comment(s) | Requested clarification on Administrator operational Ticket access. |
| My Response(s) | Confirmed the approved authorization matrix explicitly permits Administrator Queue, ownership, priority, status, and Internal Note operations while normal Admin navigation remains focused on User Management. |
| Changes After Review | No code change required; the authorization decision was already explicit in the specification. |
| Outcome | Approved and merged 2026-09-17. |

### PR 5 - `feature/15-lab3-user-management` to `lab3-staging`

| Field | Detail |
| :--- | :--- |
| Related Issue | #33 — Administrator User Management |
| PR Link | [PR #35](https://github.com/JeffMerry/toktickit/pull/35) |
| Reviewer | THN4 |
| Review Comment(s) | Make the “at least one active Administrator” safeguard concurrency-safe and prove it with a concurrent regression test. |
| My Response(s) | Addressed in `618e150`: active-Administrator count, validation, update, and session revocation now execute inside one PostgreSQL transaction guarded by a transaction-level advisory lock. |
| Changes After Review | Added concurrent cross-deactivation regression coverage; exactly one request succeeds, the other returns `409`, and an active Administrator remains. |
| Outcome | Feedback addressed and merged 2026-09-17. |

### PR 6 - `feature/16-lab3-release-integration` to `lab3-staging`

| Field | Detail |
| :--- | :--- |
| Related Issue | #34 — Release Integration and Evidence |
| PR Link | TODO |
| Reviewer | TODO |
| Review Comment(s) | TODO |
| My Response(s) | TODO |
| Changes After Review | TODO |
| Outcome | Pending review |

## Release Pull Request

### `lab3-staging` to `main`

| Field | Detail |
| :--- | :--- |
| PR Link | TODO |
| Final Commit SHA | TODO |
| Reviewer | TODO |
| Review Comment(s) | TODO |
| My Response(s) | TODO |
| Test Evidence | TODO |
| Outcome | Pending review |

## Pull Requests I Reviewed for My Partner

Add one section for each partner PR that you review.

### Partner PR - `feature/4-lab3-staff-queue` to `lab3-staging`

| Field | Detail |
| :--- | :--- |
| Partner | THN4 |
| PR Link | [THN4 PR #41](https://github.com/THN4/toktickit/pull/41) |
| Related Issue | THN4 #32 — IT Staff Ticket Queue |
| My Review Comment(s) | Requested complete Queue controls, metadata-driven pagination, Queue UI tests, Forbidden direct-route state, unique fixtures, then follow-up coverage for no-results/error/retry/page-size and mobile-safe Ticket cards. |
| Partner Response(s) | Implemented the controls and route state, expanded Queue API/UI coverage, used unique fixtures, and addressed the final responsive/test feedback in `be3756c`. |
| Changes After Review | Final Queue has responsive cards/table, mobile filters, badges, Open action, metadata pagination, and expanded UI coverage. |
| Outcome | Final diff rechecked after `be3756c`; ready for approval. |

## Final Review Evidence Checklist

- [x] Every completed Lab 3 feature PR is linked.
- [x] Reviewer identity is recorded.
- [x] Meaningful review comments are recorded accurately.
- [x] My responses to review comments are recorded.
- [x] Changes resulting from review are identified.
- [x] Approval and merge outcomes are recorded for completed feature PRs.
- [x] Partner PR reviews are recorded.
- [ ] Final release PR and tested commit SHA are recorded.
