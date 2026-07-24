import type { ContentBundle, InstagramSlideVisual, InstagramVisualPlan } from "./types";

type Result = { ok: true; bundle: ContentBundle } | { ok: false; error: string };

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function wordCount(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

/** Validates an incoming ingest payload and strips unknown fields. */
export function validateBundle(input: unknown): Result {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "Body must be a JSON object" };
  }
  const b = input as Record<string, unknown>;

  if (!isNonEmptyString(b.date) || !/^\d{4}-\d{2}-\d{2}$/.test(b.date)) {
    return { ok: false, error: "date must be YYYY-MM-DD" };
  }
  if (!isNonEmptyString(b.topic)) return { ok: false, error: "topic is required" };
  const socialTopic = isNonEmptyString(b.social_topic) ? b.social_topic : b.topic;

  const devto = b.devto as Record<string, unknown> | undefined;
  if (!devto || !isNonEmptyString(devto.title) || !isNonEmptyString(devto.body_markdown)) {
    return { ok: false, error: "devto.title and devto.body_markdown are required" };
  }
  const tabnews = b.tabnews as Record<string, unknown> | undefined;
  if (!tabnews || !isNonEmptyString(tabnews.title) || !isNonEmptyString(tabnews.body_markdown)) {
    return { ok: false, error: "tabnews.title and tabnews.body_markdown are required" };
  }

  const twitter = b.twitter as Record<string, unknown> | undefined;
  const tweets = Array.isArray(twitter?.tweets) ? twitter.tweets : null;
  if (!tweets || tweets.length < 3 || !tweets.every((t) => isNonEmptyString(t?.text))) {
    return { ok: false, error: "twitter.tweets must have at least 3 tweets with text" };
  }
  if (!tweets.every((tweet) => String(tweet.text).length <= 280)) {
    return { ok: false, error: "every twitter tweet must be at most 280 characters" };
  }
  if (!tweets.every((tweet) => String(tweet.text).trim().length >= 50)) {
    return {
      ok: false,
      error: "every twitter tweet must contain at least 50 characters of useful standalone context",
    };
  }

  const instagram = b.instagram as Record<string, unknown> | undefined;
  const slides = Array.isArray(instagram?.slides) ? instagram.slides : null;
  if (
    !slides ||
    slides.length < 3 ||
    !slides.every((s) => isNonEmptyString(s?.title) && isNonEmptyString(s?.body))
  ) {
    return { ok: false, error: "instagram.slides must have at least 3 slides with title and body" };
  }
  if (!isNonEmptyString(instagram?.caption)) {
    return { ok: false, error: "instagram.caption is required" };
  }
  const middleSlides = slides.slice(1, -1);
  if (!middleSlides.every((slide) => wordCount(String(slide.body)) >= 8)) {
    return {
      ok: false,
      error: "every middle Instagram slide body must contain at least 8 useful words",
    };
  }
  if (!middleSlides.every((slide) => wordCount(String(slide.body)) <= 45)) {
    return {
      ok: false,
      error: "every middle Instagram slide body must contain at most 45 words",
    };
  }
  if (
    !slides.every(
      (s) =>
        isNonEmptyString(s?.accent_phrase) &&
        String(s.title).toLocaleLowerCase().includes(String(s.accent_phrase).toLocaleLowerCase())
    )
  ) {
    return { ok: false, error: "every instagram accent_phrase must appear in its slide title" };
  }
  if (!slides.every((s) => isValidSlideVisual(s?.visual))) {
    return { ok: false, error: "every instagram slide needs a valid structured visual" };
  }
  if (!slides.every((s) => isValidVisualPlan(s?.visual_plan, s?.visual))) {
    return { ok: false, error: "every instagram slide needs a complete visual_plan matching its visual grammar" };
  }
  if (
    !tweets.every(
      (tweet) =>
        tweet?.image_slide === undefined ||
        (Number.isInteger(tweet.image_slide) && tweet.image_slide >= 1 && tweet.image_slide <= slides.length)
    )
  ) {
    return { ok: false, error: "twitter image_slide must reference an existing Instagram slide" };
  }

  const sources = Array.isArray(b.research_sources) ? b.research_sources : [];
  const socialSources = Array.isArray(b.social_research_sources)
    ? b.social_research_sources
    : sources;

  return {
    ok: true,
    bundle: {
      date: b.date,
      topic: b.topic.trim(),
      topic_rationale: isNonEmptyString(b.topic_rationale) ? b.topic_rationale : "",
      research_sources: sources
        .filter((s) => isNonEmptyString(s?.title) && isNonEmptyString(s?.url))
        .map((s) => ({ title: s.title, url: s.url })),
      social_topic: socialTopic.trim(),
      social_topic_rationale: isNonEmptyString(b.social_topic_rationale)
        ? b.social_topic_rationale
        : isNonEmptyString(b.topic_rationale)
          ? b.topic_rationale
          : "",
      social_research_sources: socialSources
        .filter((s) => isNonEmptyString(s?.title) && isNonEmptyString(s?.url))
        .map((s) => ({ title: s.title, url: s.url })),
      devto: {
        title: devto.title as string,
        tags: Array.isArray(devto.tags) ? devto.tags.filter(isNonEmptyString).slice(0, 4) : [],
        body_markdown: devto.body_markdown as string,
      },
      tabnews: {
        title: tabnews.title as string,
        body_markdown: tabnews.body_markdown as string,
      },
      twitter: {
        tweets: tweets.map((t) => ({
          text: t.text as string,
          ...(isNonEmptyString(t.image_tip) ? { image_tip: t.image_tip as string } : {}),
          ...(Number.isInteger(t.image_slide) && Number(t.image_slide) > 0
            ? { image_slide: Number(t.image_slide) }
            : {}),
        })),
      },
      instagram: {
        caption: instagram.caption as string,
        ...(isNonEmptyString(instagram.render_revision)
          ? { render_revision: instagram.render_revision as string }
          : {}),
        ...(instagram.layout_style === "balanced" ? { layout_style: "balanced" as const } : {}),
        ...(isNonEmptyString(instagram.cta_handle)
          ? { cta_handle: instagram.cta_handle as string }
          : {}),
        slides: slides.map((s) => ({
          title: s.title as string,
          body: s.body as string,
          visual_tip: isNonEmptyString(s.visual_tip) ? (s.visual_tip as string) : "",
          ...(isNonEmptyString(s.generated_visual_url)
            ? { generated_visual_url: s.generated_visual_url as string }
            : {}),
          ...(isNonEmptyString(s.generated_visual_key)
            ? { generated_visual_key: s.generated_visual_key as string }
            : {}),
          ...(isNonEmptyString(s.generated_visual_path)
            ? { generated_visual_path: s.generated_visual_path as string }
            : {}),
          ...(isNonEmptyString(s.generated_visual_alt)
            ? { generated_visual_alt: s.generated_visual_alt as string }
            : {}),
          ...(isNonEmptyString(s.accent_phrase)
            ? { accent_phrase: s.accent_phrase as string }
            : {}),
          ...(isValidSlideVisual(s.visual) ? { visual: s.visual } : {}),
          ...(isValidVisualPlan(s.visual_plan, s.visual)
            ? { visual_plan: s.visual_plan as InstagramVisualPlan }
            : {}),
        })),
      },
      project_mentions: Array.isArray(b.project_mentions)
        ? b.project_mentions.filter(isNonEmptyString)
        : [],
    },
  };
}

function isValidSlideVisual(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const visual = value as Record<string, unknown>;
  if (visual.type === "code") {
    return Array.isArray(visual.lines) && visual.lines.length > 0 && visual.lines.every(isNonEmptyString);
  }
  if (visual.type === "timeline" || visual.type === "flow" || visual.type === "loop") {
    return isDiagramItemArray(visual.items, 2);
  }
  if (visual.type === "comparison") {
    return isNonEmptyString(visual.left) && isNonEmptyString(visual.right);
  }
  if (visual.type === "cause_effect") {
    return (
      isNonEmptyString(visual.source) &&
      isNonEmptyString(visual.turning_point) &&
      isNonEmptyString(visual.outcome)
    );
  }
  if (visual.type === "numeric") {
    return isNonEmptyString(visual.value) && isNonEmptyString(visual.context);
  }
  if (visual.type === "layered") {
    return isDiagramItemArray(visual.layers, 2);
  }
  if (visual.type === "transformation") {
    return isNonEmptyString(visual.before) && isNonEmptyString(visual.action) && isNonEmptyString(visual.after);
  }
  if (visual.type === "spatial") {
    return isDiagramItemArray(visual.regions, 2);
  }
  if (visual.type === "illustration") {
    const nodes = Array.isArray(visual.nodes) ? visual.nodes : [];
    const links = Array.isArray(visual.links) ? visual.links : [];
    return (
      nodes.length >= 2 &&
      nodes.every(
        (node) =>
          isDiagramItem(node) &&
          isNonEmptyString(node.id) &&
          typeof node.x === "number" &&
          node.x >= 0 &&
          node.x <= 100 &&
          typeof node.y === "number" &&
          node.y >= 0 &&
          node.y <= 100
      ) &&
      links.length >= 1 &&
      links.every((link) => isNonEmptyString(link?.from) && isNonEmptyString(link?.to))
    );
  }
  return false;
}

function isDiagramItem(value: unknown): value is Record<string, unknown> & { label: string } {
  return Boolean(value && typeof value === "object" && isNonEmptyString((value as Record<string, unknown>).label));
}

function isDiagramItemArray(value: unknown, minimum: number): boolean {
  return Array.isArray(value) && value.length >= minimum && value.every(isDiagramItem);
}

const COMPOSITIONS = new Set([
  "headline_top",
  "visual_top",
  "text_bottom",
  "split_left",
  "split_right",
  "centered",
  "visual_dominant",
]);

function isValidVisualPlan(value: unknown, visual: unknown): boolean {
  if (!value || typeof value !== "object" || !visual || typeof visual !== "object") return false;
  const plan = value as Record<string, unknown>;
  const grammar = (visual as InstagramSlideVisual).type;
  return (
    isNonEmptyString(plan.core_message) &&
    isNonEmptyString(plan.relationship) &&
    plan.grammar === grammar &&
    isNonEmptyString(plan.focal_point) &&
    isNonEmptyString(plan.secondary_information) &&
    isNonEmptyString(plan.accent_location) &&
    typeof plan.composition === "string" &&
    COMPOSITIONS.has(plan.composition)
  );
}
