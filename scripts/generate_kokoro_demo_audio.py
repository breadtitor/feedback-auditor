"""Generate natural English demo narration with the Apache-2.0 Kokoro-82M model.

The script writes one WAV per visual segment plus a JSON timing manifest used by
the video compositor. Each sentence is synthesized separately so visual callouts
can be aligned to the spoken content without relying on speech recognition.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro import KPipeline


SAMPLE_RATE = 24_000
LEAD_SILENCE_SECONDS = 0.24
SENTENCE_GAP_SECONDS = 0.34
TAIL_SILENCE_SECONDS = 0.90


SEGMENTS = [
    {
        "id": "01-landing",
        "frame": "01-landing.png",
        "chapter": "1  PROBLEM",
        "sentences": [
            "Teachers often grade the same assignment over several sessions.",
            "Even with a shared rubric, similar student evidence can receive different scores or different levels of feedback.",
            "Feedback Auditor finds those patterns before feedback reaches students, without grading students, judging teacher fairness, or changing a score.",
        ],
    },
    {
        "id": "02-dashboard",
        "frame": "02-dashboard.png",
        "chapter": "2  SAFE DEMO",
        "sentences": [
            "The public demo needs no account or A P I key.",
            "It loads six synthetic submissions, four rubric dimensions, and seven evidence-linked review signals.",
            "The most important metric is zero automated changes.",
            "Every result is a question for teacher review.",
        ],
    },
    {
        "id": "03-evidence",
        "frame": "03-evidence.png",
        "chapter": "3  EVIDENCE",
        "sentences": [
            "Here, two responses show the same unsupported-claim pattern at comparable severity, but their Evidence Use scores differ by two points.",
            "The teacher can inspect the exact highlighted excerpts, each rubric score, the original feedback, extraction confidence, and rule R one, version one point zero.",
            "The system asks whether the same scoring interpretation should apply.",
            "It never decides which score is right.",
        ],
    },
    {
        "id": "04-decision",
        "frame": "04-decision.png",
        "chapter": "4  TEACHER DECISION",
        "sentences": [
            "The teacher can add a note, confirm the signal for review, mark it resolved, or dismiss it.",
            "Decisions persist in local browser storage, can be filtered by status, and export as a transparent Markdown review log without full student submissions or hidden model fields.",
        ],
    },
    {
        "id": "05-methodology",
        "frame": "05-methodology.png",
        "chapter": "5  G P T 5.6 PLUS RULES",
        "sentences": [
            "G P T five point six is deliberately constrained to structured evidence extraction through the Responses A P I and Structured Outputs.",
            "The server verifies every excerpt verbatim against the source text.",
            "Versioned Type Script rules then compare those signals, so the review logic and thresholds stay visible and testable.",
            "Live analysis can fail safely without breaking the deterministic demo.",
        ],
    },
    {
        "id": "06-setup",
        "frame": "06-setup.png",
        "chapter": "6  CUSTOM AUDIT",
        "sentences": [
            "Teachers can also create a new audit, edit the assignment context and rubric, and paste anonymous records using a visible J S O N template.",
            "The workflow supports real inputs while keeping the no-key synthetic demo instantly testable for judges.",
        ],
    },
    {
        "id": "07-privacy",
        "frame": "07-privacy.png",
        "chapter": "7  PRIVACY PLUS CODEX",
        "sentences": [
            "Custom drafts remain in the browser until Live Analysis is explicitly started, and setup requires de-identification and authorization confirmation.",
            "I used Codex to translate the product requirements into the architecture, implement and refactor the application, create the synthetic evaluation, and run type, rule, A P I, production-build, dependency, and real-browser checks.",
            "Feedback Auditor is a calibration mirror, not a grading authority.",
        ],
    },
]


def silence(seconds: float) -> np.ndarray:
    return np.zeros(round(SAMPLE_RATE * seconds), dtype=np.float32)


def synthesize_sentence(
    pipeline: KPipeline, sentence: str, voice: str, speed: float
) -> np.ndarray:
    chunks: list[np.ndarray] = []
    for _graphemes, _phonemes, audio in pipeline(
        sentence,
        voice=voice,
        speed=speed,
        split_pattern=r"\n+",
    ):
        chunk = np.asarray(audio, dtype=np.float32)
        if chunk.size:
            chunks.append(chunk)
    if not chunks:
        raise RuntimeError(f"Kokoro returned no audio for: {sentence}")
    return np.concatenate(chunks)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("artifacts/demo/audio-kokoro"),
    )
    parser.add_argument("--voice", default="af_heart")
    parser.add_argument("--speed", type=float, default=1.06)
    args = parser.parse_args()

    args.output.mkdir(parents=True, exist_ok=True)
    pipeline = KPipeline(lang_code="a")

    manifest: dict[str, object] = {
        "model": "hexgrad/Kokoro-82M",
        "model_license": "Apache-2.0",
        "voice": args.voice,
        "speed": args.speed,
        "sample_rate": SAMPLE_RATE,
        "segments": [],
    }

    global_cursor = 0.0
    for segment in SEGMENTS:
        pieces = [silence(LEAD_SILENCE_SECONDS)]
        local_cursor = LEAD_SILENCE_SECONDS
        sentence_timings = []

        for index, sentence in enumerate(segment["sentences"]):
            audio = synthesize_sentence(pipeline, sentence, args.voice, args.speed)
            start = local_cursor
            duration = audio.size / SAMPLE_RATE
            end = start + duration
            sentence_timings.append(
                {
                    "index": index,
                    "text": sentence,
                    "start": round(start, 3),
                    "end": round(end, 3),
                    "global_start": round(global_cursor + start, 3),
                    "global_end": round(global_cursor + end, 3),
                }
            )
            pieces.append(audio)
            local_cursor = end
            if index < len(segment["sentences"]) - 1:
                pieces.append(silence(SENTENCE_GAP_SECONDS))
                local_cursor += SENTENCE_GAP_SECONDS

        pieces.append(silence(TAIL_SILENCE_SECONDS))
        local_cursor += TAIL_SILENCE_SECONDS
        segment_audio = np.concatenate(pieces)
        output_path = args.output / f"{segment['id']}.wav"
        sf.write(output_path, segment_audio, SAMPLE_RATE, subtype="PCM_16")

        segment_record = {
            **segment,
            "audio": output_path.as_posix(),
            "start": round(global_cursor, 3),
            "end": round(global_cursor + local_cursor, 3),
            "duration": round(local_cursor, 3),
            "sentences": sentence_timings,
        }
        manifest["segments"].append(segment_record)
        global_cursor += local_cursor
        print(
            f"{segment['id']}: {local_cursor:.2f}s -> {output_path}",
            flush=True,
        )

    manifest["total_duration"] = round(global_cursor, 3)
    manifest_path = args.output / "timing-manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"Total duration: {global_cursor:.2f}s", flush=True)
    print(f"Manifest: {manifest_path}", flush=True)


if __name__ == "__main__":
    main()
