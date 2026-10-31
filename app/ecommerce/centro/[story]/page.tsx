import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { centroStories } from "@/lib/centro-content";

type Props = { params: Promise<{ story: string }> };
function findStory(key: string) {
  return Object.hasOwn(centroStories, key) ? centroStories[key as keyof typeof centroStories] : null;
}
export async function generateMetadata({ params }: Props) {
  const story = findStory((await params).story);
  return { title: story ? `${story.eyebrow} | Centro` : "Centro", description: story?.intro };
}
export default async function CentroStoryPage({ params }: Props) {
  const story = findStory((await params).story);
  if (!story) notFound();
  return <main className="centro-company-page"><header><span className="centro-eyebrow">{story.eyebrow}</span><h1>{story.title}</h1><p>{story.intro}</p></header><img className="centro-company-hero" src={story.image} alt={story.eyebrow} /><section className="centro-company-copy"><h2>A closer look<br />at Centro.</h2><div>{story.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}<Link href="/ecommerce/contact" className="centro-button">Start a conversation <ArrowUpRight size={18} /></Link></div></section></main>;
}
