import { describe, expect, it } from "vitest";

import samplePack from "../../test-data/community-service-audit-samples.json";
import { submissionSchema } from "@/domain/schemas";

describe("community service test sample pack", () => {
  it("contains six schema-valid anonymous submissions", () => {
    const submissions = submissionSchema.array().parse(samplePack);

    expect(submissions).toHaveLength(6);
    expect(new Set(submissions.map((item) => item.id)).size).toBe(6);
    expect(submissions.every((item) => item.pseudonym.startsWith("Student "))).toBe(true);
  });

  it("preserves the planted score gaps used by the test guide", () => {
    const submissions = submissionSchema.array().parse(samplePack);
    const byId = new Map(submissions.map((item) => [item.id, item]));

    expect(byId.get("submission-a")?.scores.evidence).toBe(3);
    expect(byId.get("submission-b")?.scores.evidence).toBe(1);
    expect(byId.get("submission-e")?.scores.organization).toBe(4);
  });
});
