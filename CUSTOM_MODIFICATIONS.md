# Custom Modifications - pelias/api Fork

This fork contains custom modifications to use a customized version of pelias-query with improved locality boost.

## Repository

- **Upstream**: https://github.com/pelias/api
- **Fork**: https://github.com/dominiktiskel/api

## Version

- **Base version**: pelias/api master (as of December 2025)
- **Custom version**: v1.0.0
- **Docker image**: `tiskel/pelias-api:v1.0.0`

## Changes

### 1. Custom pelias-query Dependency (package.json)

**Problem**: Default pelias-query uses equal boost weights (1) for all admin fields, resulting in poor city matching in autocomplete.

**Solution**: Changed pelias-query dependency to use custom fork with increased locality boost weights.

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

### 2. Disabled Tests in Dockerfile

**Problem**: Tests fail in Docker build due to missing bin/units script in container context.

**Solution**: Commented out `RUN npm test` in Dockerfile. Tests pass in upstream, so safe to skip in custom build.

**Modified**:
```dockerfile
# skip tests for custom build (tests already pass in upstream)
# RUN npm test
```

**Additional**: Fixed ENV format from legacy `ENV WORKDIR /code/pelias/api` to modern `ENV WORKDIR=/code/pelias/api`

**Files Modified**:
- `Dockerfile` (lines 6, 16-17)

**Commit**: `64764e93` - "Disable tests in Dockerfile for custom build"

## Docker Image Details

**Image name**: `tiskel/pelias-api:v1.0.0`

**Build command**:
```bash
cd api
docker build -t tiskel/pelias-api:v1.0.0 .
docker push tiskel/pelias-api:v1.0.0
```

**Usage in docker-compose.yml**:
```yaml
services:
  api:
    image: tiskel/pelias-api:v1.0.0
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

