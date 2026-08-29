export type Uloga = "ZAPOSLENI" | "ZAPOSLENI U HR-u" | "MENADZER U HR-u";

export type ZahtevTip = "PLATA" | "ODSUSTVO" | "OTKAZ" | "TIMBILDING";
export type ZahtevStatus =
  | "PODNET"
  | "U OBRADI"
  | "CEKA ODOBRENJE"
  | "ODOBREN"
  | "ODBIJEN";

export interface ZaposleniDto {
  zaposleni_id: number;
  ime: string;
  prezime: string;
  pozicija: string;
  plata: number;
  datum_dolaska: string;
  datum_odlaska: string | null;
  username: string;
  password: string;
  uloga: Uloga;
}

export interface ZahtevDto {
  zahtev_id: number;
  tip: ZahtevTip;
  opis: string;
  status: ZahtevStatus;
  datum_kreiranja: string;
  zaposleni_id: number | null;
}

export interface EvaluacijaDto {
  evaluacija_id: number;
  sadrzaj: string;
  ocena: number;
  datum_podnosenja: string;
  naziv_projekta: string;
  zaposleni_id: number | null;
}

export interface IzvestajDto {
  izvestaj_id: number;
  datum_kreiranja: string;
  pomenuti_zaposleni: number[] | null
  zaposleni_id: number | null;
}

export interface ObradaZahtevaDto {
  zaposleni_id: number;
  zahtev_id: number;
  komentar: string;
  obradjen: string;
  datum_obrade: string;
}

export interface OdobravanjeZahtevaDto {
  zaposleni_id: number;
  zahtev_id: number;
  komentar: string;
  odobren: string;
  datum_odobravanja: string;
}

export interface ZaposleniSafeDto {
  zaposleni_id: number;
  ime: string;
  prezime: string;
  pozicija: string;
  uloga: Uloga;
  username: string;
}

export interface SessionUserDto {
  zaposleni_id: number;
  ime: string;
  prezime: string;
  uloga: Uloga;
  username: string;
}
