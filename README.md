# HTTP QUERY Method

Compares three ways to **fetch** the same filtered product data with [HTTP QUERY]:

| Method | Can fetch? | How filters are sent | Problem |
|--------|------------|----------------------|---------|
| **GET** | Yes | URL query params | URL length / encoding limits; bad for arrays & nested filters |
| **POST** | Yes (workaround) | JSON body | Works for large filters, but POST means **write**, not read |
| **QUERY** | Yes | JSON body | Safe **read** with a body — fixes both |

## What data is this fetching?

Product catalog data. Each product includes:

- `name` — e.g. Wireless Mouse, Desk Lamp  
- `category` — `electronics`, `furniture`, or `stationery`  
- `price` — number  
- `inStock` — `true` / `false`  
- `tags` — e.g. `wireless`, `office`, `audio`

GET, POST, and QUERY all return products from this catalog. You can filter by category, price, stock, and tags.

Stack: Express.

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

---

### 1. GET — fetch with URL parameters (limited)

**Short URL works.** Method **GET**:
```
http://localhost:3001/api/products?category=electronics&inStock=true&maxPrice=100&tag=wireless
```

Or list everything:
```
http://localhost:3001/api/products
```

**Long URL fails (414).** GET filters live after `?`. If that part is longer than **500 characters**, the server returns **414 URI Too Long**.

1. Open `examples/get-long-url.txt` and copy the full URL  
2. Method **GET** → paste into the URL field → **Send**  
3. You should get status **414** and a message to use QUERY with a JSON body instead

Or build your own:  
`http://localhost:3001/api/products?category=electronics&q=` + more than ~500 characters after `?`.

**Limitation:** large filters do not fit safely in the URL. Response includes a `limitation` field on success, or **414** when the query string is too long.

---

### 2. POST — fetch with a JSON body (workaround, still limited)

People often use POST to “search” because GET cannot carry a rich body.

Method **POST**, URL:
```
http://localhost:3001/api/products/search
```

Headers: `Content-Type` = `application/json`  
Body → **raw** → **JSON** (same as `examples/post-body.json`):

```json
{
  "category": "electronics",
  "inStock": true,
  "maxPrice": 100,
  "tags": ["wireless", "audio"]
}
```

**Limitations to notice (send the request 2–3 times):**

1. **Side effect** — response field `postSideEffects` goes up each time (1, 2, 3…). POST is treated as unsafe / write-like, so retries are risky.  
2. **Caching** — response headers include `Cache-Control: no-store` and `X-HTTP-Safe: false`. Caches must not treat this as a normal read.

The body works for large filters, but the method is wrong for fetching.

---

### 3. QUERY — fetch with a JSON body (correct)

Method: type **QUERY** in Postman (it may not be in the list).  
URL:
```
http://localhost:3001/api/products/query
```

Headers: `Content-Type` = `application/json`  
Body → **raw** → **JSON** (same as `examples/query-body.json`):

```json
{
  "category": "electronics",
  "inStock": true,
  "maxPrice": 100,
  "tags": ["wireless", "audio"]
}
```

**Compare with POST:**

1. Same JSON body and filtered products.  
2. `postSideEffects` stays the **same** (QUERY does not bump it).  
3. Headers: `Cache-Control: private, max-age=60` and `X-HTTP-Safe: true` — a safe read that can be cached.

**Why QUERY:** rich body like POST, safe read like GET — without URL length limits or write semantics.

---

### Optional: Import curl correctly

Use **Import** (top left) → **Raw text** → paste the curl → **Import**.  
Never paste curl into the address/URL field.

## Structure

```
src/
  app.js                 # cors, helmet, mount /api
  server.js              # listen
  routes/                # /api/products/...
  controllers/           # handlers
  data/db.js             # product catalog
  middleware/            # errors
  utils/                 # AppError, catchAsync
examples/
  get-long-url.txt       # oversized GET URL → 414
  post-body.json         # body for POST /search
  query-body.json        # body for QUERY /query
```
