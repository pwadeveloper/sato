import { cn } from "@/lib/cn";

/** Strips honorifics so "Engr. Wale Osamiluyi" initials as WO, not EW. */
function initialsOf(name: string): string {
  const words = name
    .replace(/\{\{CONFIRM[\s\S]*?\}\}/g, "")
    .split(/\s+/)
    .filter((word) => word && !/^(engr\.?|mr\.?|mrs\.?|ms\.?|dr\.?|arc\.?)$/i.test(word));

  const letters = words.map((word) => word[0]).filter((letter) => /[A-Za-z]/.test(letter));
  return letters.slice(0, 2).join("").toUpperCase();
}

export interface PersonInitialsProps {
  name: string;
  size?: "sm" | "lg";
  className?: string;
}

/**
 * Stands in for a photograph. Sato has no staff photography, and a generic
 * silhouette icon would read as a broken image — initials set in the same
 * expanded Archivo as the headings read as a deliberate treatment.
 */
export function PersonInitials({ name, size = "lg", className }: PersonInitialsProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center bg-asphalt text-concrete wdth-heading font-bold",
        size === "lg" ? "size-20 text-2xl" : "size-11 text-sm",
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  );
}
