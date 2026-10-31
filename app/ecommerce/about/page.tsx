import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { centroImages } from "@/lib/centro-content";

export const metadata = {
  title: "About Centro",
  description: "Learn about Centro’s history, people and work across textile sourcing and product development.",
};

const companyLinks = [
  { eyebrow: "OUR STORY", title: "History", href: "/ecommerce/history" },
  { eyebrow: "THE PEOPLE", title: "Leadership", href: "/ecommerce/leadership" },
  { eyebrow: "HOW WE WORK", title: "Design & production", href: "/ecommerce/process" },
  { eyebrow: "LOOKING AHEAD", title: "Sustainability", href: "/ecommerce/centro/sustainability" },
  { eyebrow: "IN OUR COMMUNITY", title: "Social responsibilities", href: "/ecommerce/centro/social-responsibilities" },
];

export default function AboutPage() {
  return (
    <main className="centro-company-page centro-editorial-page">
      <header className="centro-page-intro">
        <span className="centro-eyebrow">ABOUT CENTRO</span>
        <h1>A textile sourcing company,<br /><em>built around people.</em></h1>
        <p>
          Since 2006, Centro has worked across design, product development,
          production and delivery.
        </p>
      </header>

      <figure className="centro-page-hero">
        <img src={centroImages.story} alt="Centro colleagues together" />
        <figcaption>The people behind Centro.</figcaption>
      </figure>

      <section className="centro-editorial-story" aria-labelledby="centro-history-title">
        <div className="centro-editorial-story-image">
          <img src={centroImages.history} alt="A moment from Centro’s early history" loading="lazy" />
          <span>OUR STORY / EST. 2006</span>
        </div>
        <div className="centro-editorial-story-copy">
          <span className="centro-eyebrow">A THOUGHTFUL START</span>
          <h2 id="centro-history-title">From 13 colleagues<br />to a growing team.</h2>
          <p>
            Centro began in October 2006 with a team of 13. It has since grown
            into a textile sourcing company, built around the people who bring
            products from an early idea to production.
          </p>
          <p>
            Today, its work spans design, product development, production and
            delivery. Each stage depends on close collaboration between teams
            and partners.
          </p>
          <Link className="centro-text-link" href="/ecommerce/process">
            See how the work comes together <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="centro-company-links" aria-labelledby="centro-company-links-title">
        <div className="centro-company-links-heading">
          <span className="centro-eyebrow">A CLOSER LOOK</span>
          <h2 id="centro-company-links-title">More to explore.</h2>
        </div>
        <div className="centro-company-links-grid">
          {companyLinks.map((item) => (
            <Link key={item.href} href={item.href}>
              <span>{item.eyebrow}</span>
              <strong>{item.title}</strong>
              <ArrowUpRight size={18} aria-hidden />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
