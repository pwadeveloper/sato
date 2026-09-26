import Image from "next/image";
import { PersonInitials } from "./PersonInitials";
import { RichText } from "./RichText";
import type { TeamMember } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface PersonCardProps {
  member: TeamMember;
  headingLevel?: 2 | 3;
  /** Labels for the two detail lists, from page content. */
  qualificationsLabel: string;
  membershipsLabel: string;
  className?: string;
}

export function PersonCard({
  member,
  headingLevel = 3,
  qualificationsLabel,
  membershipsLabel,
  className,
}: PersonCardProps) {
  const NameTag = `h${headingLevel}` as const;

  return (
    <article className={cn("flex flex-col border-t border-asphalt pt-6", className)}>
      {member.photo ? (
        <div className="relative mb-5 aspect-4/5 w-full overflow-hidden bg-steel/10">
          <Image
            src={member.photo.src}
            alt={member.photo.alt}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      ) : (
        <PersonInitials name={member.name} className="mb-5" />
      )}

      <NameTag className="text-xl font-bold wdth-heading text-balance">
        <RichText text={member.name} />
      </NameTag>

      <p className="mt-1 text-sm font-medium text-brand-deep wdth-body">
        <RichText text={member.title} />
      </p>

      {member.yearsExperience ? (
        <p className="mt-2 text-sm text-steel-ink tabular wdth-body">
          <RichText text={member.yearsExperience} />
        </p>
      ) : null}

      {member.bio.map((paragraph, index) => (
        <p key={index} className="mt-3 text-base wdth-body">
          <RichText text={paragraph} />
        </p>
      ))}

      {member.qualifications.length ? (
        <div className="mt-5">
          <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-steel-ink wdth-body">
            <RichText text={qualificationsLabel} />
          </p>
          <ul className="mt-2 flex flex-col gap-1">
            {member.qualifications.map((item) => (
              <li key={item} className="text-sm text-steel-ink wdth-body">
                <RichText text={item} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {member.memberships.length ? (
        <div className="mt-5">
          <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-steel-ink wdth-body">
            <RichText text={membershipsLabel} />
          </p>
          <ul className="mt-2 flex flex-col gap-1">
            {member.memberships.map((item) => (
              <li key={item} className="text-sm text-steel-ink wdth-body">
                <RichText text={item} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}
