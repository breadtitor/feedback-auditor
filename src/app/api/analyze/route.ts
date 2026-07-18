import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { NextResponse } from "next/server";
import { z } from "zod";

import { ingestAnalysisResponse } from "@/domain/analysis-ingest";
import { analysisResponseSchema, auditProjectSchema } from "@/domain/schemas";
import {
  ANALYSIS_PROMPT_VERSION,
  ANALYSIS_SCHEMA_VERSION,
  buildAnalysisPrompt,
} from "@/lib/openai/analysis-prompt";

export const runtime = "nodejs";
export const maxDuration = 60;

const requestSchema = z.object({
  project: auditProjectSchema,
});

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        error:
          "Live Analysis is not configured on this deployment because OPENAI_API_KEY is missing.",
        code: "OPENAI_KEY_MISSING",
      },
      { status: 503 },
    );
  }

  let input: z.infer<typeof requestSchema>;
  try {
    input = requestSchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      { error: "The analysis request does not match the expected project schema." },
      { status: 400 },
    );
  }

  const model = process.env.OPENAI_MODEL || "gpt-5.6";
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const response = await client.responses.parse({
      model,
      store: false,
      reasoning: { effort: "low" },
      max_output_tokens: 12_000,
      input: [
        {
          role: "system",
          content:
            "You extract evidence for a teacher-controlled calibration workflow. Follow the supplied boundaries and structured output contract exactly.",
        },
        { role: "user", content: buildAnalysisPrompt(input.project) },
      ],
      text: {
        format: zodTextFormat(analysisResponseSchema, "feedback_evidence_analysis"),
      },
    });

    if (!response.output_parsed) {
      return NextResponse.json(
        { error: "The model returned no structured analysis." },
        { status: 502 },
      );
    }

    const parsed = analysisResponseSchema.parse(response.output_parsed);
    const { signals, feedbackCoverage, evidenceValidation } = ingestAnalysisResponse(
      input.project,
      parsed,
    );

    return NextResponse.json({
      schemaVersion: ANALYSIS_SCHEMA_VERSION,
      promptVersion: ANALYSIS_PROMPT_VERSION,
      model: response.model,
      signals,
      feedbackCoverage,
      evidenceValidation,
    });
  } catch (error) {
    console.error("Live Analysis failed", {
      model,
      errorType: error instanceof Error ? error.name : "UnknownError",
    });
    return NextResponse.json(
      {
        error:
          "Live Analysis could not complete. Check the server configuration and try again; the local draft is unchanged.",
        code: "LIVE_ANALYSIS_FAILED",
      },
      { status: 502 },
    );
  }
}
