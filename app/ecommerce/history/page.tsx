import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { centroImages } from "@/lib/centro-content";

export const metadata: Metadata = {
  title: "History",
  description:
    "Discover Centro’s journey, from a team of 13 in 2006 to a growing textile sourcing company.",
  alternates: { canonical: "/ecommerce/history" },
};

const archiveImages = [
  {
    src: centroImages.historyPeople,
    alt: "Centro colleagues in the company history collection",
  },
  {
    src: centroImages.historyArchive,
    alt: "A historical moment from Centro",
  },
  {
    src: centroImages.historyMilestone,
    alt: "A milestone from Centro’s journey",
  },
];

export default function HistoryPage() {
  return (
    <main className="centro-company-page centro-editorial-page centro-history-page">
      <header className="centro-page-intro">
        <span className="centro-eyebrow">OUR STORY / SINCE 2006</span>
        <h1>A thousand-mile journey<br /><em>begins with one step.</em></h1>
        <p>
          Centro’s story began with a small team and a shared ambition. It
          continues to grow through the people and partnerships behind the work.
        </p>
      </header>

      <figure className="centro-page-hero">
        <img
          src={centroImages.historyHero}
          alt="A moment from Centro’s company history"
        />
        <figcaption>Centro / A story still in the making</figcaption>
      </figure>

      <section className="centro-editorial-story" aria-labelledby="centro-history-start">
        <div className="centro-editorial-story-image">
          <img
            src={centroImages.history}
            alt="Centro colleagues and the people behind its early story"
            loading="lazy"
          />
          <span>THE FIRST STEP / OCTOBER 2006</span>
        </div>
        <div className="centro-editorial-story-copy">
          <span className="centro-eyebrow">A THOUGHTFUL START</span>
          <h2 id="centro-history-start">Thirteen people.<br />One beginning.</h2>
          <p>
            Centro began in October 2006 with 13 people. From that first step,
            it has grown into a textile sourcing company focused on thoughtful
            growth and the wellbeing of its colleagues.
          </p>
          <p>
            Its story is shaped by the people who build relationships, develop
            ideas and carry the work forward—one step at a time.
          </p>
          <Link className="centro-text-link" href="/ecommerce/leadership">
            Meet the people behind Centro <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="centro-history-gallery" aria-label="Moments from Centro’s history">
        {archiveImages.map((image) => (
          <figure key={image.src}>
            <img src={image.src} alt={image.alt} loading="lazy" />
          </figure>
        ))}
      </section>

      <section className="centro-community-note">
        <span className="centro-eyebrow">THE STORY CONTINUES</span>
        <p>
          Every next step is made possible by the people who bring their care,
          experience and ideas to the work.
        </p>
        <Link className="centro-text-link" href="/ecommerce/process">
          Explore how we work <ArrowUpRight size={16} />
        </Link>
      </section>
    </main>
  );
}
