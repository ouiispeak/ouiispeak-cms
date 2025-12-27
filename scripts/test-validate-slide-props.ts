/**
 * Tier 3.2 Step 1 Test: Validate Slide Props Utilities
 * 
 * Tests: Do the validation utilities work correctly?
 */

import {
  validateSlidePropsRuntime,
  validateAndSanitizeSlideProps,
} from "../lib/utils/validateSlideProps";
import { SLIDE_TYPES } from "../lib/types/slideProps";

async function testValidateSlideProps() {
  console.log("🧪 Step 1 Test: Validate Slide Props Utilities");
  console.log("");

  try {
    // Test 1: Valid text slide props
    console.log("Test 1: Valid text slide props...");
    const validTextProps = {
      label: "Test Slide",
      title: "Hello World",
      body: "This is a test",
    };
    const result1 = validateSlidePropsRuntime(SLIDE_TYPES.TEXT, validTextProps, "test-1");
    if (!result1.valid) {
      console.log("❌ ERROR: Valid props failed validation");
      console.log("   Errors:", result1.errors);
      process.exit(1);
    }
    console.log("✅ SUCCESS: Valid props passed validation");
    console.log("");

    // Test 2: Invalid props (not an object)
    console.log("Test 2: Invalid props (not an object)...");
    const result2 = validateSlidePropsRuntime(SLIDE_TYPES.TEXT, "not an object", "test-2");
    if (result2.valid) {
      console.log("❌ ERROR: Invalid props passed validation");
      process.exit(1);
    }
    if (result2.errors.length === 0) {
      console.log("❌ ERROR: No errors reported for invalid props");
      process.exit(1);
    }
    console.log("✅ SUCCESS: Invalid props correctly rejected");
    console.log("   Errors:", result2.errors);
    console.log("");

    // Test 3: Valid ai-speak-student-repeat props
    console.log("Test 3: Valid ai-speak-student-repeat props...");
    const validStudentRepeatProps = {
      label: "Practice",
      title: "Repeat After Me",
      elements: [
        {
          samplePrompt: "Hello",
          referenceText: "Hello",
        },
      ],
    };
    const result3 = validateSlidePropsRuntime(
      SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT,
      validStudentRepeatProps,
      "test-3"
    );
    if (!result3.valid) {
      console.log("❌ ERROR: Valid student repeat props failed validation");
      console.log("   Errors:", result3.errors);
      process.exit(1);
    }
    console.log("✅ SUCCESS: Valid student repeat props passed validation");
    console.log("");

    // Test 4: Invalid ai-speak-student-repeat props (missing elements)
    console.log("Test 4: Invalid student repeat props (missing elements)...");
    const invalidStudentRepeatProps = {
      label: "Practice",
      title: "Repeat After Me",
      // Missing elements array
    };
    const result4 = validateSlidePropsRuntime(
      SLIDE_TYPES.AI_SPEAK_STUDENT_REPEAT,
      invalidStudentRepeatProps,
      "test-4"
    );
    if (result4.valid) {
      console.log("❌ ERROR: Invalid props passed validation");
      process.exit(1);
    }
    console.log("✅ SUCCESS: Invalid props correctly rejected");
    console.log("   Errors:", result4.errors);
    console.log("");

    // Test 5: validateAndSanitizeSlideProps with valid props
    console.log("Test 5: validateAndSanitizeSlideProps with valid props...");
    const sanitized = validateAndSanitizeSlideProps(SLIDE_TYPES.TEXT, validTextProps, "test-5");
    if (!sanitized) {
      console.log("❌ ERROR: Valid props returned null");
      process.exit(1);
    }
    console.log("✅ SUCCESS: Valid props returned correctly");
    console.log("");

    // Test 6: validateAndSanitizeSlideProps with invalid props
    console.log("Test 6: validateAndSanitizeSlideProps with invalid props...");
    const sanitizedInvalid = validateAndSanitizeSlideProps(
      SLIDE_TYPES.TEXT,
      "not an object",
      "test-6"
    );
    if (sanitizedInvalid !== null) {
      console.log("❌ ERROR: Invalid props did not return null");
      process.exit(1);
    }
    console.log("✅ SUCCESS: Invalid props correctly returned null");
    console.log("");

    console.log("✅ Step 1 PASSED: Validation utilities work correctly!");
  } catch (err) {
    console.log("❌ FAILED:", err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

testValidateSlideProps();

