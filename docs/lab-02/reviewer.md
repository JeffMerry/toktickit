# Lab 2 Reviewer Record

## My Information

| Field | Detail |
|-------|--------|
| **Name** | Kittithat Disthanakornkun |
| **Student ID** | 67070501004 |
| **GitHub Username** | [JeffMerry](https://github.com/JeffMerry) |

---
## Peer Reviewer (Primary)

| Field | Detail |
|-------|--------|
| **Reviewer Name** | Thanatip Nitinantakul |
| **Reviewer Student ID** | 67070501023 |
| **Reviewer GitHub Username** | [ThnaChamp](https://github.com/ThnaChamp) |

---


## Pull Requests Reviewed

> My partner reviewed the following PRs that I submitted.

### PR 1 — feature/5-lab2-spec-docs → lab2-staging

| Field | Detail |
|-------|--------|
| **PR Link** | [https://github.com/JeffMerry/toktickit/pull/16](https://github.com/JeffMerry/toktickit/pull/16) |
| **Reviewer** | Thanatip Nitinantakul ([@ThnaChamp](https://github.com/ThnaChamp)) |
| **Review Comment** | "Everything is complete, great job Kittithat" |
| **My Response** | thankyou for review |
| **Outcome** | Approved and merged |

---

### PR 2 — feature/6-lab2-requester-context → lab2-staging

| Field | Detail |
|-------|--------|
| **PR Link** | [https://github.com/JeffMerry/toktickit/pull/17](https://github.com/JeffMerry/toktickit/pull/17) |
| **Reviewer** | Thanatip Nitinantakul ([@ThnaChamp](https://github.com/ThnaChamp)) |
| **Review Comment** | "Thank you for the explanation, now everything is great." |
| **My Response** | Thank you for the review; everything is ready to merge. |
| **Outcome** | Approved and merged |

---
### PR 3 — feature/7-lab2-create-ticket-workflow → lab2-staging

| Field | Detail |
|-------|--------|
| **PR Link** | [https://github.com/JeffMerry/toktickit/pull/18](https://github.com/JeffMerry/toktickit/pull/18) |
| **Reviewer** | Thanatip Nitinantakul ([@ThnaChamp](https://github.com/ThnaChamp)) |
| **Review Comment** | "Everything is complete and matches the specifications." |
| **My Response** | Thank for review Champ, you can merge now. |
| **Outcome** | Approved and merged |

---
### PR 4 — feature/8-lab2-my-tickets-list → lab2-staging

| Field | Detail |
|-------|--------|
| **PR Link** | [https://github.com/JeffMerry/toktickit/pull/19](https://github.com/JeffMerry/toktickit/pull/19) |
| **Reviewer** | Thanatip Nitinantakul ([@ThnaChamp](https://github.com/ThnaChamp)) |
| **Review Comment (1)** | "Everything is set for the UI implementation and testing, but don't forget to update the tests in your tests.md file as well." |
| **My Response (1)** | Ok i commit update test.md with actual automated test file already. |
| **Review Comment (2)** | "Great job Kittithat." |
| **My Response (2)** | Thankyou Champ for review, Ready to merge. |
| **Outcome** | Approved and merged |

---
### PR 5 — feature/9-lab2-ticket-detail → lab2-staging

| Field | Detail |
|-------|--------|
| **PR Link** | [https://github.com/JeffMerry/toktickit/pull/20](https://github.com/JeffMerry/toktickit/pull/20) |
| **Reviewer** | Thanatip Nitinantakul ([@ThnaChamp](https://github.com/ThnaChamp)) |
| **Review Comment** | "Everything in this issue is done, Good job." |
| **My Response** | Thankyou MR.Champ for review, Ready to merge. |
| **Outcome** | Approved and merged |

---

### PR 6 — feature/10-lab2-Release-Integration → lab2-staging

| Field | Detail |
|-------|--------|
| **PR Link** | [https://github.com/JeffMerry/toktickit/pull/21](https://github.com/JeffMerry/toktickit/pull/21) |
| **Reviewer** | Thanatip Nitinantakul ([@ThnaChamp](https://github.com/ThnaChamp)) |
| **Review Comment** | "Everything is done, great job Kittithat. See you again at next lab session." |
| **My Response** | Thankyou Champ for review, can merge now. |
| **Outcome** | Approved and merged |

---
## Pull Requests I Reviewed for My Partner
> I reviewed the following PRs submitted by my partner Thanatip Nitinantakul ([@ThnaChamp](https://github.com/ThnaChamp)).

### PR A — feature/1-specifications → lab2-staging

| Field | Detail |
|-------|--------|
| **PR Link** | [https://github.com/ThnaChamp/toktickit/pull/18](https://github.com/ThnaChamp/toktickit/pull/18)|
| **My Review Comment** | "Complete .md information is ready to work on the next step." |
| **Partner's Response** | Thank for review Kittithat. |
| **Outcome** | Approved and merged |

---
### PR B — feature/2-requester-context → lab2-staging

| Field | Detail |
|-------|--------|
| **PR Link** | [https://github.com/ThnaChamp/toktickit/pull/19](https://github.com/ThnaChamp/toktickit/pull/19)|
| **My Review Comment** | "In schema.prisma under the Attachment model, since onDelete is not explicitly specified in the relation, Prisma/PostgreSQL defaults to onDelete: Restrict (as seen in the generated SQL file: ON DELETE RESTRICT).The issue: If a ticket is deleted (prisma.ticket.delete(...)) while it still has related attachments, the database will throw a foreign key constraint error and block the deletion to prevent orphaned records.Therefore, to prevent this issue, should we set it to onDelete: Cascade? What are your thoughts on this?" |
| **Partner's Response** | Thanks for pointing this out but I decided to keep Restrict for now because:1. No ticket deletion in Lab 2: We don't have a DELETE /api/tickets endpoint in this sprint, so this won't trigger any errors.2. Soft delete pattern: Attachments use soft delete (removedAt) to keep audit history. Keeping Restrict acts as a safety guard against accidental hard deletes. |
| **Outcome** | Approved and merged |

---

### PR C — feature/3-create-ticket → lab2-staging

| Field | Detail |
|-------|--------|
| **PR Link** | [https://github.com/ThnaChamp/toktickit/pull/20](https://github.com/ThnaChamp/toktickit/pull/20)|
| **My Review Comment** | "Everything is perfect; detailed tests have been written for various scenarios." |
| **Partner's Response** | Thank for review Kittithat, you can merge now. |
| **Outcome** | Approved and merged |

---
### PR D — feature/4-my-ticket → lab2-staging

| Field | Detail |
|-------|--------|
| **PR Link** | [https://github.com/ThnaChamp/toktickit/pull/21](https://github.com/ThnaChamp/toktickit/pull/21)|
| **My Review Comment** | "GET /api/tickets — orderBy is missing a secondary sort (BR-23)Currently orderBy only sorts by a single field chosen by the user, but the spec (BR-23) requires a secondary sort of ticketNumber DESC at all times.This matters because createdAt comes from @default(now()), which can genuinely produce duplicate values when multiple tickets are created at (or near) the same instant - e.g. a batch seed script or concurrent requests under load. When the sort key has tied values and there's no tiebreaker, PostgreSQL does not guarantee a stable order across separate queries.As a result, pagination can become unstable: records with a tied createdAt may show up on two different pages, or be skipped entirely and never appear on either page. This is a hard bug to catch because it only surfaces when a tie actually occurs.Could we add ticketNumber as a secondary sort in the orderBy array?" |
| **Partner's Response** | Thank you for pointing out the problem. I've updated the orderBy logic to use an array where ticketNumber: 'desc' is always appended as the secondary sort (tie-breaker) whenever the primary sort isn't already. |
| **Outcome** | Approved and merged |

---

### PR E — feature/5-ticket-detail-attachments → lab2-staging

| Field | Detail |
|-------|--------|
| **PR Link** | [https://github.com/ThnaChamp/toktickit/pull/22](https://github.com/ThnaChamp/toktickit/pull/22)|
| **My Review Comment** | "Everything is in good. Test results have been fully updated." |
| **Partner's Response** | Thank for review Kittithat, you can merge now. |
| **Outcome** | Approved and merged |

---
### PR F — feature/6-e2e-testing → lab2-staging

| Field | Detail |
|-------|--------|
| **PR Link** | [https://github.com/ThnaChamp/toktickit/pull/22](https://github.com/ThnaChamp/toktickit/pull/22)|
| **My Review Comment** | "After reviewing the screenshots in artifacts/lab-02/screenshots/, they don't appear to match what's specified in ui-spec.md. Could you please double-check this?" |
| **Partner's Response** | You're right, I'll fix it right away. Updated all screenshot captures using automated Playwright test suite to strictly match the 15 required states in Section 12 of ui-spec.md, and deleted legacy screenshots. |
| **Outcome** | Approved and merged |

---