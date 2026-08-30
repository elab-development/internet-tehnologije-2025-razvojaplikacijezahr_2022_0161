"use client";

import { useState, useEffect } from "react";
import Card from "@/src/components/ui/Card";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import Modal from "@/src/components/ui/Modal";
import { useAuth } from "@/src/components/AuthProvider";

interface ZahtevRow {
  zahtev_id: number;
  tip: string;
  opis: string;
  status: string;
  datum_kreiranja: string;
  zaposleni_id?: number;
  ime?: string;
  prezime?: string;
}

const TIPOVI = ["PLATA", "ODSUSTVO", "OTKAZ", "TIMBILDING"];

export default function ZahteviPage() {
  const { user } = useAuth();
  const [list, setList] = useState<ZahtevRow[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ tip: "PLATA", opis: "" });
  const [obradaModal, setObradaModal] = useState<ZahtevRow | null>(null);
  const [obradaKomentar, setObradaKomentar] = useState("");
  const [odobriModal, setOdobriModal] = useState<ZahtevRow | null>(null);
  const [odobriKomentar, setOdobriKomentar] = useState("");
  const [odobren, setOdobren] = useState(true);

  async function fetchList() {
    setLoading(true);
    try {
      const url = search.trim() ? `/api/zahtevi?search=${encodeURIComponent(search)}` : "/api/zahtevi";
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) setList(Array.isArray(data.data) ? data.data : []);
      else setMessage(data.error || "Greška");
    } catch {
      setMessage("Došlo je do greške. Aplikacija ne može da pronađe traženi zahtev.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchList();
  }, [search]);

  const isHr = user?.uloga === "ZAPOSLENI U HR-u" || user?.uloga === "MENADZER U HR-u";
  const isManager = user?.uloga === "MENADZER U HR-u";

  const nijeSopstveni = (row: ZahtevRow) => row.zaposleni_id !== user?.zaposleni_id;

  async function handleSubmitZahtev(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("/api/zahtevi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Zahtev je uspešno zapamćen. Čeka obradu.");
        setModalOpen(false);
        setForm({ tip: "PLATA", opis: "" });
        fetchList();
      } else {
        setMessage(data.error || "Zahtev nije ispravno podnet.");
      }
    } catch {
      setMessage("Došlo je do greške. Zahtev nije zapamćen.");
    }
  }

  async function handleObrada() {
    if (!obradaModal) return;
    setMessage("");
    try {
      const res = await fetch(`/api/zahtevi/${obradaModal.zahtev_id}/obradi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ komentar: obradaKomentar }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Zahtev je obrađen. Zahtev čeka odobrenje.");
        setObradaModal(null);
        setObradaKomentar("");
        fetchList();
      } else {
        setMessage(data.error || "Zahtev nije obrađen.");
      }
    } catch {
      setMessage("Došlo je do greške. Zahtev nije obrađen.");
    }
  }

  async function handleOdobri(value: boolean) {
    if (!odobriModal) return;
    setMessage("");
    try {
      const res = await fetch(`/api/zahtevi/${odobriModal.zahtev_id}/odobri`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ odobren: value, komentar: odobriKomentar }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(value ? "Zahtev je odobren." : "Zahtev nije odobren.");
        setOdobriModal(null);
        setOdobriKomentar("");
        setOdobren(true);
        fetchList();
      } else {
        setMessage(data.error || "Greška.");
      }
    } catch {
      setMessage("Došlo je do greške.");
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Zahtevi</h1>
      <Card>
        <div className="toolbar">
          <Input
            placeholder="Pretraži zahteve..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button onClick={() => { setForm({ tip: "PLATA", opis: "" }); setModalOpen(true); }}>
            Podnesi zahtev
          </Button>
        </div>
        {message && <p className="msg msg--success">{message}</p>}
        {loading ? (
          <p>Učitavanje...</p>
        ) : list.length === 0 ? (
          <p>Nema zahteva.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Tip</th>
                  <th>Opis</th>
                  <th>Status</th>
                  <th>Datum</th>
                  {isHr && <th>Podnosilac</th>}
                  <th>Akcije</th>
                </tr>
              </thead>
              <tbody>
                {list.map((row) => (
                  <tr key={row.zahtev_id}>
                    <td>{row.tip}</td>
                    <td>{row.opis}</td>
                    <td>{row.status}</td>
                    <td>{row.datum_kreiranja?.slice(0, 10)}</td>
                    {isHr && (
                      <td>
                        {row.ime != null ? `${row.ime} ${row.prezime}` : "-"}
                      </td>
                    )}
                    <td>
                      <div className="table-actions">
                        {isHr && nijeSopstveni(row) && row.status === "PODNET" && (
                          <Button variant="secondary" onClick={() => { setObradaModal(row); setObradaKomentar(""); }}>
                            Obradi
                          </Button>
                        )}
                        {isManager && nijeSopstveni(row) && row.status === "CEKA ODOBRENJE" && (
                          <Button variant="secondary" onClick={() => { setOdobriModal(row); setOdobriKomentar(""); setOdobren(true); }}>
                            Odobri/Odbij
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Podnesi zahtev"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Otkaži</Button>
            <Button type="submit" form="zahtev-form">Podnesi</Button>
          </>
        }
      >
        <form id="zahtev-form" onSubmit={handleSubmitZahtev} className="form modal-form">
          <div className="form-row">
            <label className="form-label">Tip</label>
            <select
              className="input"
              value={form.tip}
              onChange={(e) => setForm({ ...form, tip: e.target.value })}
            >
              {TIPOVI.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label className="form-label">Opis</label>
            <textarea
              className="input"
              rows={3}
              value={form.opis}
              onChange={(e) => setForm({ ...form, opis: e.target.value })}
              required
            />
          </div>
        </form>
      </Modal>

      <Modal
        open={!!obradaModal}
        onClose={() => setObradaModal(null)}
        title="Obradi zahtev"
        footer={
          <>
            <Button variant="secondary" onClick={() => setObradaModal(null)}>Otkaži</Button>
            <Button onClick={handleObrada}>Obradi</Button>
          </>
        }
      >
        {obradaModal && (
          <div className="form modal-form">
            <p><strong>Tip:</strong> {obradaModal.tip}</p>
            <p><strong>Opis:</strong> {obradaModal.opis}</p>
            <div className="form-row">
              <label className="form-label">Komentar</label>
              <textarea
                className="input"
                rows={2}
                value={obradaKomentar}
                onChange={(e) => setObradaKomentar(e.target.value)}
              />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!odobriModal}
        onClose={() => setOdobriModal(null)}
        title="Odobri zahtev"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOdobriModal(null)}>Otkaži</Button>
            <Button variant="danger" onClick={() => handleOdobri(false)}>Odbij</Button>
            <Button onClick={() => handleOdobri(true)}>Odobri</Button>
          </>
        }
      >
        {odobriModal && (
          <div className="form modal-form">
            <p><strong>Tip:</strong> {odobriModal.tip}</p>
            <p><strong>Opis:</strong> {odobriModal.opis}</p>
            <div className="form-row">
              <label className="form-label">Komentar</label>
              <textarea
                className="input"
                rows={2}
                value={odobriKomentar}
                onChange={(e) => setOdobriKomentar(e.target.value)}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
