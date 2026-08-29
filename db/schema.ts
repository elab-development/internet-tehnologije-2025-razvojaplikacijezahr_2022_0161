import {
  date,
  integer,
  numeric,
  pgTable,
  primaryKey,
  serial,
  varchar,
} from "drizzle-orm/pg-core";

export const zaposleniTable = pgTable("zaposleni", {
  zaposleni_id: serial("zaposleni_id").primaryKey(),
  ime: varchar("ime", { length: 255 }).notNull(),
  prezime: varchar("prezime", { length: 255 }).notNull(),
  pozicija: varchar("pozicija", { length: 255 }).notNull(),
  plata: numeric("plata", { precision: 10, scale: 2 }).notNull(),
  datum_dolaska: date("datum_dolaska").notNull(),
  datum_odlaska: date("datum_odlaska"),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  uloga: varchar("uloga", { length: 255 }).notNull(),
});

export const zahtevTable = pgTable("zahtev", {
  zahtev_id: serial("zahtev_id").primaryKey(),
  tip: varchar("tip", { length: 255 }).notNull(),
  opis: varchar("opis", { length: 255 }).notNull(),
  status: varchar("status", { length: 255 }).notNull(),
  datum_kreiranja: date("datum_kreiranja").notNull(),
  zaposleni_id: integer("zaposleni_id").references(() => zaposleniTable.zaposleni_id, {
    onUpdate: "cascade",
    onDelete: "restrict",
  }),
});

export const evaluacijaTable = pgTable("evaluacija", {
  evaluacija_id: serial("evaluacija_id").primaryKey(),
  sadrzaj: varchar("sadrzaj", { length: 1000 }).notNull(),
  ocena: integer("ocena").notNull(),
  datum_podnosenja: date("datum_podnosenja").notNull(),
  naziv_projekta: varchar("naziv_projekta", { length: 255 }).notNull(),
  zaposleni_id: integer("zaposleni_id").references(() => zaposleniTable.zaposleni_id, {
    onUpdate: "cascade",
    onDelete: "restrict",
  }),
});

export const izvestajTable = pgTable("izvestaj", {
  izvestaj_id: serial("izvestaj_id").primaryKey(),
  sadrzaj: varchar("sadrzaj", { length: 1000 }).notNull(),
  datum_kreiranja: date("datum_kreiranja").notNull(),
  pomenuti_zaposleni: integer("pomenuti_zaposleni").array(),
  zaposleni_id: integer("zaposleni_id").references(() => zaposleniTable.zaposleni_id, {
    onUpdate: "cascade",
    onDelete: "restrict",
  }),
});

export const obradaZahtevaTable = pgTable("obrada_zahteva", {
  zaposleni_id: integer("zaposleni_id").notNull()
  .references(() => zaposleniTable.zaposleni_id, {
    onUpdate: "cascade",
    onDelete: "restrict",
  }),
  zahtev_id: integer("zahtev_id").notNull()
  .references(() => zahtevTable.zahtev_id, {
    onUpdate: "cascade",
    onDelete: "restrict",
  }),
  komentar: varchar("komentar", { length: 255 }).notNull(),
  obradjen: varchar("obradjen", { length: 255 }).notNull(),
  datum_obrade: date("datum_obrade").notNull(),
},
  (table) => [primaryKey({ columns: [table.zaposleni_id, table.zahtev_id] })]
);

export const odobravanjeZahtevaTable = pgTable("odobravanje_zahteva", {
  zaposleni_id: integer("zaposleni_id").notNull()
  .references(() => zaposleniTable.zaposleni_id, {
    onUpdate: "cascade",
    onDelete: "restrict",
  }),
  zahtev_id: integer("zahtev_id").notNull()
  .references(() => zahtevTable.zahtev_id, {
    onUpdate: "cascade",
    onDelete: "restrict",
  }),
  komentar: varchar("komentar", { length: 255 }).notNull(),
  odobren: varchar("odobren", { length: 255 }).notNull(),
  datum_odobravanja: date("datum_odobravanja").notNull(),
},
  (table) => [primaryKey({ columns: [table.zaposleni_id, table.zahtev_id] })]
);
