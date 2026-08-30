export type Uloga = "ZAPOSLENI" | "ZAPOSLENI U HR-u" | "MENADZER U HR-u";

export type ZahtevTip = "PLATA" | "ODSUSTVO" | "OTKAZ" | "TIMBILDING";
export type ZahtevStatus =
  | "PODNET"
  | "CEKA ODOBRENJE"
  | "ODOBREN"
  | "ODBIJEN";

export interface SessionUserDto {
  zaposleni_id: number;
  ime: string;
  prezime: string;
  uloga: Uloga;
  username: string;
}
