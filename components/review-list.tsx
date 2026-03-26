import { Card, CardContent } from "@/components/ui/card"
import { Star, User } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Review {
  id: string
  username: string
  rating: number
  comment?: string
  content?: string
  created_at: string
}

interface ReviewListProps {
  reviews: Review[]
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <p className="text-lg font-medium text-muted-foreground">No reviews yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Be the first to share your experience with this property!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{review.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-0.5" aria-label={`${review.rating} out of 5 stars`}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= review.rating
                        ? "fill-primary text-primary"
                        : "text-muted-foreground/30"
                    }`}
                    aria-hidden
                  />
                ))}
              </div>
            </div>
            <p className="mt-4 text-foreground leading-relaxed">
              {review.comment ?? review.content ?? ""}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
