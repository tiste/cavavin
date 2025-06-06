import React, { useState } from "react";

interface ShowMoreTagsProps {
  tags: string[];
  selected: string;
  onSelect: (tag: string) => void;
  className?: string;
}

const LIMIT = 5;

export function ShowMoreTags({
  tags,
  selected,
  onSelect,
  className = "",
}: ShowMoreTagsProps) {
  const [showAll, setShowAll] = useState(false);
  const visibleTags = showAll ? tags : tags.slice(0, LIMIT);

  return (
    <>
      {visibleTags.map((tag) => (
        <span
          key={tag}
          className={`tag is-clickable ${className}${tag === selected ? " is-bordered" : ""}`}
          onClick={() => onSelect(tag)}
        >
          {tag}
        </span>
      ))}
      {tags.length > LIMIT && (
        <button
          className={`tag ${className}`}
          onClick={() => setShowAll((v) => !v)}
          type="button"
        >
          {showAll ? "... moins" : "... plus"}
        </button>
      )}
    </>
  );
}
