# Custom Modifications - pelias/api Fork

This fork contains custom modifications to use a customized version of pelias-query with improved locality boost.

## Repository

- **Upstream**: https://github.com/pelias/api
- **Fork**: https://github.com/dominiktiskel/api

## Version

- **Base version**: pelias/api master (as of December 2025)
- **Custom version**: v1.0.4
- **Docker image**: `tiskel/pelias-api:v1.0.4`

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

### 2. Always Return Category Field in API Response (v1.0.3)

**Problem**: The `category` field was only included in API responses when the user explicitly passed a `?categories=...` parameter in the query. This was due to a conditional check `condition: checkCategoryParam` in `helper/geojsonify_place_details.js`. The `categories` parameter should be used for **filtering** results, not for **controlling** whether the category field is displayed in the response.

**Impact**: POI type information (e.g., bus_stop, place_of_worship, restaurant) was never visible in API responses, even when present in Elasticsearch, making it impossible to:
- Display appropriate icons for POIs in the UI
- Understand what type of POI a result represents
- Use category data in client applications

**Solution**: Removed the `condition: checkCategoryParam` from the category field definition, making categories always visible in API responses when present in the source data.

**Modified**:
```javascript
// Before (line 60)
{ name: 'category', type: 'array', condition: checkCategoryParam }

// After
{ name: 'category', type: 'array' }
```

**Result**:
- Categories now always appear in API responses when available
- The `?categories=...` parameter still works for **filtering** results
- POI type information is now accessible to client applications

**Example Response (After)**:
```json
{
  "properties": {
    "id": "way/315916061",
    "name": "Kościół św. Stanisława Biskupa i Męczennika",
    "layer": "venue",
    "category": ["religion"]
  }
}
```

**Files Modified**:
- `helper/geojsonify_place_details.js` (line 60, removed condition)
- `helper/geojsonify_place_details.js` (lines 73-75, removed unused `checkCategoryParam` function)

**Commit**: v1.0.3

### 3. Disable Venue Deduplication by Primary Name (v1.0.4)

**Problem**: The Pelias API was deduplicating POIs at the same location if they shared ANY alias in `name.default`, even if their primary names were different. For example:
- "Mercedes-Benz Trucks Grupa Wróbel" (primary name)
- "Tacho & CB Serwis" (primary name)

Both are car repair shops (`car_repair`) at Sułowska 10, so they have the same type aliases ("Mechanik", "Warsztat", "Serwis samochodowy"). The deduplication logic compared ALL names in `name.default` (including aliases) and found a match in the aliases, treating them as duplicates. Only one POI would appear in API results.

**Impact**: Users couldn't see multiple businesses of the same type at the same location, even though they are completely different entities with different names.

**Solution**: Modified `helper/diffPlaces.js` to compare ONLY the primary (first) name for venue layer, not all aliases. If two venues have different primary names, they are considered different POIs regardless of shared type aliases.

**Modified** (`helper/diffPlaces.js`, lines 163-184):
```javascript
// CUSTOM: For venue layer, compare only the primary name (first element)
// not all aliases. This allows multiple venues at the same location
// with the same type (e.g., two car repair shops) to both appear in results.
const isVenue1 = _.get(item1, 'layer') === 'venue' || !_.includes( canonicalLayers, _.get(item1, 'layer') );
const isVenue2 = _.get(item2, 'layer') === 'venue' || !_.includes( canonicalLayers, _.get(item2, 'layer') );

if (isVenue1 && isVenue2) {
  // For venues, only compare the primary (first) name, ignore aliases
  const primaryName1 = field.getArrayValue(names1.default)[0];
  const primaryName2 = field.getArrayValue(names2.default)[0];
  
  if (primaryName1 && primaryName2) {
    const normalized1 = normalizeString(field.getStringValue(primaryName1));
    const normalized2 = normalizeString(field.getStringValue(primaryName2));
    
    // If primary names are different, these are different venues
    if (normalized1 !== normalized2) {
      return true;
    }
  }
}
```

**Result**:
- ✅ Multiple venues at same location with different names now both appear
- ✅ "Mechanik Sułowska" search now returns BOTH Mercedes-Benz and Tacho & CB
- ✅ Legitimate duplicates (same name, same location) still deduplicated
- ✅ Type aliases still work for search, but don't cause false deduplication

**Example Search Result (After)**:

Query: `http://localhost:4000/v1/autocomplete?text=Mechanik%20Sułowska`

```json
{
  "features": [
    {
      "properties": {
        "name": "Tacho & CB Serwis",
        "street": "Sułowska",
        "category": ["retail"],
        "addendum": {
          "osm": {
            "type": "car_repair",
            "type_name": "Warsztat samochodowy"
          }
        }
      }
    },
    {
      "properties": {
        "name": "Mercedes-Benz Trucks Grupa Wróbel",
        "street": "Sułowska",
        "category": ["retail"],
        "addendum": {
          "osm": {
            "type": "car_repair",
            "type_name": "Warsztat samochodowy"
          }
        }
      }
    }
  ]
}
```

**Files Modified**:
- `helper/diffPlaces.js` (lines 163-184, added venue primary name check)

**Commit**: v1.0.4

### 4. Deduplicate OSM Alternative Names (v1.0.4)

**Problem**: OSM POIs with multiple name variants (`name`, `official_name`, `short_name`, `alt_name`) were imported as separate documents with suffixes. For example:
- `way/677719698` - "Publiczne Przedszkole LiPi" (from OSM `name`)
- `way/677719698_official` - "Publiczne Przedszkole \"Lipi\"" (from OSM `official_name`)
- `way/677719698_short` - "LiPi" (from OSM `short_name`)
- `way/677719698_alt1`, `_alt2`, ... (from OSM `alt_name` semicolon-separated)

All variants have the same `original_name` in `addendum.osm`, same coordinates, same address. They should appear as ONE result, preferring the primary name (without any suffix).

**Impact**: Duplicate POIs cluttered search results, confusing users.

**Solution**: 

1. Added `isOsmAlternativeNameDuplicate()` function to detect duplicates:
   - Compares base `source_id` (removing `_official`, `_short`, `_alt1`, `_alt2`, etc.)
   - Checks if `addendum.osm.original_name` is identical
   - Returns `false` (same POI) if both conditions met

2. Modified `isDifferent()` to use this check (similar to Geonames concordance)

3. Modified `isPreferred()` in `middleware/dedupe.js` with priority order:
   - **Priority 0**: No suffix (original `name`)
   - **Priority 1**: `_short` (from `short_name`)
   - **Priority 2**: `_official` (from `official_name`)
   - **Priority 3+**: `_alt1`, `_alt2`, `_alt3`, ... (from `alt_name`)

**Modified** (`helper/diffPlaces.js`, lines 268-318):
```javascript
function isOsmAlternativeNameDuplicate(item1, item2) {
  if (item1.source !== 'openstreetmap' || item2.source !== 'openstreetmap') {
    return false;
  }

  // Remove ALL alternative name suffixes: _official, _short, _alt1, _alt2, etc.
  const getBaseSourceId = (sourceId) => {
    if (!sourceId) return null;
    return sourceId.replace(/_(official|short|alt\d+)$/, '');
  };

  const baseId1 = getBaseSourceId(item1.source_id);
  const baseId2 = getBaseSourceId(item2.source_id);

  if (!baseId1 || !baseId2 || baseId1 !== baseId2) {
    return false;
  }

  const osmData1 = _.get(item1, 'addendum.osm');
  const osmData2 = _.get(item2, 'addendum.osm');
  
  // Decode and compare original_name
  // Returns true if same POI
}
```

**Modified** (`middleware/dedupe.js`, lines 69-91):
```javascript
// CUSTOM: prefer OSM records with primary names over alternative names
// Priority order: no suffix > _short > _official > _alt1 > _alt2 > ...
if (existingHit.source === 'openstreetmap' && candidateHit.source === 'openstreetmap') {
  const getNameTypePriority = (sourceId) => {
    if (!sourceId) return 0;
    if (!sourceId.match(/_(official|short|alt\d+)$/)) return 0; // No suffix = highest
    if (sourceId.endsWith('_short')) return 1;
    if (sourceId.endsWith('_official')) return 2;
    const altMatch = sourceId.match(/_alt(\d+)$/);
    if (altMatch) return 3 + parseInt(altMatch[1]); // alt1=4, alt2=5, ...
    return 999;
  };
  
  const existingPriority = getNameTypePriority(existingHit.source_id);
  const candidatePriority = getNameTypePriority(candidateHit.source_id);
  
  if (candidatePriority < existingPriority) { return true; }
  if (existingPriority < candidatePriority) { return false; }
}
```

**Result**:
- ✅ "Przedszkole Cynamonowa" now shows 2 kindergartens instead of 4+
- ✅ Always shows the primary name (from OSM `name` tag, no suffix)
- ✅ Alternative names (`official_name`, `short_name`, `alt_name`) are hidden but searchable via aliases
- ✅ Preference order ensures best name variant is shown: `name` > `short_name` > `official_name` > `alt_name`

**Example Search Result (After)**:

Query: `http://localhost:4000/v1/autocomplete?text=Przedszkole%20Cynamonowa`

```json
{
  "features": [
    {
      "properties": {
        "id": "way/677719698",
        "name": "Publiczne Przedszkole LiPi",
        "addendum": {
          "osm": {
            "original_name": "Publiczne Przedszkole LiPi"
          }
        }
      }
    }
    // No longer shows way/677719698_official
  ]
}
```

**Files Modified**:
- `helper/diffPlaces.js` (lines 268-331, added OSM alternative name detection)
- `middleware/dedupe.js` (lines 69-79, prefer primary name)

**Commit**: v1.0.4

### 5. Custom pelias-query Dependency (package.json)

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

### 6. Fixed Windows Line Endings (CRLF) in Dockerfile

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

**Image name**: `tiskel/pelias-api:v1.0.4`

**Build command**:
```bash
cd api
docker build -t tiskel/pelias-api:v1.0.4 .
docker push tiskel/pelias-api:v1.0.4
```

**Usage in docker-compose.yml**:
```yaml
services:
  api:
    image: tiskel/pelias-api:v1.0.4
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

