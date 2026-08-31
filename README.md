# HR aplikacija

Veb aplikacija za upravljanje ljudskim resursima razvijena u okviru projekta iz predmeta Internet tehnologije.

Aplikacija omogućava upravljanje podacima o zaposlenima, podnošenje i obradu zahteva, podnošenje evaluacija i kreiranje izveštaja.

## Korisničke uloge

Sistem podržava tri korisničke uloge:

- Zaposleni
- Zaposleni u HR-u
- Menadžer u HR-u

Dostupne funkcionalnosti i pristup podacima zavise od uloge prijavljenog korisnika.

## Funkcionalnosti

Aplikacija omogućava:

- prijavu i odjavu korisnika;
- promenu lozinke;
- kontrolu pristupa na osnovu korisničke uloge;
- pregled i pretragu zaposlenih;
- dodavanje i izmenu podataka o zaposlenima;
- evidentiranje odlaska zaposlenog;
- podnošenje i pregled zahteva;
- obradu zahteva od strane HR zaposlenog;
- odobravanje ili odbijanje zahteva od strane HR menadžera;
- podnošenje i pregled evaluacija;
- kreiranje i pregled izveštaja.

## Korišćene tehnologije

- Next.js
- React
- TypeScript
- PostgreSQL
- Drizzle ORM
- Node.js
- Docker
- Docker Compose
- Git i GitHub

## Pokretanje aplikacije pomoću Docker-a

Za pokretanje projekta potrebno je imati instalirane Docker i Docker Compose.

Iz korenskog direktorijuma projekta pokrenuti:

```bash
docker compose up --build

Ovom komandom se pokreću aplikacija i PostgreSQL baza podataka u odvojenim Docker kontejnerima.

Nakon pokretanja kontejnera potrebno je izvršiti migraciju baze podataka:

```bash
docker compose exec app npm run db:migrate
```

Za inicijalno popunjavanje baze testnim podacima pokrenuti:

```bash
docker compose exec app npm run db:seed
```

Nakon uspešnog pokretanja aplikacija je dostupna na adresi:

http://localhost:3000

Za zaustavljanje Docker kontejnera koristiti:

```bash
docker compose down
```

## Lokalno pokretanje aplikacije

Za lokalno pokretanje aplikacije potrebno je instalirati sve zavisnosti projekta:

```bash
npm install
```

Nakon instalacije zavisnosti aplikacija se pokreće komandom:

```bash
npm run dev
```

Za lokalno pokretanje potrebno je obezbediti dostupnu PostgreSQL bazu podataka i podesiti promenljivu okruženja `DATABASE_URL`.

Aplikacija je nakon pokretanja dostupna na adresi:

http://localhost:3000

## Struktura projekta

Najvažniji direktorijumi i fajlovi projekta su:

- `src/app` – stranice aplikacije i API rute realizovane pomoću Next.js App Router-a
- `src/components` – React komponente korisničkog interfejsa
- `lib` – kontroleri, autentifikacija, autorizacija i poslovna logika aplikacije
- `db` – konfiguracija baze podataka, definicija šeme i inicijalni podaci
- `shared` – zajednički TypeScript tipovi koji se koriste u aplikaciji
- `Dockerfile` – definicija Docker image-a aplikacije
- `docker-compose.yml` – konfiguracija aplikacionog i PostgreSQL servisa
- `drizzle.config.ts` – konfiguracija Drizzle ORM-a

## Baza podataka

Za skladištenje podataka koristi se PostgreSQL baza podataka.

Struktura baze definisana je pomoću Drizzle ORM-a i obuhvata tabele za zaposlene, zahteve, evaluacije, izveštaje, obradu zahteva i odobravanje zahteva.

Migracije baze pokreću se komandom:

```bash
docker compose exec app npm run db:migrate
```

Inicijalni testni podaci mogu se dodati komandom:

```bash
docker compose exec app npm run db:seed
```

## Autori

- Đorđe Živkov 2022/0131
- Marija Stupar 2022/0161

Projekat je realizovan u okviru predmeta Internet tehnologije.
