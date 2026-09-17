# Lab 3 Release Evidence

## Integrated Verification

- Integrated source commit tested: `8bd18a9` (`lab3-staging`)
- Test date: 2026-09-17 (Asia/Bangkok)
- Server production build: Pass
- Server automated suite: Pass — 14 files, 48 tests
- Client production build: Pass
- Client automated suite: Pass — 6 files, 9 tests

The exact commands and results are recorded in [tests.md](tests.md). No failing automated test was skipped or hidden in this run.

## Merged Feature Evidence

| Feature | Issue | Pull Request | Merge target | Outcome |
| :--- | :--- | :--- | :--- | :--- |
| Specification and test plan | #11 | [#26](https://github.com/JeffMerry/toktickit/pull/26) | `lab3-staging` | Merged |
| User database | #12 | [#28](https://github.com/JeffMerry/toktickit/pull/28) | `lab3-staging` | Merged |
| Authentication and role shell | #13 | [#30](https://github.com/JeffMerry/toktickit/pull/30) | `lab3-staging` | Merged |
| Staff Ticket Workflow | #31 | [#32](https://github.com/JeffMerry/toktickit/pull/32) | `lab3-staging` | Merged |
| User Management | #33 | [#35](https://github.com/JeffMerry/toktickit/pull/35) | `lab3-staging` | Merged |

Detailed review comments, responses, and outcomes are recorded in [reviewer.md](reviewer.md).

## Required Manual Screenshot and Accessibility Evidence

Capture these from the final release candidate after `feature/16-lab3-release-integration` is merged into `lab3-staging`. Store files under `artifacts/lab-03/screenshots/` using the locations below, and add links to the release PR description.

| Screen / scenario | Desktop | Tablet | Mobile | Keyboard / feedback check | Evidence location | Status |
| :--- | :---: | :---: | :---: | :--- | :--- | :--- |
| Login and invalid-sign-in message | Required | Required | Required | Labels, focus, safe error | `authentication/` | Pending manual capture |
| Mandatory password change | Required | Optional | Required | Focus order, blocked navigation | `authentication/` | Pending manual capture |
| Requester Ticket detail and comments | Required | Optional | Required | No Internal Notes shown | `requester-ticket-detail/` | Pending manual capture |
| Staff Queue and Ticket workflow | Required | Required | Required | Queue filters, badges, controls | `staff-queue/`, `staff-ticket-detail/` | Pending manual capture |
| Administrator User Management | Required | Optional | Required | Form labels, safety conflict, no overflow | `user-management/` | Pending manual capture |

## Release PR Gate

Before opening `lab3-staging` to `main`:

1. Pull the current `lab3-staging` tip and re-run all four build/test commands in `tests.md`.
2. Replace the tested SHA above with that release-candidate SHA if application code changed.
3. Capture the manual evidence in the matrix and link it in the PR.
4. Complete the Release Pull Request table in `reviewer.md` after the PR exists and receives peer review.
5. Leave an unresolved item visible in the PR if a required check cannot run; do not mark it as passing without evidence.
