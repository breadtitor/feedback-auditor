# Judge Test Guide

Time required: about three minutes per path. No login, real student data, or API key is required.

Public demo: <https://breadtitor.github.io/feedback-auditor/>

## Choose a judge path

The landing page provides two intentionally separate static demonstrations:

1. **Try the synthetic demo** is the seven-finding, 88%-coverage fixture shown in the narrated video.
2. **Open the precomputed Codex audit** is the newer six-essay GPT-5.6 Codex sample run: 32 verified evidence signals, 13 review questions, 63% coverage, and no API call from the site.

Neither path sends a request to OpenAI. The precomputed path is recommended when testing the latest analysis result; the original path is retained so the numbers and workflow in the 2:44 voiceover video remain reproducible. Its confidence label was clarified after recording to identify the evidence as pre-authored rather than live extraction.

## 1. Open the narrated-video fixture (20 seconds)

Select **Try the synthetic demo** on the landing page. You should see:

- 6 anonymous synthetic submissions;
- 7 open review signals;
- 88% feedback coverage;
- 0 automated grade changes.

## 2. Inspect a finding (50 seconds)

Open **Similar evidence, different scores**.

Verify that the detail panel shows:

- two highlighted verbatim excerpts;
- each anonymous student's rubric score;
- the existing teacher feedback;
- extraction confidence and a canonical evidence tag;
- rule ID `R1 v1.0`;
- a neutral teacher review question.

The product does not say which grade is correct.

## Optional: inspect the precomputed Codex audit (60 seconds)

Return home and select **Open the precomputed Codex audit**. Verify:

- the top bar reads **Precomputed · no API** and contains no Live Analysis action;
- the provenance banner explains that 32 saved evidence signals are matched locally to six fictional submissions;
- the metrics show 13 open review questions, 63% feedback coverage, and 0 automated changes;
- the review queue contains R1, R2, R3, and R4 findings;
- the six complete essays are available under **Submissions**;
- **Methodology** labels step 2 as saved GPT-5.6 Codex analysis;
- exported Markdown records the precomputed provenance and zero public-site API calls.

The JSON was generated earlier in the entrant's GPT-5.6 Codex session and validated by the same production evidence gate used by the server route. The browser is not claiming that these results were generated live.

## 3. Record a teacher decision (35 seconds)

Add a short note and select **Confirm for review**. The decision count should increase. Filter **Status → Confirmed** to isolate it. Reloading and reopening the demo preserves the decision in local browser storage.

Use **Reset demo** when finished.

## 4. Inspect transparency (35 seconds)

Open **Methodology** and verify the separation between:

1. anonymous work and rubric;
2. GPT-5.6 structured signal extraction;
3. deterministic TypeScript rules;
4. teacher-controlled decisions.

Select **Export review** to download the Markdown decision log.

## 5. Try the input workflow (40 seconds)

Return home and select **Create an audit**.

- Edit the assignment context.
- Inspect or edit the four rubric dimensions.
- Select **Load format template** for the submission JSON schema.
- Confirm both privacy items.
- Create the local audit.

The new audit is ready for GPT-5.6 evidence extraction. Without a configured server key, **Run live analysis** returns a visible safe fallback and leaves the local draft unchanged.

## Expected boundaries

- No automatic grade changes.
- No fairness or bias determination.
- No protected-characteristic inference.
- No real student data in the repository.
- No browser-exposed API key.
- No live OpenAI Platform request from either public judge path.
