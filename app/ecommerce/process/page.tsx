import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { centroImages } from "@/lib/centro-content";

export const metadata: Metadata = {
  title: "Design & production",
  description:
    "Explore the Centro design and production process, from product development to quality, compliance and logistics.",
  alternates: { canonical: "/ecommerce/process" },
};

const processStages = [
  {
    number: "01",
    title: "Design & development",
    image: centroImages.processDevelopment,
    alt: "Centro product design and development",
    description:
      "Ideas take shape through design and product development, with attention to the details that make a product work.",
  },
  {
    number: "02",
    title: "Production",
    image: centroImages.processProduction,
    alt: "Centro production work",
    description:
      "Production brings those ideas into the making stage, supported by coordination across teams and partners.",
  },
  {
    number: "03",
    title: "Compliance & safety",
    image: centroImages.processCompliance,
    alt: "Centro compliance and safety",
    description:
      "Compliance and safety are important parts of the wider production journey.",
  },
  {
    number: "04",
    title: "Shipping & logistics",
    image: centroImages.processLogistics,
    alt: "Centro shipping and logistics",
    description:
      "The final stages connect production with shipping and logistics.",
  },
];

export default function ProcessPage() {
  return (
    <main className="centro-company-page centro-editorial-page centro-process-page">
      <header className="centro-page-intro">
        <span className="centro-eyebrow">DESIGN &amp; PRODUCTION</span>
        <h1>From first idea<br /><em>to final detail.</em></h1>
        <p>
          A closer look at the connected stages behind Centro’s design and
          production process.
        </p>
      </header>

      <figure className="centro-page-hero centro-process-hero">
        <img
          src={centroImages.process}
          alt="Centro design and production"
        />
        <figcaption>Design and production / Centro</figcaption>
      </figure>

      <section className="centro-process-intro" aria-labelledby="centro-process-heading">
        <span className="centro-eyebrow">A CONNECTED JOURNEY</span>
        <h2 id="centro-process-heading">Every stage moves the idea forward.</h2>
        <p>
          Product development, production, compliance and logistics each play a
          part. Together, they connect an early idea with the finished work.
        </p>
      </section>

      <section className="centro-process-stages" aria-label="Stages of the Centro process">
        {processStages.map((stage) => (
          <article key={stage.number} className="centro-process-stage">
            <img src={stage.image} alt={stage.alt} loading="lazy" />
            <div className="centro-process-stage-copy">
              <span>{stage.number} / THE PROCESS</span>
              <h3>{stage.title}</h3>
              <p>{stage.description}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="centro-community-note">
        <span className="centro-eyebrow">INSIDE CENTRO</span>
        <p>
          The process is only one part of the story. It is the people behind
          each stage who bring the work together.
        </p>
        <Link className="centro-text-link" href="/ecommerce/leadership">
          Meet Centro’s people <ArrowUpRight size={16} />
        </Link>
      </section>
    </main>
  );
}
