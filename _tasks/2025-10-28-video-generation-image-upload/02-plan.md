# Implementation Plan: Add Image-to-Video Support to video-generation Tool

**Date**: 2025-10-28
**Prepared by**: Don (Guillermo)
**Status**: Ready for Implementation

## Executive Summary

Add image-to-video functionality to the **new** `video-generation` tool at `apps/super-chatbot/src/app/tools/video-generation/`, enabling users to transform images into videos using Vertex AI Veo 2 and Veo 3. This builds upon the existing text-to-video capabilities while following proven patterns from the `image-generation` tool's file upload implementation.

**User Value**: Enable creative video workflows where users can animate still images, bringing photos and artwork to life with AI-powered motion.

**Performance Target**: < 2s file upload processing, maintain existing generation speeds

**DX Priority**: Reuse existing components, maintain type safety, follow Next.js 15 patterns

---

## Research Findings

### Existing Patterns Discovered

#### 1. File Upload Pattern (Image Generation Tool)
**File**: `apps/super-chatbot/src/app/tools/image-generation/components/image-generation-form.tsx`
- Lines 74-108: File upload state management with preview
- Uses `FileReader.readAsDataURL()` for base64 encoding
- Stores in form state as `sourceImageUrl: string`
- Clean pattern: `handleFileUpload` → `setImagePreview` → update form data

#### 2. Image Upload Component (Old Video Generator)
**File**: `apps/super-chatbot/src/app/tools/video-generator/components/image-upload.tsx`
- Lines 19-108: Advanced image processing with resolution matching
- Validates file type (JPEG, PNG, WebP) and size (< 10MB)
- Drag-and-drop support with visual feedback
- Image cropping/scaling to match target resolution
- **Decision**: Adapt this component for better UX

#### 3. API Pattern for Image Parameters
**File**: `apps/super-chatbot/src/app/tools/image-generation/api/image-generation-api.ts`
- Lines 4-15: `ImageGenerationRequest` with optional `sourceImageUrl`
- Lines 83-138: Conditional logic: with sourceImageUrl → edit endpoint, without → direct endpoint
- **Pattern to follow**: Use optional `sourceImageUrl` in `VideoGenerationRequest`

#### 4. Vertex AI API Structure
**File**: `apps/super-chatbot/src/app/api/video/generate-vertex/route.ts`
- Lines 11-17: Zod schema for video generation (currently text-only)
- Lines 143-157: Payload structure for Vertex AI
- **Gap**: Missing image parameter support in payload

#### 5. Documentation Evidence
**File**: `apps/super-chatbot/docs/ai-capabilities/video-generation/image-to-video-models.md`
- Vertex AI Veo 2 & Veo 3 support image-to-video
- Requires `image` field with `bytesBase64Encoded` or `gcsUri`
- Same duration/aspect ratio/resolution options as text-to-video

---

## Architecture Decisions

### 1. Component Reuse Strategy
**Decision**: Create dedicated `ImageUploadForVideo` component adapted from old video-generator
**Rationale**:
- Existing component has resolution matching (crucial for video)
- Proven drag-and-drop UX
- Image validation and processing logic
- **Trade-off**: Some code duplication vs shared component complexity

### 2. Form Mode Toggle
**Decision**: Single form with conditional UI based on `sourceImageUrl` presence
**Rationale**:
- Image generation tool uses this pattern successfully
- Simpler state management than tabs
- Users can switch modes by uploading/clearing image
- **Alternative considered**: Tabs for text-to-video vs image-to-video - rejected as over-engineering

### 3. API Endpoint Strategy
**Decision**: Modify existing Vertex AI endpoint to accept optional image parameter
**Rationale**:
- Vertex AI API handles both modes
- Fal.ai Veo3 doesn't support image-to-video (according to docs)
- Single endpoint simplifies client logic
- **Impact**: Fal.ai model will remain text-only, Vertex models get both capabilities

### 4. Image Encoding Approach
**Decision**: Use base64 encoding in request body (like image-generation)
**Rationale**:
- Simpler than GCS upload flow
- Works for images < 10MB (validated at upload)
- Vertex AI accepts `bytesBase64Encoded`
- **Trade-off**: Larger request payload vs implementation simplicity

---

## Implementation Plan

### Phase 1: Type Definitions & Schemas (Foundation)

**File**: `apps/super-chatbot/src/app/tools/video-generation/api/video-generation-api.ts`

**Changes**:
```typescript
// Add optional sourceImageUrl to request type
export interface VideoGenerationRequest {
  prompt: string;
  sourceImageUrl?: string; // NEW: Optional base64 data URL or URL
  duration?: number;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  resolution?: '720p' | '1080p';
  model?: VideoModel;
  generateAudio?: boolean;
  enhancePrompt?: boolean;
  negativePrompt?: string;
  seed?: number;
}
```

**Testing**:
- TypeScript compilation passes
- Existing code still works with optional field

---

### Phase 2: API Integration (Backend)

#### 2.1 Update Vertex AI Endpoint

**File**: `apps/super-chatbot/src/app/api/video/generate-vertex/route.ts`

**Changes**:
1. Update Zod schema (lines 11-17):
```typescript
const videoGenerationSchema = z.object({
  prompt: z.string().min(1, 'Промпт обязателен'),
  sourceImageUrl: z.string().optional(), // NEW
  duration: z.enum(['4', '6', '8']).optional().default('8'),
  aspectRatio: z.enum(['16:9', '9:16', '1:1']).optional().default('16:9'),
  resolution: z.enum(['720p', '1080p']).optional().default('720p'),
  negativePrompt: z.string().optional(),
});
```

2. Add image processing helper:
```typescript
function extractBase64FromDataUrl(dataUrl: string): string {
  // Handle data:image/jpeg;base64,... format
  const base64Match = dataUrl.match(/^data:image\/[^;]+;base64,(.+)$/);
  if (base64Match) return base64Match[1];

  // Already base64 or URL - return as is
  return dataUrl;
}
```

3. Update payload structure (lines 143-157):
```typescript
const payload: any = {
  instances: [
    {
      prompt: validatedData.prompt,
      ...(validatedData.sourceImageUrl && {
        image: {
          bytesBase64Encoded: extractBase64FromDataUrl(validatedData.sourceImageUrl)
        }
      }),
      ...(validatedData.negativePrompt && {
        negativePrompt: validatedData.negativePrompt,
      }),
    },
  ],
  parameters: {
    aspectRatio: validatedData.aspectRatio,
    resolution: validatedData.resolution,
    durationSeconds: Number.parseInt(validatedData.duration),
  },
};
```

**Testing Strategy**:
- Unit test: base64 extraction from data URL
- Integration test: Vertex AI payload validation (mock)
- Manual test: Real Vertex AI call with image

**Error Handling**:
- Invalid base64 → return 400 with helpful error
- Image too large → validate before sending to API
- Vertex API errors → log and return user-friendly message

---

#### 2.2 Update Balance Calculation

**File**: Same as 2.1

**Changes**:
```typescript
// Determine generation type based on source image
const generationType = validatedData.sourceImageUrl
  ? 'image-to-video'
  : 'text-to-video';

// Existing balance validation code...
const balanceValidation = await validateOperationBalance(
  userId,
  'video-generation',
  generationType,
  multipliers,
);
```

**Note**: Check if balance multipliers differ for image-to-video

---

### Phase 3: UI Components (Frontend)

#### 3.1 Create Image Upload Component

**File**: `apps/super-chatbot/src/app/tools/video-generation/components/image-upload-for-video.tsx` (NEW)

**Source Pattern**: Based on `apps/super-chatbot/src/app/tools/video-generator/components/image-upload.tsx`

**Key Features**:
- File validation (JPEG, PNG, WebP, < 10MB)
- Drag-and-drop support
- Image preview with remove button
- Resolution matching (scale to target video resolution)
- Loading states during processing

**Simplified Version** (remove complexity not needed for initial version):
- Keep: validation, preview, drag-and-drop
- Remove: Complex resolution matching (use simpler scaling)
- Remove: Advanced cropping UI (just center-crop)

**Props Interface**:
```typescript
interface ImageUploadForVideoProps {
  onImageSelect: (dataUrl: string) => void;
  onImageRemove: () => void;
  selectedImageUrl?: string | null;
  disabled?: boolean;
  targetResolution?: string;
}
```

**Implementation Notes**:
- Use `FileReader.readAsDataURL()` for base64 encoding
- Create preview with `<img src={dataUrl} />`
- Validate on selection, not on form submit
- Clear file input after selection to allow re-upload

---

#### 3.2 Update Video Generation Form

**File**: `apps/super-chatbot/src/app/tools/video-generation/components/video-generation-form.tsx`

**Changes**:

1. Add image state (after line 94):
```typescript
const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
```

2. Add image handlers:
```typescript
const handleImageSelect = (dataUrl: string) => {
  setImageDataUrl(dataUrl);
  setFormData(prev => ({ ...prev, sourceImageUrl: dataUrl }));
};

const handleImageRemove = () => {
  setImageDataUrl(null);
  setFormData(prev => ({ ...prev, sourceImageUrl: undefined }));
};
```

3. Add UI section (after model selection, before prompt):
```tsx
{/* Image Upload Section (NEW) */}
<div className="space-y-2">
  <Label>Source Image (Optional - for image-to-video)</Label>
  <ImageUploadForVideo
    onImageSelect={handleImageSelect}
    onImageRemove={handleImageRemove}
    selectedImageUrl={imageDataUrl}
    disabled={isGenerating}
    targetResolution={
      formData.resolution === '1080p' ? '1920x1080' : '1280x720'
    }
  />
  <p className="text-xs text-muted-foreground">
    Upload an image to generate video from it. Leave empty for text-to-video.
  </p>
</div>
```

4. Update prompt label and placeholder (conditional based on image):
```tsx
<Label htmlFor="prompt">
  {imageDataUrl
    ? 'Video Description (describe motion/animation)'
    : 'Video Description *'}
</Label>
<Textarea
  placeholder={
    imageDataUrl
      ? 'Describe how the image should move or animate...'
      : 'Describe the video you want to generate...'
  }
  // ... rest of props
/>
```

5. Add visual indicator when image is selected:
```tsx
{imageDataUrl && (
  <div className="p-3 bg-blue-950/20 rounded-lg border border-blue-900/30">
    <p className="text-sm text-blue-300">
      🎬 Image-to-Video Mode: Your image will be animated based on the prompt
    </p>
  </div>
)}
```

**UI Flow**:
1. User uploads image → preview appears
2. Form switches to image-to-video mode (prompt placeholder changes)
3. User enters animation description
4. Submit → API receives sourceImageUrl
5. User can remove image to return to text-to-video mode

---

#### 3.3 Update Client API Function

**File**: `apps/super-chatbot/src/app/tools/video-generation/api/video-generation-api.ts`

**Changes**:

Update `generateVideo` function (lines 46-238):
```typescript
export async function generateVideo(
  request: VideoGenerationRequest,
): Promise<VideoGenerationApiResponse<GeneratedVideoResult>> {
  try {
    console.log('🎬 Generating video with request:', {
      hasImage: !!request.sourceImageUrl,
      model: request.model,
      // ... other fields
    });

    // Existing endpoint determination logic...
    const model = request.model || 'fal-veo3';
    let endpoint = '/api/video/generate';

    if (model === 'vertex-veo3' || model === 'vertex-veo2') {
      endpoint = '/api/video/generate-vertex';
    }

    // Prepare request body (UPDATED)
    const requestBody = {
      prompt: request.prompt,
      ...(request.sourceImageUrl && {
        sourceImageUrl: request.sourceImageUrl // NEW
      }),
      duration: /* existing duration logic */,
      aspectRatio: request.aspectRatio || '16:9',
      resolution: request.resolution || '720p',
      // ... existing fields
    };

    // Rest of function unchanged...
  } catch (error) {
    // ... existing error handling
  }
}
```

**Key Points**:
- Only Vertex AI endpoints support image-to-video
- Fal.ai endpoint ignores sourceImageUrl (remains text-only)
- Log whether image is provided for debugging

---

### Phase 4: Hook Updates (State Management)

**File**: `apps/super-chatbot/src/app/tools/video-generation/hooks/use-video-generation.ts`

**Changes**: Minimal - hook is agnostic to request content

**Verification**:
- `VideoGenerationRequest` type is already used (line 8)
- `handleGenerateVideo` passes request to API as-is (line 157)
- No changes needed - type updates in Phase 1 automatically flow through

**Testing**:
- Ensure TypeScript compilation passes
- Verify image-to-video requests work through the hook

---

### Phase 5: Model Capability Updates (Configuration)

**File**: `apps/super-chatbot/src/app/tools/video-generation/api/video-generation-api.ts`

**Changes**: Update model descriptions (lines 275-293)

```typescript
models: [
  {
    id: 'fal-veo3',
    label: 'Fal.ai Veo 3',
    description: 'Google Veo 3 via Fal.ai (Text-to-video only)', // UPDATED
    badge: 'Best',
  },
  {
    id: 'vertex-veo3',
    label: 'Vertex AI Veo 3',
    description: 'Direct Google Veo 3.1 (Text & Image-to-video)', // UPDATED
    badge: 'Direct',
  },
  {
    id: 'vertex-veo2',
    label: 'Vertex AI Veo 2',
    description: 'Google Veo 2 (Text & Image-to-video)', // UPDATED
  },
],
```

**User Guidance**:
- Clear indication which models support image-to-video
- Consider disabling Fal.ai model when image is uploaded (future enhancement)

---

## Testing Strategy

### Unit Tests (Vitest)

**File**: `apps/super-chatbot/src/tests/unit/video-generation-image-upload.test.ts` (NEW)

**Coverage**:
1. Base64 extraction from data URL
2. Request type validation with Zod schema
3. Image validation (file type, size)
4. Form state updates when image uploaded/removed

**Example Test**:
```typescript
describe('Video Generation Image Upload', () => {
  it('should extract base64 from data URL', () => {
    const dataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRg...';
    const base64 = extractBase64FromDataUrl(dataUrl);
    expect(base64).toBe('/9j/4AAQSkZJRg...');
  });

  it('should validate request with sourceImageUrl', () => {
    const request = {
      prompt: 'Animate this image',
      sourceImageUrl: 'data:image/jpeg;base64,abc123',
      model: 'vertex-veo3',
    };
    const result = videoGenerationSchema.safeParse(request);
    expect(result.success).toBe(true);
  });
});
```

---

### Integration Tests

**File**: `apps/super-chatbot/src/tests/integration/video-generation-api.test.ts` (UPDATE)

**New Test Cases**:
1. POST `/api/video/generate-vertex` with sourceImageUrl
2. Verify payload includes `image.bytesBase64Encoded`
3. Test error handling for invalid image data
4. Verify balance calculation for image-to-video

**Mock Strategy**:
- Mock Vertex AI API responses
- Mock file upload/processing
- Use test images (small base64 strings)

---

### Manual Testing Checklist

**Before Implementation**:
- [ ] Review all referenced files
- [ ] Verify Vertex AI API documentation
- [ ] Check balance configuration for image-to-video

**After Implementation**:
- [ ] Text-to-video still works (no regression)
- [ ] Image upload shows preview
- [ ] Image removal returns to text-to-video mode
- [ ] Form validation works with image
- [ ] Vertex Veo 3 generates video from image
- [ ] Vertex Veo 2 generates video from image
- [ ] Fal.ai ignores image parameter (text-only)
- [ ] Error handling for large files
- [ ] Error handling for invalid formats
- [ ] Loading states during upload
- [ ] Progress tracking during generation

---

## Edge Cases & Error Handling

### Client-Side Validation

1. **File Too Large** (> 10MB)
   - Error: "Image must be smaller than 10MB"
   - Action: Prevent upload, show error toast

2. **Invalid Format** (not JPEG/PNG/WebP)
   - Error: "Please select a valid image file"
   - Action: Prevent upload, show error toast

3. **Corrupt Image File**
   - Error: "Failed to process image"
   - Action: Show error, allow retry

4. **Network Error During Upload**
   - Error: "Upload failed, please try again"
   - Action: Reset upload state, allow retry

### Server-Side Validation

1. **Missing Base64 Data**
   - Error: "Invalid image data"
   - Response: 400 with helpful message
   - Log: Warning with request ID

2. **Vertex AI Rejects Image**
   - Error: Return specific Vertex error
   - Response: 500 with suggestion to try different image
   - Log: Full error details

3. **Balance Insufficient**
   - Error: Use existing balance error handler
   - Response: 402 Payment Required
   - Log: Balance check failure

### User Experience

1. **Slow Upload**
   - Show: Processing spinner
   - Timeout: 10 seconds
   - Fallback: Error message

2. **Generation Failure**
   - Clear: Current generation state
   - Preserve: Form data and uploaded image
   - Allow: Retry with same image

3. **Model Not Supporting Image**
   - Disable: Image upload for Fal.ai model
   - Guide: "This model only supports text-to-video"

---

## Performance Considerations

### Client-Side

**Image Processing**:
- Target: < 2s for 10MB image
- Optimization: Use Web Workers for base64 encoding (future)
- Current: Synchronous FileReader (acceptable for v1)

**Bundle Size**:
- New component: ~5KB (ImageUploadForVideo)
- Impact: Minimal, code-split with page

**Memory**:
- Preview images: < 10MB in memory
- Cleanup: Revoke object URLs on unmount

### Server-Side

**Request Size**:
- Base64 overhead: ~33% larger than binary
- 10MB image → ~13.3MB request body
- Mitigation: Already handled by Next.js (50MB default limit)

**Processing Time**:
- Base64 decode: < 100ms
- Vertex AI call: 20-60 seconds (existing)
- No impact on generation time

**Caching**:
- Not applicable (dynamic generation)
- Consider: Cache processed images by hash (future)

---

## Migration & Rollback Plan

### Deployment Strategy

**Phase 1: Soft Launch**
- Deploy with feature flag (if available)
- Enable for beta users only
- Monitor error rates and performance

**Phase 2: Full Release**
- Enable for all users
- Update documentation
- Announce feature

### Rollback Plan

**If Critical Issues**:
1. Revert form component changes
2. Remove `sourceImageUrl` from API request
3. User impact: Image-to-video unavailable, text-to-video unaffected

**Rollback Time**: < 5 minutes (single PR revert)

**Data Integrity**: No database changes, no data loss

---

## Documentation Updates

### User Documentation

**File**: `apps/super-chatbot/docs/ai-capabilities/video-generation/models-guide.md` (UPDATE)

**Add Section**:
```markdown
## Image-to-Video Generation

Vertex AI Veo 2 and Veo 3 models support generating videos from source images.

### How to Use
1. Select Vertex AI Veo 2 or Veo 3 model
2. Upload a source image (JPEG, PNG, WebP, max 10MB)
3. Describe how you want the image to animate
4. Click "Generate Video"

### Tips for Best Results
- Use clear, high-quality images
- Describe specific motion (e.g., "camera pans left")
- Keep prompts focused on animation, not image content
- Try different seeds for variations

### Supported Models
- ✅ Vertex AI Veo 3 (image-to-video)
- ✅ Vertex AI Veo 2 (image-to-video)
- ❌ Fal.ai Veo 3 (text-to-video only)
```

### Developer Documentation

**File**: `_ai/video-generation-patterns.md` (UPDATE or CREATE)

**Add Entry**:
```markdown
## Image-to-Video Pattern

**Location**: `apps/super-chatbot/src/app/tools/video-generation/`

**Key Files**:
- `components/image-upload-for-video.tsx` - Image upload component
- `api/video-generation-api.ts` - Client API with sourceImageUrl
- `api/video/generate-vertex/route.ts` - Server endpoint with image support

**Flow**:
1. User uploads image → FileReader converts to base64 data URL
2. Data URL stored in form state as `sourceImageUrl`
3. On submit → included in API request
4. Server extracts base64 → sends to Vertex AI as `bytesBase64Encoded`
5. Vertex AI processes image + prompt → returns video

**Key Learnings**:
- Base64 encoding simplest for images < 10MB
- Vertex AI accepts both `bytesBase64Encoded` and `gcsUri`
- Fal.ai Veo3 doesn't support image-to-video (as of 2025-10)
- Image validation crucial for good UX
```

---

## Acceptance Criteria

### Functional Requirements

- [ ] User can upload image in video generation form
- [ ] Image preview displays after upload
- [ ] User can remove uploaded image
- [ ] Form switches between text-to-video and image-to-video modes
- [ ] Vertex Veo 3 generates video from uploaded image
- [ ] Vertex Veo 2 generates video from uploaded image
- [ ] Fal.ai continues to work (text-to-video only)
- [ ] Text-to-video functionality unchanged (no regression)

### Non-Functional Requirements

- [ ] Image upload completes in < 2 seconds
- [ ] File validation prevents invalid uploads
- [ ] Error messages are clear and actionable
- [ ] Loading states indicate progress
- [ ] TypeScript compilation passes with no errors
- [ ] All tests pass (unit + integration)
- [ ] Linting passes (`pnpm lint`)
- [ ] Build succeeds (`pnpm build`)

### User Experience

- [ ] Upload UI is intuitive (drag-and-drop works)
- [ ] Preview shows uploaded image clearly
- [ ] Remove button is obvious and works
- [ ] Prompt placeholder updates based on mode
- [ ] Model descriptions indicate image-to-video support
- [ ] Error messages guide user to resolution

---

## Known Limitations & Future Enhancements

### Current Limitations

1. **Fal.ai Model**: No image-to-video support (API limitation)
2. **Image Size**: 10MB max (reasonable for web uploads)
3. **Processing**: Client-side synchronous (acceptable for v1)
4. **Resolution Matching**: Simple center-crop (no advanced editing)

### Future Enhancements

1. **Advanced Image Editing**
   - Crop/rotate before upload
   - Filters and adjustments
   - Multiple images → sequence

2. **Optimize Performance**
   - Web Workers for encoding
   - Client-side compression
   - Progressive upload

3. **Expand Model Support**
   - Monitor Fal.ai for image-to-video
   - Add other providers (Runway, Pika)

4. **Gallery Integration**
   - Select from previously generated images
   - Image library management
   - Batch image-to-video

5. **Advanced Features**
   - Video style transfer
   - Motion presets (pan, zoom, etc.)
   - Frame interpolation settings

---

## Risk Assessment

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Vertex API changes format | High | Low | Monitor API, add version param |
| Large images cause timeout | Medium | Medium | Validate size, compress if needed |
| Base64 encoding memory issues | Medium | Low | Limit size to 10MB |
| Browser compatibility | Low | Low | Use standard APIs (FileReader) |

### Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Higher API costs | High | High | Balance multipliers, user limits |
| User confusion | Medium | Medium | Clear UI labels, documentation |
| Low adoption | Low | Medium | User testing, iterate on UX |

### Mitigation Summary

1. **API Changes**: Version lock, monitor changelog
2. **Performance**: File size validation, consider compression
3. **Costs**: Balance validation already in place
4. **UX**: Follow proven patterns from image-generation tool

---

## Timeline Estimate

**Total Time**: 8-12 hours (1-1.5 days)

### Breakdown

1. **Phase 1** (Types & Schemas): 1 hour
   - Update interfaces
   - Add Zod validations

2. **Phase 2** (API Integration): 3-4 hours
   - Update Vertex AI endpoint
   - Add image processing
   - Balance calculation updates
   - Testing API changes

3. **Phase 3** (UI Components): 3-4 hours
   - Create ImageUploadForVideo component
   - Update VideoGenerationForm
   - Update client API function
   - Test user flows

4. **Phase 4** (Hook Updates): 0.5 hour
   - Verify type flow
   - Testing

5. **Phase 5** (Testing & Documentation): 1-2 hours
   - Write tests
   - Update docs
   - Manual testing

---

## Dependencies & Prerequisites

### External Dependencies

- ✅ Vertex AI API key configured (`GOOGLE_AI_API_KEY`)
- ✅ Auth0 authentication working
- ✅ Balance system functional
- ✅ Next.js 15 App Router setup

### Internal Dependencies

- ✅ Existing video-generation tool functional
- ✅ Type definitions in place
- ✅ Zod validation setup
- ✅ Image-generation tool as reference

### Blockers

- None identified

---

## Next Steps

1. **Review with Architecture** (Optional for simple task)
2. **Create Tests** (@kent): TDD approach
3. **Implement** (@rob): Follow this plan
4. **Code Review** (@kevlin): Check for duplication
5. **Documentation** (@raymond): User guides
6. **Knowledge Base** (@ward): Extract patterns

---

## Appendix: Code References

### Key Files to Modify

1. `apps/super-chatbot/src/app/tools/video-generation/api/video-generation-api.ts`
   - Lines 6-16: Update `VideoGenerationRequest` interface
   - Lines 46-238: Update `generateVideo` function

2. `apps/super-chatbot/src/app/api/video/generate-vertex/route.ts`
   - Lines 11-17: Update Zod schema
   - Lines 143-157: Update payload structure
   - Add: Base64 extraction helper

3. `apps/super-chatbot/src/app/tools/video-generation/components/video-generation-form.tsx`
   - Add: Image state management
   - Add: Image upload component integration
   - Update: Conditional UI based on image presence

4. `apps/super-chatbot/src/app/tools/video-generation/components/image-upload-for-video.tsx`
   - NEW: Create component based on old video-generator pattern

### Reference Implementations

**Pattern Source**:
- File upload: `apps/super-chatbot/src/app/tools/image-generation/components/image-generation-form.tsx:74-108`
- Image component: `apps/super-chatbot/src/app/tools/video-generator/components/image-upload.tsx:19-400`
- API pattern: `apps/super-chatbot/src/app/tools/image-generation/api/image-generation-api.ts:83-138`

**Documentation Source**:
- API structure: `apps/super-chatbot/docs/ai-capabilities/video-generation/image-to-video-models.md`
- Implementation notes: `apps/super-chatbot/docs/development/implementation-plans/fix-video-generation-image-to-video.md`

---

## Sign-off

**Prepared by**: Don (Guillermo) - Tech Lead & Process Manager
**Date**: 2025-10-28
**Status**: ✅ Ready for Implementation

**Review Checklist**:
- [x] All existing patterns documented with file paths
- [x] Verified patterns work in production code
- [x] Performance implications noted
- [x] Edge cases identified
- [x] Testing strategy defined
- [x] Acceptance criteria clear
- [x] User value proposition stated

**Next Agent**: @kent (Test creation) or @rob (Implementation if skipping TDD)

---

*"Deploy is the new build. Ship fast, iterate faster. This plan gets image-to-video working today, we'll optimize tomorrow based on user data."* - Guillermo
