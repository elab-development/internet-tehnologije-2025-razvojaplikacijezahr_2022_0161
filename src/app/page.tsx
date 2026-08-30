import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Navbar from "@/src/components/Navbar";
import Card from "@/src/components/ui/Card";
import Link from "next/link";

export default async function HomePage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const isHr = session.uloga === "ZAPOSLENI U HR-u" || session.uloga === "MENADZER U HR-u";

  return (
    <div className="app-layout">
      <Navbar />
      <main className="app-main app-main--narrow">
        <h1 className="page-title">
          Dobrodošli, {session.ime} {session.prezime}
        </h1>
        <p className="page-subtitle">
          Aplikacija za upravljanje ljudskim resursima. Koristite meni za navigaciju.
        </p>
        <div className="home-grid">
          {isHr && (
            <Link href="/zaposleni">
              <Card title="Zaposleni" className="card--hover">
                Upravljanje zaposlenima – dodavanje, izmena, brisanje, pretraga.
              </Card>
            </Link>
          )}
          <Link href="/zahtevi">
            <Card title="Zahtevi" className="card--hover">
              Pregled i podnošenje zahteva (odustvo, plata, otkaz, timbilding).
            </Card>
          </Link>
          <Link href="/evaluacije">
            <Card title="Evaluacije" className="card--hover">
              Pregled i podnošenje evaluacija.
            </Card>
          </Link>
          <Link href="/izvestaji">
            <Card title="Izveštaji" className="card--hover">
              Pregled izveštaja. Menadžer HR-a može generisati nove.
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}
