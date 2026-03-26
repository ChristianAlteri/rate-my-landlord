/** Review body limits — enforced on client and server */

export const MAX_REVIEW_WORDS = 2000

/** Hard cap on characters to keep payloads bounded (2000 words × very long tokens). */
export const MAX_COMMENT_CHARS = 200_000

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function validateReviewComment(text: string): { ok: true } | { ok: false; error: string } {
  const t = text.trim()
  if (!t) {
    return { ok: false, error: "Please write a review." }
  }
  if (t.length > MAX_COMMENT_CHARS) {
    return { ok: false, error: "Review is too long." }
  }
  const words = countWords(t)
  if (words > MAX_REVIEW_WORDS) {
    return { ok: false, error: `Reviews are limited to ${MAX_REVIEW_WORDS} words.` }
  }
  return { ok: true }
}
