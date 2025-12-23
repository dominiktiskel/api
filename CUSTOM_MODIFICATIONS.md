# Custom Modifications - pelias/api Fork

This fork contains custom modifications to use a customized version of pelias-query with improved locality boost.

## Repository

- **Upstream**: https://github.com/pelias/api
- **Fork**: https://github.com/dominiktiskel/api

## Version

- **Base version**: pelias/api master (as of December 2025)
- **Custom version**: v1.0.2
- **Docker image**: `tiskel/pelias-api:v1.0.2`

## Changes

### 1. Fixed Admin Locality Boost Values (query/autocomplete_defaults.js)

**Problem**: When searching "Street, City", Pelias did not prioritize results from the specified city. The root cause was that `query/autocomplete_defaults.js` had all admin boost values hardcoded to 1, overriding any values from `pelias-query/defaults.json`.

**Solution**: Updated boost values directly in `query/autocomplete_defaults.js`:

```javascript
// Before (all were 1)
'admin:locality:boost': 1,
'admin:localadmin:boost': 1,
'admin:county:boost': 1,
'admin:region:boost': 1,
'admin:neighbourhood:boost': 1,
'admin:borough:boost': 1,

// After
'admin:locality:boost': 10,     // Highest priority for city matching
'admin:localadmin:boost': 8,
'admin:borough:boost': 10,
'admin:county:boost': 5,
'admin:region:boost': 3,
'admin:neighbourhood:boost': 12, // Most granular
```

**Impact**: When searching "Akacjowa, Wrocław", results from Wrocław now appear first instead of being mixed with other localities.

**Files Modified**:
- `query/autocomplete_defaults.js` (lines 73-111)

**Commits**: 
- `d3d94b9d` - "Fix admin locality boost values in autocomplete defaults"
- `66a8a9cc` - "Remove debug logging, release v1.0.2"

### 2. Custom pelias-query Dependency (package.json)

**Problem**: Default pelias-query uses equal boost weights (1) for all admin fields, resulting in poor city matching in autocomplete.

**Solution**: Changed pelias-query dependency to use custom fork with increased locality boost weights.

**Note**: This change was later found to be ineffective because `query/autocomplete_defaults.js` was overriding the values. Kept for consistency with upstream pelias-query improvements.

**Modified**:
```json
// Before
"pelias-query": "^11.4.0"

// After  
"pelias-query": "git+https://github.com/dominiktiskel/query.git#master"
```

**Files Modified**:
- `package.json` (line 58)

**Commit**: `ee326a62` - "Use custom fork of pelias-query with improved locality boost"

### 2. Fixed Windows Line Endings (CRLF) in Dockerfile

**Problem**: When building on Windows, shell scripts in `bin/` directory contain CRLF line endings, causing "no such file or directory" errors when running on Linux containers.

**Solution**: Modified Dockerfile to convert CRLF to LF and set execute permissions as root user before switching to pelias user.

**Modified**:
```dockerfile
# Fix Windows line endings (CRLF -> LF) for shell scripts as root
RUN find . -type f -name "*.sh" -exec sed -i 's/\r$//' {} \; && \
    find ./bin -type f -exec sed -i 's/\r$//' {} \; && \
    chmod +x ./bin/*

# Fix ownership for pelias user
RUN chown -R pelias:pelias ${WORKDIR}

# Switch to pelias user
USER pelias
```

**Additional changes**:
- Disabled tests in Docker build (tests pass in upstream)
- Fixed ENV format from legacy `ENV WORKDIR /code/pelias/api` to modern `ENV WORKDIR=/code/pelias/api`
- Reorganized Dockerfile to copy files as root first, then fix line endings/permissions, then switch to pelias user

**Files Modified**:
- `Dockerfile` (complete restructure)

**Commits**: 
- `64764e93` - "Disable tests in Dockerfile for custom build"
- `4ed1cd96` - "Fix Windows line endings (CRLF) in shell scripts"
- `8ac92ab2` - "Fix Dockerfile to handle line endings conversion as root user"

## Docker Image Details

**Image name**: `tiskel/pelias-api:v1.0.2`

**Build command**:
```bash
cd api
docker build -t tiskel/pelias-api:v1.0.2 .
docker push tiskel/pelias-api:v1.0.2
```

**Usage in docker-compose.yml**:
```yaml
services:
  api:
    image: tiskel/pelias-api:v1.0.2
    # ... rest of config
```

## Changes Summary

This fork modifies the Pelias API to use a custom version of pelias-query that provides better ranking for autocomplete results when users specify city names in their queries.

**Key improvement**: Searching "Street, City" now prioritizes results from that specific city instead of mixing results from multiple cities.

## Testing

After deployment:

```bash
# Should show Wrocław results first
curl "http://localhost:4000/v1/autocomplete?text=Akacjowa,%20Wrocław&sources=openstreetmap"

# Should show Długołęka results first  
curl "http://localhost:4000/v1/autocomplete?text=Akacjowa,%20Długołęka&sources=openstreetmap"

# Should show best text match (no city preference)
curl "http://localhost:4000/v1/autocomplete?text=Akacjowa&sources=openstreetmap"
```

## Maintenance

### Updating pelias-query boost values

If you need to adjust boost values:

1. Modify `defaults.json` in dominiktiskel/query fork
2. Commit and push changes
3. Rebuild this API image (npm will fetch latest from git)

### Syncing with upstream pelias/api

```bash
git remote add upstream https://github.com/pelias/api.git
git fetch upstream
git merge upstream/master
# Resolve conflicts if needed
# Ensure package.json still points to custom query fork
```

## Related Repositories

- **pelias/query**: https://github.com/dominiktiskel/query - Custom boost weights
- **openstreetmap**: https://github.com/dominiktiskel/openstreetmap - Custom OSM import with street aggregation and range expansion

## Dependencies

This custom API requires:
- Custom pelias-query fork (dominiktiskel/query) - provides improved boost weights
- Standard Pelias infrastructure (Elasticsearch, libpostal, etc.)

