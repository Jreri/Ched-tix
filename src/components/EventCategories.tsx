import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const CATEGORIES = [
  "All",
  "Music",
  "Sports",
  "Academic",
  "Cultural",
  "Workshop",
  "Conference",
  "Social"
];

interface EventCategoriesProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const EventCategories = ({ selectedCategory, onSelectCategory }: EventCategoriesProps) => {
  return (
    <div className="w-full overflow-auto pb-2">
      <div className="flex space-x-2">
        {CATEGORIES.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            className={cn(
              "whitespace-nowrap",
              selectedCategory === category
                ? "bg-primary text-primary-foreground"
                : "bg-background hover:bg-muted"
            )}
            onClick={() => onSelectCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default EventCategories;
