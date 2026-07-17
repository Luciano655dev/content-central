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
};

export type TwitterContent = {
  tweets: Tweet[];
};

export type InstagramSlide = {
  title: string;
  body: string;
  visual_tip: string;
};

export type InstagramContent = {
  caption: string;
  slides: InstagramSlide[];
};

export type Platform = "devto" | "tabnews" | "twitter" | "instagram";

export type PostStatus = Record<Platform, boolean>;

/** The JSON contract the daily agent POSTs to /api/ingest. */
export type ContentBundle = {
  date: string; // YYYY-MM-DD
  topic: string;
  topic_rationale: string;
  research_sources: ResearchSource[];
  devto: DevtoContent;
  tabnews: TabnewsContent;
  twitter: TwitterContent;
  instagram: InstagramContent;
  project_mentions: string[];
};

export type PostRow = ContentBundle & {
  id?: string;
  status: PostStatus;
  created_at?: string;
};

export type PostSummary = {
  date: string;
  topic: string;
  status: PostStatus;
};

export const EMPTY_STATUS: PostStatus = {
  devto: false,
  tabnews: false,
  twitter: false,
  instagram: false,
};

export const PLATFORMS: Platform[] = ["devto", "tabnews", "twitter", "instagram"];

export const PLATFORM_LABELS: Record<Platform, string> = {
  devto: "Dev.to",
  tabnews: "TabNews",
  twitter: "Twitter / X",
  instagram: "Instagram",
};
