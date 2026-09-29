# Lab 4 AI Use Record

> Record selected prompts and a reflection on AI-assisted specification and implementation work for Lab 4. Prompts below are selected planning prompts; later implementation and review prompts are added as the work proceeds.

## Tool and roles

- **Tool:** OpenAI Codex
- **Specification-agent role:** Analyze the Lab 4 handout, turn it into an internally consistent engineering contract, and identify decisions that the handout leaves open.
- **Coding-agent role:** Implement only the approved contract in small, reviewed branches and run the mapped tests.

## Selected prompts and use

### Prompt 1 — Analyze the handout

> `ลองเข้าไปดูแล้ววิเคราะห์ไฟล์นี้`

The handout was summarized into Actions Taken, final workflow, dashboards, regression, documentation, and submission-evidence obligations. The summary separated the handout requirements from actions performed in the repository.

### Prompt 2 — Decompose the sprint

> `ลองวางแผนมาหน่อยว่าต้องทำอะไรบ้าง ขอแบบเป็นแบ่งเป็นขั้นตอนเหมือนที่เคยทำใน lab ก่อนๆ`

The work was divided into contract, Actions API, Actions UI, workflow, dashboard API, dashboard UI, and final hardening Issues. This reduced the risk of one unreviewable implementation branch.

### Prompt 3 — Create issue records

> `พอรู้ขั้นตอนแบบนี้แล้วช่วยไปสร้าง issue ใน githubให้หน่อย repo toktikit`

Seven GitHub Issues were created and then named with an internal Issue 1-7 sequence. The final branch names remain distinct from GitHub Issue IDs.

### Prompt 4 — Establish the specification contract

> `เริ่มทำ issue 1 ค่อยๆcommit`

The specification was drafted before implementation. It defines Action Taken fields, session-derived performer, conditional follow-up validation, authorization, migration strategy, dashboard metrics, and the final Ticket transition matrix.

### Prompt 5 — Resolve an ambiguous workflow decision

> `IT Staff must review the work and formally update the Ticket.`

The contract interprets this as a resolution gate: a Ticket requires an owner, explicit confirmation, and at least one Action Taken with a Result before it can become `RESOLVED`. The backend, rather than the UI, enforces the rule.

### Prompt 6 — Preserve previous behavior

> `all previous authentication, authorization, Requester, IT Staff, Administrator, comment, note, and attachment behavior continues to work`

The test plan includes dedicated migration and Lab 1-3 regression entries instead of treating new Lab 4 UI screenshots as sufficient proof.

## My Reflection

AI helped transform a long assignment sheet into a reviewable backlog and traceable contract quickly. I checked decisions against the handout, kept the scope limited to Lab 4, and used small commits so a peer can review each document change. AI suggestions are treated as a draft: the team must review the final transition matrix, endpoint names, and tests before using them as implementation authority.
