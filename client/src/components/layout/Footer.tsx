import { useState } from 'react';
import { Link } from 'react-router';
import { Accordion, AccordionItem } from '@/components/ui/misc';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const faq = [
  ['Mogu li naručiti lijekove putem telefona?', 'Da, možete. Naš tim će pripremiti vaše lijekove i isti će u kratkom vremenskom roku biti spremni za preuzimanje u apoteci.'],
  ['Nudite li savjetovanje o upotrebi lijekova?', 'Naravno. Naši farmaceuti će vam objasniti pravilnu upotrebu, doziranje i moguće interakcije s drugim proizvodima.'],
  ['Mogu li dobiti savjet pri odabiru kozmetike ili dodataka prehrani?', 'Naravno! Naši stručni farmaceuti mogu preporučiti najbolje proizvode za njegu kože ili dodatke prehrani prema vašim individualnim potrebama.'],
  ['Nudite li prirodne ili biljne proizvode?', 'Da, nudimo širok izbor prirodnih, biljnih i dodataka prehrani pažljivo odabranih za podršku vašem zdravlju i dobrobiti.'],
  ['Mogu li dobiti lijek uz recept?', 'Naravno. Donesite važeći recept, a naši farmaceuti će pripremiti vaše lijekove brzo i sigurno.'],
] as const;

export function FaqDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Često postavljana pitanja" className="max-w-2xl">
        <Accordion type="single" collapsible defaultValue="0">
          {faq.map(([q, a], i) => (
            <AccordionItem key={q} value={String(i)} question={q}>
              {a}
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mt-6 flex justify-end">
          <Button size="sm" onClick={() => onOpenChange(false)}>
            Zatvori
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
    <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07" />
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
  </svg>
);

const hours = [
  ['Pon - Pet', '08:00 - 20:30'],
  ['Sub', '08:00 - 15:30'],
  ['Ned', '09:00 - 13:00'],
];

export function Footer() {
  const [faqOpen, setFaqOpen] = useState(false);
  const linkClass = 'text-sm text-ink/70 transition hover:text-brand';
  return (
    <footer className="mt-20 space-y-4 pb-6">
      <div className="grid gap-8 rounded-2xl bg-white p-8 shadow-card md:grid-cols-3 md:p-10">
        <div>
          <h4 className="mb-4 font-semibold">IBO & CO</h4>
          <address className="mb-4 text-sm not-italic leading-relaxed text-ink/70">
            Teheranski Trg 7, 71000 Sarajevo,
            <br />
            Bosna i Hercegovina
          </address>
          <p className="mb-1">
            <a href="tel:+38733760845" className={linkClass}>
              033 760 845
            </a>
          </p>
          <p>
            <a href="mailto:apotekaiboco@hotmail.com" className={linkClass}>
              apotekaiboco@hotmail.com
            </a>
          </p>
        </div>
        <div>
          <h4 className="mb-4 font-semibold">Brzi linkovi</h4>
          <ul className="space-y-2">
            <li><Link to="/about" className={linkClass}>O nama</Link></li>
            <li><Link to="/shop" className={linkClass}>Shop</Link></li>
            <li><Link to="/privacy-policy" className={linkClass}>Politika privatnosti</Link></li>
            <li>
              <button type="button" onClick={() => setFaqOpen(true)} className={linkClass}>
                Često postavljana pitanja
              </button>
            </li>
            <li><Link to="/locations" className={linkClass}>Lokacije</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 font-semibold">Radno vrijeme</h4>
          <p className="mb-4 text-sm leading-relaxed text-ink/70">
            Uvijek nastojimo pružiti gostoljubivu atmosferu i isporučiti iznimnu uslugu.
          </p>
          <dl className="space-y-1 text-sm">
            {hours.map(([d, h]) => (
              <div key={d} className="flex gap-4">
                <dt className="w-20 font-semibold">{d}:</dt>
                <dd className="text-ink/60">{h}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-white px-8 py-5 shadow-card sm:flex-row">
        <Link to="/" aria-label="IBO & CO početna">
          <img src="/images/logo.png" alt="IBO & CO" className="h-12 w-auto" />
        </Link>
        <p className="text-sm text-ink/60">© {new Date().getFullYear()}. Sva prava zadržana.</p>
        <div className="flex gap-4 text-ink/70">
          <a href="https://www.facebook.com/apotekaibocopzu/" target="_blank" rel="noreferrer" aria-label="Facebook" className="transition hover:text-brand">
            <FacebookIcon />
          </a>
          <a href="https://www.instagram.com/apotekaiboco/" target="_blank" rel="noreferrer" aria-label="Instagram" className="transition hover:text-brand">
            <InstagramIcon />
          </a>
        </div>
      </div>
      <FaqDialog open={faqOpen} onOpenChange={setFaqOpen} />
    </footer>
  );
}
