"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

import { AuditSetup } from "@/components/audit-setup";
import { calculateCoverage, runAudit } from "@/domain/rules";
import {
  severityLabels,
  type AuditProject,
  type AuditFinding,
  type FindingStatus,
} from "@/domain/schemas";
import { demoProject } from "@/fixtures/demo-project";

type View = "queue" | "submissions" | "method";
type LiveState = "idle" | "running" | "success" | "error";

const STORAGE_KEY = "feedback-auditor-decisions-v1";

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    arrow: <path d="m9 18 6-6-6-6M4 12h11" />,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    download: <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" />,
    eye: <><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6S2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
    file: <><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v5h5M10 13h5M10 17h5" /></>,
    filter: <path d="M4 6h16M7 12h10M10 18h4" />,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    note: <><path d="M5 4h14v16H5z" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
    play: <path d="m9 7 8 5-8 5V7Z" />,
    refresh: <><path d="M20 7v5h-5" /><path d="M4 17a8 8 0 0 0 13.4 1.6L20 16M4 8l2.6-2.6A8 8 0 0 1 20 10M4 8v5h5" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    shield: <path d="M12 3 5 6v5c0 4.6 2.8 8.8 7 10 4.2-1.2 7-5.4 7-10V6l-7-3Z" />,
    spark: <path d="m12 3 1.2 4.1L17 9l-3.8 1.9L12 15l-1.2-4.1L7 9l3.8-1.9L12 3ZM5 15l.7 2.3L8 18l-2.3.7L5 21l-.7-2.3L2 18l2.3-.7L5 15ZM19 14l.7 2.3L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7L19 14Z" />,
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /><path d="m14.8 9.2 5-5" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>,
  };
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      {paths[name]}
    </svg>
  );
}

function ProductMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand-lockup">
      <span className="brand-mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      {!compact && (
        <span>
          <strong>Feedback Auditor</strong>
          <small>Teacher calibration workspace</small>
        </span>
      )}
    </div>
  );
}

function Landing({ onStart, onCreate }: { onStart: () => void; onCreate: () => void }) {
  return (
    <main className="landing-shell">
      <nav className="landing-nav" aria-label="Primary navigation">
        <ProductMark />
        <div className="landing-links">
          <a href="#how">How it works</a>
          <a href="#safeguards">Safeguards</a>
          <button className="nav-cta" onClick={onStart}>
            Try the demo
            <Icon name="arrow" size={16} />
          </button>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-copy">
          <div className="eyebrow"><span /> Evidence-first teacher review</div>
          <h1>Find feedback drift<br />before students do.</h1>
          <p className="hero-lede">
            Surface similar student evidence that received meaningfully different scores or
            feedback—then let the teacher make the call.
          </p>
          <div className="hero-actions">
            <button className="primary-cta" onClick={onStart} data-testid="try-demo">
              <Icon name="play" size={18} />
              Try the synthetic demo
            </button>
            <button className="secondary-cta" onClick={onCreate}>
              Create an audit
            </button>
            <a className="text-link" href="#how">
              See the method <Icon name="arrow" size={16} />
            </a>
          </div>
          <div className="hero-proof">
            <span><Icon name="lock" size={15} /> No account or API key</span>
            <span><Icon name="shield" size={15} /> Synthetic student data</span>
            <span><Icon name="check" size={15} /> No automated grade changes</span>
          </div>
        </div>

        <div className="hero-demo" aria-label="Example consistency finding">
          <div className="demo-window-bar">
            <span className="window-dot" />
            <span className="window-dot" />
            <span className="window-dot" />
            <span className="window-title">Calibration review</span>
            <span className="live-pill">Synthetic demo</span>
          </div>
          <div className="demo-content">
            <div className="demo-heading-row">
              <div>
                <span className="priority-chip high">High priority</span>
                <h3>Similar evidence, different scores</h3>
              </div>
              <span className="rule-chip">R1 · v1.0</span>
            </div>
            <p className="demo-summary">
              Two submissions show the same unsupported-claim pattern at similar severity.
            </p>
            <div className="comparison-grid mini">
              <article>
                <header><span>Student A</span><strong>3<span>/4</span></strong></header>
                <p>“This shows that student volunteers can help the community.”</p>
                <footer>Evidence use</footer>
              </article>
              <div className="versus">vs</div>
              <article>
                <header><span>Student B</span><strong>1<span>/4</span></strong></header>
                <p>“The food bank example is proof that required service…”</p>
                <footer>Evidence use</footer>
              </article>
            </div>
            <div className="demo-question">
              <Icon name="target" size={18} />
              <span>Would the same scoring interpretation apply to both?</span>
            </div>
            <div className="demo-buttons">
              <button><Icon name="check" size={16} /> Confirm for review</button>
              <button className="ghost">Dismiss</button>
            </div>
          </div>
        </div>
      </section>

      <section className="problem-strip" aria-label="Product principles">
        <div><strong>6</strong><span>synthetic submissions</span></div>
        <div><strong>4</strong><span>deterministic audit rules</span></div>
        <div><strong>100%</strong><span>evidence-linked findings</span></div>
        <div><strong>0</strong><span>automatic grade changes</span></div>
      </section>

      <section className="method-section" id="how">
        <div className="section-heading">
          <div className="eyebrow"><span /> How it works</div>
          <h2>Model-assisted extraction.<br />Rule-based review.</h2>
          <p>The model structures evidence. Versioned code decides which patterns deserve review.</p>
        </div>
        <div className="method-grid">
          <article>
            <span className="step-number">01</span>
            <Icon name="file" size={24} />
            <h3>Bring the rubric and feedback</h3>
            <p>Use anonymous student labels, rubric scores, and the feedback already written by the teacher.</p>
          </article>
          <article>
            <span className="step-number">02</span>
            <Icon name="spark" size={24} />
            <h3>Extract evidence signals</h3>
            <p>GPT-5.6 returns constrained signals with verbatim evidence spans—not final grades.</p>
          </article>
          <article>
            <span className="step-number">03</span>
            <Icon name="layers" size={24} />
            <h3>Compare with visible rules</h3>
            <p>TypeScript rules find score gaps, uneven coverage, and score-feedback mismatches.</p>
          </article>
          <article>
            <span className="step-number">04</span>
            <Icon name="users" size={24} />
            <h3>Teacher makes the call</h3>
            <p>Confirm, dismiss, resolve, and export a transparent decision log.</p>
          </article>
        </div>
      </section>

      <section className="safeguard-section" id="safeguards">
        <div>
          <div className="eyebrow light"><span /> Product boundary</div>
          <h2>A calibration mirror,<br />not a grading authority.</h2>
        </div>
        <div className="safeguard-list">
          <p><Icon name="check" /> Never changes a score automatically</p>
          <p><Icon name="check" /> Never labels a teacher as unfair or biased</p>
          <p><Icon name="check" /> Never ranks students by risk or ability</p>
          <p><Icon name="check" /> Keeps every signal tied to source evidence</p>
        </div>
      </section>

      <footer className="landing-footer">
        <ProductMark />
        <p>Built for OpenAI Build Week · Education track · Synthetic data only</p>
      </footer>
    </main>
  );
}

function HighlightedText({ text, excerpt }: { text: string; excerpt: string }) {
  const index = text.indexOf(excerpt);
  if (index < 0) return <p className="student-text">{text}</p>;
  return (
    <p className="student-text">
      {text.slice(0, index)}
      <mark>{excerpt}</mark>
      {text.slice(index + excerpt.length)}
    </p>
  );
}

function FindingDetail({
  project,
  finding,
  onClose,
  onUpdate,
}: {
  project: AuditProject;
  finding: AuditFinding;
  onClose: () => void;
  onUpdate: (status: FindingStatus, note?: string) => void;
}) {
  const [note, setNote] = useState(finding.teacherNote ?? "");
  const dimension = project.rubric.find((item) => item.id === finding.rubricDimensionId)!;

  return (
    <aside className="detail-panel" aria-label="Finding detail" data-testid="finding-detail">
      <div className="detail-topbar">
        <button className="icon-button" onClick={onClose} aria-label="Close finding detail">
          <Icon name="close" size={19} />
        </button>
        <span>Finding detail</span>
        <span className="rule-chip">{finding.ruleId} · v{finding.ruleVersion}</span>
      </div>
      <div className="detail-scroll">
        <div className="detail-title">
          <span className={`priority-chip ${finding.severity}`}>{severityLabels[finding.severity]}</span>
          <h2>{finding.title}</h2>
          <p>{finding.summary}</p>
          <div className="detail-meta">
            <span>{dimension.title}</span>
            <span>{finding.submissionIds.length} submission{finding.submissionIds.length === 1 ? "" : "s"}</span>
            <span>Evidence-linked</span>
          </div>
        </div>

        <section className="detail-section">
          <div className="section-label"><span>01</span> Compare the evidence</div>
          <div className={`evidence-stack ${finding.submissionIds.length === 1 ? "single" : ""}`}>
            {finding.submissionIds.map((submissionId) => {
              const submission = project.submissions.find((item) => item.id === submissionId)!;
              const signals = project.signals.filter(
                (item) => finding.evidenceSignalIds.includes(item.id) && item.submissionId === submissionId,
              );
              const signal = signals[0];
              return (
                <article className="evidence-card" key={submissionId}>
                  <header>
                    <div className="student-avatar">{submission.pseudonym.at(-1)}</div>
                    <div><strong>{submission.pseudonym}</strong><span>Anonymous demo record</span></div>
                    <div className="score-badge">
                      <strong>{submission.scores[dimension.id]}</strong>
                      <span>/{dimension.maxPoints}</span>
                    </div>
                  </header>
                  <div className="evidence-body">
                    {signal ? (
                      <HighlightedText text={submission.text} excerpt={signal.excerpt} />
                    ) : (
                      <p className="student-text">{submission.text}</p>
                    )}
                  </div>
                  {signal && (
                    <div className="signal-explanation">
                      <span>{signal.canonicalTag.replaceAll("_", " ")}</span>
                      <p>{signal.explanation}</p>
                      <small>{Math.round(signal.confidence * 100)}% extraction confidence</small>
                    </div>
                  )}
                  <div className="teacher-feedback">
                    <span><Icon name="note" size={15} /> Existing teacher feedback</span>
                    <p>{submission.teacherFeedback}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="detail-section">
          <div className="section-label"><span>02</span> Make the teacher decision</div>
          <div className="review-question">
            <Icon name="target" size={22} />
            <div><span>Review question</span><strong>{finding.reviewQuestion}</strong></div>
          </div>
          <label className="note-field">
            <span>Decision note <small>optional</small></span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Record why this signal was confirmed or dismissed…"
            />
          </label>
          <div className="decision-actions">
            <button className="confirm-button" onClick={() => onUpdate("confirmed", note)}>
              <Icon name="check" size={17} /> Confirm for review
            </button>
            <button className="resolve-button" onClick={() => onUpdate("resolved", note)}>
              Mark resolved
            </button>
            <button className="dismiss-button" onClick={() => onUpdate("dismissed", note)}>
              Dismiss signal
            </button>
          </div>
          {finding.status !== "open" && (
            <div className={`decision-saved ${finding.status}`}>
              <Icon name="check" size={16} /> Current decision: {finding.status}
            </div>
          )}
        </section>

        <section className="method-note">
          <Icon name="shield" size={20} />
          <div>
            <strong>What this signal does—and does not—mean</strong>
            <p>This finding identifies a review pattern. It does not determine which score is correct, change a grade, or make a fairness judgment.</p>
          </div>
        </section>
      </div>
    </aside>
  );
}

function Workspace({
  initialProject,
  onExit,
  onEdit,
}: {
  initialProject: AuditProject;
  onExit: () => void;
  onEdit: (project: AuditProject) => void;
}) {
  const [project, setProject] = useState(initialProject);
  const initialFindings = useMemo(() => runAudit(initialProject), [initialProject]);
  const [findings, setFindings] = useState(initialFindings);
  const [selectedId, setSelectedId] = useState<string | null>(initialFindings[0]?.id ?? null);
  const [view, setView] = useState<View>("queue");
  const [statusFilter, setStatusFilter] = useState<"all" | FindingStatus>("all");
  const [dimensionFilter, setDimensionFilter] = useState("all");
  const [liveState, setLiveState] = useState<LiveState>("idle");
  const [liveMessage, setLiveMessage] = useState("");
  const projectStorageKey = `${STORAGE_KEY}:${project.id}`;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = window.localStorage.getItem(projectStorageKey);
      if (!saved) return;
      try {
        const decisions = JSON.parse(saved) as Record<string, Pick<AuditFinding, "status" | "teacherNote">>;
        setFindings((current) =>
          current.map((item) => (decisions[item.id] ? { ...item, ...decisions[item.id] } : item)),
        );
      } catch {
        window.localStorage.removeItem(projectStorageKey);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [projectStorageKey]);

  const selected = findings.find((item) => item.id === selectedId) ?? null;
  const filtered = findings.filter(
    (item) =>
      (statusFilter === "all" || item.status === statusFilter) &&
      (dimensionFilter === "all" || item.rubricDimensionId === dimensionFilter),
  );
  const openCount = findings.filter((item) => item.status === "open").length;
  const reviewedCount = findings.length - openCount;

  function persist(next: AuditFinding[]) {
    const decisions = Object.fromEntries(
      next.map((item) => [item.id, { status: item.status, teacherNote: item.teacherNote }]),
    );
    window.localStorage.setItem(projectStorageKey, JSON.stringify(decisions));
  }

  function updateFinding(status: FindingStatus, note?: string) {
    setFindings((current) => {
      const next = current.map((item) =>
        item.id === selectedId ? { ...item, status, teacherNote: note || undefined } : item,
      );
      persist(next);
      return next;
    });
  }

  function resetReview() {
    const next = initialFindings.map((item) => ({ ...item, status: "open" as const, teacherNote: undefined }));
    setFindings(next);
    setSelectedId(next[0]?.id ?? null);
    window.localStorage.removeItem(projectStorageKey);
  }

  async function runLiveAnalysis() {
    setLiveState("running");
    setLiveMessage("Extracting evidence with GPT-5.6…");

    if (process.env.NEXT_PUBLIC_STATIC_EXPORT === "true") {
      setLiveState("error");
      setLiveMessage(
        "Live Analysis requires a server deployment with an OpenAI API key. The complete synthetic demo remains fully interactive.",
      );
      return;
    }

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          project: {
            ...project,
            signals: [],
            feedbackCoverage: [],
          },
        }),
      });
      const payload = (await response.json()) as {
        error?: string;
        signals?: AuditProject["signals"];
        feedbackCoverage?: AuditProject["feedbackCoverage"];
        model?: string;
      };
      if (!response.ok || !payload.signals || !payload.feedbackCoverage) {
        throw new Error(payload.error ?? "Live Analysis could not complete.");
      }
      const liveProject = {
        ...project,
        signals: payload.signals,
        feedbackCoverage: payload.feedbackCoverage,
      };
      const next = runAudit(liveProject);
      setProject(liveProject);
      setFindings(next);
      setSelectedId(next[0]?.id ?? null);
      setLiveState("success");
      setLiveMessage(`Live analysis complete with ${payload.model ?? "GPT-5.6"}.`);
    } catch (error) {
      setLiveState("error");
      setLiveMessage(
        error instanceof Error && error.message.includes("OPENAI_API_KEY")
          ? `${error.message} The synthetic demo remains fully interactive.`
          : "Live Analysis is unavailable. The local draft is unchanged and the synthetic demo remains fully interactive.",
      );
    }
  }

  function exportReport() {
    const lines = [
      "# Feedback consistency review",
      "",
      `Dataset: ${project.datasetLabel}`,
      `Assignment: ${project.title}`,
      `Generated: ${new Date().toISOString()}`,
      "",
      "> Review signals support teacher calibration. They are not grades or fairness determinations.",
      "",
      ...findings.flatMap((item, index) => {
        const dimension = project.rubric.find((entry) => entry.id === item.rubricDimensionId)!;
        return [
          `## ${index + 1}. ${item.title}`,
          "",
          `- Priority: ${item.severity}`,
          `- Rubric dimension: ${dimension.title}`,
          `- Rule: ${item.ruleId} v${item.ruleVersion}`,
          `- Decision: ${item.status}`,
          `- Submissions: ${item.submissionIds.map((id) => project.submissions.find((entry) => entry.id === id)!.pseudonym).join(", ")}`,
          "",
          item.summary,
          "",
          `Review question: ${item.reviewQuestion}`,
          ...(item.teacherNote ? ["", `Teacher note: ${item.teacherNote}`] : []),
          "",
        ];
      }),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "feedback-consistency-review.md";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="app-shell">
      <aside className="app-sidebar">
        <button className="brand-button" onClick={onExit} aria-label="Return to product home"><ProductMark /></button>
        <div className="dataset-badge"><span /><div><strong>{project.synthetic ? "Synthetic dataset" : "Local teacher draft"}</strong><small>{project.synthetic ? "Safe for public demo" : "Anonymous records"}</small></div></div>

        <nav className="app-nav" aria-label="Audit navigation">
          <button className={view === "queue" ? "active" : ""} onClick={() => setView("queue")}>
            <Icon name="search" /> Review queue <span>{openCount}</span>
          </button>
          <button className={view === "submissions" ? "active" : ""} onClick={() => setView("submissions")}>
            <Icon name="file" /> Submissions <span>{project.submissions.length}</span>
          </button>
          <button className={view === "method" ? "active" : ""} onClick={() => setView("method")}>
            <Icon name="layers" /> Methodology
          </button>
        </nav>

        <div className="sidebar-context">
          <span className="sidebar-label">Current audit</span>
          <strong>{project.title}</strong>
          <p>{project.subject} · {project.gradeBand}</p>
          <div className="rubric-mini-list">
            {project.rubric.map((dimension) => (
              <div key={dimension.id}><span>{dimension.title}</span><small>{dimension.maxPoints} pts</small></div>
            ))}
          </div>
        </div>
        <div className="sidebar-footer">
          <Icon name="shield" size={17} />
          <p><strong>Human review required</strong><br />No score changes are automated.</p>
        </div>
      </aside>

      <section className="workspace-main">
        <header className="workspace-topbar">
          <div className="breadcrumb"><span>Audits</span><Icon name="chevron" size={14} /><strong>{project.title}</strong></div>
          <div className="topbar-actions">
            {!project.synthetic && <button className="secondary-button" onClick={() => onEdit(project)}>Edit inputs</button>}
            <button className="secondary-button" onClick={runLiveAnalysis} disabled={liveState === "running"}>
              <Icon name="spark" size={16} />
              {liveState === "running" ? "Analyzing…" : "Run live analysis"}
            </button>
            <button className="export-button" onClick={exportReport} data-testid="export-report">
              <Icon name="download" size={16} /> Export review
            </button>
          </div>
        </header>

        {liveState !== "idle" && (
          <div className={`live-status ${liveState}`} role="status">
            {liveState === "running" ? <span className="spinner" /> : <Icon name={liveState === "success" ? "check" : "shield"} size={17} />}
            <span>{liveMessage}</span>
            {liveState !== "running" && <button onClick={() => setLiveState("idle")} aria-label="Dismiss status"><Icon name="close" size={15} /></button>}
          </div>
        )}

        {view === "queue" && (
          <div className="workspace-content">
            <div className="workspace-heading">
              <div>
                <span className="page-kicker">Calibration review</span>
                <h1>Review signals</h1>
                <p>Patterns worth a second look, ordered by review priority.</p>
              </div>
              <button className="reset-button" onClick={resetReview}><Icon name="refresh" size={15} /> Reset demo</button>
            </div>

            <div className="metric-grid">
              <article><span className="metric-icon amber"><Icon name="search" /></span><div><strong>{openCount}</strong><span>Open signals</span><small>Need teacher review</small></div></article>
              <article><span className="metric-icon indigo"><Icon name="check" /></span><div><strong>{reviewedCount}</strong><span>Decisions recorded</span><small>Confirmed or dismissed</small></div></article>
              <article><span className="metric-icon teal"><Icon name="target" /></span><div><strong>{calculateCoverage(project)}%</strong><span>Feedback coverage</span><small>Rubric dimensions mentioned</small></div></article>
              <article><span className="metric-icon slate"><Icon name="lock" /></span><div><strong>0</strong><span>Automated changes</span><small>Teacher remains in control</small></div></article>
            </div>

            <div className="queue-toolbar">
              <div className="toolbar-title"><strong>Review queue</strong><span>{filtered.length} of {findings.length} signals</span></div>
              <div className="filters">
                <label><Icon name="filter" size={15} /><span className="sr-only">Status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | FindingStatus)}><option value="all">All statuses</option><option value="open">Open</option><option value="confirmed">Confirmed</option><option value="resolved">Resolved</option><option value="dismissed">Dismissed</option></select></label>
                <label><span className="sr-only">Rubric dimension</span><select value={dimensionFilter} onChange={(event) => setDimensionFilter(event.target.value)}><option value="all">All dimensions</option>{project.rubric.map((dimension) => <option key={dimension.id} value={dimension.id}>{dimension.title}</option>)}</select></label>
              </div>
            </div>

            <div className="finding-list" data-testid="finding-list">
              {filtered.map((item) => {
                const dimension = project.rubric.find((entry) => entry.id === item.rubricDimensionId)!;
                return (
                  <button className={`finding-row ${item.status !== "open" ? "reviewed" : ""}`} key={item.id} onClick={() => setSelectedId(item.id)} data-testid={`finding-${item.ruleId.toLowerCase()}`}>
                    <span className={`severity-line ${item.severity}`} />
                    <span className={`priority-chip ${item.severity}`}>{severityLabels[item.severity]}</span>
                    <span className="finding-copy"><strong>{item.title}</strong><small>{item.summary}</small><span><b>{dimension.title}</b> · {item.ruleId} v{item.ruleVersion} · {item.submissionIds.length} record{item.submissionIds.length === 1 ? "" : "s"}</span></span>
                    {item.status !== "open" && <span className={`status-chip ${item.status}`}><Icon name="check" size={13} />{item.status}</span>}
                    <Icon name="chevron" size={18} />
                  </button>
                );
              })}
              {filtered.length === 0 && <div className="empty-state"><Icon name={findings.length === 0 ? "spark" : "check"} size={26} /><strong>{findings.length === 0 ? "Ready for evidence extraction" : "No signals match these filters"}</strong><p>{findings.length === 0 ? "Run Live Analysis to extract structured evidence and apply the four review rules." : "Change the status or rubric filter to see other findings."}</p></div>}
            </div>
          </div>
        )}

        {view === "submissions" && (
          <div className="workspace-content">
            <div className="workspace-heading"><div><span className="page-kicker">{project.synthetic ? "Synthetic calibration pack" : "Local calibration draft"}</span><h1>Anonymous submissions</h1><p>{project.synthetic ? "Every record is synthetic and purpose-built for this public demo." : "These records remain local until Live Analysis is explicitly started."}</p></div></div>
            <div className="submission-grid">
              {project.submissions.map((submission) => (
                <article key={submission.id}>
                  <header><div className="student-avatar">{submission.pseudonym.at(-1)}</div><div><strong>{submission.pseudonym}</strong><span>{Object.values(submission.scores).reduce((a, b) => a + b, 0)}/{project.rubric.reduce((total, dimension) => total + dimension.maxPoints, 0)} rubric points</span></div></header>
                  <p>{submission.text}</p>
                  <div className="score-row" style={{ gridTemplateColumns: `repeat(${project.rubric.length}, 1fr)` }}>{project.rubric.map((dimension) => <span key={dimension.id}><small>{dimension.title.split(" ")[0]}</small><strong>{submission.scores[dimension.id]}/{dimension.maxPoints}</strong></span>)}</div>
                  <footer><Icon name="note" size={15} /><span>{submission.teacherFeedback}</span></footer>
                </article>
              ))}
            </div>
          </div>
        )}

        {view === "method" && (
          <div className="workspace-content methodology-page">
            <div className="workspace-heading"><div><span className="page-kicker">Transparent by design</span><h1>Audit methodology</h1><p>The model structures evidence; versioned code determines review signals.</p></div></div>
            <div className="pipeline-card">
              <div><span>01</span><Icon name="file" /><strong>Anonymous work + rubric</strong><small>Teacher-provided evidence</small></div><Icon name="arrow" />
              <div><span>02</span><Icon name="spark" /><strong>Structured signals</strong><small>GPT-5.6 extraction</small></div><Icon name="arrow" />
              <div><span>03</span><Icon name="layers" /><strong>Deterministic rules</strong><small>TypeScript v1.0</small></div><Icon name="arrow" />
              <div><span>04</span><Icon name="users" /><strong>Teacher decision</strong><small>Human-controlled outcome</small></div>
            </div>
            <div className="rule-card-grid">
              <article><span>R1</span><h3>Similar evidence, score gap</h3><p>Compares the same canonical issue at similar severity and surfaces score gaps above a visible threshold.</p><small>Threshold: 35% of dimension maximum</small></article>
              <article><span>R2</span><h3>Uneven feedback coverage</h3><p>Finds when a moderate or major issue is addressed for one submission but omitted for another.</p><small>Requires locatable evidence</small></article>
              <article><span>R3</span><h3>Score-feedback mismatch</h3><p>Checks whether a high or low score appears to communicate a different level from written feedback.</p><small>Teacher review only</small></article>
              <article><span>R4</span><h3>Dimension not addressed</h3><p>Surfaces a scored rubric dimension with clear evidence but no dimension-linked feedback.</p><small>Never writes replacement feedback</small></article>
            </div>
            <div className="boundary-card"><Icon name="shield" size={25} /><div><h3>Explicit product boundary</h3><p>This prototype does not automate grades, make fairness determinations, infer protected characteristics, or rank students. Every signal is a question for teacher review.</p></div></div>
          </div>
        )}
      </section>

      {selected && view === "queue" && <FindingDetail key={selected.id} project={project} finding={selected} onClose={() => setSelectedId(null)} onUpdate={updateFinding} />}
    </main>
  );
}

export function AuditWorkspace() {
  const [screen, setScreen] = useState<"landing" | "setup" | "workspace">("landing");
  const [project, setProject] = useState<AuditProject | null>(null);
  const [editingProject, setEditingProject] = useState<AuditProject | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  const openDemo = () => {
    window.scrollTo(0, 0);
    setProject(demoProject);
    setScreen("workspace");
  };

  const openSetup = (existing: AuditProject | null = null) => {
    window.scrollTo(0, 0);
    setEditingProject(existing);
    setScreen("setup");
  };

  if (screen === "setup") {
    return (
      <AuditSetup
        initialProject={editingProject}
        onCancel={() => setScreen(project ? "workspace" : "landing")}
        onSave={(savedProject) => {
          setProject(savedProject);
          setEditingProject(null);
          setScreen("workspace");
        }}
      />
    );
  }

  if (screen === "workspace" && project) {
    return (
      <Workspace
        initialProject={project}
        onEdit={(currentProject) => openSetup(currentProject)}
        onExit={() => {
          setProject(null);
          setEditingProject(null);
          setScreen("landing");
        }}
      />
    );
  }

  return <Landing onStart={openDemo} onCreate={() => openSetup()} />;
}
