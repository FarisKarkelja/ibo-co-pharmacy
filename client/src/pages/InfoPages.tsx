import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema, type ContactInput } from '@ibo/shared';
import { Award, Clock, ExternalLink, Mail, MapPin, Phone, Rotate3d, Send, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { useSendContact } from '@/api/admin';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, Input, Textarea } from '@/components/ui/input';
import { IconBadge } from '@/components/ui/misc';
import { handleFormError } from '@/lib/form';

// ---------------- O nama ----------------

export function AboutPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader title="O nama" crumbs={[{ label: 'O nama' }]} />
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-5 text-sm leading-7 text-ink/75">
          <p>
            Apoteka IBO & CO je privatna zdravstvena ustanova koja je započela s radom 1999. godine. Naš tim čine stručno
            osposobljeni i posvećeni profesionalci koji su usmjereni na brigu o zdravlju naših korisnika. Tokom godina izgradili
            smo snažnu reputaciju zahvaljujući pouzdanoj, odgovornoj i ljubaznoj usluzi.
          </p>
          <p>
            Pružamo širok spektar usluga usmjerenih na očuvanje i unapređenje zdravlja, uključujući pripremu i izdavanje
            lijekova, mjerenje krvnog pritiska te kontrolu nivoa šećera u krvi. Naš cilj je pružiti visokokvalitetnu zdravstvenu
            njegu i stručno savjetovanje kako bismo našim korisnicima pomogli da svakodnevno vode zdraviji život.
          </p>
          <p>
            U apoteci IBO & CO vjerujemo u izgradnju dugoročnih i kvalitetnih odnosa s našim korisnicima. Poseban akcenat
            stavljamo na individualni pristup, profesionalnu uslugu i jasnu komunikaciju u ugodnom i sigurnom okruženju.
            Povjerenje i zadovoljstvo naših korisnika predstavljaju mjerilo našeg uspjeha. Tu smo da Vas pouzdano pratimo na
            putu ka boljem zdravlju i kvalitetnijem životu.
          </p>
          <div className="grid gap-4 pt-4 sm:grid-cols-3">
            {[
              { icon: Users, value: '8', label: 'Stručnih zaposlenih' },
              { icon: Clock, value: '25+', label: 'Godina iskustva' },
              { icon: Award, value: 'AKAZ', label: 'Certifikacija' },
            ].map((s) => (
              <Card key={s.label} className="p-5 text-center">
                <s.icon className="mx-auto size-6 text-brand" />
                <p className="mt-2 text-2xl font-semibold text-ink">{s.value}</p>
                <p className="text-xs text-muted">{s.label}</p>
              </Card>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <img src="/images/about-us.webp" alt="Farmaceut u apoteci IBO & CO" className="aspect-[4/3] w-full rounded-3xl object-cover shadow-card" />
          <Card className="flex flex-col items-center gap-5 p-6 sm:flex-row">
            <img src="/images/certification.png" alt="AKAZ certifikat" className="h-14 w-auto" loading="lazy" />
            <div>
              <h2 className="font-semibold">Certifikacija</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Ova apoteka je zvanično certificirana od strane AKAZ agencije za unapređenje kvaliteta u zdravstvu, čime se
                potvrđuje ispunjavanje najviših standarda kvaliteta, sigurnosti i profesionalne zdravstvene usluge.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ---------------- Lokacije ----------------

const locations = [
  {
    name: 'Teheranski Trg 7',
    image: '/images/location-teheranski-trg.webp',
    phone: '+387 33 760 845',
    hours: [['Radni dani', '08:00 - 20:30'], ['Subota', '08:00 - 15:30'], ['Nedjelja', '09:00 - 13:00']],
    map: 'https://maps.app.goo.gl/jkuMXzH8Fdd1ZWBU9',
    tour: 'https://www.google.com/maps/place/Apoteka+IBO%26CO+P.Z.U./@43.8395234,18.3417003,3a,90y,122.35h,90.57t/data=!3m7!1e1!3m5!1sCIHM0ogKEICAgIC56_nZwAE!2e10',
  },
  {
    name: 'Patriotske Lige 35',
    image: '/images/location-patriotske-lige.webp',
    phone: '+387 33 214 444',
    hours: [['Radni dani', '08:00 - 19:00'], ['Subota', '08:00 - 15:30'], ['Nedjelja', 'Zatvoreno']],
    map: 'https://maps.app.goo.gl/rvQYbuVqLT2iGKFWA',
    tour: 'https://www.google.com/maps/place/Apoteka+IBO%26CO+Ogranak+1/@43.874272,18.4120722,3a,90y,259.42h,88.18t/data=!3m7!1e1!3m5!1sCIHM0ogKEICAgIDq75yYJg!2e10',
  },
];

export function LocationsPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader title="Lokacije" description="Posjetite nas u jednoj od naše dvije apoteke u Sarajevu." crumbs={[{ label: 'Lokacije' }]} />
      <div className="grid gap-6 lg:grid-cols-2">
        {locations.map((l) => (
          <Card key={l.name} className="overflow-hidden">
            <div className="relative">
              <img src={l.image} alt={`Apoteka IBO & CO, ${l.name}`} loading="lazy" className="aspect-[16/9] w-full object-cover" />
              <a
                href={l.tour}
                target="_blank"
                rel="noreferrer"
                className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold shadow transition hover:bg-brand hover:text-white"
              >
                <Rotate3d className="size-4" /> 360°
              </a>
            </div>
            <div className="space-y-5 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand">IBO & CO</p>
                <h2 className="mt-1 text-xl font-semibold">{l.name}</h2>
              </div>
              <div className="grid gap-5 text-sm sm:grid-cols-2">
                <div className="space-y-3">
                  <p className="flex gap-2">
                    <MapPin className="size-4 shrink-0 text-brand" /> {l.name}, Sarajevo, Bosna i Hercegovina
                  </p>
                  <a href={`tel:${l.phone.replace(/\s/g, '')}`} className="flex gap-2 hover:text-brand">
                    <Phone className="size-4 shrink-0 text-brand" /> {l.phone}
                  </a>
                </div>
                <dl className="space-y-1">
                  {l.hours.map(([d, h]) => (
                    <div key={d} className="flex justify-between gap-3">
                      <dt className="text-muted">{d}:</dt>
                      <dd className="font-medium">{h}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href={l.map} target="_blank" rel="noreferrer">
                  Prikaži na mapi <ExternalLink />
                </a>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ---------------- Kontakt ----------------

export function ContactPage() {
  const send = useSendContact();
  const { register, handleSubmit, formState, setError, reset } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { fullName: '', email: '', message: '' },
  });

  const onSubmit = handleSubmit((values) =>
    send.mutate(values, {
      onSuccess: (res) => {
        toast.success(res.message);
        reset();
      },
      onError: (err) => handleFormError(err, setError),
    }),
  );

  return (
    <div className="animate-fade-in">
      <PageHeader title="Kontakt" description="Imate pitanje o proizvodu, terapiji ili narudžbi? Pišite nam." crumbs={[{ label: 'Kontakt' }]} />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="relative hidden overflow-hidden rounded-3xl lg:block">
          <img src="/images/contact.webp" alt="" className="absolute inset-0 size-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 space-y-3 p-8 text-sm text-white">
            <p className="flex items-center gap-2"><Phone className="size-4" /> 033 760 845</p>
            <p className="flex items-center gap-2"><Mail className="size-4" /> apotekaiboco@hotmail.com</p>
            <p className="flex items-center gap-2"><MapPin className="size-4" /> Teheranski Trg 7, Sarajevo</p>
          </div>
        </div>
        <Card className="p-6 sm:p-10">
          <div className="mb-8 flex items-center gap-4">
            <IconBadge icon={Send} className="size-12" />
            <div>
              <h2 className="text-lg font-semibold">Pošaljite poruku</h2>
              <p className="text-sm text-muted">Odgovaramo u toku radnog dana.</p>
            </div>
          </div>
          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            <Field label="Ime i prezime" error={formState.errors.fullName?.message}>
              <Input {...register('fullName')} autoComplete="name" />
            </Field>
            <Field label="Email" error={formState.errors.email?.message}>
              <Input type="email" {...register('email')} autoComplete="email" />
            </Field>
            <Field label="Poruka" error={formState.errors.message?.message}>
              <Textarea {...register('message')} rows={6} maxLength={2000} />
            </Field>
            <p className="text-xs text-muted">
              Slanjem poruke prihvatate našu{' '}
              <Link to="/privacy-policy" className="text-brand hover:underline">
                politiku privatnosti
              </Link>
              .
            </p>
            <Button type="submit" loading={send.isPending} className="w-full sm:w-auto">
              <Send /> Pošalji
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

// ---------------- Politika privatnosti ----------------

const policy: { title: string; body: (string | string[])[] }[] = [
  {
    title: 'Pregled',
    body: [
      'Ova Politika privatnosti opisuje kako Apoteka IBO & CO prikuplja, koristi i štiti vaše lične podatke kada koristite naše usluge, uključujući registraciju, kupovinu u apoteci i interakciju sa našom web stranicom.',
    ],
  },
  {
    title: 'Nalog i registracija',
    body: [
      'Za pristup određenim funkcijama, kao što su upravljanje narudžbama ili personalizovane preporuke, možete kreirati nalog registracijom sa:',
      ['Ime i prezime', 'Adresa e-pošte', 'Broj telefona', 'Lozinka'],
      'Podaci za prijavu čuvaju se sigurno. Nikada ne dijelite svoju lozinku. Vaše kontakt informacije možemo koristiti za obavještavanje o vašem nalogu, terminima ili važnim informacijama vezanim za apoteku.',
    ],
  },
  {
    title: 'Kupovina i narudžbe',
    body: [
      'Apoteka IBO & CO pruža online katalog i korpu radi vaše udobnosti. Ipak:',
      [
        'Sve kupovine se završavaju u apoteci; online plaćanja nisu omogućena na našoj web stranici.',
        'Narudžbe putem interneta su rezervisane za preuzimanje u odabranoj apoteci.',
        'Za lijekove koji se izdaju na recept potrebno je donijeti važeći recept pri preuzimanju.',
        'Možemo prikupljati informacije o odabranim proizvodima i preferiranoj lokaciji za preuzimanje.',
      ],
    ],
  },
  {
    title: 'Prikupljanje informacija',
    body: [
      'Informacije koje pružate:',
      ['Podaci za registraciju naloga (ime, e-mail, telefon, lozinka)', 'Preferencije kupovine i podaci o narudžbama', 'Povratne informacije ili poruke poslane putem web stranice ili obrazaca'],
      'Informacije koje se automatski prikupljaju:',
      ['Podaci o uređaju (tip preglednika, operativni sistem)', 'Log podaci (IP adresa, vremenski pečati)', 'Podaci o korištenju web stranice (posjećene stranice, vrijeme provedeno)'],
    ],
  },
  {
    title: 'Korištenje informacija',
    body: [
      'Prikupljene informacije koristimo kako bismo:',
      [
        'Pružili i unaprijedili naše usluge',
        'Pomogli pri obradi narudžbi i preuzimanju u apoteci',
        'Slali važne obavijesti o narudžbama, promocijama ili promjenama politike',
        'Poboljšali performanse web stranice i korisničko iskustvo',
        'Spriječili neovlašten pristup, prevare i zloupotrebe',
      ],
    ],
  },
  {
    title: 'Dijeljenje informacija',
    body: [
      'Vaše informacije možemo dijeliti sa:',
      ['Osobljem apoteke radi obrade narudžbi u apoteci', 'Provajderima usluga koji pomažu u hostingu web stranice ili IT uslugama', 'Pravnim vlastima kada to zahtijeva zakon'],
    ],
  },
  {
    title: 'Sigurnost podataka',
    body: [
      'Primjenjujemo odgovarajuće mjere za zaštitu vaših ličnih podataka, uključujući:',
      ['Šifriranje lozinki i osjetljivih podataka', 'Kontrole pristupa samo ovlaštenom osoblju', 'Redovno praćenje sistema'],
    ],
  },
  {
    title: 'Vaša prava',
    body: [
      'Imate pravo da:',
      ['Pristupite svojim ličnim podacima', 'Zatražite ispravke ili ažuriranja', 'Obrišete svoj nalog i podatke (u postavkama profila)', 'Uložite prigovor na obradu svojih podataka'],
      'Za ostvarivanje svojih prava, kontaktirajte nas putem podataka ispod.',
    ],
  },
  {
    title: 'Ažuriranje politike',
    body: [
      'Povremeno možemo ažurirati ovu Politiku privatnosti. Značajne promjene biće objavljene na našoj web stranici, a kada je prikladno, i putem e-maila.',
    ],
  },
];

export function PrivacyPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader title="Politika privatnosti" description="Posljednja izmjena: 20. novembar 2025." crumbs={[{ label: 'Politika privatnosti' }]} />
      <Card className="max-w-4xl p-6 sm:p-10">
        <div className="space-y-8">
          {policy.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold">{section.title}</h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-ink/75">
                {section.body.map((b, i) =>
                  Array.isArray(b) ? (
                    <ul key={i} className="list-disc space-y-1 pl-5 marker:text-brand">
                      {b.map((li) => (
                        <li key={li}>{li}</li>
                      ))}
                    </ul>
                  ) : (
                    <p key={i}>{b}</p>
                  ),
                )}
              </div>
            </section>
          ))}
          <section className="rounded-2xl bg-surface p-6 text-sm">
            <h2 className="text-lg font-semibold">Kontaktirajte nas</h2>
            <p className="mt-2 text-ink/75">Ako imate pitanja u vezi ove Politike privatnosti, kontaktirajte nas na:</p>
            <ul className="mt-3 space-y-1">
              <li>E-mail: apotekaiboco1@hotmail.com</li>
              <li>Adresa: Teheranski Trg 7</li>
              <li>Telefon: +387 33 760 845</li>
            </ul>
          </section>
        </div>
      </Card>
    </div>
  );
}
