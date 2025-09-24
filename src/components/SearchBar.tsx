import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
}

export function SearchBar({ placeholder = "Search...", onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className="relative">
      {/* Search icon on the left */}
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Input field */}
      <Input
        type="search"
        placeholder={placeholder}
        value={query}
        onChange={handleInputChange}
        className="pl-10 pr-10"
      />

      {/* Clear button */}
      {query && (
        <div className="absolute inset-y-0 right-0 flex items-center">
          <Button 
            variant="ghost" 
            className="h-full px-2 rounded-r-md"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        </div>
      )}
    </div>
  );
}
