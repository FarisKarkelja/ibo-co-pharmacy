import useEmblaCarousel from 'embla-carousel-react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Droplet,
  HeartHandshake,
  HeartPulse,
  MessagesSquare,
  Play,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useMe } from '@/api/auth';
import { useProducts } from '@/api/catalog';
import { useReviewSummary, useReviews } from '@/api/reviews';
import { ProductCard, ProductCardSkeleton } from '@/components/ProductCard';
import { ReviewFormDialog, ReviewsCarousel } from '@/components/Reviews';
import { Button } from '@/components/ui/button';
import { Card, SectionHeading } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { IconBadge, Stars } from '@/components/ui/misc';

const HERO_TEXT = 'Sigurnija i zdravija budućnost';

/** Typewriter effect for the hero title (typed.js in v1). */
function useTyped(text: string, speed = 70) {
  const [shown, setShown] = useState('');
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(text);
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return shown;
}

function Hero() {
  const typed = useTyped(HERO_TEXT);
  const [videoOpen, setVideoOpen] = useState(false);
  return (
    <section className="relative isolate overflow-hidden rounded-3xl">
      <img src="/images/home-bg.webp" alt="" className="absolute inset-0 -z-10 size-full object-cover" fetchPriority="high" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/75 via-black/55 to-black/30" />
      <div className="flex min-h-[78vh] flex-col items-center justify-center px-6 py-24 text-center text-white">
        <h1 className="min-h-[2.5em] text-3xl font-semibold tracking-tight sm:min-h-[1.3em] sm:text-5xl lg:text-6xl" aria-label={HERO_TEXT}>
          <span aria-hidden="true">
            {typed}
            <span className="ml-0.5 inline-block h-[0.9em] w-[3px] translate-y-[0.1em] animate-caret bg-brand" />
          </span>
        </h1>
        <span className="mt-5 block h-1 w-20 rounded-full bg-brand" />
        <p className="mt-6 text-base text-white/85 sm:text-lg">Vaše zdravlje je naša briga</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button size="lg" onClick={() => setVideoOpen(true)}>
            <Play className="fill-current" /> Pogledajte video
          </Button>
          <Button size="lg" variant="secondary" asChild className="border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white hover:text-ink">
            <Link to="/shop">
              Posjetite shop <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent title="Apoteka IBO & CO" className="max-w-4xl p-3 sm:p-4">
          <video src="/video/pharmacy.mp4" poster="/images/video-poster.jpg" controls autoPlay playsInline className="aspect-video w-full rounded-xl bg-black" />
        </DialogContent>
      </Dialog>
    </section>
  );
}

const services = [
  {
    icon: Droplet,
    title: 'Mjerenje šećera u krvi',
    text: 'Brzo i precizno mjerenje nivoa glukoze, uz jasno objašnjenje rezultata i savjete za svakodnevnu kontrolu.',
  },
  {
    icon: MessagesSquare,
    title: 'Konsultacije',
    text: 'Individualni razgovori sa farmaceutom o terapiji, suplementima i pravilnoj primjeni lijekova.',
  },
  {
    icon: HeartPulse,
    title: 'Mjerenje krvnog pritiska',
    text: 'Kontrolisano i pouzdano mjerenje krvnog pritiska u mirnom okruženju, uz stručno tumačenje rezultata.',
  },
];

function Services() {
  return (
    <section className="mt-20">
      <SectionHeading title="Naše usluge" subtitle="Pružamo vrhunske farmaceutske usluge prilagođene vašim potrebama" />
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {services.map((s) => (
          <Card key={s.title} className="group p-8 text-center transition duration-300 hover:-translate-y-1">
            <IconBadge icon={s.icon} className="mx-auto transition group-hover:scale-110" />
            <h3 className="mt-6 font-semibold">{s.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">{s.text}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

function AboutTeaser() {
  return (
    <section className="mt-24 grid items-center gap-10 lg:grid-cols-2">
      <div>
        <SectionHeading title="O nama" align="left" />
        <p className="mt-6 text-sm leading-7 text-ink/75">
          Dobrodošli u apoteku IBO & CO, Vaše pouzdano mjesto za profesionalne i kvalitetne farmaceutske usluge. Posvećeni smo
          očuvanju i unapređenju Vašeg zdravlja kroz stručne savjete, provjerene lijekove i pouzdane zdravstvene informacije.
        </p>
        <p className="mt-4 text-sm leading-7 text-ink/75">
          Naša misija je učiniti brigu o zdravlju jednostavnom, sigurnom i dostupnom. Sa timom iskusnih farmaceuta i modernim
          pristupom, pružamo personalizovanu njegu svakom pacijentu.
        </p>
        <Button variant="outline" className="mt-8" asChild>
          <Link to="/about">
            Saznajte više <ArrowRight />
          </Link>
        </Button>
      </div>
      <img src="/images/about-us.webp" alt="Farmaceut u apoteci IBO & CO" loading="lazy" className="aspect-[4/3] w-full rounded-3xl object-cover shadow-card" />
    </section>
  );
}

function FeaturedProducts() {
  const { data, isLoading } = useProducts({ featured: true, pageSize: 12 });
  const [emblaRef, embla] = useEmblaCarousel({ align: 'start', containScroll: 'trimSnaps' });
  return (
    <section className="mt-24">
      <SectionHeading title="Istaknuti proizvodi" subtitle="Pogledajte naše najpopularnije proizvode" />
      <div className="relative mt-10">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="-ml-5 flex py-2">
                {data?.items.map((p) => (
                  <div key={p.id} className="min-w-0 shrink-0 grow-0 basis-[78%] pl-5 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button variant="secondary" size="icon-sm" aria-label="Prethodni proizvodi" onClick={() => embla?.scrollPrev()}>
                <ChevronLeft />
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/products">Svi proizvodi</Link>
              </Button>
              <Button variant="secondary" size="icon-sm" aria-label="Sljedeći proizvodi" onClick={() => embla?.scrollNext()}>
                <ChevronRight />
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

const reasons = [
  { icon: HeartHandshake, title: 'Posvećena briga', text: 'Stručna i pažljiva usluga usmjerena na sigurnost i udobnost pacijenata' },
  { icon: ShieldCheck, title: 'Pouzdani lijekovi', text: 'Nudimo isključivo certificirane i visokokvalitetne lijekove' },
  { icon: RefreshCw, title: 'Brzo obnavljanje terapije', text: 'Jednostavno i brzo obnavljanje recepata kako biste uvijek imali potrebne lijekove' },
];

function WhyUs() {
  return (
    <section className="mt-24 grid items-center gap-10 lg:grid-cols-2">
      <img src="/images/why-choose-us.webp" alt="Police s lijekovima u apoteci" loading="lazy" className="order-2 aspect-[4/3] w-full rounded-3xl object-cover shadow-card lg:order-1" />
      <div className="order-1 lg:order-2">
        <SectionHeading title="Zašto mi" align="left" />
        <p className="mt-6 text-sm leading-7 text-ink/75">
          Uz snažnu posvećenost Vašem zdravlju, naš tim visoko obučenih farmaceutskih stručnjaka osigurava vrhunsku njegu i
          profesionalnu uslugu.
        </p>
        <ul className="mt-8 space-y-6">
          {reasons.map((r) => (
            <li key={r.title} className="flex gap-4">
              <IconBadge icon={r.icon} className="size-12" />
              <div>
                <h3 className="font-semibold">{r.title}</h3>
                <p className="mt-1 text-sm text-muted">{r.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ReviewsSection() {
  const { data: reviews, isLoading } = useReviews(9);
  const { data: summary } = useReviewSummary();
  const { data: user } = useMe();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <section className="mt-24">
      <SectionHeading title="Mišljenja korisnika" subtitle="Šta naši korisnici kažu o nama" />
      {summary && summary.count > 0 && (
        <div className="mt-6 flex items-center justify-center gap-3 text-sm">
          <span className="text-2xl font-semibold">{summary.average.toFixed(1)}</span>
          <Stars value={summary.average} size="md" />
          <Link to="/reviews" className="text-muted underline-offset-4 hover:text-brand hover:underline">
            ({summary.count} recenzija)
          </Link>
        </div>
      )}
      <div className="mt-10">
        <ReviewsCarousel reviews={reviews} loading={isLoading} />
      </div>
      <div className="mt-8 flex justify-center">
        <Button onClick={() => (user ? setOpen(true) : navigate('/login?redirect=/reviews'))}>Podijelite svoje mišljenje</Button>
      </div>
      <ReviewFormDialog open={open} onOpenChange={setOpen} />
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="animate-fade-in">
      <Hero />
      <Services />
      <AboutTeaser />
      <FeaturedProducts />
      <WhyUs />
      <ReviewsSection />
    </div>
  );
}
