# CA1 - Events Management REST API (Node.js + Express.js)

A RESTful API for managing events, using an **in-memory array** as storage (no database).

## Tech Stack
- Node.js
- Express.js

## Event Object Structure
```json
{
  "id": 1,
  "name": "Tech Fest 2026",
  "category": "Technology",
  "date": "2026-08-10",
  "status": "Scheduled"
}
```
Valid `status` values: `Scheduled`, `Ongoing`, `Completed`, `Cancelled`

## Setup Instructions
```bash
npm install
node server.js
```
Server runs on `http://localhost:3000`

## API Endpoints

| Method | Endpoint                     | Description                     |
|--------|-------------------------------|----------------------------------|
| GET    | /api/events                  | Retrieve all events             |
| GET    | /api/events/:id               | Retrieve a single event by ID    |
| POST   | /api/events                  | Add a new event (validated)     |
| PUT    | /api/events/:id               | Update full event details        |
| PATCH  | /api/events/:id/status         | Update only the event status     |
| DELETE | /api/events/:id               | Delete an event by ID            |

## Example Requests

### Create an event
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{"name":"Hackathon","category":"Tech","date":"2026-10-01","status":"Scheduled"}'
```

### Update status only
```bash
curl -X PATCH http://localhost:3000/api/events/1/status \
  -H "Content-Type: application/json" \
  -d '{"status":"Completed"}'
```

## Error Handling
All errors are handled by a centralized error-handling middleware and return JSON in the form:
```json
{
  "success": false,
  "message": "Event with id 999 not found"
}
```

## Notes
Data is stored in memory only — it resets every time the server restarts.
