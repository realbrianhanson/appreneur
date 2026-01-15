import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showSuccess, showError } from "@/lib/toast-utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Star, Upload, Loader2, PartyPopper, X } from "lucide-react";

interface TestimonialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMaybeLater: () => void;
}

export const TestimonialModal = ({
  isOpen,
  onClose,
  onMaybeLater,
}: TestimonialModalProps) => {
  const { user, profile } = useAuth();
  const [step, setStep] = useState<"prompt" | "form">("prompt");
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [quote, setQuote] = useState("");
  const [appName, setAppName] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        showError("Please upload an image file");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError("Image must be less than 5MB");
        return;
      }
      setScreenshot(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const removeScreenshot = () => {
    setScreenshot(null);
    if (screenshotPreview) {
      URL.revokeObjectURL(screenshotPreview);
      setScreenshotPreview(null);
    }
  };

  const handleSubmit = async () => {
    if (!user || !profile) return;
    if (quote.trim().length < 20) {
      showError("Please write at least 20 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      let screenshotUrl: string | null = null;

      // Upload screenshot if provided
      if (screenshot) {
        const fileExt = screenshot.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("app-screenshots")
          .upload(fileName, screenshot);

        if (uploadError) {
          throw new Error("Failed to upload screenshot");
        }

        const { data: publicUrl } = supabase.storage
          .from("app-screenshots")
          .getPublicUrl(fileName);

        screenshotUrl = publicUrl.publicUrl;
      }

      // Insert testimonial
      const { error: insertError } = await supabase
        .from("testimonials")
        .insert({
          user_id: user.id,
          cohort_id: profile.cohort_id,
          name: profile.first_name,
          content: quote.trim(),
          rating,
          app_name: appName.trim() || null,
          app_screenshot_url: screenshotUrl,
          is_approved: false,
          is_featured: false,
        });

      if (insertError) throw insertError;

      showSuccess("Thank you for sharing! Your testimonial will be reviewed and published soon.");
      onClose();
    } catch (error) {
      console.error("Error submitting testimonial:", error);
      showError("Failed to submit testimonial. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = hoveredRating !== null ? hoveredRating : rating;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
        {step === "prompt" ? (
          <>
            <DialogHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                <PartyPopper className="w-8 h-8 text-primary" />
              </div>
              <DialogTitle className="text-2xl font-display">
                Congratulations! 🎉
              </DialogTitle>
              <DialogDescription className="text-base mt-2">
                You've completed the 7-Day Appreneur Challenge! Would you mind
                sharing your experience to help inspire others?
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 mt-6">
              <Button
                variant="cta"
                size="lg"
                onClick={() => setStep("form")}
                className="w-full"
              >
                Sure, I'd love to!
              </Button>
              <Button
                variant="ghost"
                onClick={onMaybeLater}
                className="w-full text-muted-foreground"
              >
                Maybe later
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-display">
                Share Your Experience
              </DialogTitle>
              <DialogDescription>
                Your story could inspire the next cohort of builders!
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {/* Star Rating */}
              <div className="space-y-2">
                <Label>How would you rate your experience?</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(null)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          star <= displayRating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Quote */}
              <div className="space-y-2">
                <Label htmlFor="quote">Your testimonial *</Label>
                <Textarea
                  id="quote"
                  placeholder="What did you build? How did the challenge help you?"
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {quote.length}/20 characters minimum
                </p>
              </div>

              {/* App Name */}
              <div className="space-y-2">
                <Label htmlFor="appName">App name (optional)</Label>
                <Input
                  id="appName"
                  placeholder="e.g., Habit Tracker Pro"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                />
              </div>

              {/* Screenshot Upload */}
              <div className="space-y-2">
                <Label>App screenshot (optional)</Label>
                {screenshotPreview ? (
                  <div className="relative rounded-lg border border-border overflow-hidden">
                    <img
                      src={screenshotPreview}
                      alt="Screenshot preview"
                      className="w-full h-40 object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeScreenshot}
                      className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-background"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload a screenshot
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep("prompt")}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Back
                </Button>
                <Button
                  variant="cta"
                  onClick={handleSubmit}
                  className="flex-1"
                  disabled={isSubmitting || quote.trim().length < 20}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Testimonial"
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
