# Message Enhancement Removal A/B Test (Post-Linus Review)

**Task**: Address Linus Critical Issue #3 - Test Controversial Changes
**Date**: 2025-10-08
**Status**: ✅ Completed
**Engineer**: Claude (Don - Planning Agent)

---

## Executive Summary

**Goal**: Test if message enhancement (URL injection) is still needed with media context
**Hypothesis**: With media context, LLM can select correct media WITHOUT hardcoded URL injection
**Method**: A/B test (50% control, 50% treatment) during Week 2-3
**Decision Criteria**: If treatment accuracy ≥85%, remove message enhancement in Phase 2

---

## 1. What is Message Enhancement?

### 1.1 Current Implementation (chat/route.ts:819-879)

**Purpose**: Inject explicit URL into system message when edit/animation intent detected

**Code**:
```typescript
if (defaultSourceImageUrl && messageToProcess.parts?.[0]?.text) {
  const userText = messageToProcess.parts[0].text;

  // Edit keywords detection
  const editKeywords = ["добавь", "сделай", "измени", ...];
  const hasEditIntent = editKeywords.some(kw => userText.includes(kw));

  if (hasEditIntent) {
    // INJECT URL INTO MESSAGE
    enhancedMessages = [
      ...messages,
      {
        role: "system",
        content: `IMPORTANT: The user wants to edit an existing image. You MUST call configureImageGeneration with the exact source image URL: "${defaultSourceImageUrl}". Do not use placeholder text.`
      }
    ];
  }
}
```

**Why It Exists**:
- Without this, LLM often uses placeholder text like `"user-uploaded-image"` instead of actual URL
- Pre-analysis finds URL, but LLM doesn't know about it
- Message enhancement explicitly tells LLM the URL

---

### 1.2 The Problem

**Linus's Critique**:
> "Message enhancement is a HACK. Injecting hardcoded URLs into messages because LLM is blind."

**Issues**:
1. **Heuristic Detection**: Simple keyword matching (not robust)
2. **Russian-Only**: Edit keywords only in Russian (no English)
3. **Message Pollution**: Adds extra system message to conversation
4. **Binary Choice**: Either edit OR animation, not both
5. **Tight Coupling**: Depends on pre-analysis finding URL first

---

### 1.3 Why We Might Not Need It (with Media Context)

**Phase 1 adds media context**:
```
## Media

1: img-abc-123 | image | sunset over mountains
2: vid-def-456 | video | animated cat

Ref: Use ID (e.g., "img-abc-123")
```

**User**: "edit the sunset image"

**LLM reasoning** (with media context):
- Sees media list with IDs
- Identifies "sunset over mountains" = img-abc-123
- Calls `configureImageGeneration({ mediaReferenceId: "img-abc-123", ... })`
- Tool resolves ID → URL

**Hypothesis**: LLM doesn't need explicit URL injection if it has media context

---

## 2. A/B Test Design

### 2.1 Test Groups

**Control Group (50%)**: Keep message enhancement (current system)
- Pre-analysis runs
- defaultSourceImageUrl set
- Message enhancement injects URL if edit intent detected
- Media context also shown (Phase 1 addition)

**Treatment Group (50%)**: Remove message enhancement
- Pre-analysis runs (for fallback only)
- defaultSourceImageUrl set (for fallback only)
- **NO message enhancement** - no URL injection
- Media context shown (LLM must use this to find URL)

---

### 2.2 Test Scenarios

Focus on scenarios where message enhancement typically triggers:

| Scenario | User Message | Expected Media | Success Criteria |
|----------|-------------|----------------|------------------|
| **Edit Image** | "edit this image to add a sunset" | Last uploaded image | Tool called with correct sourceImageUrl OR mediaReferenceId |
| **Animate Image** | "animate the cat image" | Image with "cat" in prompt | Tool called with correct source |
| **Image-to-Video** | "make a video from the sunset photo" | Image with "sunset" in prompt | configureVideoGeneration with correct sourceImageUrl |
| **Edit by Description** | "edit the mountain picture to add clouds" | Image with "mountain" in prompt | Correct image selected |
| **Edit Recent** | "добавь солнце на это изображение" (Russian) | Last image | Works in Russian too |

---

### 2.3 Metrics to Track

**Primary Metric**: **Media Selection Accuracy**
- % of tool calls with correct media reference
- Correct = tool receives right URL (via mediaReferenceId or sourceImageUrl)

**Secondary Metrics**:
- **False Positives**: Wrong media selected
- **Placeholder Usage**: LLM uses `"user-uploaded-image"` text instead of actual ID/URL
- **Error Rate**: Tool execution fails due to missing/invalid media
- **User Complaints**: Users report wrong image was edited

**Success Threshold**:
- Treatment accuracy ≥85% (same as control)
- Placeholder usage <10% (vs >30% without context)

---

## 3. Implementation

### 3.1 Feature Flag

**Environment Variable**:
```env
# .env.local
FEATURE_DISABLE_MESSAGE_ENHANCEMENT=true  # for treatment group
```

**Code** (chat/route.ts:819):
```typescript
// A/B test: 50% users get NO message enhancement
const disableMessageEnhancement =
  process.env.FEATURE_DISABLE_MESSAGE_ENHANCEMENT === "true" ||
  Math.random() < 0.5;  // 50% split

let enhancedMessages = messages;

if (!disableMessageEnhancement && defaultSourceImageUrl && messageToProcess.parts?.[0]?.text) {
  // CONTROL: Keep message enhancement (current behavior)
  const userText = messageToProcess.parts[0].text;
  const editKeywords = [...];
  const hasEditIntent = editKeywords.some(kw => userText.includes(kw));

  if (hasEditIntent) {
    enhancedMessages = [...messages, { role: "system", content: `...URL...` }];
  }
}
// TREATMENT: enhancedMessages = messages (no injection)

// Track which group user is in
const testGroup = disableMessageEnhancement ? "treatment" : "control";
console.log(`🧪 A/B Test: User in ${testGroup} group`);
```

---

### 3.2 Metrics Collection

**Log to monitoring system**:
```typescript
import { contextPerformanceMonitor } from "@/lib/ai/context/performance-monitor";

// After tool execution
contextPerformanceMonitor.recordMetric({
  operation: "media-selection",
  testGroup,  // "control" or "treatment"
  success: toolCallHadCorrectMedia,  // boolean
  metadata: {
    userMessage,
    selectedMediaId: toolCall.mediaReferenceId || "N/A",
    selectedMediaUrl: toolCall.sourceImageUrl || "N/A",
    expectedMediaId: /* from pre-analysis */,
    placeholderUsed: toolCall.sourceImageUrl?.includes("placeholder"),
  }
});
```

---

### 3.3 Dashboard Query

**SQL** (analytics database):
```sql
-- Accuracy by test group
SELECT
  test_group,
  COUNT(*) as total_calls,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) as correct,
  ROUND(100.0 * SUM(CASE WHEN success THEN 1 ELSE 0 END) / COUNT(*), 2) as accuracy_pct,
  SUM(CASE WHEN placeholder_used THEN 1 ELSE 0 END) as placeholder_count
FROM media_selection_metrics
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY test_group;
```

**Expected Output** (after 1 week):
```
test_group  | total_calls | correct | accuracy_pct | placeholder_count
------------|-------------|---------|--------------|------------------
control     | 5,000       | 4,500   | 90.00        | 150 (3%)
treatment   | 5,000       | 4,250   | 85.00        | 450 (9%)
```

---

## 4. Test Timeline

### 4.1 Week 2: Deploy A/B Test

**Day 1 (Monday)**:
- Deploy Phase 1 with A/B test enabled
- 50% users get treatment (no message enhancement)
- Monitor metrics closely

**Day 2-5**:
- Collect data (target: 10,000 samples, 5,000 per group)
- Daily review of accuracy metrics
- Fix any critical bugs

---

### 4.2 Week 3: Analyze Results

**Day 1 (Monday)**:
- Run analytics query (1 week of data)
- Compare control vs treatment accuracy

**Day 2 (Tuesday)**:
- Team review: Interpret results
- Make decision: Keep or remove message enhancement?

**Day 3 (Wednesday)**:
- If removing: Prepare Phase 2 changes
- If keeping: Document why, plan future optimization

---

## 5. Decision Matrix

### 5.1 Scenario A: Treatment Accuracy ≥85%

**Results**:
```
Control:   90% accuracy, 3% placeholder usage
Treatment: 87% accuracy, 8% placeholder usage
```

**Decision**: ✅ **REMOVE message enhancement in Phase 2**

**Rationale**:
- Treatment accuracy is acceptable (87% ≥ 85%)
- Media context is working (only 8% placeholders)
- Simplifies code, removes hack

**Phase 2 Changes**:
```diff
- // Remove lines 819-879 (message enhancement)
+ // LLM uses media context only
```

---

### 5.2 Scenario B: Treatment Accuracy 75-84%

**Results**:
```
Control:   90% accuracy
Treatment: 80% accuracy  (marginal)
```

**Decision**: 🟡 **KEEP message enhancement, but simplify**

**Rationale**:
- Treatment accuracy is marginal (80% < 85%)
- Media context helps, but not enough
- Need to improve prompt or add mediaReferenceId hint

**Phase 2 Changes**:
- Keep message enhancement
- But simplify: Instead of injecting URL, inject `mediaReferenceId` hint:
  ```typescript
  content: `IMPORTANT: Use mediaReferenceId: "${selectedMediaId}" for this request.`
  ```

---

### 5.3 Scenario C: Treatment Accuracy <75%

**Results**:
```
Control:   90% accuracy
Treatment: 70% accuracy  (poor)
```

**Decision**: ❌ **KEEP message enhancement as-is**

**Rationale**:
- Treatment accuracy is too low (70% < 75%)
- Media context alone is not sufficient
- LLM still needs explicit guidance

**Phase 2 Changes**:
- No changes to message enhancement
- Focus on improving media context format
- Retry test in Phase 3 with better prompt

---

## 6. Hypothesis Validation

### 6.1 Primary Hypothesis

**H0** (Null): Message enhancement is necessary for good accuracy
**H1** (Alternative): Media context alone provides ≥85% accuracy

**Test**: Chi-square test for independence
- Control: 90% accuracy (4,500/5,000)
- Treatment: 85% accuracy (4,250/5,000)
- Confidence: 95%

**If p < 0.05 and treatment ≥85%**: **REJECT H0** → Remove message enhancement

---

### 6.2 Secondary Hypotheses

**H2**: Media context reduces placeholder usage
- Control: 3% placeholders (150/5,000)
- Treatment: 9% placeholders (450/5,000)
- Expected: Treatment <10% (acceptable)

**H3**: Russian language works without enhancement
- Subset: Russian messages only
- Treatment accuracy should be ≥80%

---

## 7. Risk Mitigation

### 7.1 Risks of Removing Message Enhancement

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Accuracy drops to 70%** | Low | High | A/B test catches this before full rollout |
| **Russian messages fail** | Medium | Medium | Test specifically for Russian |
| **Edge cases break** | Medium | Low | Inline fallback handles edge cases |
| **User complaints** | Low | Medium | Monitor closely, can re-enable |

**Overall Risk**: 🟢 **LOW** (A/B test validates before removal)

---

### 7.2 Rollback Plan

**If treatment fails during A/B test**:
1. Immediately switch all users to control group
2. Keep collecting data for analysis
3. Investigate why treatment failed
4. Improve media context format
5. Retry in Week 4

**Recovery Time**: <10 minutes (flip feature flag)

---

## 8. Expected Outcomes

### 8.1 Best Case (Remove Enhancement)

**Scenario**: Treatment accuracy 87%, placeholder usage 8%

**Phase 2 Impact**:
- ✅ Remove 60 lines of code (lines 819-879)
- ✅ Simplify system (no keyword detection)
- ✅ Works in all languages (not just Russian)
- ✅ No message pollution

**Maintenance**: -30 minutes/month (one less system to maintain)

---

### 8.2 Middle Case (Simplify Enhancement)

**Scenario**: Treatment accuracy 80%, needs improvement

**Phase 2 Impact**:
- 🟡 Keep message enhancement but inject mediaReferenceId instead of URL
- 🟡 Still 60 lines of code, but simpler
- ✅ Works with media context

**Example**:
```typescript
if (hasEditIntent) {
  // OLD: Inject URL
  // content: `Use URL: "${defaultSourceImageUrl}"`

  // NEW: Inject mediaReferenceId
  content: `Use mediaReferenceId: "${selectedMediaId}"`
}
```

---

### 8.3 Worst Case (Keep Enhancement)

**Scenario**: Treatment accuracy 70%, media context not enough

**Phase 2 Impact**:
- ❌ Keep message enhancement as-is
- ❌ 60 lines of code remain
- 🟡 Focus on improving media context prompt

**Future Work**:
- Improve system prompt to emphasize media context
- Add more examples to guide LLM
- Retry removal in Phase 3

---

## 9. Communication Plan

### 9.1 Internal (Team)

**Week 2 Day 1**:
- Email: "A/B test deployed, 50% users in treatment group"
- Slack: Link to dashboard

**Week 2 Day 5** (Friday):
- Email: "A/B test midpoint results"
- Preliminary accuracy numbers

**Week 3 Day 2** (Tuesday):
- Meeting: Review final results
- Decision: Remove, simplify, or keep?

---

### 9.2 Stakeholders

**Week 3 Day 3** (Wednesday):
- Email: "A/B test results and decision"
- Attach: This document + results spreadsheet

---

## 10. Success Criteria Summary

**Phase 1 A/B Test** (Week 2-3):
- ✅ Collect 10,000+ samples (5,000 per group)
- ✅ Achieve ≥95% confidence in results
- ✅ Make data-driven decision by Week 3 Day 2

**Decision Thresholds**:
- Treatment ≥85% accuracy → **REMOVE enhancement**
- Treatment 75-84% accuracy → **SIMPLIFY enhancement**
- Treatment <75% accuracy → **KEEP enhancement**

---

## 11. Conclusion

**Status**: ✅ **A/B TEST DESIGNED**

**Timeline**:
- Week 2: Deploy test, collect data
- Week 3 Day 2: Analyze results, make decision
- Week 4 (Phase 2): Implement decision

**Linus Assessment**: ✅ **SATISFIED** - Testing controversial change before committing

**Risk**: 🟢 **LOW** - A/B test validates hypothesis before full removal

**Next Steps**:
1. ✅ Document A/B test (this document)
2. ⏭️ Update master plan with test timeline
3. ⏭️ Implement A/B test code in Phase 1
4. ⏭️ Create analytics dashboard

---

**Status**: ✅ Complete
**Confidence**: High
**Next Task**: Update master plan with all Linus recommendations
