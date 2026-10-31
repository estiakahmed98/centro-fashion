import Link from "next/link";
import { HomeMotion } from "@/components/HomeMotion";
import { ProductCard } from "@/components/ProductCard";
import { Icon } from "@/components/Icons";
import { getHomepageProducts } from "@/lib/commerce-client";
import { CommerceState } from "@/components/CommerceState";
import { homeImages } from "@/lib/home-images";

const categoryTiles = [
  {
    title: "The art of tailoring",
    label: "SUITS",
    href: "/collections/suits",
    image: homeImages.suits,
    className:
      "mosaic-wide [&]:[grid-column:span_8] max-[700.01px]:[&]:[grid-column:span_3] max-[700.01px]:[&]:[height:350px]",
  },
  {
    title: "Small details.",
    label: "ACCESSORIES",
    href: "/collections/accessories",
    image: homeImages.accessories,
    className:
      "mosaic-narrow [&]:[grid-column:span_4] [&_.mosaic-caption]:[left:18px] [&_.mosaic-caption]:[right:12px] [&_.mosaic-caption_h3]:[font-size:clamp(24px,_2vw,_36px)] [&_.mosaic-caption_>_span:first-child]:[font-size:8px] [&_.mosaic-caption_>_span:first-child]:[letter-spacing:0.07em] max-[1000.01px]:[&_.mosaic-caption_h3]:[font-size:25px] max-[700.01px]:[&]:[grid-column:span_3] max-[700.01px]:[&]:[height:350px] max-[700.01px]:[&_.mosaic-caption]:[left:17px] max-[700.01px]:[&_.mosaic-caption]:[bottom:23px] max-[700.01px]:[&_.mosaic-caption_h3]:[font-size:30px]",
  },
  {
    title: "A lighter layer.",
    label: "JACKETS",
    href: "/collections/jackets",
    image: homeImages.jackets,
    className:
      "mosaic-third [&]:[grid-column:span_4] [&]:[height:clamp(420px,_46vw,_800px)] max-[700.01px]:[&]:[grid-column:span_2] max-[700.01px]:[&]:[height:clamp(260px,_72vw,_420px)] max-[700.01px]:[&_.mosaic-caption]:left-[10px] max-[700.01px]:[&_.mosaic-caption]:right-[8px] max-[700.01px]:[&_.mosaic-caption]:bottom-[18px] max-[700.01px]:[&_.mosaic-caption_h3]:text-[clamp(17px,4.8vw,27px)] max-[700.01px]:[&_.mosaic-caption_h3]:leading-[1.1] max-[700.01px]:[&_.mosaic-caption_>_span:first-child]:text-[7px] max-[700.01px]:[&_.mosaic-caption_>_span:first-child]:tracking-[0.08em] max-[700.01px]:[&_.mosaic-cta]:gap-[6px] max-[700.01px]:[&_.mosaic-cta]:text-[7px]",
  },
  {
    title: "Everyday refinement.",
    label: "SHIRTS",
    href: "/collections/shirts",
    image: homeImages.shirts,
    className:
      "mosaic-third [&]:[grid-column:span_4] [&]:[height:clamp(420px,_46vw,_800px)] max-[700.01px]:[&]:[grid-column:span_2] max-[700.01px]:[&]:[height:clamp(260px,_72vw,_420px)] max-[700.01px]:[&_.mosaic-caption]:left-[10px] max-[700.01px]:[&_.mosaic-caption]:right-[8px] max-[700.01px]:[&_.mosaic-caption]:bottom-[18px] max-[700.01px]:[&_.mosaic-caption_h3]:text-[clamp(17px,4.8vw,27px)] max-[700.01px]:[&_.mosaic-caption_h3]:leading-[1.1] max-[700.01px]:[&_.mosaic-caption_>_span:first-child]:text-[7px] max-[700.01px]:[&_.mosaic-caption_>_span:first-child]:tracking-[0.08em] max-[700.01px]:[&_.mosaic-cta]:gap-[6px] max-[700.01px]:[&_.mosaic-cta]:text-[7px]",
  },
  {
    title: "Soft by nature.",
    label: "KNITWEAR",
    href: "/collections/knitwear",
    image: homeImages.knitwear,
    className:
      "mosaic-third [&]:[grid-column:span_4] [&]:[height:clamp(420px,_46vw,_800px)] max-[700.01px]:[&]:[grid-column:span_2] max-[700.01px]:[&]:[height:clamp(260px,_72vw,_420px)] max-[700.01px]:[&_.mosaic-caption]:left-[10px] max-[700.01px]:[&_.mosaic-caption]:right-[8px] max-[700.01px]:[&_.mosaic-caption]:bottom-[18px] max-[700.01px]:[&_.mosaic-caption_h3]:text-[clamp(17px,4.8vw,27px)] max-[700.01px]:[&_.mosaic-caption_h3]:leading-[1.1] max-[700.01px]:[&_.mosaic-caption_>_span:first-child]:text-[7px] max-[700.01px]:[&_.mosaic-caption_>_span:first-child]:tracking-[0.08em] max-[700.01px]:[&_.mosaic-cta]:gap-[6px] max-[700.01px]:[&_.mosaic-cta]:text-[7px]",
  },
  {
    title: "The finishing touch.",
    label: "SHOES",
    href: "/collections/shoes",
    image: homeImages.shoes,
    className:
      "mosaic-half [&]:[grid-column:span_6] max-[700.01px]:[&]:[grid-column:span_3] max-[700.01px]:[&]:[height:350px]",
  },
  {
    title: "Room to move.",
    label: "TROUSERS",
    href: "/collections/trousers",
    image: homeImages.trousers,
    className:
      "mosaic-half [&]:[grid-column:span_6] max-[700.01px]:[&]:[grid-column:span_3] max-[700.01px]:[&]:[height:350px]",
  },
];
const mediaWordmarkStyles = [
  "media-wordmark-0 [&]:[font-size:15px] [&]:[font-weight:400] [&]:[letter-spacing:0.07em]",
  "media-wordmark-1 ",
  "media-wordmark-2 [&]:[font-family:var(--serif)] [&]:[font-style:italic]",
  "media-wordmark-3 [&]:[font-family:Arial,_sans-serif] [&]:[font-size:49px] [&]:[font-weight:900] [&]:[letter-spacing:-0.12em]",
  "media-wordmark-4 [&]:[font-size:18px] [&]:[font-weight:400] [&]:[letter-spacing:0.03em]",
  "media-wordmark-5 [&]:[font-weight:400] [&]:[letter-spacing:-0.07em]",
];
const media = ["NOBLEMAN", "Forbes", "Esquire", "GQ", "THE RAKE", "VOGUE"];

export const dynamic = "force-dynamic";

export default async function Home() {
  const home = await getHomepageProducts().catch(() => null);
  if (!home)
    return (
      <CommerceState
        title="The collection is temporarily unavailable."
        message="Please try again in a moment."
      />
    );
  const featuredProducts = home.featured;
  return (
    <HomeMotion>
      <section
        className="campaign-hero h-[100svh] min-h-[680px] relative mt-[-91px] [background:#65685e] [color:white] isolate max-[700.01px]:mt-[-90px] max-[700.01px]:min-h-[640px] max-[700.01px]:max-h-[950px]"
        aria-labelledby="campaign-title"
      >
        <picture className="contents">
          <source
            media="(max-width: 700px)"
            srcSet={encodeURI(homeImages.heroMobile)}
          />
          <img
            className="campaign-image absolute inset-[0] w-[100%] h-[100%] object-cover object-[50%_0%] z-[-3] min-[1600px]:object-[50%_0%] max-[700.01px]:object-[50%_0%]"
            src={homeImages.hero}
            alt="Italian tailoring, photographed in natural light"
            fetchPriority="high"
          />
        </picture>
        <div className="campaign-shade absolute inset-[0] z-[-1] [background:linear-gradient(90deg,_#161d1a66_0%,_#161d1a08_75%),_linear-gradient(0deg,_#111a205c,_transparent_65%)]" />
        <div className="campaign-copy absolute left-[3%] bottom-[10%] [&_.editorial-kicker]:mb-[28px] [&_h1]:[font-family:var(--sans)] [&_h1]:[font-size:clamp(70px,_7.6vw,_146px)] [&_h1]:[font-weight:var(--font-weight-normal,_400)] [&_h1]:leading-[0.91] [&_h1]:tracking-[-0.065em] [&_h1]:m-[0_0_32px] [&_h1_em]:[font-family:var(--serif)] [&_h1_em]:[font-weight:var(--font-weight-normal,_400)] [&_h1_em]:tracking-[-0.025em] max-[1000.01px]:[&_h1]:[font-size:90px] max-[700.01px]:left-[6%] max-[700.01px]:bottom-[12%] max-[700.01px]:[&_h1]:[font-size:clamp(54px,_16.7vw,_92px)] max-[700.01px]:[&_.editorial-kicker]:[font-size:8px] max-[700.01px]:[&_.editorial-kicker]:max-w-[230px] max-[700.01px]:[&_.editorial-kicker]:mb-[20px]">
          <span className="editorial-kicker block [font-size:10px] [font-weight:var(--font-weight-semibold,_600)] tracking-[0.22em] leading-[1.6]">
            A NEW SEASON OF POSSIBILITY
          </span>
          <h1 id="campaign-title">
            THE ART OF
            <br />
            DRESSING
            <br />
            <em>WELL.</em>
          </h1>
          <Link
            className="editorial-button min-h-[50px] min-w-[245px] inline-flex items-center justify-between gap-[35px] p-[16px_24px] [font-size:10px] [font-weight:var(--font-weight-semibold,_600)] tracking-[0.04em] [transition:background_0.2s,_color_0.2s] max-[1000.01px]:min-w-[205px] max-[1000.01px]:p-[15px_19px] max-[1000.01px]:[font-size:9px] max-[1000.01px]:gap-[20px] button-white [background:#faf9f6] [color:#242620] [&:hover]:[background:#e6e2d9]"
            href="/collections/suits"
          >
            EXPLORE THE COLLECTION <Icon name="arrow-right" size={16} />
          </Link>
        </div>
        <div className="campaign-footnote absolute left-[3%] right-[3%] bottom-[26px] flex justify-between gap-[20px] [font-size:8px] tracking-[0.17em] [&_a]:flex [&_a]:items-center [&_a]:gap-[15px] max-[700.01px]:left-[6%] max-[700.01px]:bottom-[23px] max-[700.01px]:[font-size:7px] max-[700.01px]:[&_>_a]:hidden!">
          <span>AURA BOED / THE NEW COLLECTION</span>
          <a href="#tailoring-edit" aria-label="Scroll to the tailoring edit">
            SCROLL TO DISCOVER <Icon name="chevron-down" size={15} />
          </a>
        </div>
      </section>

      <section
        className="tailoring-edit grid grid-cols-[1fr_1fr] gap-[var(--editorial-gap)] pt-[var(--editorial-gap)] items-start max-[700.01px]:grid-cols-[1fr]"
        id="tailoring-edit"
        aria-label="The tailoring edit"
      >
        <div className="sticky-editorial sticky top-[57px] h-[calc(100svh_-_57px)] min-h-[570px] [background:#b3b6b0] [color:white] isolate [&_>_img]:w-[100%] [&_>_img]:h-[100%] [&_>_img]:object-cover [&_>_img]:object-[50%_20%] [&_>_img]:absolute [&_>_img]:inset-[0] [&_>_img]:z-[-2] [&::after]:[content:''] [&::after]:absolute [&::after]:inset-[0] [&::after]:z-[-1] [&::after]:[background:linear-gradient(0deg,_#0c171b91,_transparent_70%)] max-[700.01px]:relative max-[700.01px]:top-[auto] max-[700.01px]:h-[85svh] max-[700.01px]:min-h-[530px] max-[700.01px]:max-h-[850px]">
          <img
            src={homeImages.tailoring}
            alt="Refined tailoring from the Aura BOED edit"
            loading="lazy"
          />
          <div
            data-reveal=""
            className="sticky-editorial-copy absolute bottom-[40px] left-[5%] right-[5%] [&_h2]:[font-family:var(--sans)] [&_h2]:[font-weight:var(--font-weight-normal,_400)] [&_h2]:[font-size:clamp(36px,_4.2vw,_82px)] [&_h2]:tracking-[-0.055em] [&_h2]:leading-[1.08] [&_h2]:m-[18px_0_26px] max-[1000.01px]:[&_h2]:[font-size:40px] max-[700.01px]:left-[6%] max-[700.01px]:bottom-[30px] max-[700.01px]:[&_h2]:[font-size:48px]"
          >
            <span className="editorial-kicker block [font-size:10px] [font-weight:var(--font-weight-semibold,_600)] tracking-[0.22em] leading-[1.6]">
              CONSIDERED IN EVERY DETAIL
            </span>
            <h2>
              100% Made in Italy
              <br />
              Tailoring
            </h2>
            <Link
              className="editorial-button min-h-[50px] min-w-[245px] inline-flex items-center justify-between gap-[35px] p-[16px_24px] [font-size:10px] [font-weight:var(--font-weight-semibold,_600)] tracking-[0.04em] [transition:background_0.2s,_color_0.2s] max-[1000.01px]:min-w-[205px] max-[1000.01px]:p-[15px_19px] max-[1000.01px]:[font-size:9px] max-[1000.01px]:gap-[20px] button-outline [border:1px_solid_#fff] [color:#fff] [&:hover]:[background:#fff] [&:hover]:[color:#242620]"
              href="/collections/suits"
            >
              VIEW ALL SUITS <Icon name="arrow-right" size={16} />
            </Link>
          </div>
        </div>
        <div className="tailoring-products grid grid-cols-[repeat(2,_minmax(0,_1fr))] gap-[0_var(--editorial-gap)] [&_.product-media]:[aspect-ratio:2_/_3] [&_.product-media_img]:object-[center_top] [&_.product-meta]:p-[17px_12px_24px] [&_.product-meta]:min-h-[100px] [&_.product-color]:hidden [&_.product-name]:[font-size:11px] [&_.product-name]:[font-weight:var(--font-weight-normal,_400)] [&_.product-price]:[font-size:10px] [&_.product-price]:mt-[10px] [&_.product-badge]:hidden max-[700.01px]:[&_.product-meta]:min-h-[110px] max-[700.01px]:[&_.product-meta]:p-[14px_10px_22px] max-[700.01px]:[&_.product-name]:[font-size:10px]">
          {featuredProducts.map(
            (product) =>
              product && <ProductCard key={product.id} product={product} />,
          )}
        </div>
      </section>

      <section
        className="collection-mosaic"
        aria-labelledby="collection-mosaic-title"
      >
        <div
          data-reveal=""
          className="editorial-section-heading text-center p-[95px_20px_60px] [&_.editorial-kicker]:[color:#89887c] [&_.editorial-kicker]:[font-size:9px] [&_h2]:[font-family:var(--serif)] [&_h2]:[font-size:clamp(34px,_3.6vw,_60px)] [&_h2]:[font-weight:var(--font-weight-normal,_400)] [&_h2]:tracking-[-0.025em] [&_h2]:m-[15px_0_13px] [&_p]:[color:#8d8d83] [&_p]:[font-size:12px] [&_p]:m-[0] max-[700.01px]:p-[65px_24px_35px] max-[700.01px]:[&_h2]:[font-size:39px] max-[700.01px]:[&_p]:[font-size:11px] max-[700.01px]:[&_p]:leading-[1.8]"
        >
          <span className="editorial-kicker block [font-size:10px] [font-weight:var(--font-weight-semibold,_600)] tracking-[0.22em] leading-[1.6]">
            A WARDROBE, WELL CONSIDERED
          </span>
          <h2 id="collection-mosaic-title">
            Find your everyday extraordinary.
          </h2>
          <p>Timeless pieces. A thousand ways to make them yours.</p>
        </div>
        <div className="mosaic-grid grid grid-cols-[repeat(12,_minmax(0,_1fr))] gap-[var(--editorial-gap)] max-[700.01px]:grid-cols-[repeat(6,_minmax(0,_1fr))]">
          {categoryTiles.map((tile) => (
            <Link
              data-reveal=""
              key={tile.label}
              href={tile.href}
              className={`mosaic-tile relative h-[clamp(400px,_44vw,_760px)] isolate overflow-hidden [color:white] [background:#dad8d0] [&_img]:absolute [&_img]:inset-[0] [&_img]:w-[100%] [&_img]:h-[100%] [&_img]:object-cover [&_img]:object-[50%_25%] [&_img]:z-[-2] [&_img]:[transition:transform_0.7s_ease] [&:hover_img]:[transform:scale(1.025)] [&::after]:[content:''] [&::after]:absolute [&::after]:inset-[0] [&::after]:z-[-1] [&::after]:[background:linear-gradient(0deg,_#16201c88,_transparent_55%)] motion-reduce:[&_img]:[transition:none] ${tile.className}`}
            >
              <img src={tile.image} alt={tile.title} loading="lazy" />
              <div className="mosaic-caption absolute left-[30px] right-[24px] bottom-[32px] [&_>_span:first-child]:[font-size:9px] [&_>_span:first-child]:tracking-[0.2em] [&_h3]:[font-family:var(--serif)] [&_h3]:[font-size:clamp(32px,_3vw,_50px)] [&_h3]:[font-weight:var(--font-weight-normal,_400)] [&_h3]:leading-[1.05] [&_h3]:m-[10px_0_20px] max-[1000.01px]:left-[20px] max-[700.01px]:left-[17px] max-[700.01px]:bottom-[23px] max-[700.01px]:[&_h3]:[font-size:30px] max-[700.01px]:[&_>_span:first-child]:[font-size:8px]">
                <span>{tile.label}</span>
                <h3>{tile.title}</h3>
                <span className="mosaic-cta flex items-center gap-[22px] [font-size:9px] tracking-[0.1em] max-[700.01px]:gap-[15px] max-[700.01px]:[font-size:8px]">
                  DISCOVER <Icon name="arrow-right" size={16} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section
        className="collection-story grid grid-cols-[1fr_1fr] gap-[0] p-[80px_12px] [scroll-margin-top:80px] max-[700.01px]:grid-cols-[1fr] max-[700.01px]:p-[45px_0_60px]"
        id="our-story"
      >
        <div
          data-reveal=""
          className="collection-story-image h-[clamp(600px,_58vw,_1000px)] overflow-hidden bg-[#e8e8e2] max-[700.01px]:h-[620px]"
        >
          <video
            className="h-full w-full object-cover object-[center_20%]"
            data-story-video
            data-src={homeImages.story}
            aria-label="A closer look at the textures of Italian knitwear"
            muted
            loop
            playsInline
            controls
            preload="none"
          />
        </div>
        <div className="collection-story-copy [align-self:center] p-[60px_10%] [&_.editorial-kicker]:[color:#8b8c80] [&_.editorial-kicker]:[font-size:9px] [&_h2]:[font-size:clamp(36px,_3.3vw,_60px)] [&_h2]:[font-family:var(--serif)] [&_h2]:[font-weight:var(--font-weight-normal,_400)] [&_h2]:leading-[1.08] [&_h2]:tracking-[-0.025em] [&_h2]:m-[24px_0_30px] [&_p]:max-w-[540px] [&_p]:[font-size:13px] [&_p]:leading-[1.9] [&_p]:[color:#7d8075] [&_p]:mb-[22px] [&_p.collection-story-detail]:[font-size:11px] [&_p.collection-story-detail]:[color:#454d41] [&_p.collection-story-detail]:m-[30px_0] max-[1000.01px]:p-[40px_9%] max-[700.01px]:p-[45px_7%_0] max-[700.01px]:[&_h2]:[font-size:43px] max-[700.01px]:[&_h2]:m-[18px_0_24px] max-[700.01px]:[&_p]:[font-size:12px]">
          <span
            data-reveal="100"
            className="editorial-kicker block [font-size:10px] [font-weight:var(--font-weight-semibold,_600)] tracking-[0.22em] leading-[1.6]"
          >
            THE KNITWEAR COLLECTION
          </span>
          <h2 data-reveal="200">
            Exceptional texture.
            <br />
            Effortless character.
          </h2>
          <p data-reveal="300">
            Quietly distinctive pieces for the way you live. Explore soft
            knitwear, considered proportions and the easy elegance of a
            well-chosen layer.
          </p>
          <p data-reveal="300" className="collection-story-detail">
            From fine knits to textured favourites, discover the pieces that
            bring your wardrobe together.
          </p>
          <Link
            data-reveal="400"
            href="/collections/knitwear"
            className="editorial-button min-h-[50px] min-w-[245px] inline-flex items-center justify-between gap-[35px] p-[16px_24px] [font-size:10px] [font-weight:var(--font-weight-semibold,_600)] tracking-[0.04em] [transition:background_0.2s,_color_0.2s] max-[1000.01px]:min-w-[205px] max-[1000.01px]:p-[15px_19px] max-[1000.01px]:[font-size:9px] max-[1000.01px]:gap-[20px] button-dark-outline [border:1px_solid_#343731] [color:#343731] [&:hover]:[background:#343731] [&:hover]:[color:#fff]"
          >
            DISCOVER THE COLLECTION <Icon name="arrow-right" size={16} />
          </Link>
        </div>
      </section>

      <section
        className="summer-campaign h-[85svh] min-h-[600px] max-h-[1100px] [background:#ad9472] relative isolate [color:#fff] max-[700.01px]:min-h-[640px] max-[700.01px]:h-[85svh] max-[700.01px]:max-h-[900px]"
        aria-labelledby="summer-title"
      >
        <picture className="absolute inset-0 -z-[2] block">
          <source
            media="(max-width: 700px)"
            srcSet={encodeURI(homeImages.summerMobile)}
          />
          <img
            className="h-full w-full object-cover object-top max-[700.01px]:object-center"
            src={homeImages.summer}
            alt="Relaxed summer dressing in warm natural light"
            loading="lazy"
          />
        </picture>
        <div className="campaign-shade absolute inset-[0] z-[-1] [background:linear-gradient(90deg,_#161d1a66_0%,_#161d1a08_75%),_linear-gradient(0deg,_#111a205c,_transparent_65%)]" />
        <div
          data-reveal=""
          className="summer-copy absolute bottom-[12%] left-[4%] [&_h2]:[font-family:var(--serif)] [&_h2]:[font-weight:var(--font-weight-normal,_400)] [&_h2]:[font-size:clamp(65px,_7.5vw,_140px)] [&_h2]:leading-[0.92] [&_h2]:tracking-[-0.035em] [&_h2]:m-[20px_0_24px] [&_p]:[font-size:12px] [&_p]:mb-[30px] max-[700.01px]:left-[6%] max-[700.01px]:bottom-[12%] max-[700.01px]:[&_h2]:[font-size:clamp(52px,_16vw,_75px)] max-[700.01px]:[&_.editorial-kicker]:[font-size:8px]"
        >
          <span className="editorial-kicker block [font-size:10px] [font-weight:var(--font-weight-semibold,_600)] tracking-[0.22em] leading-[1.6]">
            LONG DAYS. LIGHTER LAYERS.
          </span>
          <h2 id="summer-title">
            A slower kind
            <br />
            of summer.
          </h2>
          <p>Linen, cotton and a little room to breathe.</p>
          <Link
            className="editorial-button min-h-[50px] min-w-[245px] inline-flex items-center justify-between gap-[35px] p-[16px_24px] [font-size:10px] [font-weight:var(--font-weight-semibold,_600)] tracking-[0.04em] [transition:background_0.2s,_color_0.2s] max-[1000.01px]:min-w-[205px] max-[1000.01px]:p-[15px_19px] max-[1000.01px]:[font-size:9px] max-[1000.01px]:gap-[20px] button-white [background:#faf9f6] [color:#242620] [&:hover]:[background:#e6e2d9]"
            href="/collections/summer"
          >
            SHOP NOW <Icon name="arrow-right" size={16} />
          </Link>
        </div>
        <span className="summer-caption absolute bottom-[25px] right-[3%] [font-size:8px] tracking-[0.2em] max-[700.01px]:[font-size:7px] max-[700.01px]:right-[6%]">
          THE SUMMER COLLECTION / AURA BOED
        </span>
      </section>

      <section
        className="media-section p-[66px_0_40px] text-center overflow-hidden [&_h2]:[font-size:10px] [&_h2]:m-[0_0_42px] max-[700.01px]:pt-[50px]"
        aria-labelledby="media-title"
      >
        <h2
          className="editorial-kicker block [font-size:10px] [font-weight:var(--font-weight-semibold,_600)] tracking-[0.22em] leading-[1.6]"
          id="media-title"
        >
          STYLE IN THE MEDIA
        </h2>
        <div
          className="media-marquee overflow-hidden p-[10px_0] [&:hover_.media-track]:[animation-play-state:paused] [&:focus_.media-track]:[animation-play-state:paused]"
          tabIndex={0}
          aria-label="Media mastheads. Animation pauses on hover or focus."
        >
          <div className="media-track flex w-[max-content] animate-media-drift motion-reduce:[animation:none]">
            {[0, 1].map((copy) => (
              <div
                className="media-group flex items-center [flex-shrink:0]"
                aria-hidden={copy === 1 || undefined}
                key={copy}
              >
                {media.map((name, index) => (
                  <span
                    key={name}
                    className={`media-wordmark [color:#bbbcb7] min-w-[210px] p-[0_35px] [font-size:32px] leading-[1.4] [font-family:Georgia,_serif] [font-weight:var(--font-weight-bold,_700)] max-[700.01px]:min-w-[165px] max-[700.01px]:p-[0_25px] ${mediaWordmarkStyles[index]}`}
                  >
                    {name}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
        <p className="media-preview-note [font-size:9px] [color:#aaa99f] m-[28px_0_0]">
          Media mastheads shown for design preview.
        </p>
      </section>
    </HomeMotion>
  );
}
