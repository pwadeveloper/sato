import type { Metadata } from "next";
import { RichText } from "@/components/RichText";
import { getPage } from "@/lib/content";

const page = getPage("leadership");

export const metadata: Metadata = {
  title: page.metaTitle ?? page.title,
  description: page.metaDescription,
};

export default function LeadershipPage() {
  return <RichText as="h1" text={page.title} />;
}
