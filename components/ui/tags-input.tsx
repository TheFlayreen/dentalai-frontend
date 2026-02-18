"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>(
  ({ value = [], onChange, placeholder, disabled, className }, ref) => {
    const [inputValue, setInputValue] = React.useState("");

    const addTag = (tag: string) => {
      const trimmed = tag.trim();
      if (!trimmed) return;
      if (value.includes(trimmed)) return;

      onChange([...value, trimmed]);
      setInputValue("");
    };

    const removeTag = (tagToRemove: string) => {
      const newValue = value.filter((tag) => tag !== tagToRemove);
      onChange(newValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addTag(inputValue);
      }
    };

    return (
      <div
        className={cn(
          "flex flex-col gap-2",
          disabled && "opacity-50 pointer-events-none",
          className
        )}
      >
        <div className="flex flex-row items-center gap-2">
          <Input
            ref={ref}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
          />
          <Button className="bg-black hover:bg-black/70" type='button' onClick={() => addTag(inputValue)}>
            Add
          </Button>
        </div>
        {value.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1.5 max-w-[100%] overflow-hidden">
            {value.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {tag}
                <Button className="h-6 w-6" size="sm" variant="ghost" onClick={() => removeTag(tag)}>
                  <X
                    className="h-3 w-3 cursor-pointer"
                  />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  }
);

TagInput.displayName = "TagInput";
