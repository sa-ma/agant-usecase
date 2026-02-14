# API Overview

Base URL: `http://localhost:8000/api`

Authentication uses bearer tokens returned from `POST /auth/login`.

Key endpoints:

- `POST /auth/login`
- `GET /me`
- `GET /customers`
- `POST /customers`
- `PATCH /customers/{id}/kyb`
- `GET /customers/{id}/addresses`
- `POST /customers/{id}/addresses`
- `PATCH /addresses/{id}/revoke`
- `GET /requests`
- `POST /requests`
- `POST /requests/{id}/approve`
- `POST /requests/{id}/submit`
- `POST /requests/{id}/settle`
- `POST /token/pause`
- `POST /token/unpause`
- `POST /token/freeze`
- `POST /token/unfreeze`
- `GET /token/status`
- `GET /transactions`
- `GET /transactions/export.csv`
- `GET /audit-logs`
- `GET /audit-logs/export.csv`
- `GET /reserves/snapshot`
