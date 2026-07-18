# Final Submission Worksheet — Author Input Required

The organizer explicitly asks entrants to choose their own project name and write the Devpost description in their own voice. Complete the short author fields below before final submission.

## Identity and required form fields

- **Final project name (60 characters max):** Feedback Auditor
- **Submitter type:** Individual
- **Country of residence:** Canada
- **`/feedback` Session ID from the primary Codex build task:** `019f7314-a7f8-7f23-b437-5c37eabcff36`

## Author voice

Write one or two natural sentences for each prompt. Short and specific is better than polished marketing language.

1. **I built this because…**

   I want a low-cost final validation layer for serious assessment workflows where anonymous work may be reviewed across multiple grading passes. Extracting each submission once and cross-checking it with deterministic rules avoids repeated pairwise model calls and reduces token use compared with brute-force AI re-grading.

2. **The teacher workflow I most wanted to improve was…**

3. **The product decision I care most about is…**

4. **Codex changed or accelerated my build by…**

5. **The part where GPT-5.6 matters is…**

These sentences will be used to assemble the final English Devpost description while preserving the entrant's own wording.

## External publishing confirmations

- [x] Authorize upload of `feedback-auditor-demo-kokoro-highlighted.mp4` as a **public** YouTube video on the currently signed-in channel **padoru MMD**.
- [x] Entrant confirms they have read and agree to the OpenAI Build Week Official Rules and Devpost Terms of Service shown on the final submission page.

## Verified submission facts

- Track: Education
- Repository: <https://github.com/breadtitor/feedback-auditor>
- Public judge demo: <https://breadtitor.github.io/feedback-auditor/>
- License: MIT
- Demo length: 2:44
- Demo format: 1920×1080, 16:9, English Kokoro-82M open-weight voiceover, synchronized UI highlights, no embedded subtitles
- Synthetic fixture: 6 submissions, 4 rubric dimensions, 7 findings, 4 deterministic rules
- Precomputed Codex judge path: 6 full fictional essays, 32 verified evidence signals, 13 findings, 63% coverage, 0 public-site API calls
- Live integration: GPT-5.6 Responses API + Structured Outputs + verbatim excerpt validation
- Public judge path: no account and no API key required for the deterministic synthetic demo
- Public hosting boundary: static GitHub Pages deployment with no database, server API, or embedded key
- Automated grade changes: 0
