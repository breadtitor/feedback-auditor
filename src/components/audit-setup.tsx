"use client";

import { useMemo, useState } from "react";

import {
  auditProjectSchema,
  submissionSchema,
  type AuditProject,
  type RubricDimension,
} from "@/domain/schemas";

type SetupProps = {
  initialProject?: AuditProject | null;
  onCancel: () => void;
  onSave: (project: AuditProject) => void;
};

const DEFAULT_RUBRIC: RubricDimension[] = [
  { id: "claim", title: "Claim & reasoning", description: "Quality of the claim and reasoning.", maxPoints: 4 },
  { id: "evidence", title: "Evidence use", description: "Selection and explanation of evidence.", maxPoints: 4 },
  { id: "organization", title: "Organization", description: "Logical sequencing and cohesion.", maxPoints: 4 },
  { id: "clarity", title: "Language clarity", description: "Clarity and control of language.", maxPoints: 4 },
];

function makeTemplate(dimensions: RubricDimension[]) {
  const scores = Object.fromEntries(dimensions.map((dimension) => [dimension.id, 0]));
  return JSON.stringify(
    [
      {
        id: "submission-a",
        pseudonym: "Student A",
        text: "Paste anonymous student work here.",
        scores,
        teacherFeedback: "Paste the teacher's existing feedback here.",
      },
      {
        id: "submission-b",
        pseudonym: "Student B",
        text: "Paste a second anonymous submission here.",
        scores,
        teacherFeedback: "Paste the teacher's existing feedback here.",
      },
    ],
    null,
    2,
  );
}

export function AuditSetup({ initialProject, onCancel, onSave }: SetupProps) {
  const [title, setTitle] = useState(initialProject?.title ?? "");
  const [subject, setSubject] = useState(initialProject?.subject ?? "English Language Arts");
  const [gradeBand, setGradeBand] = useState(initialProject?.gradeBand ?? "Grade 10");
  const [assignmentPrompt, setAssignmentPrompt] = useState(initialProject?.assignmentPrompt ?? "");
  const [objectives, setObjectives] = useState(initialProject?.learningObjectives.join("\n") ?? "");
  const [dimensions, setDimensions] = useState<RubricDimension[]>(initialProject?.rubric ?? DEFAULT_RUBRIC);
  const [submissionJson, setSubmissionJson] = useState(
    initialProject ? JSON.stringify(initialProject.submissions, null, 2) : "",
  );
  const [anonymousConfirmed, setAnonymousConfirmed] = useState(false);
  const [processingConfirmed, setProcessingConfirmed] = useState(false);
  const [error, setError] = useState("");

  const dimensionIds = useMemo(() => new Set(dimensions.map((item) => item.id)), [dimensions]);

  function updateDimension(index: number, patch: Partial<RubricDimension>) {
    setDimensions((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  }

  function addDimension() {
    const nextNumber = dimensions.length + 1;
    setDimensions((current) => [
      ...current,
      { id: `dimension-${nextNumber}`, title: `Dimension ${nextNumber}`, description: "", maxPoints: 4 },
    ]);
  }

  function saveProject() {
    setError("");
    if (!title.trim() || !assignmentPrompt.trim()) {
      setError("Add an audit title and assignment prompt before continuing.");
      return;
    }
    if (dimensions.length === 0 || dimensionIds.size !== dimensions.length || dimensions.some((item) => !item.id.trim() || !item.title.trim())) {
      setError("Rubric dimensions need unique IDs and visible titles.");
      return;
    }

    try {
      const parsedJson: unknown = JSON.parse(submissionJson);
      const submissions = submissionSchema.array().parse(parsedJson);
      if (submissions.length < 2) throw new Error("Add at least two anonymous submissions for comparison.");

      for (const submission of submissions) {
        for (const dimension of dimensions) {
          const score = submission.scores[dimension.id];
          if (score === undefined || score < 0 || score > dimension.maxPoints) {
            throw new Error(`${submission.pseudonym} needs a score from 0 to ${dimension.maxPoints} for “${dimension.id}”.`);
          }
        }
      }

      const project = auditProjectSchema.parse({
        id: initialProject?.id ?? `custom-${Date.now()}`,
        title: title.trim(),
        subject: subject.trim(),
        gradeBand: gradeBand.trim(),
        assignmentPrompt: assignmentPrompt.trim(),
        learningObjectives: objectives.split("\n").map((item) => item.trim()).filter(Boolean),
        rubric: dimensions,
        submissions,
        signals: [],
        feedbackCoverage: [],
        datasetLabel: "Local teacher audit",
        synthetic: false,
      });
      onSave(project);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The submission JSON could not be validated.");
    }
  }

  return (
    <main className="setup-shell">
      <header className="setup-header">
        <button className="setup-brand" onClick={onCancel} aria-label="Return to product home">
          <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>
          <span><strong>Feedback Auditor</strong><small>Private-by-default setup</small></span>
        </button>
        <button className="setup-back" onClick={onCancel}>← Back</button>
      </header>

      <section className="setup-intro">
        <span>New calibration audit</span>
        <h1>{initialProject ? "Edit your audit inputs" : "Bring the work. Keep the judgment."}</h1>
        <p>Set the assignment context, define the rubric, and paste anonymous records. Draft data stays in this browser unless you explicitly run Live Analysis.</p>
      </section>

      <section className="setup-grid">
        <article className="setup-card">
          <header><span>01</span><div><h2>Assignment context</h2><p>Give the analysis enough instructional context to interpret evidence.</p></div></header>
          <div className="field-grid two-up">
            <label><span>Audit title</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Civic argument calibration" /></label>
            <label><span>Subject</span><input value={subject} onChange={(event) => setSubject(event.target.value)} /></label>
            <label><span>Grade band</span><input value={gradeBand} onChange={(event) => setGradeBand(event.target.value)} /></label>
            <label><span>Learning objectives</span><input value={objectives} onChange={(event) => setObjectives(event.target.value)} placeholder="One objective per line" /></label>
          </div>
          <label className="field-block"><span>Assignment prompt</span><textarea value={assignmentPrompt} onChange={(event) => setAssignmentPrompt(event.target.value)} placeholder="Paste the prompt students responded to…" /></label>
        </article>

        <article className="setup-card">
          <header><span>02</span><div><h2>Rubric dimensions</h2><p>IDs connect each imported score to a visible rubric dimension.</p></div></header>
          <div className="rubric-editor">
            {dimensions.map((dimension, index) => (
              <div className="rubric-editor-row" key={`${dimension.id}-${index}`}>
                <label><span>ID</span><input value={dimension.id} onChange={(event) => updateDimension(index, { id: event.target.value })} /></label>
                <label><span>Title</span><input value={dimension.title} onChange={(event) => updateDimension(index, { title: event.target.value })} /></label>
                <label><span>Max</span><input type="number" min="1" max="100" value={dimension.maxPoints} onChange={(event) => updateDimension(index, { maxPoints: Number(event.target.value) })} /></label>
                <label><span>Description</span><input value={dimension.description} onChange={(event) => updateDimension(index, { description: event.target.value })} /></label>
                <button aria-label={`Remove ${dimension.title}`} onClick={() => setDimensions((current) => current.filter((_, itemIndex) => itemIndex !== index))}>×</button>
              </div>
            ))}
          </div>
          <button className="add-dimension" onClick={addDimension}>+ Add rubric dimension</button>
        </article>

        <article className="setup-card full-width">
          <header><span>03</span><div><h2>Anonymous submissions</h2><p>Paste a JSON array with pseudonym, text, scores keyed by rubric ID, and existing teacher feedback.</p></div></header>
          <div className="json-toolbar">
            <code>pseudonym · text · scores · teacherFeedback</code>
            <button onClick={() => setSubmissionJson(makeTemplate(dimensions))}>Load format template</button>
          </div>
          <label className="field-block"><span>Submission JSON</span><textarea className="json-input" value={submissionJson} onChange={(event) => setSubmissionJson(event.target.value)} placeholder="Load the template, then paste at least two anonymous records…" spellCheck={false} /></label>
        </article>

        <article className="privacy-card full-width">
          <div><span className="privacy-icon">✓</span><div><h2>Privacy checkpoint</h2><p>Custom drafts remain local. Running Live Analysis sends the entered text to the configured OpenAI API from the server.</p></div></div>
          <label><input type="checkbox" checked={anonymousConfirmed} onChange={(event) => setAnonymousConfirmed(event.target.checked)} /><span>I removed student names, emails, IDs, and other direct identifiers.</span></label>
          <label><input type="checkbox" checked={processingConfirmed} onChange={(event) => setProcessingConfirmed(event.target.checked)} /><span>I am authorized to process these records for teacher review.</span></label>
        </article>
      </section>

      <footer className="setup-footer">
        <div>{error ? <p role="alert">{error}</p> : <p>No grade is changed by creating or analyzing an audit.</p>}</div>
        <button className="setup-cancel" onClick={onCancel}>Cancel</button>
        <button className="setup-save" onClick={saveProject} disabled={!anonymousConfirmed || !processingConfirmed}>{initialProject ? "Save and return" : "Create audit"} →</button>
      </footer>
    </main>
  );
}
