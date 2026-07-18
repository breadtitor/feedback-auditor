# Demo Video Plan

Target length: **2:35–2:50**. Hard limit: under three minutes. Format: 16:9, 1080p, English voiceover, readable cursor, no background music required.

The final voiceover uses the open-weight [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) `af_heart` voice (Apache-2.0). The entrant reviewed the wording and explicitly requested an open-source synthetic voice.

Final render: `artifacts/demo/feedback-auditor-demo-kokoro-highlighted.mp4` (**2:44**, 1080p, English narration). It has synchronized chapter labels and UI focus boxes, but intentionally has no burned-in captions or subtitle stream because YouTube captions will be used.

Rebuild the narration and video from the repository root:

```powershell
py -3.12 -m venv .venv-kokoro
& '.\.venv-kokoro\Scripts\python.exe' -m pip install -r scripts\requirements-video.txt
& '.\.venv-kokoro\Scripts\python.exe' scripts\generate_kokoro_demo_audio.py
& '.\.venv-kokoro\Scripts\python.exe' scripts\compose_highlighted_demo.py
```

## Shot list and narration draft

### 0:00–0:18 — Problem and promise

**Screen:** Landing page, then hover over the synthetic demo action.

**Narration:**

> Teachers often grade the same assignment over several sessions. Similar student evidence can receive different scores or different levels of feedback. Feedback Auditor finds those patterns before feedback reaches students—without grading students or changing a score.

### 0:18–0:35 — One-click judge path

**Screen:** Select **Try the synthetic demo**. Pause on the four metric cards.

**Narration:**

> The public demo needs no account or API key. It loads six synthetic submissions, four rubric dimensions, and seven evidence-linked review signals. The most important metric is zero automated changes: the teacher stays in control.

### 0:35–1:15 — Core finding

**Screen:** Open **Similar evidence, different scores**. Point to both excerpts, scores, feedback, confidence, and `R1 v1.0`.

**Narration:**

> Here, two responses show the same unsupported-claim pattern at comparable severity, but their Evidence Use scores differ. The teacher can inspect the exact excerpts, the original feedback, extraction confidence, and the deterministic rule that surfaced the comparison. The system asks a calibration question; it does not decide which score is right.

### 1:15–1:35 — Human decision and export

**Screen:** Type a short note, select **Confirm for review**, filter to confirmed, then select **Export review**.

**Narration:**

> The teacher confirms, resolves, or dismisses each signal and records why. Decisions persist locally and export as a transparent review log without full student submissions or hidden model fields.

### 1:35–2:00 — How GPT-5.6 is used

**Screen:** Open **Methodology** and move through the four pipeline steps.

**Narration:**

> GPT-5.6 is deliberately constrained to structured evidence extraction through the Responses API and Structured Outputs. The server verifies every excerpt against the source text. Versioned TypeScript rules then compare those signals, so the review logic and thresholds remain visible and testable.

### 2:00–2:22 — Custom audit and privacy

**Screen:** Return home, open **Create an audit**, scroll through context, rubric, JSON template, and privacy checkpoint.

**Narration:**

> Teachers can also create an audit, edit the assignment and rubric, and paste anonymous records. Drafts stay in the browser until Live Analysis is explicitly started, and the setup requires de-identification and authorization confirmation.

### 2:22–2:42 — Codex and finish

**Screen:** Brief split between the polished product and a terminal showing passing tests/build, then end on landing page.

**Narration:**

> I used Codex to turn the product requirements into the architecture, implement and refactor the application, build the synthetic evaluation, and run type, rule, API, production-build, dependency, and browser checks. Feedback Auditor is a calibration mirror—not a grading authority.

## Capture checklist

- Reset the demo before recording.
- Use the deployed URL, not localhost, if deployment is ready.
- Hide bookmarks, notifications, account avatars, API keys, and terminal paths containing personal information.
- Keep zoom at 100% and use a 16:9 browser window.
- Make the cursor movement deliberate; pause on evidence and rule labels.
- Show at least one real teacher decision.
- Do not imply measured learning outcomes or production FERPA compliance.
- Export/download can be shown without opening a system file picker.
- End before 2:55 to preserve upload/transcode margin.
- Upload to public or unlisted YouTube and verify playback while signed out.
