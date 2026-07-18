import { afterEach, describe, expect, it } from "vitest";

import { POST } from "@/app/api/analyze/route";

const originalApiKey = process.env.OPENAI_API_KEY;

afterEach(() => {
  if (originalApiKey === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = originalApiKey;
});

describe("Live Analysis API boundary", () => {
  it("fails safely when the server has no API key", async () => {
    delete process.env.OPENAI_API_KEY;
    const response = await POST(
      new Request("http://localhost/api/analyze", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      code: "OPENAI_KEY_MISSING",
    });
  });

  it("rejects malformed projects before calling the model", async () => {
    process.env.OPENAI_API_KEY = "test-key-never-sent";
    const response = await POST(
      new Request("http://localhost/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ project: { title: "Incomplete" } }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "The analysis request does not match the expected project schema.",
    });
  });
});
