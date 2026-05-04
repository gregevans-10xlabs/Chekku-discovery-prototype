"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";

interface CourseRow {
  title: string;
  meta: string;
  cta: string;
  tone: "accent" | "muted";
}

const RECOMMENDED: CourseRow[] = [
  {
    title: "Harvey Norman Installer Induction",
    meta: "~1.5 hours · Online · Free",
    cta: "Start",
    tone: "accent",
  },
  {
    title: "First Aid / HLTAID011",
    meta: "Full day · In-person · $150-$220",
    cta: "Book",
    tone: "accent",
  },
  {
    title: "QBE Repair Network Induction",
    meta: "~2 hours · Online · Free",
    cta: "Start",
    tone: "accent",
  },
];

const UPCOMING: CourseRow[] = [
  {
    title: "Working at Heights refresher",
    meta: "Due in 270 days",
    cta: "270d",
    tone: "muted",
  },
];

export default function TrainingPage() {
  const router = useRouter();

  return (
    <main className="pb-8">
      <PageHeader
        title="Training & courses"
        subtitle="AI matched to your trade and compliance gaps"
        back
        onBack={() => router.push("/profile")}
      />

      <section className="px-5 pt-4">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
          Recommended for you
        </h2>
        <div className="space-y-2">
          {RECOMMENDED.map((c) => (
            <CourseCard key={c.title} course={c} />
          ))}
        </div>
      </section>

      <section className="mt-6 px-5">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
          Upcoming refreshers
        </h2>
        <div className="space-y-2">
          {UPCOMING.map((c) => (
            <CourseCard key={c.title} course={c} />
          ))}
        </div>
      </section>

      <section className="mt-6 px-5">
        <p className="text-[11px] text-muted-strong">
          Completing a course updates your Compliance vault automatically and
          unlocks the related work bands in Find Jobs.
        </p>
      </section>
    </main>
  );
}

function CourseCard({ course }: { course: CourseRow }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4">
      <div className="min-w-0">
        <p className="text-[14px] font-semibold">{course.title}</p>
        <p className="mt-0.5 text-xs text-muted">{course.meta}</p>
      </div>
      <Badge tone={course.tone === "accent" ? "accent" : "neutral"}>
        {course.cta}
      </Badge>
    </div>
  );
}
