import Link from "next/link";
import { ArrowDown, ArrowUpRight, ArrowRight } from "lucide-react";
import { Suspense } from "react";
import { HomeMotion } from "./HomeMotion";
import HomeFeaturedProducts from "./HomeFeaturedProducts";
import { getCentroCategories } from "@/lib/centro-navigation";
import { centroImages } from "@/lib/centro-content";

export default async function Home() {
  const categories = (await getCentroCategories()).filter(category => category.parentId === null && category.showInHeader);
  return <HomeMotion>
    <main className="centro-home">
      <section className="centro-hero" aria-labelledby="centro-hero-title">
        <div className="centro-hero-copy">
          <span className="centro-eyebrow"><span /> A FRESH PERSPECTIVE / CENTRO</span>
          <h1 id="centro-hero-title">Made for<br />the way<br />you <em>live.</em></h1>
          <p>A considered collection. A creative point of view. Discover pieces for every side of your everyday.</p>
          <div className="centro-hero-actions"><Link className="centro-button" href="/ecommerce/products">Explore the collection <ArrowUpRight size={18} /></Link><Link className="centro-text-link" href="/ecommerce/about">Meet Centro <ArrowRight size={15} /></Link></div>
          <a href="#collections" className="centro-scroll"><span><ArrowDown size={15} /></span> A LITTLE FURTHER, A LITTLE DIFFERENT</a>
        </div>
        <div className="centro-hero-art"><div className="centro-hero-main"><img src={centroImages.hero} alt="Cream tailored blazer from the Centro collection" fetchPriority="high" /><span>THE EVERYDAY EDIT / 01</span></div><div className="centro-hero-detail"><img src={centroImages.heroDetail} alt="Black windbreaker from the Centro collection" /><span>Different pieces.<br />One point of view.</span></div><span className="centro-hero-stamp">CONSIDERED<br />BY CENTRO <ArrowUpRight size={21} /></span></div>
      </section>
      <section id="collections" className="centro-collections" aria-labelledby="centro-collections-title">
        <div className="centro-section-heading" data-reveal=""><div><span className="centro-eyebrow">YOUR WORLD, WELL CONSIDERED</span><h2 id="centro-collections-title">Find your <em>everyday.</em></h2></div><Link className="centro-text-link" href="/ecommerce/products">View all collections <ArrowUpRight size={17} /></Link></div>
        <div className="centro-category-grid">{categories.map((category, index) => <Link key={category.id} className="centro-category-card" href={`/ecommerce/collections/${category.slug}`}><div><img src={category.image || "/placeholder.svg"} alt={category.name} loading="lazy" /><span>{String(index + 1).padStart(2, "0")}</span></div><h3>{category.name}<ArrowUpRight size={18} /></h3></Link>)}</div>
      </section>
      <section className="centro-latest" aria-labelledby="centro-latest-title"><div className="centro-section-heading" data-reveal=""><div><span className="centro-eyebrow">A NEW CHAPTER IN YOUR WARDROBE</span><h2 id="centro-latest-title">The latest <em>perspective.</em></h2></div><Link className="centro-text-link" href="/ecommerce/products?sort=newest">Shop new arrivals <ArrowUpRight size={17} /></Link></div><div className="centro-product-grid"><Suspense fallback={<p className="centro-loading" role="status">Discovering the latest pieces...</p>}><HomeFeaturedProducts /></Suspense></div></section>
      <section className="centro-story" id="our-story" aria-labelledby="centro-story-title"><div className="centro-story-image"><img src={centroImages.story} alt="The people behind Centro" loading="lazy" /><span>THE PEOPLE. THE IDEAS. THE POSSIBILITIES.</span></div><div className="centro-story-copy" data-reveal=""><span className="centro-eyebrow">INSIDE CENTRO</span><h2 id="centro-story-title">Good design<br />starts with<br /><em>people.</em></h2><p>Behind every collection is another story. A world of creativity, collaboration and the people who bring an idea to life.</p><p>Get to know Centro, explore our design and production process, and discover what goes into the things you make part of your day.</p><Link className="centro-button" href="/ecommerce/about">Discover our story <ArrowUpRight size={18} /></Link></div></section>
      <section className="centro-journal" aria-labelledby="centro-journal-title"><div className="centro-section-heading" data-reveal=""><div><span className="centro-eyebrow">BEYOND THE COLLECTION</span><h2 id="centro-journal-title">A little more <em>Centro.</em></h2></div><span className="centro-section-note">A closer look at our world.</span></div><div className="centro-journal-grid">{[{title:"From idea to everyday.",label:"DESIGN & PRODUCTION",image:centroImages.process,href:"/ecommerce/centro/process"},{title:"Thoughtfulness, woven in.",label:"SUSTAINABILITY",image:centroImages.sustainability,href:"/ecommerce/centro/sustainability"},{title:"People at the heart of it.",label:"CENTRO CARES",image:centroImages.cares,href:"/ecommerce/centro/cares"}].map(story => <Link key={story.href} href={story.href} className="centro-journal-card"><div><img src={story.image} alt={story.label} loading="lazy" /></div><span className="centro-eyebrow">{story.label}</span><h3>{story.title}<ArrowUpRight size={19} /></h3></Link>)}</div></section>
      <section className="centro-contact-banner"><span className="centro-eyebrow">LET'S MAKE SOMETHING GOOD</span><h2>A new idea?<br /><em>We're listening.</em></h2><Link href="/ecommerce/contact" className="centro-button">Get in touch <ArrowUpRight size={18} /></Link></section>
    </main>
  </HomeMotion>;
}
