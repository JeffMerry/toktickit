# Lab 2 AI Usage Reflection & Log

## AI Tool Information
- **AI Tool / LLM Used**: Antigravity AI (Gemini 3.6 Flash / Claude 3.5 Sonnet)
- **Role in Sprint**: Engineering Assistant for Specification Drafting, Architecture Planning, TDD Test Case Generation, and Component Implementation.

---
## Selected Key Prompts

| # | Prompt Name | Actual Prompt Text | My Reflection |
|---|---|---|---|
| 1 | วิเคราะห์ Requirements เเละ Business Rules สำหรับ Sprint 2 | ช่วยวิเคราะห์ไฟล์ Lab_02_labsheet.pdf เเล้วสรุป Business Rulesเเบะ Edge Case ของระบบ Requester MVP พร้อมเขียนโครงร่างสำหรับ specification.md| AI ช่วยสรุปขอบเขตของงาน ทำให้เรามองเห็นข้อกำหนดที่สำคัญของงานเเละมีการวางเเผน Business Rules ที่ชัดเจนเพื่อที่จะเอาไปวางเเผน issues บน GitHub ต่อได้ทันที |
| 2 | การออกเบบ Database Schema เเละ Indexing สำหรับ Search/Filter | ช่วยออกเเบบ Prisma Schema สำหรับตาราง Ticket,Attachment, DevelopmentRequester, Category เเละ RelatedSystem พร้อมช่วยเเนะนำว่า fields ไหนควรทำอะไรบ้าง | ทำให้เข้าใจการเลือกทำ Indexing บนฟิลด์ที่ถูก Query บ่อยๆเช่น requesterId , status เเละ createdAt ช่วยทำให้ระบบทำงานได้เร็วขึ้น |
| 3 | การออกเเบบ REST API Contract เเละ Pagination Metadata | ช่วยออกเเบบ JSON Schema ของ API ในไฟล์ api_spec.md รวมถึงโครงสร้าง Response เมื่อเกิด Validation ต่างๆ | ได้เรียนรู้เรื่อง API Contract ที่รัดกุมเเละเป็นมาตรฐานที่ทำให้ Frontend เเละ Backend ทำงานร่วมกันได้ โดยมีการกำหนด Error Format ที่ชัดเจนช่วยให้จัดการเเสดงผลบน UI Form ได้ง่ายขั้น |
| 4 |การออกเเบบ Zen Green UI Design Tokens เเละ Accessibility | ช่วยออกเเบบ UI ให้เป็นไปตามที่ได้กำหนดเอาไว้ในไฟล์ Lab_02_labsheet.pdf เเละเเนะนำการทำ CSS structure ที่รองรับการเเสดงผล Responsive | ทำให้เข้าใจเรืองของการออกเเบบ UI โดยใช้รูปเเบบที่กำหนด เเละทำให้เข้าใจเรื่องการใช้ CSS structure ในการทำ Responsive |
| 5 |การ Implement Logic การจัดการ Attachment Lifecycle | ช่วยเขียน Logic สำหรับการ Upload, Preview เเละ Soft Removal ของ Attachment | ทำให้ผมเข้าใจกลไกการทำ Soft Removal เพื่อความปลอดภัยของข้อมูลซึ่งดีกว่าการทำ Hard Delete ทันทีเเละเห็นภาพการจัดการ State ของไฟล์เเนบทั้งฝั่งของ Client เเละ Databaseชัดเจนขึ้น |
| 6 | การเขียน Test Plan ให้ครอบคลุม Acceptance Criteria | ช่วยเเปลง Acceptance Criteria ใน specification.md ให้เป็นตาราง planned test ใน test.md | ทำให้เห็นภาพรวามว่า Acceptance Criteria เเต่ละข้อ map กับ test อะไร ช่วยทำให้เข้าใจว่าทำไหมถึงต้องมีการเขียน test ในส่วนนี้ |
| 7 | การทำ Client-side Validation เเละ Form State Management |ช่วยเขียน Form Conponent ในหน้า Create Ticket โดยกำหนดให้ปุ่ม Submit เเสดงสถานะ Busy เเละ Disable เมื่อกำลังส่งข้อมูล เเละเเสดง Error Message ใต้ Input Field ที่ไม่ผ่าน Validation | เข้าใจหลักการจัดการ State ของ Form เพื่อป้องกันปัญหา Duplicate Submissioon เมื่อมีการกดยํ้าๆ เเละ การส่ง Feedback ให้กับผู้ใช้ตามตำเเหน่งของเเต่ละฟิลด์อย่างถูกต้อง |
| 8 | การเขียน E2E Test Flow ด้วย Playwright เเละ Visual Inspection | ช่วยเขียน Playwright Script เพื่อทดสอบ Flow สลับ Development Requester -> สร้างตั๋วใหม่พร้อมไฟล์แนบ -> ตรวจสอบว่าตั๋วแสดงใน My Tickets ของผู้ใช้นั้น -> เปลี่ยน Requester แล้วตั๋วต้องไม่ปรากฏ พร้อมบันทึก Screenshot ที่ Viewport Desktop, Tablet และ Mobile | ทำให้มองเห็นภาพรวมการทดสอบ End-to-End ที่จำลองพฤติกรรมจริงของผู้ใช้ เเละได้ Artifacts รูปภาพสำหรับตรวจสอบ Responsive Layout เเละ UI |

---


## My Reflection on AI Use Experience
ในส่วนของ Lab 2 นี้ การใช้ AI ทำให้ช่วยเพิ่ม Productivity ในการทำงานได้เยอะขึ้นมาก เข้าใจสิ่งที่โจทย์ต้องการได้ง่าย ด้วยการทำให้AIช่วยในการเเบ่งหัวข้อต่างๆออกมาทำให้เห็นภาพรวมของงานได้ละเอียดมากขึ้น เพื่อนำมาเขียนในส่วนของSpecเเละTest Plan ได้อย่างมีประสิทธิภาพ มีการกำหนด Business Logic เพื่อเป็นการกดหนดขอบเขตงานให้กับ AI เเละเข้าใจเรื่องการทำ Automated Test Suites (Unit,API,E2E) ที่เป็นการยืนยันความถูกต้องสมบูรณ์ของระบบก่อนการ Merge ทุกครั้ง
