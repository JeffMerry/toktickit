# Test Evidence - Lab 1

## Summary Table

| Test ID       | File / Scope                             | Tool      | Test Description                                            | Status |
| ------------- | ---------------------------------------- | --------- | ----------------------------------------------------------- | ------ |
| FOUNDATION-01 | `server/tests/lab-01/foundation.test.ts` | Vitest    | Sanity check structure for backend testing framework        | Passed |
| API-01        | `server/tests/lab-01/health.test.ts`     | Supertest | Health endpoint returns HTTP 200 and expected JSON status   | Passed |
| API-02        | `server/tests/lab-01/categories.test.ts` | Supertest | Categories endpoint returns the four seeded categories      | Passed |
| UI-01         | `client/src/App.test.tsx`                | Vitest    | TokTickIT title and Check System button render correctly    | Passed |
| UI-02         | `client/src/App.test.tsx`                | Vitest    | Clicking Check System shows Online status and category list | Passed |
| UI-03         | `client/src/App.test.tsx`                | Vitest    | API failure displays Offline status and error message       | Passed |

---

## Detailed Test Case Descriptions

### 1. Backend Tests (Server)

#### **FOUNDATION-01: Project Foundation Sanity Check**

- **File:** [foundation.test.ts](file:///c:/Users/Kittithat/toktickit/server/tests/lab-01/foundation.test.ts)
- **Tool:** Vitest
- **Objective:** ตรวจสอบความพร้อมของระบบ Testing Framework ฝั่ง Server (Vitest)
- **Test Logic:** ทำการเรียก `expect(true).toBe(true)` เพื่อยืนยันว่าการตั้งค่า Test Runner สามารถทำงานได้โดยไม่มีข้อผิดพลาด

#### **API-01: GET /api/health (Health Endpoint)**

- **File:** [health.test.ts](file:///c:/Users/Kittithat/toktickit/server/tests/lab-01/health.test.ts)
- **Tool:** Supertest + Vitest
- **Objective:** ทดสอบการทำงานของ API Health Check Endpoint
- **Test Logic:**
  1. ส่ง HTTP GET request ไปยัง `/api/health`
  2. ตรวจสอบว่า HTTP Response Status Code เท่ากับ `200`
  3. ตรวจสอบว่า Response Body เป็น JSON ตรงกับ `{ status: 'ok', service: 'TokTickIT API' }`

#### **API-02: GET /api/categories (Categories Endpoint)**

- **File:** [categories.test.ts](file:///c:/Users/Kittithat/toktickit/server/tests/lab-01/categories.test.ts)
- **Tool:** Supertest + Vitest (Prisma Client Mocking)
- **Objective:** ทดสอบการดึงข้อมูลหมวดหมู่การแจ้งปัญหา (Request Categories)
- **Test Logic:**
  1. ทำการ Mock `@prisma/client` เพื่อจำลองคืนค่า Categories ทั้ง 4 รายการ ได้แก่:
     - `Account and Access` (ID: 1)
     - `Hardware` (ID: 2)
     - `Software` (ID: 3)
     - `Network` (ID: 4)
  2. ส่ง HTTP GET request ไปยัง `/api/categories`
  3. ตรวจสอบว่า HTTP Status Code เท่ากับ `200` และค่านำส่งตรงกับ Array ที่ได้ทำการ Mock ไว้

---

### 2. Frontend Tests (Client)

#### **UI-01: App Component Initial Render**

- **File:** [App.test.tsx](file:///c:/Users/Kittithat/toktickit/client/src/App.test.tsx)
- **Tool:** Vitest + React Testing Library
- **Objective:** ตรวจสอบการเรนเดอร์องค์ประกอบหลักบนหน้าเว็บเมื่อเริ่มต้นเปิดแอปพลิเคชัน
- **Test Logic:**
  1. ทำการ Render คอมโพเนนต์ `<App />`
  2. ตรวจสอบว่ามีข้อความหัวข้อ `"TokTickIT IT Service Desk"` แสดงผลบนหน้าจอ
  3. ตรวจสอบว่ามีปุ่มกด (Button) ชื่อ `"Check System"` บนหน้าจอ

#### **UI-02: Successful API Integration & Category List Render**

- **File:** [App.test.tsx](file:///c:/Users/Kittithat/toktickit/client/src/App.test.tsx)
- **Tool:** Vitest + React Testing Library (Mock Global Fetch)
- **Objective:** ทดสอบ Workflow เมื่อผู้ใช้กดปุ่มตรวจสอบระบบแล้ว API ดึงข้อมูลสำเร็จ
- **Test Logic:**
  1. Mock `global.fetch` ให้ตอบกลับข้อมูล Health status (`ok`) และ Categories ทั้ง 4 รายการสำเร็จ
  2. Render คอมโพเนนต์ `<App />` และทำการจำลองคลิกปุ่ม `"Check System"`
  3. รอผลลัพธ์ผ่าน `waitFor()` และตรวจสอบว่า:
     - แสดงข้อความสถานะระบบเป็น **"Online"**
     - แสดงหมวดหมู่ทั้ง 4 รายการ (`Account and Access`, `Hardware`, `Software`, `Network`) บน UI อย่างถูกต้อง

#### **UI-03: API Failure Handling & Offline Status Display**

- **File:** [App.test.tsx](file:///c:/Users/Kittithat/toktickit/client/src/App.test.tsx)
- **Tool:** Vitest + React Testing Library (Mock Fetch Rejection)
- **Objective:** ทดสอบการจัดการ Error กรณีระบบไม่สามารถเชื่อมต่อ API Backend ได้
- **Test Logic:**
  1. Mock `global.fetch` ให้เกิด Reject (Network error)
  2. Render คอมโพเนนต์ `<App />` และทำการจำลองคลิกปุ่ม `"Check System"`
  3. รอผลลัพธ์ผ่าน `waitFor()` และตรวจสอบว่า:
     - แสดงข้อความสถานะระบบเป็น **"Offline"**
     - แสดงข้อความ Error แจ้งเตือนผู้ใช้ `"Unable to connect to TokTickIT API"`
