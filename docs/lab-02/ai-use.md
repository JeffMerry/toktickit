# Lab 2 AI Usage Reflection & Log

## AI Tool Information
- **AI Tool / LLM Used**: Antigravity AI (Gemini 3.6 Flash / Claude 3.5 Sonnet)
- **Role in Sprint**: Engineering Assistant for Specification Drafting, Architecture Planning, TDD Test Case Generation, and Component Implementation.

---

## Selected Key Prompts Log

| Prompt ID | Target Task / Document | Prompt Excerpt | Output / Result Achieved |
| :--- | :--- | :--- | :--- |
| **P-01** | `specification.md` | "Read Lab 2 handout and draft specification.md covering Business Rules BR-01 to BR-13, scope, and ACs." | Created complete engineering specification contract for Sprint 2. |
| **P-02** | `ui-spec.md` | "Define Zen Green Theme visual tokens, form rules, button states, and layout responsive viewports." | Generated comprehensive UI spec with hex tokens and visual guidelines. |
| **P-03** | `api-spec.md` | "Design REST API endpoints for tickets and attachments including status codes and error payloads." | Produced full API contract for Ticket CRUD and Attachment soft-removal. |
| **P-04** | `tests.md` | "Create planned test table mapping FR/BR/AC to test file paths across unit, API, UI, and E2E levels." | Generated test plan matrix with 100% AC traceability. |
| **P-05** | Backend API Tests | "Implement failing API tests for ticket creation and ownership validation." | Provided initial test suite following TDD workflow. |
| **P-06** | Frontend Components | "Build CreateTicket form using Zen Green design system with field-level validation messages." | Developed React component complying with UI contract. |

---

## My Reflection on AI Use Experience
Using AI as an engineering assistant during Sprint 2 significantly accelerated the Spec-Driven Development process. By asking the AI to draft complete contracts (`specification.md`, `ui-spec.md`, `api-spec.md`, `tests.md`) before writing any code, potential ambiguities regarding attachment limits and multi-requester ownership protection were identified and resolved early. The AI proved particularly effective at enforcing TDD discipline and maintaining visual consistency with the Zen Green design system.
