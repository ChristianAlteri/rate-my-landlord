"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Star, Shield, Send } from "lucide-react"
import { submitReview } from "@/app/actions/submit"
import { countWords, MAX_COMMENT_CHARS, MAX_REVIEW_WORDS } from "@/lib/review-validation"

interface ReviewFormProps {
  propertyId: string
}

export function ReviewForm({ propertyId }: ReviewFormProps) {
  const [username, setUsername] = useState("")
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const displayRating = hoverRating || rating
  const wordCount = countWords(comment)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!username.trim()) {
      setError("Please enter a display name")
      return
    }
    if (rating === 0) {
      setError("Please select a rating")
      return
    }
    const commentTrimmed = comment.trim()
    if (!commentTrimmed) {
      setError("Please write a review")
      return
    }
    if (commentTrimmed.length > MAX_COMMENT_CHARS) {
      setError("Review is too long.")
      return
    }
    if (countWords(commentTrimmed) > MAX_REVIEW_WORDS) {
      setError(`Reviews are limited to ${MAX_REVIEW_WORDS} words.`)
      return
    }

    setIsSubmitting(true)

    try {
      const result = await submitReview({
        property_id: propertyId,
        username: username.trim(),
        rating,
        comment: commentTrimmed,
      })
      if (!result.ok) {
        setError(result.error)
        return
      }

      setSuccess(true)
      setUsername("")
      setRating(0)
      setComment("")
      router.refresh()

      setTimeout(() => setSuccess(false), 4000)
    } catch (err) {
      console.error("Error submitting review:", err)
      setError("Failed to submit review. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle id="review-form-title" className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          Leave a review
        </CardTitle>
        <CardDescription>
          Pick a name, a star rating, and a short write-up. No account required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" aria-labelledby="review-form-title" noValidate>
          <div className="space-y-2">
            <Label htmlFor="review-username">Display name</Label>
            <Input
              id="review-username"
              name="username"
              autoComplete="nickname"
              placeholder="e.g. North London renter"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={50}
              aria-invalid={!!error && !username.trim()}
            />
          </div>

          <fieldset className="space-y-2 border-0 p-0">
            <legend className="mb-2 text-sm font-medium text-foreground">Rating</legend>
            <div className="flex flex-wrap gap-1" onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map((star) => (
                <label
                  key={star}
                  className="cursor-pointer rounded-md p-1.5 focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                >
                  <input
                    type="radio"
                    name="rating"
                    value={String(star)}
                    checked={rating === star}
                    onChange={() => setRating(star)}
                    className="sr-only"
                    aria-label={`${star} star${star === 1 ? "" : "s"}`}
                  />
                  <span
                    className="block"
                    onMouseEnter={() => setHoverRating(star)}
                    onFocus={() => setHoverRating(star)}
                    onBlur={() => setHoverRating(0)}
                  >
                    <Star
                      className={`h-9 w-9 transition-colors ${
                        star <= displayRating ? "fill-primary text-primary" : "text-muted-foreground/35"
                      }`}
                      aria-hidden
                    />
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor="review-comment">Your review</Label>
            <Textarea
              id="review-comment"
              name="comment"
              placeholder="What was it like renting here?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={6}
              maxLength={MAX_COMMENT_CHARS}
              aria-invalid={!!error && !comment.trim()}
            />
            <p className="text-right text-xs text-muted-foreground">
              {wordCount}/{MAX_REVIEW_WORDS} words
            </p>
          </div>

          {error && (
            <p id="review-form-error" role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          {success && (
            <p role="status" aria-live="polite" className="text-sm text-foreground">
              Thanks — your review was posted.
            </p>
          )}

          <Button type="submit" className="h-11 min-h-11 w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              "Submitting…"
            ) : (
              <>
                <Send className="h-4 w-4" aria-hidden />
                Submit review
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Only your display name is shown with the review.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
