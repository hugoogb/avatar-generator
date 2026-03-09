# Avatar Generator - Sync Fixes & Issues

## Critical Sync Issues

### 1. React playground missing Anime style
- **File**: `playgrounds/react/main.tsx`
- **Status**: [ ] Fixed
- **Problem**: Core playground has all 7 styles (including anime), but React playground only imports and renders 6 styles
- **Fix**: Add `anime` import from `@avatar-style-anime/src`, import `ANIME_OPTIONS` from consts, add `<StyleSection>` for Anime

### 2. Docs interactive Playground missing Anime
- **File**: `docs/src/components/Playground.astro`
- **Status**: [ ] Fixed
- **Problem**: Comment says "Shows all 6 avatar styles" (should be 7). Only 6 style cards rendered — no Anime card, no `generateAnime` function, no `preview-anime` in the `previews` map
- **Fix**: Update comment to 7, add Anime style card HTML, add `generateAnime` function, add `preview-anime` to previews map

### 3. Docs FacesOptions lists WRONG style values
- **File**: `docs/src/content/docs/reference/avatar.mdx` (lines 106-108)
- **Status**: [ ] Fixed
- **Problem**: Documentation lists incorrect option values for Faces style that don't match the actual implementation
  - `hairStyle` docs: `"none"`, `"short"`, `"flat"`, `"parted"`, `"long"`, `"curly"`, `"mohawk"`, `"buzz"`
  - `hairStyle` actual: `"none"`, `"flat-top"`, `"cap"`, `"side-swept"`, `"spiky"`, `"round-top"`, `"mohawk"`, `"beanie"`
  - `eyeStyle` docs: `"dots"`, `"circles"`, `"closed"`, `"happy"`
  - `eyeStyle` actual: `"dots"`, `"rectangles"`, `"lines"`, `"round"`
  - `mouthStyle` docs: `"smile"`, `"neutral"`, `"open"`, `"smirk"`, `"small"`
  - `mouthStyle` actual: `"line"`, `"rect-smile"`, `"open-rect"`, `"zigzag"`, `"dot"`
- **Fix**: Update all three option value lists to match `src/lib/styles/faces/src/index.ts`

### 4. Playground consts use wrong Faces values
- **File**: `playgrounds/consts.ts` (lines 66-67)
- **Status**: [ ] Fixed
- **Problem**: Test data uses values from the Illustrated style instead of valid Faces values
  - `hairStyle: "curly"` — not a valid Faces hair style
  - `eyeStyle: "happy"` — not a valid Faces eye style
  - `mouthStyle: "smile"` — not a valid Faces mouth style
  - These silently fall through to random selection, making test data ineffective
- **Fix**: Use valid Faces values: `hairStyle: "side-swept"`, `eyeStyle: "round"`, `mouthStyle: "rect-smile"`

## Minor Issues

### 5. Syntax issue in consts.ts
- **File**: `playgrounds/consts.ts` (line 5)
- **Status**: [ ] Fixed
- **Problem**: `"Hugo GB` is missing closing `",`
- **Fix**: Change to `"Hugo GB",`

### 6. Docs README is generic Starlight template
- **File**: `docs/README.md`
- **Status**: [ ] Pending
- **Problem**: Still contains default Starlight starter kit content
- **Fix**: Replace with avatar-generator docs description (future)

### 7. No unit tests
- **Status**: [ ] Pending
- **Problem**: No test files exist for any package
- **Fix**: Add test infrastructure and basic tests (future — v2.1.0)

### 8. No Angular playground
- **Status**: [ ] Pending
- **Problem**: Only core + react playgrounds exist
- **Fix**: Add Angular playground (future — v2.2.0)

### 9. Legacy v1 test data
- **File**: `playgrounds/consts.ts` (lines 96-116)
- **Status**: [ ] Pending
- **Problem**: `LEGACY_OPTIONS` export is unused in current playgrounds
- **Fix**: Remove or keep for backwards compat testing (low priority)
