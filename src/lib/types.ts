export type ResearchSource = {
  title: string;
  url: string;
};

export type DevtoContent = {
  title: string;
  tags: string[];
  body_markdown: string;
};

export type TabnewsContent = {
  title: string;
  body_markdown: string;
};

export type Tweet = {
  text: string;
  image_tip?: string;
  /** 1-based Instagram slide to reuse with this tweet. Omit when no slide is a good match. */
  image_slide?: number;
};

export type TwitterContent = {
  tweets: Tweet[];
};

export type InstagramSlide = {
  title: string;
  body: string;
  visual_tip: string;
  /** Public AI-generated visual layer. Exact slide text is rendered separately on top. */
  generated_visual_url?: string;
  /** Key for an optimized visual layer stored separately from the post bundle. */
  generated_visual_key?: string;
  /** Local workspace path used by the trusted runner before it uploads the asset to Blob. */
  generated_visual_path?: string;
  /** Short description of the generated visual for asset review and debugging. */
  generated_visual_alt?: string;
  /** Exact word or short phrase from the title rendered in lime serif italic. */
  accent_phrase?: string;
  /** Structured visual that the deterministic poster renderer can draw accurately. */
  visual?: InstagramSlideVisual;
  /** Private art-direction plan. It is consumed by the renderer, not printed on the slide. */
  visual_plan?: InstagramVisualPlan;
};

export type InstagramComposition =
  | "headline_top"
  | "visual_top"
  | "text_bottom"
  | "split_left"
  | "split_right"
  | "centered"
  | "visual_dominant";

export type InstagramVisualPlan = {
  core_message: string;
  relationship: string;
  grammar: InstagramSlideVisual["type"];
  focal_point: string;
  secondary_information: string;
  accent_location: string;
  composition: InstagramComposition;
};

export type InstagramDiagramItem = {
  label: string;
  detail?: string;
  accent?: boolean;
};

export type InstagramSlideVisual =
  | { type: "none" }
  | { type: "code"; label?: string; lines: string[]; highlight?: string }
  | { type: "timeline"; label?: string; items: InstagramDiagramItem[] }
  | { type: "comparison"; label?: string; left: string; right: string; accent?: "left" | "right" }
  | { type: "flow"; label?: string; items: InstagramDiagramItem[] }
  | { type: "cause_effect"; label?: string; source: string; turning_point: string; outcome: string }
  | { type: "numeric"; label?: string; value: string; context: string; comparison?: string }
  | { type: "layered"; label?: string; layers: InstagramDiagramItem[] }
  | { type: "transformation"; label?: string; before: string; action: string; after: string }
  | { type: "loop"; label?: string; items: InstagramDiagramItem[] }
  | { type: "spatial"; label?: string; regions: InstagramDiagramItem[]; relation?: string }
  | {
      type: "illustration";
      label?: string;
      nodes: Array<InstagramDiagramItem & { id: string; x: number; y: number }>;
      links: Array<{ from: string; to: string; accent?: boolean }>;
    };

export type InstagramContent = {
  caption: string;
  slides: InstagramSlide[];
  /** Changes whenever a carousel is regenerated so browsers cannot reuse old PNG URLs. */
  render_revision?: string;
  /** Enables the compact, centralized composition system from the current brand prompt. */
  layout_style?: "balanced";
  /** Handle used only on the final carousel CTA. */
  cta_handle?: string;
};

export type Platform = "devto" | "tabnews" | "twitter" | "instagram";

export type ContentSession = "articles" | "social";

export type PostStatus = Record<Platform, boolean>;

/** The JSON contract the daily agent POSTs to /api/ingest. */
export type ContentBundle = {
  date: string; // YYYY-MM-DD
  /** Technical long-form topic shared by Dev.to and TabNews. */
  topic: string;
  topic_rationale: string;
  research_sources: ResearchSource[];
  /** Independent quick, useful topic shared by Twitter and Instagram. */
  social_topic: string;
  social_topic_rationale: string;
  social_research_sources: ResearchSource[];
  devto: DevtoContent;
  tabnews: TabnewsContent;
  twitter: TwitterContent;
  instagram: InstagramContent;
  project_mentions: string[];
};

export type PostRow = ContentBundle & {
  id: string;
  status: PostStatus;
  created_at?: string;
};

export type PostSummary = {
  id: string;
  date: string;
  topic: string;
  social_topic: string;
  status: PostStatus;
  created_at?: string;
};

export const EMPTY_STATUS: PostStatus = {
  devto: false,
  tabnews: false,
  twitter: false,
  instagram: false,
};

export const PLATFORMS: Platform[] = ["devto", "tabnews", "twitter", "instagram"];

export const CONTENT_SESSIONS: ContentSession[] = ["articles", "social"];

export const SESSION_PLATFORMS: Record<ContentSession, Platform[]> = {
  articles: ["devto", "tabnews"],
  social: ["twitter", "instagram"],
};

export const SESSION_LABELS: Record<ContentSession, string> = {
  articles: "Articles",
  social: "Social",
};

export const PLATFORM_LABELS: Record<Platform, string> = {
  devto: "Dev.to",
  tabnews: "TabNews",
  twitter: "Twitter / X",
  instagram: "Instagram",
};

/** Keeps older bundles useful: a legacy image_tip means the same-position carousel slide was intended. */
export function tweetImageSlide(tweet: Tweet, tweetIndex: number, slideCount: number): number | undefined {
  if (tweet.image_slide && tweet.image_slide >= 1 && tweet.image_slide <= slideCount) {
    return tweet.image_slide;
  }
  const samePosition = tweetIndex + 1;
  return tweet.image_tip && samePosition <= slideCount ? samePosition : undefined;
}
