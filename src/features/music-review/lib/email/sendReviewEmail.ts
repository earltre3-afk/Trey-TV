import { supabase } from "@/lib/supabase";

export async function sendReviewEmail(opts: {
  reviewId: string;
  submissionId: string;
  userId: string;
  recipientEmail: string;
  songTitle: string;
  artistName: string;
  overallScore: number;
  categories: Record<string, number>;
  summary: string;
}) {
  const { data, error } = await supabase.functions.invoke("music-review-send-email", {
    body: {
      reviewId: opts.reviewId,
      songTitle: opts.songTitle,
      artistName: opts.artistName,
      overallScore: opts.overallScore,
      categories: opts.categories,
      summary: opts.summary,
      recipientEmail: opts.recipientEmail,
    },
  });

  // Log the attempt
  await supabase.from("music_review_email_logs").insert({
    user_id: opts.userId,
    submission_id: opts.submissionId,
    review_score_id: opts.reviewId,
    recipient_email: opts.recipientEmail,
    provider: "resend",
    status: data?.provider_status || (error ? "failed" : "preview_only"),
    provider_message_id: data?.provider_message_id || null,
    sent_at: new Date().toISOString(),
    error_message: data?.error || error?.message || null,
  });

  return { html: data?.html as string | undefined, status: data?.provider_status as string };
}
