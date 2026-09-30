# Acadia — Postman Test Collections

## Files

| File | Description |
|---|---|
| `acadia-unit-tests.json` | Unit test collection — 53 test cases across 7 modules |
| `acadia-integration-tests.json` | Integration test collection — 5 end-to-end flows |
| `acadia-environment.json` | Environment variables (base URL, credentials, dynamic IDs) |

---

## Prerequisites

1. Backend running on port 5000 (`npm run dev` in `backend/`)
2. MongoDB running with seeded data (`node seed.js` in `backend/`)
3. ML services running on ports 5002 and 5003 (optional — tests degrade gracefully)
4. Newman installed globally:

```bash
npm install -g newman newman-reporter-htmlextra
```

---

## Run Unit Tests

```bash
newman run acadia-unit-tests.json \
  --environment acadia-environment.json \
  -r htmlextra \
  --reporter-htmlextra-export reports/unit-test-report.html
```

---

## Run Integration Tests

```bash
newman run acadia-integration-tests.json \
  --environment acadia-environment.json \
  -r htmlextra \
  --reporter-htmlextra-export reports/integration-test-report.html
```

---

## Run Both and Generate Combined Report

```bash
newman run acadia-unit-tests.json --environment acadia-environment.json -r htmlextra --reporter-htmlextra-export reports/unit-test-report.html

newman run acadia-integration-tests.json --environment acadia-environment.json -r htmlextra --reporter-htmlextra-export reports/integration-test-report.html
```

Open `reports/unit-test-report.html` and `reports/integration-test-report.html` in a browser for the full documented evidence with request/response details.

---

## Import into Postman (for manual runs)

1. Open Postman → Import → select `acadia-unit-tests.json`
2. Open Postman → Import → select `acadia-integration-tests.json`
3. Open Postman → Environments → Import → select `acadia-environment.json`
4. Select "Acadia Local" environment from the environment dropdown
5. Run collections manually or use the Collection Runner

---

## Notes

- **IT-007 (Account Lockout)** — set `{{lockedUserId}}` in the environment to the student's MongoDB `_id` before running, or run this test separately after identifying the ID from a GET users call
- **IT-001, IT-003, IT-004** — these flows require file uploads (PDF) which cannot be scripted in JSON; run them manually in Postman using the Collection Runner and attach a PDF in the multipart form body
- **UT-AUTH-003/004/005** — lockout tests require a fresh unlocked account; re-seed or reset between runs
