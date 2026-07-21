# Twitter/X Thread Guide (English)

The hook tweet determines ~90% of thread performance. Top creators draft 10+ hooks and pick one. Tone here is DIFFERENT from the articles: **aggressive, imponent, confident**. You state things; you don't suggest them. No hedging, no "I think", no "maybe". You are the dev who has seen it all and is doing the reader a favor.

## Hook tweet (tweet 1)

- Front-load the payoff in the first 8 words — that's all that shows in the feed preview
- Open with a direct accusation, correction, warning, or command that makes the reader feel an immediate need to change something: **“YOU’RE DOING X WRONG,” “STOP DOING X,” “YOU NEED TO CHANGE X,”** or an equally forceful topic-specific line
- The first line should usually be a standalone 3–8 word punch. ALL CAPS is allowed for that one short line when it increases urgency; do not write the rest of the tweet in all caps
- Be incisive, not generic. Name the exact practice, API, failure, or decision in the opening line; “YOU’RE DOING THIS WRONG” is weaker than “YOU’RE MEASURING REQUEST TIME WRONG”
- Prove the confrontation immediately with a concrete consequence, number, code fragment, or failure. Never use outrage without evidence
- Formulas (rotate; never two days in a row with the same one):
  - Threat + promise: "Your API has a bug that will double-charge a customer. You just haven't hit it yet."
  - Stop/Start: "Stop writing tests that test nothing. Do this instead."
  - Number + authority: "I read 200 postmortems. 80% died from the same 3 mistakes."
  - Identity bait: "Senior devs don't debug faster. They debug differently."
- End tweet 1 with the thread signal: "🧵" or "(thread)"
- NEVER waste tweet 1 on context. Context is tweet 2's job.

## Body tweets

- **One idea per tweet.** If a tweet needs two sentences of setup, split it
- Every tweet's FIRST line is a sub-hook — assume it's read in isolation
- Use line breaks and arrows (→) for rhythm; walls of text die
- Concrete > abstract in every single tweet: numbers, code, named tools
- Give the idea enough room to become useful: body tweets should normally land around **150–260 characters**. Treat **110–280** as a flexible editorial band when code, a sharp hook, or a compact example needs a different shape
- A body tweet must explain at least one of: **how the mechanism works, why it fails, what the evidence shows, or what the reader should do**. Naming a concept and calling it important is not a tweet
- Prefer 2–4 short lines or paragraphs. Use the available characters for one precise explanation, not several shallow claims
- Run the standalone test: if the tweet is separated from the thread, it should still teach a concrete fact, condition, API choice, number, or decision rule
- ≤ 280 chars per tweet, always
- 5–8 tweets total. Every tweet must earn the next swipe

## Images: reuse the Instagram carousel

Twitter never gets separately generated images. Reuse only a genuinely matching Instagram poster by adding a 1-based `image_slide` to that tweet. Usually tweet 1 reuses slide 1; add at most 1–3 other matching slides across the thread.

- The chosen slide must make sense beside that exact tweet without extra explanation.
- If no Instagram slide matches, omit `image_slide`. This is better than forcing a weak image.
- A relevant primary-source URL may stay in the tweet text when it fits naturally, but do not add a link merely to fill the image slot.
- Keep `image_tip` only as optional editorial context for old consumers; the dashboard and quick poster use `image_slide`.

## Closing tweet

Three jobs, one line each: (1) the one-sentence takeaway, restated with force; (2) identity-signal statement the reader wants to retweet to look smart; (3) CTA — "Follow @Luciano655dev for daily deep dives like this" (growth) or a question (engagement). Alternate CTAs across days.
