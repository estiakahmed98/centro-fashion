import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { centroImages } from "@/lib/centro-content";

export const metadata: Metadata = {
  title: "Social responsibilities",
  description:
    "Discover Centro Cares and Centro’s community-focused social responsibility work.",
  alternates: { canonical: "/ecommerce/centro/social-responsibilities" },
};

const communityImages = [
  {
    src: centroImages.communityMeal,
    alt: "A community photograph from Centro Cares",
    caption: "From the Centro Cares community collection.",
  },
  {
    src: centroImages.communityPortrait,
    alt: "A portrait from Centro Cares",
    caption: "People and communities / Centro Cares.",
  },
];

export default function SocialResponsibilitiesPage() {
  return (
    <main className="centro-company-page centro-editorial-page centro-social-page">
      <header className="centro-page-intro">
        <span className="centro-eyebrow">CENTRO CARES / OUR COMMUNITIES</span>
        <h1>Community support,<br /><em>through Centro Cares.</em></h1>
        <p>
          Centro Cares is Centro’s social responsibility initiative, with
          programmes focused on food, education and rehabilitation.
        </p>
      </header>

      <figure className="centro-page-hero centro-social-hero">
        <img
          src={centroImages.communityDistribution}
          alt="A community outreach photograph from Centro Cares"
        />
        <figcaption>Centro Cares community outreach.</figcaption>
      </figure>

      <section className="centro-impact-intro" aria-labelledby="centro-impact-title">
        <div>
          <span className="centro-eyebrow">SOCIAL RESPONSIBILITY</span>
          <h2 id="centro-impact-title">Support for<br />local communities.</h2>
        </div>
        <div>
          <p>
            Centro’s community work is brought together through Centro Cares.
            Its initiatives include food assistance, education and
            rehabilitation.
          </p>
          <p>
            The photographs below come from Centro’s own collection and
            document community outreach and shared meals.
          </p>
          <Link className="centro-button" href="/ecommerce/contact">
            Talk to our team <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>

      <section className="centro-community-gallery" aria-label="Centro Cares community photographs">
        {communityImages.map((image) => (
          <figure key={image.src}>
            <img src={image.src} alt={image.alt} loading="lazy" />
            <figcaption>{image.caption}</figcaption>
          </figure>
        ))}
      </section>

      <section className="centro-community-note">
        <span className="centro-eyebrow">CENTRO CARES</span>
        <p>
          Centro Cares brings together the people and activities behind this
          community work.
        </p>
        <Link className="centro-text-link" href="/ecommerce/about">
          Learn about Centro <ArrowUpRight size={16} />
        </Link>
      </section>
    </main>
  );
}
