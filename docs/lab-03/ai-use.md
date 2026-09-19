# บันทึกและการสะท้อนผลการใช้ AI — Lab 3

## ข้อมูลเครื่องมือ AI

| หัวข้อ | รายละเอียด |
| :--- | :--- |
| เครื่องมือ / LLM ที่ใช้ | OpenAI Codex (ผู้ช่วยเขียนโปรแกรมแบบสนทนา) |
| บทบาทใน Sprint | ช่วยวิเคราะห์ข้อกำหนด วางแผน Issue และ Branch เสนอแนวทางพัฒนา วางแผนการทดสอบ/เก็บหลักฐาน และเตรียมการตอบ Pull Request Review |
| ช่วงเวลาที่ใช้งาน | 15–19 กันยายน 2026 |

Codex ถูกใช้ในฐานะผู้ช่วยด้านวิศวกรรมซอฟต์แวร์ ไม่ใช่ผู้ตัดสินใจแทนผู้พัฒนา
ผู้พัฒนาเป็นผู้ตรวจสอบการแก้ไข คำสั่ง Git ผลการทดสอบ และการตัดสินใจใน Pull Request
ก่อนนำงานเข้าสู่กระบวนการ review ของทีม

---

## ตัวอย่าง Prompt สำคัญ

ตารางนี้บันทึก Prompt ที่ใช้ในระหว่างทำ Lab 3 โดยเรียบเรียงภาษาให้ชัดเจนขึ้น
แต่ยังคงเจตนาและขอบเขตของคำสั่งที่ใช้จริง

| # | วันที่ / Issue | หัวข้อ Prompt | ข้อความ Prompt ที่ใช้ (เรียบเรียง) | ผลลัพธ์ที่นำไปใช้ | สิ่งที่ได้เรียนรู้ |
| :---: | :--- | :--- | :--- | :--- | :--- |
| 1 | 15 ก.ย. 2026 / #11 | วิเคราะห์ข้อกำหนด Lab 3 | `ช่วยวิเคราะห์เอกสาร Lab 3 และสรุปข้อกำหนด บทบาทผู้ใช้ กฎด้านความปลอดภัย ขั้นตอนการทำงาน และสิ่งที่ต้องส่งให้เข้าใจง่าย` | ได้สรุปภาพรวมของข้อกำหนด Lab 3, roles, security rules, workflow และ deliverables | AI ช่วยแยกโจทย์ขนาดใหญ่ออกเป็นข้อกำหนดที่เข้าใจง่ายขึ้น แต่ยังต้องตรวจเทียบกับเอกสาร Lab ก่อนกำหนดขอบเขตงานจริง |
| 2 | 15 ก.ย. 2026 / #11 | วางแผน GitHub Issues | `ช่วยแบ่งงาน Lab 3 เป็น GitHub Issues ประมาณ 7 เรื่อง พร้อมลำดับการทำ Branch การ review และขั้นตอนเตรียม release` | ได้แผนงานแบบเป็นลำดับ มี feature branches จุด review และช่วงเก็บ release evidence | การแบ่งงานเป็น Issue ทำให้จัดการ Kanban และ Pull Request ได้ง่ายขึ้น อย่างไรก็ตาม ทีมยังต้องปรับชื่อและขอบเขตของ Issue ตามงานจริงระหว่างพัฒนา |
| 3 | 15 ก.ย. 2026 / #11 | จัดทำ API และแผนทดสอบ | `ช่วยจัดทำ specification, API contract และ test plan สำหรับ Lab 3 โดยครอบคลุม authentication, role authorization, URGENT priority และ acceptance criteria` | ได้ร่าง `specification.md`, `api-spec.md` และ `tests.md` ก่อนเริ่มพัฒนา | เอกสารตั้งต้นช่วยเป็น checklist ที่ดี แต่ feedback ทำให้เห็นว่าต้องตรวจ contract กับโครงสร้าง repository จริง โดยเฉพาะ path ของ test และ enum ที่ต้องสอดคล้องกันทุกชั้น |
| 4 | 15 ก.ย. 2026 / #12 | ออกแบบฐานข้อมูลผู้ใช้ | `ช่วยวางขั้นตอนการเพิ่ม User, Session และ Role ใน Prisma พร้อม migration, seed data และ API regression tests โดยแบ่งงานเป็น commits เล็ก ๆ` | ได้แนวทางสำหรับ Prisma schema/migration, seed data และ API regression tests ของ Users, Sessions, roles และ Ticket fields | การเปลี่ยน schema ต้องระมัดระวังมาก เพราะส่งผลต่อข้อมูลจาก Lab 2 และ feature ถัดไป จึงต้องตรวจ migration และ API tests ด้วยตนเอง |
| 5 | 16 ก.ย. 2026 / #13 | พัฒนา Authentication และ Role | `ช่วยพัฒนา authentication ด้วย session, การบังคับเปลี่ยนรหัสผ่าน, role guards และ navigation ตาม role โดยค่อย ๆ ทำและ commit เป็นส่วนย่อย` | ได้แผนและการแก้ไขสำหรับ session authentication, password-change enforcement, role guards และ role-aware navigation | AI ช่วยให้ใช้กฎความปลอดภัยเดียวกันทั้ง backend และ frontend ได้ต่อเนื่อง แต่ต้องตรวจเองว่า requester identity มาจาก session ไม่ใช่ `requesterId` ที่ client ส่งมา |
| 6 | 17 ก.ย. 2026 / #31 | พัฒนา Staff Ticket Workflow | `ช่วยพัฒนา Staff Ticket Workflow แบบค่อยเป็นค่อยไป พร้อม commit แยกส่วนสำหรับ queue, claim/assignment, IT priority, status, comments และ internal notes` | ได้งานย่อยสำหรับ staff queue, claim/assignment, IT priority, status transitions, Public Comments และ Internal Notes | Feature นี้มีขอบเขตกว้าง การแยก commit ทำให้ review ง่ายขึ้น และช่วยให้ตรวจ status-transition rules กับ stale-update checks ได้เป็นจุด ๆ |
| 7 | 17 ก.ย. 2026 / #33 | พัฒนา User Management | `ช่วยพัฒนา User Management สำหรับ Administrator โดยแยก commit สำหรับการแสดงรายชื่อ สร้าง แก้ไข เปลี่ยน initial password และทดสอบกฎความปลอดภัย` | ได้แนวทางสำหรับหน้าจอและ API ของ administrator-only user management รวมถึง safety tests | ได้เรียนรู้ว่า UI validation อย่างเดียวไม่เพียงพอสำหรับงานผู้ดูแลระบบ จึงต้องเพิ่มการป้องกันกรณี request พร้อมกันเพื่อไม่ให้ระบบสูญเสีย active Administrator คนสุดท้าย |
| 8 | 18 ก.ย. 2026 / #34 | เตรียม Release Integration และ E2E | `ช่วยวาง release checklist, Playwright E2E tests ตามเส้นทางของแต่ละ role และแผนเก็บ screenshot evidence สำหรับ Lab 3` | ได้ release checklist, Playwright role journeys, คำสั่งทดสอบ และแผนเก็บหลักฐานภาพหน้าจอ | AI ช่วยเชื่อม feature ที่แยกกันให้เป็น user journey จริง และทำให้เห็นว่า unit/API tests, E2E tests และ visual evidence เป็นหลักฐานคนละประเภท |
| 9 | 19 ก.ย. 2026 / review follow-up | วิเคราะห์และตอบ feedback | `ช่วยวิเคราะห์ feedback ใน Pull Request บอกว่าประเด็นใดต้องแก้ และช่วยร่างคำตอบที่อธิบายสิ่งที่แก้ไขพร้อมหลักฐานการตรวจสอบ` | ได้การวิเคราะห์ feedback และร่างแนวทางตอบกลับเรื่อง contract alignment, authorization coverage, administrator safety และ responsive evidence | AI ช่วยอธิบาย feedback และร่างคำตอบได้รวดเร็ว แต่รับการแก้ไขเฉพาะข้อที่มีเหตุผลทางเทคนิค และตรวจด้วย test หรือ evidence ก่อนรายงานว่าเสร็จ |
| 10 | 19 ก.ย. 2026 / final documentation | จัดทำเอกสารสรุปการ review | `ช่วยจัดทำ reviewer.md ของ Lab 3 โดยใช้โครงสร้างจาก Lab 2 และบันทึก PR ที่ review ผลลัพธ์ และ release gate ที่ยังเหลือ` | ได้ `reviewer.md` ในรูปแบบเดียวกับ Lab 2 พร้อม PRs, outcomes และรายการก่อน release | เอกสารเป็นส่วนหนึ่งของ deliverable ไม่ใช่งานตกแต่งช่วงท้าย จึงต้องตรวจเลข PR, commit และผลการ review จากหลักฐานจริง |

---

## การตรวจสอบและการใช้ AI อย่างรับผิดชอบ

- [x] ตรวจทานสรุปข้อกำหนดจาก AI เทียบกับเอกสาร Lab 3 ก่อนใช้เป็นข้อตกลงของโครงการ
- [x] ตรวจทาน code และเอกสารที่ AI ช่วยสร้างก่อน commit และก่อนเปิด Pull Request ทุกครั้ง
- [x] รัน build, server tests, client tests และ E2E tests ตามที่บันทึกไว้ใน [tests.md](tests.md) แทนการเชื่อผลลัพธ์จาก AI โดยอัตโนมัติ
- [x] ตรวจ authentication และ authorization ที่ backend API โดยตรง รวมถึง requester identity ที่ต้องมาจาก session และ role restrictions
- [x] ไม่ส่งรหัสผ่าน session cookie/token ข้อมูลส่วนตัว หรือ repository secrets เข้าไปใน Prompt
- [x] บันทึกการแก้ไขสำคัญจาก peer review ได้แก่ test-file paths, ความสอดคล้องของ `URGENT` priority, regression coverage ของ requester spoofing, ความปลอดภัยของ concurrent Administrator updates และ responsive screenshot evidence

### การแก้ไขสำคัญหลังได้รับ Review

| ประเด็น | ข้อสันนิษฐาน/ร่างที่ AI ช่วยเสนอ | การตรวจสอบหรือแก้ไข |
| :--- | :--- | :--- |
| Client test paths | แผนช่วงแรกอ้างถึง `client/src/tests/...` | ตรวจ convention ของ repository แล้วปรับแผนให้ตรงกับตำแหน่ง client tests จริง |
| `URGENT` priority | API contract มี `URGENT` ซึ่งอาจไม่ครบทุกชั้นของระบบ | ตรวจ enum, migration, validation, UI, seed data และ tests ให้รองรับค่าเดียวกัน |
| Requester authorization | UI อาจดูถูกต้อง แต่ direct API request อาจส่ง `requesterId` ของผู้อื่นได้ | เพิ่ม/ตรวจ backend tests เพื่อปฏิเสธ client-controlled identity และป้องกัน Tickets/Attachments ของผู้ใช้รายอื่น |
| Last active Administrator | การตรวจแบบทั่วไปอาจผิดพลาดเมื่อมี update พร้อมกัน | ปรับ implementation และ tests ให้มี serialized safety handling เพื่อคง active Administrator ไว้อย่างน้อยหนึ่งคน |
| Responsive evidence | ภาพชุดแรกยังไม่ครอบคลุม Staff Ticket Detail ทุก viewport ที่ต้องการ | เพิ่มหลักฐาน tablet และ mobile แล้วรัน capture flow กับ E2E ใหม่ |

---

## การสะท้อนผลการใช้ AI

ใน Lab 3 AI ช่วยให้เปลี่ยนข้อกำหนดจำนวนมากให้เป็น GitHub Issues, feature
branches, test cases และ Pull Request checklists ที่จัดการได้ง่ายขึ้น โดยเฉพาะ
การทำให้ Prisma schema, Express API, React UI, seed data และ automated tests
สอดคล้องกัน

อย่างไรก็ตาม งานนี้ทำให้เห็นชัดว่า output จาก AI ต้องได้รับการตรวจสอบในจุดที่
ระบบเชื่อมต่อกัน ตัวอย่างเช่น API contract อาจดูครบถ้วน แต่ enum อาจยังไม่อยู่ใน
database migration, path ที่วางแผนไว้ไม่ตรงกับ repository หรือ authorization
อาจถูกบังคับเฉพาะใน UI เท่านั้น Peer review และการรัน build, tests และ E2E จริง
เป็นสิ่งที่ช่วยพบความเสี่ยงเหล่านี้

ผมใช้ Codex เพื่อช่วยอธิบายทางเลือก แบ่งขั้นตอนการพัฒนา และร่างคำตอบ review
แต่ยังรับผิดชอบในการตัดสินใจด้านการออกแบบ ตรวจ diff เก็บ secrets ออกจาก prompts
รันการทดสอบ และรายงานเฉพาะหลักฐานที่เกิดขึ้นจริง กระบวนการนี้ทำให้ AI เป็นผู้ช่วย
ที่มีประโยชน์ โดยยังคงให้ code review, testing และการอนุมัติจากทีมเป็นหลักฐานหลัก
ของความน่าเชื่อถือของผลลัพธ์สุดท้าย
