import type { ContentBundle } from "./types";

type Result = { ok: true; bundle: ContentBundle } | { ok: false; error: string };

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
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

  const instagram = b.instagram as Record<string, unknown> | undefined;
  const slides = Array.isArray(instagram?.slides) ? instagram.slides : null;
  if (
    !slides ||
    slides.length < 3 ||
    !slides.every((s) => isNonEmptyString(s?.title) && isNonEmptyString(s?.body))
  ) {
    return { ok: false, error: "instagram.slides must have at least 3 slides with title and body" };
  }

  const sources = Array.isArray(b.research_sources) ? b.research_sources : [];

  return {
    ok: true,
    bundle: {
      date: b.date,
      topic: b.topic.trim(),
      topic_rationale: isNonEmptyString(b.topic_rationale) ? b.topic_rationale : "",
      research_sources: sources
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
        })),
      },
      instagram: {
        caption: isNonEmptyString(instagram?.caption) ? (instagram!.caption as string) : "",
        slides: slides.map((s) => ({
          title: s.title as string,
          body: s.body as string,
          visual_tip: isNonEmptyString(s.visual_tip) ? (s.visual_tip as string) : "",
        })),
      },
      project_mentions: Array.isArray(b.project_mentions)
        ? b.project_mentions.filter(isNonEmptyString)
        : [],
    },
  };
}
