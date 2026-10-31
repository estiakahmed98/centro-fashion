import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { centroImages } from "@/lib/centro-content";

export const metadata: Metadata = {
  title: "Leadership",
  description:
    "Meet the people and leadership philosophy shaping Centro’s direction and work.",
  alternates: { canonical: "/ecommerce/leadership" },
};

export default function LeadershipPage() {
  return (
    <main className="centro-company-page centro-editorial-page centro-leadership-page">
      <header className="centro-page-intro">
        <span className="centro-eyebrow">THE PEOPLE / LEADERSHIP</span>
        <h1>Clear direction.<br /><em>People at the centre.</em></h1>
        <p>
          Centro’s leadership philosophy is part of a wider story: how people,
          ideas and decisions move the work forward.
        </p>
      </header>

      <figure className="centro-page-hero centro-leadership-hero">
        <img
          src={centroImages.leadershipHero}
          alt="Centro colleagues working together"
        />
        <figcaption>People bring the vision to life.</figcaption>
      </figure>

      <section className="centro-editorial-story" aria-labelledby="centro-leadership-title">
        <div className="centro-editorial-story-image centro-leadership-team-image">
          <img
            src={centroImages.leadershipTeam}
            alt="Centro leadership team"
            loading="lazy"
          />
          <span>OUR LEADERSHIP PHILOSOPHY</span>
        </div>
        <div className="centro-editorial-story-copy">
          <span className="centro-eyebrow">A SHARED POINT OF VIEW</span>
          <h2 id="centro-leadership-title">Leadership is<br />a team effort.</h2>
          <p>
            Centro’s leadership story brings its visionaries and the wider team
            into focus. Different experience and perspectives help shape a
            shared direction for the company.
          </p>
          <p>
            It is a people-first view of leadership—grounded in working
            together, supporting colleagues and building for the long term.
          </p>
          <Link className="centro-text-link" href="/ecommerce/history">
            Read Centro’s story <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="centro-leadership-visionaries">
        <img
          src={centroImages.leadershipVisionaries}
          alt="Centro’s leadership team"
          loading="lazy"
        />
      </section>

      <section className="centro-company-links" aria-labelledby="centro-leadership-links-title">
        <div className="centro-company-links-heading">
          <span className="centro-eyebrow">INSIDE CENTRO</span>
          <h2 id="centro-leadership-links-title">The work behind the work.</h2>
        </div>
        <div className="centro-company-links-grid centro-leadership-links-grid">
          <Link href="/ecommerce/process">
            <span>HOW WE WORK</span>
            <strong>Design &amp; production</strong>
            <ArrowUpRight size={18} aria-hidden />
          </Link>
          <Link href="/ecommerce/centro/social-responsibilities">
            <span>IN OUR COMMUNITY</span>
            <strong>Social responsibilities</strong>
            <ArrowUpRight size={18} aria-hidden />
          </Link>
        </div>
      </section>
    </main>
  );
}
