import { PersonInitials } from "./PersonInitials";
import { RichText } from "./RichText";
import type { TeamMember } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface TeamListProps {
  members: TeamMember[];
  headingLevel?: 2 | 3;
  className?: string;
}

/**
 * The wider project team as a compact register — name, role and one line —
 * rather than a wall of large cards. The leadership entries above carry the
 * full detail; repeating that treatment for everyone would flatten the
 * distinction the page is making.
 */
export function TeamList({ members, headingLevel = 3, className }: TeamListProps) {
  const NameTag = `h${headingLevel}` as const;

  return (
    <ul className={cn("border-t border-asphalt", className)}>
      {members.map((member) => (
        <li
          key={member.slug}
          id={member.slug}
          className="flex scroll-mt-32 items-start gap-4 border-b border-rule py-5"
        >
          {member.photo ? null : <PersonInitials name={member.name} size="sm" />}

          <div className="min-w-0">
            <NameTag className="text-base font-bold wdth-heading">
              <RichText text={member.name} />
            </NameTag>

            <p className="mt-0.5 text-sm font-medium text-laterite wdth-body">
              <RichText text={member.title} />
            </p>

            {member.bio.length ? (
              <p className="mt-1 text-sm text-steel-ink wdth-body">
                <RichText text={member.bio[0]} />
              </p>
            ) : member.qualifications.length ? (
              <p className="mt-1 text-sm text-steel-ink wdth-body">
                <RichText text={member.qualifications[0]} />
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
