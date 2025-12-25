# Pronunciation Assessment API Error Diagnosis

## Error Details
- **Error**: Empty response `{}` from `/api/pronunciation-assessment`
- **Location**: `submitPronunciationAssessment.ts:46`
- **Status**: API returns error but body is empty `{}`

## API Route Analysis (from `route.ts`)

### Required Environment Variable
```typescript
const WHISPER_BASE_URL = resolveWhisperBaseUrl();
```

**Resolution logic:**
1. Checks `WHISPER_BASE_URL` env var
2. Falls back to `NEXT_PUBLIC_WHISPER_BASE_URL`
3. In development: defaults to `http://127.0.0.1:8000`
4. In production: returns `null` if not set

### Error Cases That Return JSON:

1. **Missing WHISPER_BASE_URL** (line 130-135):
   ```json
   { "error": "WHISPER_BASE_URL env var is not configured." }
   ```
   Status: 500

2. **Missing referenceText** (line 139-144):
   ```json
   { "error": "Missing referenceText query param" }
   ```
   Status: 400

3. **Wrong content type** (line 147-152):
   ```json
   { "error": "Expected multipart/form-data with field \"file\"" }
   ```
   Status: 400

4. **Missing file** (line 157-162):
   ```json
   { "error": "Missing audio file (field \"file\")" }
   ```
   Status: 400

5. **Whisper server error** (line 181-188):
   ```json
   { "error": "Whisper server error", "status": <whisper_status> }
   ```
   Status: 502

6. **Timeout** (line 201-206):
   ```json
   { "error": "Whisper request timed out." }
   ```
   Status: 504

7. **Other errors** (line 201-206):
   ```json
   { "error": <error_message> }
   ```
   Status: 500

## Why Empty Response `{}`?

The empty response suggests one of these scenarios:

### Scenario 1: Response parsing failure
- API returns error but `res.json()` fails to parse
- Falls back to empty object: `await res.json().catch(() => ({}))`
- **Possible causes**:
  - Response is not valid JSON
  - Response body is empty
  - Network error before response received

### Scenario 2: Whisper server not running
- API tries to connect to Whisper server at `http://127.0.0.1:8000`
- Connection fails or times out
- Error might not be properly formatted

### Scenario 3: Environment variable not set
- `WHISPER_BASE_URL` not configured
- API returns 500 with error message
- But response parsing might be failing

## Required Setup

### 1. Whisper Server Must Be Running
The Whisper server (`whisper/server.py`) must be running on:
- **Development**: `http://127.0.0.1:8000` (default)
- **Production**: Set via `WHISPER_BASE_URL` env var

### 2. Environment Variables
```bash
# Required for production
WHISPER_BASE_URL=http://your-whisper-server:8000

# Optional
WHISPER_TIMEOUT_MS=15000  # Default: 15000ms
```

### 3. Whisper Server Endpoints
- **Health check**: `GET /healthz`
- **Transcribe**: `POST /transcribe` (expects FormData with 'file')

## Diagnostic Steps

### Step 1: Check if Whisper server is running
```bash
curl http://127.0.0.1:8000/healthz
```
Expected response:
```json
{ "status": "ok", "model": "small" }
```

### Step 2: Check environment variables
In OuiiSpeak repo, verify:
```bash
echo $WHISPER_BASE_URL
echo $NEXT_PUBLIC_WHISPER_BASE_URL
```

### Step 3: Check API route logs
Look for console errors in:
- Next.js server logs
- Browser console (for client-side errors)
- Whisper server logs

### Step 4: Test API directly
```bash
curl -X POST http://localhost:3000/api/pronunciation-assessment?referenceText=test \
  -F "file=@test.webm" \
  -H "Content-Type: multipart/form-data"
```

## Most Likely Issues

### Issue 1: Whisper Server Not Running ⚠️ **MOST LIKELY**
- **Symptom**: Empty response `{}`
- **Cause**: Whisper server at `http://127.0.0.1:8000` is not running
- **Fix**: Start Whisper server:
  ```bash
  cd whisper
  python server.py
  ```

### Issue 2: Environment Variable Not Set
- **Symptom**: 500 error with message about WHISPER_BASE_URL
- **Cause**: `WHISPER_BASE_URL` not configured in production
- **Fix**: Set environment variable

### Issue 3: Network/Connection Issue
- **Symptom**: Timeout or connection refused
- **Cause**: Can't reach Whisper server
- **Fix**: Check network, firewall, server status

## Recommended Fixes

### Immediate Actions:
1. **Start Whisper server** (if not running):
   ```bash
   cd /Users/raycheljohnson/ouiispeak/whisper
   python server.py
   ```

2. **Verify Whisper server is accessible**:
   ```bash
   curl http://127.0.0.1:8000/healthz
   ```

3. **Check OuiiSpeak environment variables**:
   - Ensure `WHISPER_BASE_URL` is set (or defaults to localhost in dev)

4. **Check browser console** for more detailed error messages

5. **Check Next.js server logs** for API route errors

## Additional Notes

- The API route properly handles errors and returns JSON
- Empty `{}` suggests response parsing failed, not that API returned empty
- Check the actual HTTP status code in browser Network tab
- Whisper server must be running separately from Next.js app

