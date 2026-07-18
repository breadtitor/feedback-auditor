"""Compose the final demo with Kokoro narration and timed UI callouts.

The output intentionally contains no subtitle stream or burned-in captions.
Sentence timings come from the Kokoro generation manifest and are used only to
align chapter labels, amber focus boxes, and short explanatory callouts.
"""

from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEMO_DIR = ROOT / "artifacts" / "demo"
FRAMES_DIR = DEMO_DIR / "frames"
AUDIO_DIR = DEMO_DIR / "audio-kokoro"
MANIFEST_PATH = AUDIO_DIR / "timing-manifest.json"
OUTPUT_PATH = DEMO_DIR / "feedback-auditor-demo-kokoro-highlighted.mp4"
RENDER_DIR = DEMO_DIR / "render-kokoro"

WIDTH = 1920
HEIGHT = 1080
FPS = 30
FONT_REGULAR = Path("C:/Windows/Fonts/segoeui.ttf")
FONT_SEMIBOLD = Path("C:/Windows/Fonts/seguisb.ttf")


CHAPTER_LABELS = {
    "01-landing": "1  PROBLEM",
    "02-dashboard": "2  SAFE DEMO",
    "03-evidence": "3  EVIDENCE",
    "04-decision": "4  TEACHER DECISION",
    "05-methodology": "5  GPT-5.6 + RULES",
    "06-setup": "6  CUSTOM AUDIT",
    "07-privacy": "7  PRIVACY + CODEX",
}


# Coordinates are expressed in each source screenshot's native pixels.  Labels
# use final 1920x1080 coordinates so their placement is easy to audit.
EVENTS = {
    "01-landing": [
        {
            "sentence": 1,
            "boxes": [(835, 375, 570, 165)],
            "label": "Similar evidence  •  different outcomes",
            "label_xy": (985, 350),
        },
        {
            "sentence": 2,
            "boxes": [(842, 535, 552, 55), (535, 685, 250, 35)],
            "label": "Finds drift  •  never changes scores",
            "label_xy": (1000, 720),
        },
    ],
    "02-dashboard": [
        {
            "sentence": 0,
            "boxes": [(13, 84, 205, 50)],
            "label": "Synthetic data  •  no account  •  no key",
            "label_xy": (285, 92),
        },
        {
            "sentence": 1,
            "boxes": [(262, 183, 675, 95), (15, 198, 202, 75), (15, 332, 202, 145)],
            "label": "6 submissions  •  4 dimensions  •  7 signals",
            "label_xy": (360, 345),
        },
        {
            "sentence": 2,
            "boxes": [(939, 183, 218, 95)],
            "label": "0 automated changes",
            "label_xy": (955, 345),
        },
        {
            "sentence": 3,
            "boxes": [(1218, 648, 440, 55), (1218, 811, 440, 43)],
            "label": "Teacher stays in control",
            "label_xy": (1370, 690),
        },
    ],
    "03-evidence": [
        {
            "sentence": 0,
            "boxes": [(1218, 287, 442, 443)],
            "label": "Same pattern  •  2-point gap",
            "label_xy": (1365, 275),
        },
        {
            "sentence": 1,
            "fraction": (0.00, 0.22),
            "boxes": [(1222, 340, 435, 185)],
            "label": "Exact excerpts",
            "label_xy": (1365, 285),
        },
        {
            "sentence": 1,
            "fraction": (0.22, 0.40),
            "boxes": [(1375, 290, 280, 42)],
            "label": "Rubric scores",
            "label_xy": (1365, 255),
        },
        {
            "sentence": 1,
            "fraction": (0.40, 0.64),
            "boxes": [(1222, 615, 435, 116)],
            "label": "Original teacher feedback",
            "label_xy": (1350, 550),
        },
        {
            "sentence": 1,
            "fraction": (0.64, 0.82),
            "boxes": [(1222, 570, 435, 42)],
            "label": "Extraction confidence",
            "label_xy": (1350, 525),
        },
        {
            "sentence": 1,
            "fraction": (0.82, 1.00),
            "boxes": [(1608, 20, 62, 28), (262, 420, 710, 82)],
            "label": "Rule R1  •  version 1.0",
            "label_xy": (1310, 115),
        },
        {
            "sentence": 2,
            "boxes": [(1218, 797, 442, 58)],
            "label": "Calibration question",
            "label_xy": (1380, 790),
        },
        {
            "sentence": 3,
            "boxes": [(1218, 797, 442, 58)],
            "label": "Teacher decides",
            "label_xy": (1435, 790),
        },
    ],
    "04-decision": [
        {
            "sentence": 0,
            "boxes": [(1218, 664, 442, 162)],
            "label": "Teacher records the decision",
            "label_xy": (1320, 650),
        },
        {
            "sentence": 1,
            "fraction": (0.00, 0.32),
            "boxes": [(487, 183, 226, 95), (905, 306, 250, 39)],
            "label": "Local review state",
            "label_xy": (530, 345),
        },
        {
            "sentence": 1,
            "fraction": (0.32, 0.65),
            "boxes": [(1056, 14, 117, 42)],
            "label": "Transparent Markdown export",
            "label_xy": (1020, 90),
        },
        {
            "sentence": 1,
            "fraction": (0.65, 1.00),
            "boxes": [(1218, 790, 442, 39)],
            "label": "No full submissions in the log",
            "label_xy": (1300, 735),
        },
    ],
    "05-methodology": [
        {
            "sentence": 0,
            "boxes": [(535, 185, 255, 112)],
            "label": "GPT-5.6  •  extraction only",
            "label_xy": (605, 370),
        },
        {
            "sentence": 1,
            "boxes": [(535, 185, 255, 112)],
            "label": "Excerpts verified against source",
            "label_xy": (570, 370),
        },
        {
            "sentence": 2,
            "boxes": [(795, 185, 255, 112), (262, 307, 1054, 313)],
            "label": "Versioned TypeScript rules",
            "label_xy": (790, 725),
        },
        {
            "sentence": 3,
            "boxes": [(1050, 185, 266, 112), (262, 628, 1054, 70)],
            "label": "Safe fallback  •  deterministic demo",
            "label_xy": (755, 805),
        },
    ],
    "06-setup": [
        {
            "sentence": 0,
            "fraction": (0.00, 0.32),
            "boxes": [(317, 301, 510, 350)],
            "label": "Assignment context",
            "label_xy": (500, 305),
        },
        {
            "sentence": 0,
            "fraction": (0.32, 0.63),
            "boxes": [(838, 301, 511, 350)],
            "label": "Rubric dimensions",
            "label_xy": (1075, 305),
        },
        {
            "sentence": 0,
            "fraction": (0.63, 1.00),
            "boxes": [(317, 663, 1033, 244)],
            "label": "Anonymous JSON records",
            "label_xy": (725, 780),
        },
        {
            "sentence": 1,
            "boxes": [(317, 301, 1033, 606)],
            "label": "Real inputs  +  instant no-key demo",
            "label_xy": (690, 835),
        },
    ],
    "07-privacy": [
        {
            "sentence": 0,
            "boxes": [(317, 662, 1034, 132)],
            "label": "Browser-local until Live Analysis",
            "label_xy": (675, 760),
        },
        {
            "sentence": 1,
            "panel": {
                "xywh": (1040, 145, 760, 480),
                "title": "Built and verified with Codex",
                "lines": [
                    "Architecture",
                    "Application + refactors",
                    "Synthetic evaluation",
                    "Type • rules • API • build • browser checks",
                ],
            },
        },
        {"sentence": 2, "closing": True},
    ],
}


def ffmpeg_escape(value: str) -> str:
    """Escape text used inside a single-quoted FFmpeg drawtext value."""

    return (
        value.replace("\\", "\\\\")
        .replace("'", "\\'")
        .replace(":", "\\:")
        .replace("%", "\\%")
    )


def font_path(path: Path) -> str:
    return str(path).replace("\\", "/").replace(":", "\\:")


def image_size(ffprobe: str, path: Path) -> tuple[int, int]:
    command = [
        ffprobe,
        "-v",
        "error",
        "-select_streams",
        "v:0",
        "-show_entries",
        "stream=width,height",
        "-of",
        "json",
        str(path),
    ]
    payload = json.loads(subprocess.check_output(command, text=True))
    stream = payload["streams"][0]
    return int(stream["width"]), int(stream["height"])


def output_box(
    source_box: tuple[int, int, int, int], source_size: tuple[int, int]
) -> tuple[int, int, int, int]:
    source_width, source_height = source_size
    scale = WIDTH / source_width
    scaled_height = round((source_height * scale) / 2) * 2
    pad_y = (HEIGHT - scaled_height) / 2
    x, y, width, height = source_box
    return (
        round(x * scale),
        round(y * scale + pad_y),
        round(width * scale),
        round(height * scale),
    )


def event_times(event: dict, segment: dict) -> tuple[float, float]:
    sentence = segment["sentences"][event["sentence"]]
    start = float(sentence["start"])
    end = float(sentence["end"])
    fraction_start, fraction_end = event.get("fraction", (0.0, 1.0))
    duration = end - start
    return start + duration * fraction_start, start + duration * fraction_end


def drawtext(
    *,
    text: str,
    x: int | str,
    y: int | str,
    size: int,
    start: float,
    end: float,
    semibold: bool = True,
    box: bool = True,
    color: str = "white",
) -> str:
    font = FONT_SEMIBOLD if semibold else FONT_REGULAR
    options = [
        f"fontfile='{font_path(font)}'",
        f"text='{ffmpeg_escape(text)}'",
        f"x={x}",
        f"y={y}",
        f"fontsize={size}",
        f"fontcolor={color}",
        "shadowcolor=black@0.28",
        "shadowx=2",
        "shadowy=2",
    ]
    if box:
        options.extend(["box=1", "boxcolor=0x103E34@0.94", "boxborderw=15"])
    options.append(f"enable='between(t,{start:.3f},{end:.3f})'")
    return "drawtext=" + ":".join(options)


def highlighted_box(
    box: tuple[int, int, int, int], start: float, end: float
) -> list[str]:
    x, y, width, height = box
    enabled = f"enable='between(t,{start:.3f},{end:.3f})'"
    return [
        (
            f"drawbox=x={x}:y={y}:w={width}:h={height}:"
            f"color=0xF0A43B@0.12:t=fill:{enabled}"
        ),
        (
            f"drawbox=x={x}:y={y}:w={width}:h={height}:"
            f"color=0xE39525@0.98:t=6:{enabled}"
        ),
    ]


def video_chain(segment: dict, input_index: int, source_size: tuple[int, int]) -> str:
    duration = float(segment["duration"])
    filters = [
        "scale=1920:-2:flags=lanczos",
        "pad=1920:1080:0:(oh-ih)/2:color=0xF5F7F3",
        "setsar=1",
        f"trim=duration={duration:.3f}",
        "setpts=PTS-STARTPTS",
        "drawbox=x=34:y=26:w=410:h=62:color=0x103E34@0.94:t=fill:enable='between(t,0,2.700)'",
        drawtext(
            text=CHAPTER_LABELS[segment["id"]],
            x=56,
            y=43,
            size=27,
            start=0.0,
            end=2.7,
            box=False,
        ),
    ]

    for event in EVENTS[segment["id"]]:
        start, end = event_times(event, segment)
        for source_box in event.get("boxes", []):
            filters.extend(highlighted_box(output_box(source_box, source_size), start, end))

        if label := event.get("label"):
            label_x, label_y = event["label_xy"]
            filters.append(
                drawtext(
                    text=label,
                    x=label_x,
                    y=label_y,
                    size=30,
                    start=start,
                    end=end,
                )
            )

        if panel := event.get("panel"):
            x, y, width, height = panel["xywh"]
            enabled = f"enable='between(t,{start:.3f},{end:.3f})'"
            filters.extend(
                [
                    f"drawbox=x=0:y=0:w=iw:h=ih:color=black@0.18:t=fill:{enabled}",
                    (
                        f"drawbox=x={x}:y={y}:w={width}:h={height}:"
                        f"color=0x103E34@0.95:t=fill:{enabled}"
                    ),
                    (
                        f"drawbox=x={x}:y={y}:w={width}:h={height}:"
                        f"color=0xE39525@0.95:t=5:{enabled}"
                    ),
                    drawtext(
                        text=panel["title"],
                        x=x + 48,
                        y=y + 45,
                        size=39,
                        start=start,
                        end=end,
                        box=False,
                    ),
                ]
            )
            for line_index, line in enumerate(panel["lines"]):
                filters.append(
                    drawtext(
                        text=f"•  {line}",
                        x=x + 52,
                        y=y + 135 + line_index * 68,
                        size=28,
                        start=start,
                        end=end,
                        semibold=False,
                        box=False,
                    )
                )

        if event.get("closing"):
            enabled = f"enable='between(t,{start:.3f},{duration:.3f})'"
            filters.extend(
                [
                    f"drawbox=x=0:y=0:w=iw:h=ih:color=0x103E34@0.94:t=fill:{enabled}",
                    drawtext(
                        text="Feedback Auditor",
                        x="(w-text_w)/2",
                        y=395,
                        size=65,
                        start=start,
                        end=duration,
                        box=False,
                    ),
                    drawtext(
                        text="Calibration mirror  •  not a grading authority",
                        x="(w-text_w)/2",
                        y=500,
                        size=38,
                        start=start,
                        end=duration,
                        semibold=False,
                        box=False,
                        color="0xE8F4EF",
                    ),
                    drawtext(
                        text="breadtitor.github.io/feedback-auditor",
                        x="(w-text_w)/2",
                        y=610,
                        size=27,
                        start=start,
                        end=duration,
                        semibold=False,
                        box=False,
                        color="0xC9DDD4",
                    ),
                ]
            )

    filters.append("format=yuv420p")
    return f"[{input_index}:v]" + ",".join(filters) + f"[v{input_index // 2}]"


def build_filter_graph(manifest: dict, ffprobe: str) -> str:
    graph: list[str] = []
    concat_inputs: list[str] = []

    for index, segment in enumerate(manifest["segments"]):
        video_input = index * 2
        audio_input = video_input + 1
        frame_path = FRAMES_DIR / segment["frame"]
        source_size = image_size(ffprobe, frame_path)
        graph.append(video_chain(segment, video_input, source_size))
        graph.append(
            f"[{audio_input}:a]atrim=duration={float(segment['duration']):.3f},"
            f"asetpts=PTS-STARTPTS[a{index}]"
        )
        concat_inputs.append(f"[v{index}][a{index}]")

    graph.append(
        "".join(concat_inputs)
        + f"concat=n={len(manifest['segments'])}:v=1:a=1[vcat][acat]"
    )
    graph.append("[vcat]fps=30[vout]")
    graph.append("[acat]loudnorm=I=-16:TP=-1.5:LRA=7[aout]")
    return ";\n".join(graph) + "\n"


def main() -> None:
    ffmpeg = shutil.which("ffmpeg")
    ffprobe = shutil.which("ffprobe")
    if not ffmpeg or not ffprobe:
        raise SystemExit("ffmpeg and ffprobe must be available on PATH")
    for font in (FONT_REGULAR, FONT_SEMIBOLD):
        if not font.exists():
            raise SystemExit(f"Required font not found: {font}")

    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    RENDER_DIR.mkdir(parents=True, exist_ok=True)
    filter_path = RENDER_DIR / "filter-complex.txt"
    filter_path.write_text(build_filter_graph(manifest, ffprobe), encoding="utf-8")

    command = [ffmpeg, "-y", "-hide_banner", "-loglevel", "info"]
    for segment in manifest["segments"]:
        duration = f"{float(segment['duration']):.3f}"
        command.extend(
            [
                "-loop",
                "1",
                "-framerate",
                str(FPS),
                "-t",
                duration,
                "-i",
                str(FRAMES_DIR / segment["frame"]),
                "-i",
                str(ROOT / segment["audio"]),
            ]
        )

    command.extend(
        [
            "-filter_complex_script",
            str(filter_path),
            "-map",
            "[vout]",
            "-map",
            "[aout]",
            "-map_metadata",
            "-1",
            "-c:v",
            "libx264",
            "-preset",
            "medium",
            "-crf",
            "18",
            "-profile:v",
            "high",
            "-level",
            "4.1",
            "-pix_fmt",
            "yuv420p",
            "-r",
            str(FPS),
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            "-ar",
            "48000",
            "-ac",
            "1",
            "-movflags",
            "+faststart",
            "-shortest",
            str(OUTPUT_PATH),
        ]
    )

    print(f"Rendering {manifest['total_duration']:.2f}s demo...")
    subprocess.run(command, cwd=ROOT, check=True)
    print(f"Output: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
