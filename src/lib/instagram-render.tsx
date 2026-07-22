import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import type {
  InstagramDiagramItem,
  InstagramSlide,
  InstagramSlideVisual,
  PostRow,
} from "./types";
import { postgresUrl, readPostgresState } from "./postgres-state";

const WIDTH = 1080;
const HEIGHT = 1350;
const SAFE = 64;
const COLORS = {
  background: "#0A0A0A",
  panel: "#111111",
  panel2: "#141414",
  text: "#F3F3F0",
  secondary: "#9A9A95",
  muted: "#6F6F69",
  accent: "#C7F246",
  accentBright: "#D4FA5A",
  border: "#232323",
  line: "#3A3A36",
};

type FontWeight = 400 | 500 | 700 | 800;
type PosterFont = {
  name: string;
  data: ArrayBuffer;
  weight: FontWeight;
  style: "normal" | "italic";
};

let fontPromise: Promise<PosterFont[]> | null = null;

function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
}

function getPosterFonts() {
  if (!fontPromise) {
    const fontDir = path.join(process.cwd(), "assets", "fonts");
    fontPromise = Promise.all([
      readFile(path.join(fontDir, "Inter-Regular.ttf")),
      readFile(path.join(fontDir, "Inter-Medium.ttf")),
      readFile(path.join(fontDir, "Inter-Bold.ttf")),
      readFile(path.join(fontDir, "Inter-ExtraBold.ttf")),
      readFile(path.join(fontDir, "InstrumentSerif-Italic.ttf")),
      readFile(path.join(fontDir, "IBMPlexMono-Regular.ttf")),
      readFile(path.join(fontDir, "IBMPlexMono-Medium.ttf")),
    ]).then(([regular, medium, bold, extraBold, instrument, plexRegular, plexMedium]) => [
      { name: "Inter", data: toArrayBuffer(regular), weight: 400, style: "normal" },
      { name: "Inter", data: toArrayBuffer(medium), weight: 500, style: "normal" },
      { name: "Inter", data: toArrayBuffer(bold), weight: 700, style: "normal" },
      { name: "Inter", data: toArrayBuffer(extraBold), weight: 800, style: "normal" },
      { name: "Instrument Serif", data: toArrayBuffer(instrument), weight: 400, style: "italic" },
      { name: "IBM Plex Mono", data: toArrayBuffer(plexRegular), weight: 400, style: "normal" },
      { name: "IBM Plex Mono", data: toArrayBuffer(plexMedium), weight: 500, style: "normal" },
    ] as PosterFont[]);
  }
  return fontPromise;
}

export function instagramImageName(date: string, index: number): string {
  return `${date}-instagram-${String(index + 1).padStart(2, "0")}.png`;
}

function fallbackAccent(title: string): string {
  return title.trim().split(/\s+/).at(-1) ?? title;
}

function splitAccent(title: string, requested?: string): [string, string, string] {
  const accent = requested?.trim() || fallbackAccent(title);
  const start = title.toLocaleLowerCase().indexOf(accent.toLocaleLowerCase());
  if (start < 0) {
    const fallback = fallbackAccent(title);
    const fallbackStart = title.lastIndexOf(fallback);
    return [title.slice(0, fallbackStart), fallback, title.slice(fallbackStart + fallback.length)];
  }
  const afterAccent = title.slice(start + accent.length);
  const attachedPunctuation = afterAccent.match(/^[.!?,;:]+/)?.[0] ?? "";
  return [
    title.slice(0, start),
    title.slice(start, start + accent.length) + attachedPunctuation,
    afterAccent.slice(attachedPunctuation.length),
  ];
}

function MonoLabel({ children }: { children: string }) {
  return (
    <span
      style={{
        fontFamily: "IBM Plex Mono",
        fontSize: 20,
        fontWeight: 500,
        letterSpacing: "0.08em",
        color: COLORS.muted,
        textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  );
}

function Headline({
  slide,
  compact = false,
  cover = false,
}: {
  slide: InstagramSlide;
  compact?: boolean;
  cover?: boolean;
}) {
  const [before, accent, after] = splitAccent(slide.title, slide.accent_phrase);
  const visibleBefore = before.replace(/\s$/, "\u00A0");
  const visibleAfter = after.replace(/^\s/, "\u00A0");
  const base = slide.title.length <= 24 ? 134 : slide.title.length <= 40 ? 116 : 100;
  const fontSize = cover
    ? slide.title.length > 44
      ? 108
      : slide.title.length > 32
        ? 124
        : slide.title.length > 24
          ? 140
          : 164
    : compact
      ? slide.title.length > 44
        ? 76
        : slide.title.length > 32
          ? 88
          : Math.min(base, 108)
      : base;
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        width: "100%",
        fontFamily: "Inter",
        fontSize,
        fontWeight: 800,
        lineHeight: cover ? 0.88 : 0.92,
        letterSpacing: "-0.055em",
        color: COLORS.text,
      }}
    >
      {visibleBefore && <span>{visibleBefore}</span>}
      <span
        style={{
          fontFamily: "Instrument Serif",
          fontStyle: "italic",
          fontWeight: 400,
          letterSpacing: "-0.035em",
          color: COLORS.accent,
        }}
      >
        {accent}
      </span>
      {visibleAfter && <span>{visibleAfter}</span>}
    </div>
  );
}

function SupportingText({ slide, compact = false }: { slide: InstagramSlide; compact?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        maxWidth: compact ? 500 : 900,
        marginTop: compact ? 22 : 26,
        whiteSpace: "pre-wrap",
        fontFamily: "Inter",
        fontSize: compact ? 31 : slide.body.length > 150 ? 32 : 37,
        fontWeight: 400,
        lineHeight: 1.34,
        letterSpacing: "-0.018em",
        color: COLORS.secondary,
      }}
    >
      {slide.body}
    </div>
  );
}

function ItemText({ item, size = 24 }: { item: InstagramDiagramItem; size?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <span
        style={{
          fontFamily: "IBM Plex Mono",
          fontSize: size,
          fontWeight: 500,
          lineHeight: 1.2,
          color: item.accent ? COLORS.accent : COLORS.text,
        }}
      >
        {item.label}
      </span>
      {item.detail && (
        <span
          style={{
            marginTop: 8,
            fontFamily: "Inter",
            fontSize: Math.max(19, size - 3),
            lineHeight: 1.25,
            color: COLORS.muted,
          }}
        >
          {item.detail}
        </span>
      )}
    </div>
  );
}

function VisualLabel({ visual }: { visual: InstagramSlideVisual }) {
  if (!("label" in visual) || !visual.label) return null;
  return (
    <div style={{ display: "flex", marginBottom: 22 }}>
      <MonoLabel>{visual.label}</MonoLabel>
    </div>
  );
}

function CodeVisual({ visual }: { visual: Extract<InstagramSlideVisual, { type: "code" }> }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <VisualLabel visual={visual} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          padding: "38px 40px",
          borderLeft: `3px solid ${COLORS.accent}`,
          background: COLORS.panel,
        }}
      >
        {visual.lines.map((line, index) => {
          const highlighted = Boolean(visual.highlight && line.includes(visual.highlight));
          return (
            <span
              key={`${line}-${index}`}
              style={{
                marginTop: index ? 13 : 0,
                fontFamily: "IBM Plex Mono",
                fontSize: line.length > 40 ? 23 : 27,
                fontWeight: highlighted ? 500 : 400,
                lineHeight: 1.38,
                color: highlighted ? COLORS.accent : COLORS.text,
              }}
            >
              {line}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function TimelineVisual({ visual }: { visual: Extract<InstagramSlideVisual, { type: "timeline" }> }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <VisualLabel visual={visual} />
      <div style={{ display: "flex", position: "relative", width: "100%", minHeight: 260, paddingTop: 24 }}>
        <div
          style={{
            position: "absolute",
            top: 39,
            left: 10,
            right: 10,
            height: 2,
            background: COLORS.line,
          }}
        />
        {visual.items.map((item, index) => (
          <div
            key={`${item.label}-${index}`}
            style={{
              display: "flex",
              width: `${100 / visual.items.length}%`,
              flexDirection: "column",
              alignItems: index === 0 ? "flex-start" : index === visual.items.length - 1 ? "flex-end" : "center",
              paddingRight: index === visual.items.length - 1 ? 0 : 18,
            }}
          >
            <div
              style={{
                width: item.accent ? 30 : 18,
                height: item.accent ? 30 : 18,
                marginTop: item.accent ? 0 : 6,
                marginBottom: item.accent ? 28 : 34,
                border: `2px solid ${item.accent ? COLORS.accent : COLORS.line}`,
                borderRadius: 999,
                background: item.accent ? COLORS.accent : COLORS.background,
              }}
            />
            <ItemText item={item} size={22} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ComparisonVisual({ visual }: { visual: Extract<InstagramSlideVisual, { type: "comparison" }> }) {
  const accent = visual.accent ?? "right";
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <VisualLabel visual={visual} />
      <div style={{ display: "flex", width: "100%", minHeight: 300 }}>
        {(["left", "right"] as const).map((side, index) => (
          <div
            key={side}
            style={{
              display: "flex",
              flex: 1,
              alignItems: "flex-end",
              marginLeft: index ? 30 : 0,
              padding: "40px 34px",
              whiteSpace: "pre-wrap",
              borderLeft: `2px solid ${accent === side ? COLORS.accent : COLORS.border}`,
              background: accent === side ? COLORS.panel2 : "transparent",
              fontFamily: "IBM Plex Mono",
              fontSize: 29,
              fontWeight: 500,
              lineHeight: 1.35,
              color: accent === side ? COLORS.accent : COLORS.secondary,
            }}
          >
            {visual[side]}
          </div>
        ))}
      </div>
    </div>
  );
}

function FlowVisual({ visual }: { visual: Extract<InstagramSlideVisual, { type: "flow" }> }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <VisualLabel visual={visual} />
      <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
        {visual.items.map((item, index) => (
          <div key={`${item.label}-${index}`} style={{ display: "flex", flex: 1, alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                flex: 1,
                minHeight: 190,
                alignItems: "center",
                padding: "30px 24px",
                border: `1px solid ${item.accent ? COLORS.accent : COLORS.border}`,
                background: item.accent ? COLORS.panel2 : COLORS.panel,
              }}
            >
              <ItemText item={item} size={22} />
            </div>
            {index < visual.items.length - 1 && (
              <span style={{ padding: "0 9px", fontFamily: "IBM Plex Mono", fontSize: 28, color: COLORS.line }}>→</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CauseEffectVisual({ visual }: { visual: Extract<InstagramSlideVisual, { type: "cause_effect" }> }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <VisualLabel visual={visual} />
      <div style={{ display: "flex", alignItems: "center", width: "100%", minHeight: 290 }}>
        <div style={{ display: "flex", flex: 1, padding: 26, borderTop: `2px solid ${COLORS.line}` }}>
          <ItemText item={{ label: visual.source, detail: "SOURCE" }} size={22} />
        </div>
        <div
          style={{
            display: "flex",
            width: 230,
            minHeight: 220,
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            border: `2px solid ${COLORS.accent}`,
            transform: "rotate(-3deg)",
            background: COLORS.panel2,
            textAlign: "center",
          }}
        >
          <span style={{ fontFamily: "Instrument Serif", fontStyle: "italic", fontSize: 34, color: COLORS.accent }}>
            {visual.turning_point}
          </span>
        </div>
        <div style={{ display: "flex", flex: 1, padding: 26, borderBottom: `2px solid ${COLORS.accent}` }}>
          <ItemText item={{ label: visual.outcome, detail: "OUTCOME", accent: true }} size={22} />
        </div>
      </div>
    </div>
  );
}

function NumericVisual({ visual }: { visual: Extract<InstagramSlideVisual, { type: "numeric" }> }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <VisualLabel visual={visual} />
      <div style={{ display: "flex", alignItems: "flex-end", width: "100%" }}>
        <span
          style={{
            flexShrink: 0,
            fontFamily: "IBM Plex Mono",
          fontSize: visual.value.length > 12 ? 72 : visual.value.length > 7 ? 108 : 172,
            fontWeight: 500,
            lineHeight: 0.9,
            letterSpacing: "-0.07em",
            color: COLORS.accent,
          }}
        >
          {visual.value}
        </span>
        <div
          style={{
            display: "flex",
            flex: 1,
            minWidth: 0,
            flexDirection: "column",
            marginLeft: visual.value.length > 12 ? 30 : 42,
            paddingBottom: 10,
          }}
        >
          <span
            style={{
              fontFamily: "Inter",
              fontSize: visual.value.length > 12 ? 27 : 31,
              fontWeight: 500,
              lineHeight: 1.25,
              color: COLORS.text,
            }}
          >
            {visual.context}
          </span>
          {visual.comparison && (
            <span style={{ marginTop: 16, fontFamily: "IBM Plex Mono", fontSize: 19, color: COLORS.muted }}>
              {visual.comparison}
            </span>
          )}
        </div>
      </div>
      <div style={{ display: "flex", width: "100%", height: 3, marginTop: 38, background: COLORS.border }}>
        <div style={{ display: "flex", width: "64%", height: 3, background: COLORS.accent }} />
      </div>
    </div>
  );
}

function LayeredVisual({ visual }: { visual: Extract<InstagramSlideVisual, { type: "layered" }> }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <VisualLabel visual={visual} />
      {visual.layers.map((layer, index) => (
        <div
          key={`${layer.label}-${index}`}
          style={{
            display: "flex",
            width: `${100 - index * 6}%`,
            minHeight: 84,
            marginTop: index ? 10 : 0,
            marginLeft: `${index * 3}%`,
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 26px",
            border: `1px solid ${layer.accent ? COLORS.accent : COLORS.border}`,
            background: layer.accent ? COLORS.panel2 : index % 2 ? COLORS.panel : "transparent",
          }}
        >
          <ItemText item={layer} size={22} />
          <span style={{ fontFamily: "IBM Plex Mono", fontSize: 16, color: COLORS.muted }}>L{index + 1}</span>
        </div>
      ))}
    </div>
  );
}

function TransformationVisual({ visual }: { visual: Extract<InstagramSlideVisual, { type: "transformation" }> }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <VisualLabel visual={visual} />
      <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
        <div
          style={{
            display: "flex",
            flex: 1,
            minHeight: 225,
            alignItems: "center",
            padding: 28,
            border: `1px solid ${COLORS.border}`,
            fontFamily: "IBM Plex Mono",
            fontSize: 26,
            color: COLORS.secondary,
          }}
        >
          {visual.before}
        </div>
        <div style={{ display: "flex", width: 180, flexDirection: "column", alignItems: "center" }}>
          <span
            style={{
              maxWidth: 170,
              fontFamily: "Instrument Serif",
              fontStyle: "italic",
              fontSize: visual.action.length > 14 ? 22 : 29,
              lineHeight: 1.1,
              color: COLORS.accent,
              textAlign: "center",
              whiteSpace: "pre-wrap",
            }}
          >
            {visual.action}
          </span>
          <span style={{ marginTop: 11, fontFamily: "IBM Plex Mono", fontSize: 35, color: COLORS.accent }}>→</span>
        </div>
        <div
          style={{
            display: "flex",
            flex: 1,
            minHeight: 225,
            alignItems: "center",
            padding: 28,
            border: `2px solid ${COLORS.accent}`,
            background: COLORS.panel2,
            fontFamily: "IBM Plex Mono",
            fontSize: 26,
            color: COLORS.accent,
          }}
        >
          {visual.after}
        </div>
      </div>
    </div>
  );
}

function LoopVisual({ visual }: { visual: Extract<InstagramSlideVisual, { type: "loop" }> }) {
  const positions = [
    { left: "7%", top: 122 },
    { left: "38%", top: 16 },
    { right: "7%", top: 122 },
    { left: "38%", bottom: 4 },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <VisualLabel visual={visual} />
      <div style={{ display: "flex", position: "relative", width: "100%", height: 400 }}>
        <svg width="100%" height="400" viewBox="0 0 900 360">
          <path d="M 165 180 C 185 30, 715 30, 735 180 C 715 330, 185 330, 165 180" fill="none" stroke={COLORS.line} strokeWidth="3" />
          <path d="M 450 32 C 590 32, 700 78, 730 150" fill="none" stroke={COLORS.accent} strokeWidth="4" />
          <path d="M 718 133 L 731 151 L 739 129" fill="none" stroke={COLORS.accent} strokeWidth="4" />
        </svg>
        {visual.items.slice(0, 4).map((item, index) => (
          <div
            key={`${item.label}-${index}`}
            style={{
              display: "flex",
              position: "absolute",
              width: "24%",
              minHeight: 82,
              padding: "17px 18px",
              border: `1px solid ${item.accent ? COLORS.accent : COLORS.border}`,
              background: COLORS.background,
              ...positions[index],
            }}
          >
            <ItemText item={item} size={18} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SpatialVisual({ visual }: { visual: Extract<InstagramSlideVisual, { type: "spatial" }> }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <VisualLabel visual={visual} />
      <div style={{ display: "flex", alignItems: "stretch", width: "100%", minHeight: 330 }}>
        {visual.regions.map((region, index) => (
          <div
            key={`${region.label}-${index}`}
            style={{
              display: "flex",
              flex: index === 0 ? 1.25 : 1,
              flexDirection: "column",
              justifyContent: index % 2 ? "flex-end" : "flex-start",
              marginLeft: index ? 22 : 0,
              padding: `${26 + index * 8}px`,
              border: `1px ${index % 2 ? "dashed" : "solid"} ${region.accent ? COLORS.accent : COLORS.line}`,
              background: region.accent ? COLORS.panel2 : "transparent",
            }}
          >
            <ItemText item={region} size={23} />
          </div>
        ))}
      </div>
      {visual.relation && (
        <span style={{ marginTop: 18, fontFamily: "IBM Plex Mono", fontSize: 18, color: COLORS.muted }}>
          {visual.relation}
        </span>
      )}
    </div>
  );
}

function IllustrationVisual({ visual }: { visual: Extract<InstagramSlideVisual, { type: "illustration" }> }) {
  const nodeMap = new Map(visual.nodes.map((node) => [node.id, node]));
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <VisualLabel visual={visual} />
      <div style={{ display: "flex", position: "relative", width: "100%", height: 400 }}>
        <svg width="100%" height="400" viewBox="0 0 900 340">
          {visual.links.map((link, index) => {
            const from = nodeMap.get(link.from);
            const to = nodeMap.get(link.to);
            if (!from || !to) return null;
            return (
              <line
                key={`${link.from}-${link.to}-${index}`}
                x1={(from.x / 100) * 900}
                y1={(from.y / 100) * 340}
                x2={(to.x / 100) * 900}
                y2={(to.y / 100) * 340}
                stroke={link.accent ? COLORS.accent : COLORS.line}
                strokeWidth={link.accent ? 4 : 2}
              />
            );
          })}
        </svg>
        {visual.nodes.map((node) => (
          <div
            key={node.id}
            style={{
              display: "flex",
              position: "absolute",
              left: `${node.x}%`,
              top: `${node.y}%`,
              width: 180,
              minHeight: 84,
              transform: "translate(-50%, -50%)",
              alignItems: "center",
              justifyContent: "center",
              padding: 17,
              border: `2px solid ${node.accent ? COLORS.accent : COLORS.line}`,
              borderRadius: 999,
              background: COLORS.background,
              fontFamily: "IBM Plex Mono",
              fontSize: 18,
              fontWeight: 500,
              textAlign: "center",
              color: node.accent ? COLORS.accent : COLORS.text,
            }}
          >
            {node.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function Visual({ slide }: { slide: InstagramSlide }) {
  const visual = slide.visual;
  if (!visual || visual.type === "none") return null;
  switch (visual.type) {
    case "code":
      return <CodeVisual visual={visual} />;
    case "timeline":
      return <TimelineVisual visual={visual} />;
    case "comparison":
      return <ComparisonVisual visual={visual} />;
    case "flow":
      return <FlowVisual visual={visual} />;
    case "cause_effect":
      return <CauseEffectVisual visual={visual} />;
    case "numeric":
      return <NumericVisual visual={visual} />;
    case "layered":
      return <LayeredVisual visual={visual} />;
    case "transformation":
      return <TransformationVisual visual={visual} />;
    case "loop":
      return <LoopVisual visual={visual} />;
    case "spatial":
      return <SpatialVisual visual={visual} />;
    case "illustration":
      return <IllustrationVisual visual={visual} />;
  }
}

function CoverLayout({ slide, balanced }: { slide: InstagramSlide; balanced: boolean }) {
  const composition = slide.visual_plan?.composition ?? "centered";
  const split = composition === "split_left" || composition === "split_right";

  if (split) {
    const text = (
      <div
        style={{
          display: "flex",
          width: "64%",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Headline slide={slide} cover />
        <SupportingText slide={slide} compact />
      </div>
    );
    const visual = (
      <div
        style={{
          display: "flex",
          width: "32%",
          maxHeight: 620,
          alignItems: "center",
          alignSelf: "center",
          overflow: "hidden",
          opacity: 1,
        }}
      >
        <Visual slide={slide} />
      </div>
    );
    return (
      <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "space-between" }}>
        {composition === "split_left" ? text : visual}
        {composition === "split_left" ? visual : text}
      </div>
    );
  }

  if (composition === "visual_top") {
    return (
      <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center" }}>
        <div
          style={{
            display: "flex",
            width: "92%",
            maxHeight: 360,
            marginBottom: 36,
            alignSelf: "flex-end",
            overflow: "hidden",
            opacity: 1,
          }}
        >
          <Visual slide={slide} />
        </div>
        <Headline slide={slide} cover />
        <SupportingText slide={slide} />
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        justifyContent: balanced ? "center" : "space-between",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", paddingTop: balanced ? 0 : 32 }}>
        <Headline slide={slide} cover />
        <SupportingText slide={slide} />
      </div>
      <div
        style={{
          display: "flex",
          width: "100%",
          maxHeight: balanced ? 410 : 360,
          marginTop: balanced ? 40 : 0,
          alignSelf: "center",
          overflow: "hidden",
          opacity: 1,
        }}
      >
        <Visual slide={slide} />
      </div>
    </div>
  );
}

function FinalLayout({ slide, balanced, handle }: { slide: InstagramSlide; balanced: boolean; handle: string }) {
  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", paddingTop: 8 }}>
        <Headline slide={slide} compact />
        <SupportingText slide={slide} />
      </div>
      <div
        style={{
          display: "flex",
          flex: 1,
          minHeight: balanced ? 340 : 0,
          alignItems: "center",
          width: "100%",
          marginTop: balanced ? 20 : 0,
          padding: "16px 0",
        }}
      >
        <Visual slide={slide} />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginTop: balanced ? 18 : 0,
          paddingTop: 25,
          borderTop: `1px solid ${COLORS.border}`,
        }}
      >
        <span style={{ fontFamily: "Inter", fontSize: 24, color: COLORS.secondary }}>
          Save this for later.
        </span>
        <div style={{ display: "flex", marginTop: 11, fontFamily: "Inter", fontSize: 24, color: COLORS.secondary }}>
          <span style={{ marginRight: 7 }}>Follow</span>
          <span style={{ marginRight: 7, color: COLORS.accent }}>{handle}</span>
          <span>for more useful dev stuff</span>
        </div>
      </div>
    </div>
  );
}

function HybridTextPanel({
  slide,
  compact = false,
  fullWidth = false,
  cover = false,
}: {
  slide: InstagramSlide;
  compact?: boolean;
  fullWidth?: boolean;
  cover?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        padding: fullWidth ? "40px 44px 44px" : cover ? "38px 40px 42px" : "32px 34px 36px",
        borderTop: `1px solid ${COLORS.border}`,
        background: "rgba(10,10,10,0.88)",
      }}
    >
      <Headline slide={slide} compact={compact} cover={cover} />
      <SupportingText slide={slide} compact={compact} />
    </div>
  );
}

function HybridCoverLayout({ slide }: { slide: InstagramSlide }) {
  const composition = slide.visual_plan?.composition ?? "headline_top";
  const alignBottom =
    composition === "visual_top" || composition === "text_bottom" || composition.startsWith("split_");
  const alignRight = composition === "split_right";
  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        alignItems: alignBottom ? "flex-end" : "center",
        justifyContent: alignRight ? "flex-end" : "flex-start",
      }}
    >
      <div
        style={{
          display: "flex",
          width: composition === "text_bottom" ? "100%" : composition.startsWith("split_") ? "68%" : "92%",
        }}
      >
        <HybridTextPanel
          slide={slide}
          compact={composition.startsWith("split_")}
          fullWidth={composition === "text_bottom"}
          cover
        />
      </div>
    </div>
  );
}

function HybridMiddleLayout({ slide }: { slide: InstagramSlide }) {
  const composition = slide.visual_plan?.composition ?? "headline_top";
  const split = composition === "split_left" || composition === "split_right";
  const atBottom = composition === "visual_top" || composition === "text_bottom";
  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        alignItems: atBottom ? "flex-end" : "flex-start",
        justifyContent: composition === "split_right" ? "flex-end" : "flex-start",
        paddingTop: atBottom ? 0 : 8,
        paddingBottom: atBottom ? 10 : 0,
      }}
    >
      <div style={{ display: "flex", width: composition === "text_bottom" ? "100%" : split ? "56%" : "86%" }}>
        <HybridTextPanel slide={slide} compact fullWidth={composition === "text_bottom"} />
      </div>
    </div>
  );
}

function HybridFinalLayout({ slide, handle }: { slide: InstagramSlide; handle: string }) {
  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "92%",
          flexDirection: "column",
          padding: "20px 26px 32px 0",
          background: "rgba(10,10,10,0.88)",
        }}
      >
        <Headline slide={slide} compact />
        <SupportingText slide={slide} compact />
      </div>
      <div
        style={{
          display: "flex",
          width: "100%",
          flexDirection: "column",
          padding: "28px 0 4px",
          borderTop: `1px solid ${COLORS.border}`,
          background: "rgba(10,10,10,0.94)",
        }}
      >
        <span style={{ fontFamily: "Inter", fontSize: 24, color: COLORS.secondary }}>
          Save this for later.
        </span>
        <div style={{ display: "flex", marginTop: 11, fontFamily: "Inter", fontSize: 24, color: COLORS.secondary }}>
          <span style={{ marginRight: 7 }}>Follow</span>
          <span style={{ marginRight: 7, color: COLORS.accent }}>{handle}</span>
          <span>for more useful dev stuff</span>
        </div>
      </div>
    </div>
  );
}

function GeneratedVisualLayer({ source }: { source: string | null }) {
  if (!source) return null;
  return (
    <div
      style={{
        display: "flex",
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: COLORS.background,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders remote Blob assets. */}
      <img
        src={source}
        alt=""
        width={WIDTH}
        height={HEIGHT}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      <div
        style={{
          display: "flex",
          position: "absolute",
          inset: 0,
          background: "rgba(10,10,10,0.12)",
        }}
      />
    </div>
  );
}

type StoredGeneratedVisual = {
  contentType: string;
  data: string;
};

async function generatedVisualSource(slide: InstagramSlide): Promise<string | null> {
  if (slide.generated_visual_url) return slide.generated_visual_url;
  if (!slide.generated_visual_key || !postgresUrl()) return null;
  const stored = await readPostgresState<StoredGeneratedVisual>(slide.generated_visual_key);
  if (!stored?.contentType || !stored.data) return null;
  return `data:${stored.contentType};base64,${stored.data}`;
}

function MiddleLayout({ slide, balanced }: { slide: InstagramSlide; balanced: boolean }) {
  const composition = slide.visual_plan?.composition ?? "headline_top";
  const split = composition === "split_left" || composition === "split_right";
  if (split) {
    const text = (
      <div style={{ display: "flex", width: "48%", flexDirection: "column", justifyContent: "center" }}>
        <Headline slide={slide} compact />
        <SupportingText slide={slide} compact />
      </div>
    );
    const visual = (
      <div style={{ display: "flex", width: "49%", alignItems: "center" }}>
        <Visual slide={slide} />
      </div>
    );
    return (
      <div style={{ display: "flex", flex: 1, alignItems: "stretch", justifyContent: "space-between" }}>
        {composition === "split_left" ? text : visual}
        {composition === "split_left" ? visual : text}
      </div>
    );
  }

  if (composition === "visual_top") {
    return (
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            minHeight: balanced ? 420 : 470,
            marginBottom: balanced ? 38 : 0,
            alignItems: "center",
          }}
        ><Visual slide={slide} /></div>
        <div style={{ display: "flex", flexDirection: "column", paddingBottom: 18 }}>
          <Headline slide={slide} compact />
          <SupportingText slide={slide} />
        </div>
      </div>
    );
  }

  if (composition === "centered") {
    return (
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", width: "100%", alignSelf: "center", marginBottom: 42 }}><Visual slide={slide} /></div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Headline slide={slide} compact />
          <SupportingText slide={slide} />
        </div>
      </div>
    );
  }

  if (composition === "visual_dominant") {
    return (
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: balanced ? "center" : "flex-start",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Headline slide={slide} compact />
          <SupportingText slide={slide} />
        </div>
        <div
          style={{
            display: "flex",
            flex: balanced ? 0 : 1,
            minHeight: balanced ? 410 : 0,
            alignItems: "center",
            marginTop: balanced ? 32 : 24,
          }}
        ><Visual slide={slide} /></div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", paddingTop: 8 }}>
        <Headline slide={slide} compact />
        <SupportingText slide={slide} />
      </div>
      <div
        style={{
          display: "flex",
          width: "100%",
          minHeight: balanced ? 410 : 360,
          marginTop: balanced ? 30 : 0,
          alignItems: "center",
          paddingBottom: 16,
        }}
      >
        <Visual slide={slide} />
      </div>
    </div>
  );
}

export async function renderInstagramSlide(
  post: Pick<PostRow, "date" | "topic" | "instagram">,
  index: number,
  download = false
): Promise<ImageResponse> {
  const slide = post.instagram.slides[index];
  if (!slide) throw new Error("Instagram slide not found");
  const fonts = await getPosterFonts();
  const isFirst = index === 0;
  const isLast = index === post.instagram.slides.length - 1;
  const balanced = post.instagram.layout_style === "balanced";
  const handle = post.instagram.cta_handle ?? "@LucianoMenezes";
  const generatedSource = await generatedVisualSource(slide);
  const hybrid = Boolean(generatedSource);

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: COLORS.background,
        color: COLORS.text,
      }}
    >
      <GeneratedVisualLayer source={generatedSource} />
      <div
        style={{
          display: "flex",
          position: "relative",
          flex: 1,
          flexDirection: "column",
          padding: SAFE,
        }}
      >
        {isFirst && hybrid ? (
          <HybridCoverLayout slide={slide} />
        ) : isFirst ? (
          <CoverLayout slide={slide} balanced={balanced} />
        ) : isLast && hybrid ? (
          <HybridFinalLayout slide={slide} handle={handle} />
        ) : isLast ? (
          <FinalLayout slide={slide} balanced={balanced} handle={handle} />
        ) : hybrid ? (
          <HybridMiddleLayout slide={slide} />
        ) : (
          <MiddleLayout slide={slide} balanced={balanced} />
        )}
      </div>
    </div>,
    {
      width: WIDTH,
      height: HEIGHT,
      fonts,
      headers: {
        "Cache-Control": "private, no-store, max-age=0, must-revalidate",
        "CDN-Cache-Control": "no-store",
        "Vercel-CDN-Cache-Control": "no-store",
        ...(download
          ? { "Content-Disposition": `attachment; filename="${instagramImageName(post.date, index)}"` }
          : {}),
      },
    }
  );
}
