# API Spec {{ID}}: {{TITLE}}

**Status**: Draft  
**Author**: User  
**Created**: {{DATE}}  
**Service / Scope**: `backend/api`

---

## 1. Specification (What & Why)

### Overview & Motivation
*What endpoint or service capability is being introduced? Who are the consumer clients?*

### API Endpoints

#### `POST /api/v1/{{SLUG}}`
- **Description**: *What this endpoint does*
- **Auth**: `Bearer <token>` / Public
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "exampleField": "value"
}
```
- **Responses**:
  - `200 OK`: Successful operation
  - `400 Bad Request`: Validation failure
  - `401 Unauthorized`: Missing or invalid token
  - `500 Internal Error`: Server failure

### Data Models & Schema
```typescript
export interface ExamplePayload {
  exampleField: string;
}
```

---

## 2. Technical Plan

### Database & Migrations
- *Tables to alter or create (or specify "No DB changes")*

### Architecture & Service Flow
`Client -> Router -> Validation Middleware -> Controller -> Service -> DB`

### Security, Rate Limiting & Validation
- *Input validation rules (Zod / Joi / class-validator)*
- *Rate limiting tier*
- *Sanitization & injection prevention*

---

## 3. Implementation Tasks

- [ ] **Task 1: Schemas & Validation**
  - [ ] Define request/response validation schema
  - [ ] Create database migration if needed
- [ ] **Task 2: Route & Controller**
  - [ ] Implement route handler and middleware
  - [ ] Implement service business logic
- [ ] **Task 3: Testing**
  - [ ] Add integration test for happy path (`200 OK`)
  - [ ] Add tests for validation errors (`400`) and auth failures (`401`)
- [ ] **Task 4: Documentation**
  - [ ] Update OpenAPI / Swagger specs if applicable

---

## 4. Verification

```bash
# Smoke test with curl
curl -X POST http://localhost:3000/api/v1/{{SLUG}} \
  -H "Content-Type: application/json" \
  -d '{"exampleField": "test"}'
```
