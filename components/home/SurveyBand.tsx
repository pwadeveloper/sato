"use client";

import dynamic from "next/dynamic";
import { useMediaQuery } from "@/lib/use-media-query";

const SurveyField = dynamic(
  () => import("../webgl/SurveyField").then((mod) => mod.SurveyField),
  { ssr: false },
);

/**
 * Mounts the survey field behind the motto, lazily.
 *
 * Nothing renders on the server: the band is asphalt with the survey grid
 * until the field arrives, so the motto is readable from the first paint
 * and a reader who never gets WebGL sees a finished band rather than a
 * gap. Point density follows the viewport, so a phone draws fewer points
 * at the same visual weight.
 */
export function SurveyBand() {
  const wide = useMediaQuery("(min-width: 768px)");
  return <SurveyField density={wide ? "high" : "low"} />;
}
