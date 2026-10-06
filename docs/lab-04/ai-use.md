# บันทึกและการสะท้อนผลการใช้ AI — Lab 4

## ข้อมูลเครื่องมือ AI

| หัวข้อ | รายละเอียด |
| :--- | :--- |
| เครื่องมือ / LLM ที่ใช้ | OpenAI Codex (ผู้ช่วยเขียนโปรแกรมแบบสนทนา) |
| บทบาทใน Sprint | ช่วยวิเคราะห์ข้อกำหนด วางแผน Issue และ Branch พัฒนา Actions Taken, Ticket workflow และ dashboards วางแผนการทดสอบ ตอบ feedback และจัดทำหลักฐานก่อน release |
| ช่วงเวลาที่ใช้งาน | 29 กันยายน – 6 ตุลาคม 2026 |

Codex เป็นผู้ช่วยในการเสนอแนวทางและลงมือแก้ไขตามคำสั่งของผู้พัฒนา ไม่ใช่ผู้อนุมัติการเปลี่ยนแปลงแทนทีม ผู้พัฒนาต้องตรวจ diff ผลการทดสอบ และคำตอบจาก peer review ก่อนนำงานเข้า Pull Request

---

## ตัวอย่าง Prompt สำคัญ

ตารางนี้เรียบเรียงข้อความ Prompt ให้ชัดเจนขึ้นตามรูปแบบของบันทึก Lab 3 โดยคงเจตนาและขอบเขตงานที่สั่งจริง ไม่ใช่การอ้างว่าแต่ละแถวเป็นข้อความ verbatim ทุกคำ

| # | วันที่ / Issue | หัวข้อ Prompt | ข้อความ Prompt ที่ใช้ (เรียบเรียง) | ผลลัพธ์ที่นำไปใช้ | สิ่งที่ได้เรียนรู้ |
| :---: | :--- | :--- | :--- | :--- | :--- |
| 1 | 29 ก.ย. 2026 / #41 | วิเคราะห์เอกสาร Lab 4 | `ช่วยวิเคราะห์เอกสาร Lab 4 และสรุปขอบเขตงาน กฎของ Actions Taken การเปลี่ยนสถานะ Ticket ข้อมูลใน dashboard และหลักฐานที่ต้องส่ง โดยแยกข้อกำหนดในเอกสารออกจากข้อเสนอในการพัฒนา` | ได้ภาพรวมขอบเขตงานและข้อกำหนดที่ต้องแยกจากคำแนะนำในเอกสาร | ต้องตรวจข้อกำหนดต้นฉบับก่อนเปลี่ยนเป็นแผนพัฒนา โดยเฉพาะกฎสถานะและสิทธิ์ของแต่ละ role |
| 2 | 29 ก.ย. 2026 / #41 | วางแผน Issues | `ช่วยแบ่งงาน Lab 4 เป็น Issues ที่ทำตามลำดับได้ ระบุขอบเขตของแต่ละ Issue ชื่อ feature branch และจุดที่ต้องเปิด PR ให้เพื่อน review โดยใช้รูปแบบการทำงานเดียวกับ Lab ก่อนหน้า` | ได้ลำดับงานจากเอกสารสัญญาไปจนถึงการตรวจ regression และ release | การแบ่ง Issue ช่วยให้ PR มีขอบเขตตรวจสอบได้ แต่แผนต้องปรับเมื่อ implementation รวมงานสอง Issue ใน PR เดียว |
| 3 | 29 ก.ย. 2026 / #41 | สร้าง specification | `เริ่ม Issue 1 บน feature/19-lab4-spec-docs จัดทำ specification, API/UI contract และ test plan ให้สอดคล้องกัน แบ่งงานเป็น commits ย่อย และสรุปประเด็นสำคัญสำหรับคำอธิบาย PR` | ได้ specification, API/UI contract และ test plan สำหรับการ review ก่อนเขียน feature code | การตกลงกฎของ Actions Taken, resolution gate และ dashboard metrics ก่อนลงมือ ช่วยลดความคลาดเคลื่อนระหว่าง backend กับ UI |
| 4 | 1 ต.ค. 2026 / #42 | พัฒนา Actions Taken API | `พัฒนา feature/20-lab4-actions-api ตาม contract ที่ผ่าน review ครอบคลุม migration, seed, สิทธิ์การเข้าถึง, Action lifecycle และ audit trail พร้อมทดสอบ API จากนั้นตรวจ feedback ใน PR และแก้ประเด็นที่มีผลต่อข้อมูลหรือความถูกต้อง` | ได้ migration, seed fixtures, API, audit/version checks และการแก้ seed ให้คง Action ของผู้ใช้ไว้ | Seed สำหรับ demo ต้องไม่ลบข้อมูลและ audit history ที่ผู้ใช้สร้างจริง; review พบความเสี่ยงนี้ก่อน merge |
| 5 | 2 ต.ค. 2026 / #43 | พัฒนา Actions Taken UI | `พัฒนา feature/21-lab4-actions-ui ให้เจ้าหน้าที่จัดการ Actions Taken ได้ และให้ Requester เห็นข้อมูลแบบอ่านอย่างเดียว เพิ่มสถานะ loading/error/retry และทดสอบกรณีข้อมูลถูกแก้ไขพร้อมกันตาม feedback ของผู้รีวิว` | ได้หน้ารายการ/ฟอร์ม Action, มุมมอง read-only ของ Requester, retry และ conflict reload | เมื่อ reload หลัง `409` ต้องใช้ทั้งข้อมูลและ timestamp ล่าสุด ไม่ใช่เปลี่ยนเพียง version แล้วส่งค่าเก่าทับข้อมูลใหม่ |
| 6 | 3–4 ต.ค. 2026 / #44 | พัฒนา Ticket workflow | `พัฒนา feature/22-lab4-ticket-workflow ตามตารางสถานะที่ตกลงไว้ บังคับเงื่อนไขก่อน resolve ที่ backend แสดงคำอธิบายใน UI และเพิ่ม regression สำหรับคำขอที่ใช้ข้อมูล Ticket เก่าหลัง Action เปลี่ยน` | ได้ status transition, confirmation, resolution checks, requester indication และ stale-update regression | การตรวจเงื่อนไขก่อน resolve ต้องป้องกัน concurrent Action updates ที่เกิดระหว่างตรวจและบันทึกสถานะ |
| 7 | 5–6 ต.ค. 2026 / #45–#46 | พัฒนา dashboards | `พัฒนา feature/23-lab4-dashboards ให้ Requester และ IT Staff เห็น metrics ตามสิทธิ์ของตน คำนวณข้อมูลจาก server เชื่อมการ์ดไปยังรายการ Ticket ที่ตรงกับตัวเลข และเพิ่ม API/UI tests พร้อมสรุปงานสำหรับ PR` | ได้ metrics ที่คำนวณจาก server, role-scoped dashboard, drill-down และ component/API tests ใน PR เดียว | ต้องแยกความหมาย metric ออกจาก filter ปลายทาง และระบุให้ชัดเมื่อสอง Issues ถูกส่งใน PR เดียว |
| 8 | 6 ต.ค. 2026 / #47 | ตรวจ Lab 4 ขั้นสุดท้าย | `ทำงานบน feature/24-lab4-final-verification โดยเพิ่ม E2E สำหรับเส้นทาง Requester และเจ้าหน้าที่ รัน regression ของ Lab ก่อนหน้า ตรวจหน้าจอหลายขนาด เก็บ screenshot evidence และบันทึกผลทดสอบตามที่เกิดขึ้นจริง โดยแบ่งเป็น commits ย่อย` | ได้ E2E journeys, regression Lab 3+4, ภาพหลักฐาน 12 ภาพ, การแก้ปัญหา Action form/timestamp และ responsive overflow | การทดสอบใน browser จริงพบปัญหาที่ unit tests ไม่เห็น และการตรวจที่ 320 px พบ layout ที่ล้นจอ |
| 9 | 6 ต.ค. 2026 / #47 | สรุปเอกสารส่งงาน | `ช่วยตรวจความครบถ้วนของเอกสารส่งงาน Lab 4 และจัดทำบันทึกการใช้ AI กับประวัติ peer review ในรูปแบบเดียวกับ Lab 3 โดยสรุปงานที่ทำ ผลการทดสอบ feedback ที่ได้รับ และรายการที่ยังต้องดำเนินการก่อน release ตามหลักฐานจริง` | ปรับบันทึก Prompt, ผลลัพธ์, peer-review history และ checklist ให้เทียบรูปแบบ Lab 3 ได้ | เอกสารต้องแยกผลที่ตรวจแล้วออกจาก PR/release ที่ยังไม่เกิดขึ้น และไม่เขียนสถานะ “Approved” ล่วงหน้า |

---

## การตรวจสอบและการใช้ AI อย่างรับผิดชอบ

- [x] ตรวจข้อกำหนดและ contract ของ Lab 4 ก่อนใช้เป็นแนวทาง implement
- [x] ใช้ GitHub Issues และ feature branches แยกงานเพื่อให้เพื่อน review ก่อน merge
- [x] ตรวจ feedback ของ PR #48–#52 และแก้ประเด็นที่มีผลต่อข้อมูล ความถูกต้อง หรือการใช้งาน
- [x] รัน server tests, client tests, builds และ Chromium E2E ตามผลที่บันทึกใน [tests.md](tests.md)
- [x] ใช้ฐานข้อมูล PostgreSQL แยกสำหรับ seed และ browser tests ที่เปลี่ยนข้อมูล ไม่ใช้ฐานข้อมูล local ปกติ
- [x] เก็บภาพ Requester/Staff dashboards และ Actions Taken ที่ขนาด 1440, 768 และ 320 px ใน [release-evidence.md](release-evidence.md)
- [ ] ให้เพื่อน review และ merge PR ของ `feature/24-lab4-final-verification` แล้วตรวจผลใหม่บน `lab4-staging`
- [ ] บันทึกผล final PR จาก `lab4-staging` ไป `main` หลังเกิดขึ้นจริง

### การแก้ไขสำคัญหลังได้รับ Review หรือผลทดสอบ

| ประเด็น | ความเสี่ยงที่พบ | การตรวจสอบหรือแก้ไข |
| :--- | :--- | :--- |
| Seed และ audit history | การ seed แบบลบแล้วสร้างใหม่อาจลบ Actions Taken ของผู้ใช้และ audit events | ใช้ stable seed keys และ upsert เฉพาะ fixtures ของ seed; เพิ่ม regression |
| Conflict reload ในฟอร์ม Action | ใช้ timestamp ใหม่กับค่าฟอร์มเก่าอาจทับการแก้ไขของคนอื่น | โหลดข้อมูล Action ล่าสุดลงฟอร์มพร้อม version แล้วทดสอบ retry |
| Resolution gate | Action เปลี่ยนหลังตรวจเงื่อนไข แต่ก่อนเปลี่ยน Ticket status | อัปเดต parent Ticket timestamp ใน transaction ของ Action mutation และทดสอบ stale `409` |
| Browser flow หลังบันทึก Action | ฟอร์มไม่ปิดและ Ticket Detail ถือ timestamp เก่า | ปิดฟอร์มหลังสำเร็จและ reload Ticket Detail หลัง Action changes; E2E ทดสอบการ resolve ต่อเนื่อง |
| Responsive Staff Detail | Grid ขั้นต่ำ 300 px ทำให้หน้า 320 px ล้น | ปรับ grid, cards และ inputs ให้ยืดตาม viewport แล้วแคปภาพซ้ำ |
| Parallel API tests | หลาย suite เปลี่ยน fixture ในฐานข้อมูลเดียว ทำให้ dashboard count ไม่คงที่ | รัน server test ทีละ worker; ชุดเต็มผ่าน 60/60 |

---

## การสะท้อนผลการใช้ AI

Lab 4 มีงานหลายชั้นที่ต้องสอดคล้องกัน: Prisma migration และ seed, Express API, React UI, authorization, Ticket status และ dashboard metrics Codex ช่วยแบ่งงานให้เป็น Issue/PR ขนาดพอ review ได้ และช่วยเชื่อมข้อกำหนดกับชุดทดสอบของแต่ละส่วน

จุดที่ต้องระวังคือ code ที่ดูถูกต้องในระดับไฟล์อาจผิดเมื่อมีข้อมูลจริงหรือหลายคำขอพร้อมกัน Peer review ช่วยพบ seed ที่อาจลบ audit history, conflict reload ที่อาจทับข้อมูล และ race ใน resolution gate ส่วน E2E และภาพหน้าจอช่วยพบปัญหา post-save flow กับ mobile overflow สิ่งเหล่านี้ต้องยืนยันด้วยการรันจริง ไม่ใช่เชื่อคำอธิบายจาก AI เพียงอย่างเดียว

ผมจึงใช้ AI เป็นผู้ช่วยวิเคราะห์ แก้ไข และร่างเอกสาร แต่ยังตรวจ diff และผลทดสอบ แยกฐานข้อมูลทดสอบออกจากข้อมูลปกติ และบันทึกสิ่งที่ยังไม่เสร็จตามจริง โดยเฉพาะ peer review ของ final-verification branch และการตรวจบน `lab4-staging`/`main` ซึ่งยังไม่ควรอ้างว่าผ่านจนกว่าจะเกิดขึ้นจริง
