# REST API Reference

**Base URL:** `http://localhost:3000` (Development) / `https://your-domain.com` (Production)  
**Content-Type:** `application/json` (or `multipart/form-data` for uploads)

---

## 1. Chat Endpoints

### `POST /api/chat`
Processes incoming visitor messages through guardrails, vector retrieval, and grounded answer synthesis.

#### Request Body
```json
{
  "workspaceId": "01a0ecb4-78d1-71ff-aa11-1d673314e5df",
  "visitorId": "vis-92817492-3810",
  "message": "What is your refund policy?",
  "conversationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "metadata": {
    "device": "Desktop",
    "browser": "Chrome",
    "os": "macOS",
    "pageUrl": "https://example.com/pricing",
    "cameFrom": "Google Search"
  }
}
```

#### Response `200 OK` (Grounded Support Answer)
```json
{
  "conversationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "answer": "We offer a 30-day money-back guarantee for all annual subscriptions. To request a refund, contact billing@example.com.",
  "intent": "SUPPORT",
  "citations": ["refund-policy.pdf"],
  "status": "open",
  "groundingExplanation": "Synthesized from refund-policy.pdf using Gemini Flash with grounded context. (processed in 420ms)"
}
```

#### Response `200 OK` (Off-Topic Deflection)
```json
{
  "conversationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "answer": "I am Gaurav Desk Agent. I can only assist with questions regarding our products, services, and documentation. How can I help you with those today?",
  "intent": "OFF_TOPIC",
  "citations": [],
  "status": "open",
  "groundingExplanation": "Off-topic query intercepted by guardrail in 12ms."
}
```

#### Response `200 OK` (Escalation to Human)
```json
{
  "conversationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "answer": "I'm looping in a human support operator to help you with this right now. Please hold on a moment.",
  "intent": "ESCALATE",
  "citations": [],
  "status": "waiting",
  "groundingExplanation": "Visitor requested human operator. Escalated to queue in 15ms."
}
```

---

### `GET /api/chat`
Polls message history and current status for an active conversation.

#### Query Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `conversationId` | UUID | Yes | Active conversation ID. |

#### Response `200 OK`
```json
{
  "conversationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "status": "open",
  "tag": "You",
  "assignedTo": "Operator",
  "messages": [
    {
      "id": "e9321f45-...",
      "sender": "visitor",
      "senderName": "You",
      "text": "Hello, can I upgrade my plan?",
      "citations": [],
      "createdAt": "2026-10-10T08:15:00.000Z"
    },
    {
      "id": "f8210b32-...",
      "sender": "operator",
      "senderName": "Operator",
      "text": "Yes, you can upgrade anytime from your billing page!",
      "citations": [],
      "createdAt": "2026-10-10T08:16:12.000Z"
    }
  ]
}
```

---

## 2. Knowledge Base Endpoints

### `GET /api/knowledge`
Retrieves all indexed documents and suggested starter questions for a workspace.

#### Query Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `workspaceId` | UUID | No | Defaults to the primary workspace if omitted. |

#### Response `200 OK`
```json
{
  "documents": [
    {
      "id": "7a8b9c0d-...",
      "filename": "pricing-faq.md",
      "fileSize": 14200,
      "fileType": "md",
      "status": "indexed",
      "createdAt": "2026-10-10T07:30:00.000Z"
    }
  ],
  "suggestedQuestions": [
    "How do I request a refund?",
    "What payment methods do you accept?",
    "Can I cancel my subscription anytime?"
  ]
}
```

---

### `POST /api/knowledge`
Uploads, chunks, embeds, and indexes a support document.

#### Request Format: `multipart/form-data`
* `file`: Binary file (`.pdf`, `.md`, `.txt`, maximum 10 MB).
* `workspaceId`: UUID string (optional).

#### Example cURL
```bash
curl -X POST "http://localhost:3000/api/knowledge" \
  -F "file=@/path/to/product-manual.pdf" \
  -F "workspaceId=01a0ecb4-78d1-71ff-aa11-1d673314e5df"
```

#### Response `200 OK`
```json
{
  "success": true,
  "document": {
    "id": "9c8b7a6d-...",
    "filename": "product-manual.pdf",
    "fileSize": 348120,
    "fileType": "pdf",
    "status": "indexed",
    "createdAt": "2026-10-10T08:20:00.000Z"
  },
  "suggestedQuestions": [
    "How do I calibrate the device?",
    "What does error code E-04 mean?"
  ]
}
```

---

### `DELETE /api/knowledge`
Deletes an indexed document, deletes all associated vector chunks, and refreshes suggested starter questions.

#### Query Parameters
* `id`: UUID of the document to delete.

#### Response `200 OK`
```json
{
  "success": true,
  "suggestedQuestions": [
    "What payment methods do you accept?"
  ]
}
```

---

## 3. Workspace Customization Endpoints

### `GET /api/workspace`
Returns appearance and configuration settings for the chatbot widget.

#### Response `200 OK`
```json
{
  "id": "01a0ecb4-78d1-71ff-aa11-1d673314e5df",
  "name": "Default Workspace",
  "agentName": "Gaurav Desk Agent",
  "accentColor": "#2563eb",
  "position": "bottom-right",
  "greetingMessage": "Hi there! How can we help you today?",
  "starterQuestions": [
    "How does billing work?",
    "How do I install the widget?"
  ],
  "allowedDomains": ["example.com", "localhost:3000"],
  "agentEnabled": true,
  "avatarUrl": null,
  "avatarKey": null
}
```

---

### `PUT /api/workspace`
Updates appearance and configuration settings.

#### Request Body
```json
{
  "agentName": "Support Copilot",
  "accentColor": "#4f46e5",
  "position": "bottom-left",
  "greetingMessage": "Welcome! Need any help?",
  "allowedDomains": ["example.com", "app.example.com"],
  "agentEnabled": true
}
```

---

## 4. Operator Inbox Endpoints

### `GET /api/conversations`
Fetches all conversations, message threads, and telemetry for the operator dashboard.

#### Response `200 OK`
```json
{
  "conversations": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "customerName": "Visitor",
      "customerEmail": null,
      "subjectSnippet": "What is your refund policy?",
      "status": "open",
      "tag": "Agent",
      "assignedTo": null,
      "metadata": {
        "device": "Desktop",
        "browser": "Chrome",
        "os": "macOS"
      },
      "lastActivity": "2m ago",
      "messages": [ ... ]
    }
  ]
}
```

---

### `POST /api/conversations`
Posts an operator reply to an active conversation and transitions control to human.

#### Request Body
```json
{
  "conversationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "replyText": "Hi there, I can issue that refund for you right now.",
  "operatorName": "Operator"
}
```

#### Response `200 OK`
```json
{
  "success": true,
  "messageId": "9b12a843-..."
}
```

---

### `PATCH /api/conversations`
Updates conversation lifecycle status.

#### Request Body
```json
{
  "conversationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "status": "closed"
}
```

#### Response `200 OK`
```json
{
  "success": true
}
```

---

## 5. Media & Asset Endpoints

### `POST /api/avatar/upload`
Uploads a custom agent avatar to Neon Object Storage (AWS S3-compatible).

#### Request Format: `multipart/form-data`
* `file`: Image file (`image/png`, `image/jpeg`, `image/webp`, `image/gif`, `image/svg+xml`, max 5 MB).
* `workspaceId`: UUID string (optional).

#### Response `200 OK`
```json
{
  "success": true,
  "avatarUrl": "https://s3.us-east-1.amazonaws.com/avatars/avatars/1712739281-logo.png",
  "avatarKey": "avatars/1712739281-logo.png"
}
```
