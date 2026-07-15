# HTTP QUERY + Express AI Search Demo

Shows why **HTTP QUERY** ([RFC 10008](https://www.rfc-editor.org/rfc/rfc10008.html)) fits **complex AI search**:
filters + semantic text + `topK` / `minScore` in one JSON body.

- **GET** — awkward for rich query bodies  
- **POST** — meant for creating/changing resources  
- **QUERY** — safe **read** with a structured body (like AI / vector retrieval)

Stack: Express

## Requirement

Node.js **21.7.2+** (HTTP parser must allow `QUERY`).

```bash
node -v
npm install
npm start
```

Server: `http://localhost:3001`

## Try it in Postman

**Do not paste a curl into the URL bar.** That box only accepts a URL like `http://localhost:3001/...`

### Create the QUERY request by hand

1. Click **New** → **HTTP Request**
2. In the method dropdown, **type** `QUERY` (it may not be listed)
3. URL field — paste **only** this:
   ```
   http://localhost:3001/api/ai/search
   ```
4. **Headers** tab → add `Content-Type` = `application/json`
5. **Body** tab → **raw** → **JSON** → paste:

```json
{
  "text": "refund policy and billing disputes",
  "filters": {
    "orgId": "acme",
    "type": "pdf",
    "tags": ["refund", "billing"]
  },
  "topK": 3,
  "minScore": 0.4
}
```

6. Click **Send**

List docs: method **GET**, URL only:
```
http://localhost:3001/api/ai/documents
```

### Optional: Import curl correctly

Use **Import** (top left) → **Raw text** → paste the curl → **Import**.  
Never paste curl into the address/URL field.

## Structure

```
src/
  app.js                 # cors, helmet, mount /api
  server.js              # listen
  routes/                # /api/ai/...
  controllers/           # handlers
  data/vectorStore.js    # in-memory dummy knowledge base
  middleware/            # errors
  utils/                 # AppError, catchAsync
examples/
  query-body.json
```
