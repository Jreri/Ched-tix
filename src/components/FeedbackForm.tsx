import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Star, ThumbsUp, Send } from "lucide-react";

interface FeedbackFormProps {
  eventId: string;
  eventTitle: string;
}

const FeedbackForm = ({ eventId, eventTitle }: FeedbackFormProps) => {
  const { toast } = useToast();
  const [rating, setRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating) {
      toast({
        title: "Rating required",
        description: "Please select a rating before submitting your feedback.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Feedback submitted",
        description: "Thank you for providing your feedback!",
      });
      
      // Reset form
      setRating(null);
      setFeedback("");
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ThumbsUp className="h-5 w-5" />
          Customer Feedback
        </CardTitle>
        <CardDescription>
          Share your thoughts about "{eventTitle}"
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>How would you rate the event?</Label>
            <div className="flex items-center justify-center">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className="p-1"
                    onClick={() => setRating(value)}
                  >
                    <Star 
                      className={`h-8 w-8 ${
                        rating && value <= rating 
                          ? "fill-yellow-400 text-yellow-400" 
                          : "text-muted-foreground"
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>
            {rating && (
              <div className="text-center text-sm text-muted-foreground">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label>What aspects of the event did you enjoy?</Label>
            <RadioGroup defaultValue="content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="content" id="content" />
                  <Label htmlFor="content">Content & Presentations</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="organization" id="organization" />
                  <Label htmlFor="organization">Organization</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="venue" id="venue" />
                  <Label htmlFor="venue">Venue & Facilities</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="networking" id="networking" />
                  <Label htmlFor="networking">Networking Opportunities</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label htmlFor="feedback">Additional Comments</Label>
            <Textarea
              id="feedback"
              placeholder="Share your thoughts, suggestions, or feedback..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full flex gap-2 items-center"
            disabled={isSubmitting}
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default FeedbackForm;
