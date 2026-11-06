// Demo data for local development and screenshots. No real customer data.

export const seedCategories = [
  { name: 'Lijekovi', description: 'Bezreceptni i receptni lijekovi za svakodnevne zdravstvene potrebe.', image: 'medicines.webp' },
  { name: 'Dodaci prehrani', description: 'Vitamini, minerali i suplementi za imunitet, energiju i vitalnost.', image: 'dietary-supplements.webp' },
  { name: 'Medicinska pomagala', description: 'Aparati za mjerenje pritiska i šećera, toplomjeri i inhalatori.', image: 'medical-devices.webp' },
  { name: 'Kozmetika', description: 'Dermokozmetika i njega kože, kose i noktiju.', image: 'cosmetics.webp' },
  { name: 'Sanitetski materijal', description: 'Zavoji, gaze, flasteri, rukavice i dezinfekcija.', image: 'medical-supplies.webp' },
  { name: 'Biljni preparati', description: 'Čajevi, sirupi i prirodni preparati na biljnoj bazi.', image: 'herbal-products.webp' },
] as const;

type SeedProduct = {
  name: string;
  description: string;
  price: number;
  category: (typeof seedCategories)[number]['name'];
  rx?: boolean;
  featured?: boolean;
  image?: string;
};

export const seedProducts: SeedProduct[] = [
  // Dodaci prehrani (featured products from the v1 home page)
  { name: 'Beauty Lift Collagen 10000 Intense', description: 'Doprinosi elastičnosti kože, zdravlju kose i noktiju te smanjenju znakova starenja.', price: 40.45, category: 'Dodaci prehrani', featured: true, image: 'beauty-lift-collagen.webp' },
  { name: 'Imuno Royal Jelly 1500', description: 'Podržava imunitet, povećava energiju i otpornost organizma.', price: 37.5, category: 'Dodaci prehrani', featured: true, image: 'imuno-royal-jelly.webp' },
  { name: 'Doppelherz Kollagen 11.000 Plus', description: 'Pomaže zdravlju zglobova, kostiju i kože te poboljšava pokretljivost.', price: 34.5, category: 'Dodaci prehrani', featured: true, image: 'doppelherz-kollagen.webp' },
  { name: 'OMNIflex Flex Vital 2+1 GRATIS', description: 'Doprinosi očuvanju hrskavice, fleksibilnosti zglobova i smanjenju ukočenosti.', price: 101.7, category: 'Dodaci prehrani', featured: true, image: 'omniflex-flex-vital.webp' },
  { name: 'Doppelherz Omega-3 1400', description: 'Podržava zdravlje srca, mozga i normalnu funkciju vida.', price: 20.3, category: 'Dodaci prehrani', featured: true, image: 'doppelherz-omega-3.webp' },
  { name: 'Vitamin C 1000 mg, 30 tableta', description: 'Doprinosi normalnoj funkciji imunološkog sistema i smanjenju umora.', price: 9.9, category: 'Dodaci prehrani' },
  { name: 'Vitamin D3 2000 IU kapi', description: 'Za zdrave kosti, zube i mišiće te normalnu funkciju imuniteta.', price: 14.2, category: 'Dodaci prehrani' },
  { name: 'Magnezij 375 mg šumeće tablete', description: 'Smanjuje umor i iscrpljenost, doprinosi normalnoj funkciji mišića.', price: 8.6, category: 'Dodaci prehrani' },

  // Lijekovi
  { name: 'Paracetamol 500 mg, 20 tableta', description: 'Za ublažavanje blagih do umjerenih bolova i snižavanje povišene temperature.', price: 3.2, category: 'Lijekovi' },
  { name: 'Ibuprofen 400 mg, 20 tableta', description: 'Ublažava bol, upalu i povišenu temperaturu.', price: 5.4, category: 'Lijekovi' },
  { name: 'Caffetin, 10 tableta', description: 'Za brzo ublažavanje glavobolje, zubobolje i menstrualnih bolova.', price: 4.8, category: 'Lijekovi' },
  { name: 'Amoksicilin 500 mg, 16 kapsula', description: 'Antibiotik za liječenje bakterijskih infekcija. Izdaje se isključivo uz recept.', price: 6.75, category: 'Lijekovi', rx: true },
  { name: 'Enalapril 10 mg, 20 tableta', description: 'Za liječenje povišenog krvnog pritiska. Izdaje se uz recept.', price: 4.1, category: 'Lijekovi', rx: true },
  { name: 'Lordes 5 mg, 10 tableta', description: 'Ublažava simptome alergijskog rinitisa i koprivnjače.', price: 7.3, category: 'Lijekovi' },
  { name: 'Metformin 850 mg, 30 tableta', description: 'Za regulaciju šećera u krvi kod dijabetesa tipa 2. Izdaje se uz recept.', price: 5.95, category: 'Lijekovi', rx: true },

  // Medicinska pomagala
  { name: 'Omron M3 aparat za pritisak', description: 'Automatski nadlaktični tlakomjer s detekcijom nepravilnog otkucaja srca.', price: 129.0, category: 'Medicinska pomagala' },
  { name: 'Accu-Chek Instant glukometar', description: 'Jednostavno i precizno mjerenje šećera u krvi uz Bluetooth povezivanje.', price: 49.9, category: 'Medicinska pomagala' },
  { name: 'Digitalni toplomjer', description: 'Brzo mjerenje temperature za 10 sekundi, vodootporan vrh.', price: 12.5, category: 'Medicinska pomagala' },
  { name: 'Inhalator kompresorski', description: 'Za inhalacijsku terapiju kod djece i odraslih, tih rad.', price: 89.0, category: 'Medicinska pomagala' },

  // Kozmetika
  { name: 'La Roche-Posay Effaclar gel', description: 'Gel za čišćenje masne i osjetljive kože sklone nepravilnostima.', price: 32.4, category: 'Kozmetika' },
  { name: 'Avène Cicalfate+ krema', description: 'Obnavljajuća zaštitna krema za oštećenu i iritiranu kožu.', price: 27.9, category: 'Kozmetika' },
  { name: 'Bioderma Sensibio H2O 250 ml', description: 'Micelarna voda za čišćenje i skidanje šminke za osjetljivu kožu.', price: 24.6, category: 'Kozmetika' },
  { name: 'Vichy Capital Soleil SPF 50+', description: 'Visoka zaštita od sunca za lice, lagana tekstura.', price: 38.9, category: 'Kozmetika' },

  // Sanitetski materijal
  { name: 'Hansaplast flasteri Universal, 20 kom', description: 'Vodootporni flasteri za male rane i ogrebotine.', price: 4.2, category: 'Sanitetski materijal' },
  { name: 'Sterilna gaza 10 x 10 cm, 10 kom', description: 'Sterilna gaza za previjanje i zaštitu rana.', price: 2.9, category: 'Sanitetski materijal' },
  { name: 'Elastični zavoj 8 cm', description: 'Za fiksaciju obloga i potporu kod uganuća.', price: 3.5, category: 'Sanitetski materijal' },
  { name: 'Nitrilne rukavice M, 100 kom', description: 'Jednokratne rukavice bez pudera, otporne na kidanje.', price: 14.9, category: 'Sanitetski materijal' },
  { name: 'Dezinfekcijski gel za ruke 500 ml', description: 'Brza dezinfekcija ruku bez vode, s aloe verom.', price: 7.8, category: 'Sanitetski materijal' },

  // Biljni preparati
  { name: 'Čaj od kamilice, 20 filter vrećica', description: 'Umirujući biljni čaj za probavu i opuštanje.', price: 3.4, category: 'Biljni preparati' },
  { name: 'Sirup od bršljana 100 ml', description: 'Biljni sirup za olakšavanje iskašljavanja kod produktivnog kašlja.', price: 11.9, category: 'Biljni preparati' },
  { name: 'Ehinacea kapi 50 ml', description: 'Biljni preparat za podršku imunitetu u hladnim mjesecima.', price: 13.5, category: 'Biljni preparati' },
  { name: 'Valerijana, 30 dražeja', description: 'Biljni preparat za smirenje i lakše uspavljivanje.', price: 8.2, category: 'Biljni preparati' },
];

/** Demo accounts. Credentials are documented in the README. */
export const seedAdmin = {
  fullName: 'Admin IBO & CO',
  email: 'admin@example.com',
  phone: '033760845',
  password: 'Admin123!',
};

export const seedCustomer = {
  fullName: 'Demo Kupac',
  email: 'kupac@example.com',
  phone: '061123456',
  password: 'Kupac123!',
};

export const seedExtraCustomers = [
  { fullName: 'Amra Hodžić', email: 'amra.hodzic@example.com', phone: '062345678' },
  { fullName: 'Kenan Begić', email: 'kenan.begic@example.com', phone: '061987654' },
  { fullName: 'Lejla Mehić', email: 'lejla.mehic@example.com', phone: '063112233' },
  { fullName: 'Tarik Softić', email: 'tarik.softic@example.com', phone: '066445566' },
  { fullName: 'Selma Kurtović', email: 'selma.kurtovic@example.com', phone: '062778899' },
];

export const seedReviews = [
  { rating: 5, location: 'Teheranski Trg 7', comment: 'Izuzetno ljubazno osoblje i stručni savjeti. Uvijek se vraćam u ovu apoteku.' },
  { rating: 5, location: 'Patriotske Lige 35', comment: 'Narudžbu sam preuzela za manje od sat vremena. Sve preporuke!' },
  { rating: 4, location: 'Both', comment: 'Dobar izbor dodataka prehrani i fer cijene. Online korpa je baš praktična.' },
  { rating: 5, location: 'Teheranski Trg 7', comment: 'Farmaceutkinja mi je detaljno objasnila terapiju i moguće nuspojave. Hvala!' },
  { rating: 4, location: 'Patriotske Lige 35', comment: 'Brzo mjerenje pritiska i šećera, bez čekanja.' },
  { rating: 5, location: 'Both', comment: 'Najbolja apoteka u gradu, uvijek imaju ono što mi treba.' },
  { rating: 3, location: 'Teheranski Trg 7', comment: 'Usluga je odlična, samo je subotom gužva u popodnevnim satima.' },
] as const;

export const seedMessages = [
  { fullName: 'Mirza Alić', email: 'mirza.alic@example.com', message: 'Da li imate na stanju Omron M3 tlakomjer u poslovnici na Patriotske Lige?' },
  { fullName: 'Ena Delić', email: 'ena.delic@example.com', message: 'Zanima me da li radite mjerenje šećera nedjeljom i da li je potrebna najava?' },
];
