# Judge Test Guide

Time required: about three minutes. No login, student data, or API key is required.

## 1. Open the product (20 seconds)

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
