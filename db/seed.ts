import "dotenv/config";
import { db } from "./index";
import {
  zaposleniTable,
} from "./schema";
import { hashPassword } from "../lib/password";

async function main() {
  const today = new Date().toISOString().slice(0, 10);

  try {
    await db.transaction(async (tx) => {
      await tx
      .insert(zaposleniTable)
      .values({
        ime: "Ana",
        prezime: "Menadzer",
        pozicija: "HR Menadžer",
        plata: "8000.00",
        datum_dolaska: today,
        datum_odlaska: null,
        username: "manager",
        password: await hashPassword("manager123"),
        uloga: "MENADZER U HR-u",
      })

      await tx.insert(zaposleniTable).values({
      ime: "Marko",
      prezime: "HR",
      pozicija: "HR Zaposleni",
      plata: "5000.00",
      datum_dolaska: today,
      datum_odlaska: null,
      username: "hr",
      password: await hashPassword("hr123"),
      uloga: "ZAPOSLENI U HR-u",
      });

      await tx
      .insert(zaposleniTable)
      .values({
        ime: "Petar",
        prezime: "Petrovic",
        pozicija: "Developer",
        plata: "4500.00",
        datum_dolaska: today,
        datum_odlaska: null,
        username: "petar",
        password: await hashPassword("petar123"),
        uloga: "ZAPOSLENI",
      })
    })
  } catch (e) {
    console.log(e)
  }
  console.log("Seed uspešno završen!!!")
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
