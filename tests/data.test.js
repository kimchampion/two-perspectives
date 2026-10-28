import test from "node:test";
import assert from "node:assert/strict";
import {
  blankResponses,
  isComplete,
  needsWordingCheck,
  newCode,
  scenarios,
  steps,
} from "../src/data.js";

test("each card and participant has independent response state", () => {
  const responses = blankResponses();
  responses[0][0].text = "Only participant A can see this draft.";
  assert.equal(responses[0][1].text, "");
  assert.equal(responses[1][0].text, "");
  assert.equal(blankResponses()[0][0].text, "");
  assert.equal(responses.length, steps.length);
});

test("required responses cannot be submitted without meaningful text and a choice", () => {
  assert.equal(
    isComplete(0, { mode: "color", choice: "", text: "Curious." }),
    false,
  );
  assert.equal(
    isComplete(0, { mode: "color", choice: "#D9CEEB", text: "   " }),
    false,
  );
  assert.equal(
    isComplete(0, { mode: "color", choice: "#D9CEEB", text: "Curious." }),
    true,
  );
  assert.equal(isComplete(1, { text: "A different perspective." }), true);
  assert.equal(isComplete(2, { choice: "", text: "I need a moment." }), false);
  assert.equal(
    isComplete(2, { choice: "Pause", text: "I need a moment." }),
    true,
  );
  assert.equal(
    isComplete(3, { mode: "sketch", drawing: "", text: "A little changed." }),
    false,
  );
  assert.equal(
    isComplete(3, {
      mode: "sketch",
      drawing: "data:image/png;base64,example",
      text: "A little changed.",
    }),
    true,
  );
});

test("all fictional scenarios provide separate perspectives for two characters", () => {
  assert.equal(new Set(scenarios.map((s) => s.id)).size, scenarios.length);
  for (const scenario of scenarios) {
    assert.equal(scenario.perspectives.length, 2);
    assert.notEqual(scenario.perspectives[0], scenario.perspectives[1]);
    assert.ok(scenario.story.length > 50);
  }
});

test("the demo wording check recognizes configured phrases without partial matches", () => {
  assert.equal(needsWordingCheck("You are an IDIOT."), true);
  assert.equal(needsWordingCheck("Please shut up."), true);
  assert.equal(needsWordingCheck("The character felt misunderstood."), false);
  assert.equal(needsWordingCheck("We could build a killer playlist."), false);
});

test("session codes contain six readable alphanumeric characters", () => {
  const codes = Array.from({ length: 20 }, newCode);
  assert.ok(codes.every((code) => /^[A-HJ-NP-Z2-9]{6}$/.test(code)));
  assert.equal(new Set(codes).size, codes.length);
});
