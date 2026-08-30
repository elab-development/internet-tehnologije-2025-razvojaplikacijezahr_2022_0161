"use client";

import { useState, useEffect } from "react";
import Card from "@/src/components/ui/Card";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import Modal from "@/src/components/ui/Modal";

interface ZaposleniRow {
  zaposleni_id: number;
  ime: string;
  prezime: string;
  pozicija: string;
  plata: number;
  datum_dolaska: string;
  datum_odlaska: string;
  username: string;
  uloga: string;
}

const ULOGE = ["ZAPOSLENI", "ZAPOSLENI U HR-u", "MENADZER U HR-u"];

export default function ZaposleniPage() {
  const [list, setList] = useState<ZaposleniRow[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ZaposleniRow | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState({
    ime: "",
    prezime: "",
    pozicija: "",
    plata: "",
    datum_dolaska: "",
    datum_odlaska: "",
    username: "",
    password: "",
    uloga: "ZAPOSLENI",
  });

  async function fetchList() {
    setLoading(true);
    try {
      const url = search.trim() ? `/api/zaposleni?search=${encodeURIComponent(search)}` : "/api/zaposleni";
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) setList(Array.isArray(data.data) ? data.data : []);
      else setMessage(data.error || "Greška");
    } catch {
      setMessage("Došlo je do greške. Aplikacija ne može.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchList();
  }, [search]);

  function openAdd() {
    setEditing(null);
    setForm({
      ime: "",
      prezime: "",
      pozicija: "",
      plata: "",
      datum_dolaska: new Date().toISOString().slice(0, 10),
      datum_odlaska: "",
      username: "",
      password: "",
      uloga: "ZAPOSLENI",
    });
    setModalOpen(true);
  }

  function openEdit(row: ZaposleniRow) {
    setEditing(row);
    setForm({
      ime: row.ime,
      prezime: row.prezime,
      pozicija: row.pozicija,
      plata: String(row.plata),
      datum_dolaska: row.datum_dolaska?.slice(0, 10) || "",
      datum_odlaska: row.datum_odlaska?.slice(0, 10) || "",
      username: row.username,
      password: "",
      uloga: row.uloga,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const url = editing ? `/api/zaposleni/${editing.zaposleni_id}` : "/api/zaposleni";
    const method = editing ? "PUT" : "POST";
    const body: Record<string, unknown> = {
      ime: form.ime,
      prezime: form.prezime,
      pozicija: form.pozicija,
      plata: Number(form.plata),
      datum_dolaska: form.datum_dolaska,
      datum_odlaska: form.datum_odlaska,
      username: form.username,
      uloga: form.uloga,
    };

    if (form.password) body.password = form.password;
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(editing ? "Aplikacija je zapamtila zaposlenog." : "Zaposleni je uspešno dodat.");
        setModalOpen(false);
        fetchList();
      } else {
        setMessage(data.error || "Greška");
      }
    } catch {
      setMessage("Došlo je do greške.");
    }
  }

  async function handleDelete(id: number) {
    setMessage("");
    try {
      const res = await fetch(`/api/zaposleni/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setMessage("Aplikacija je obrisala zaposlenog.");
        fetchList();
      } else {
        setMessage(data.error || "Došlo je do greške. Aplikacija ne može da obriše zaposlenog.");
      }
    } catch {
      setMessage("Došlo je do greške.");
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Zaposleni</h1>
      <Card>
        <div className="toolbar">
          <Input
            placeholder="Pretraži zaposlene..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button onClick={openAdd}>Dodaj zaposlenog</Button>
        </div>
        {message && <p className="msg msg--success">{message}</p>}
        {loading ? (
          <p>Učitavanje...</p>
        ) : list.length === 0 ? (
          <p>Nema rezultata.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Ime</th>
                  <th>Prezime</th>
                  <th>Pozicija</th>
                  <th>Uloga</th>
                  <th>Akcije</th>
                </tr>
              </thead>
              <tbody>
                {list.map((row) => (
                  <tr key={row.zaposleni_id}>
                    <td>{row.ime}</td>
                    <td>{row.prezime}</td>
                    <td>{row.pozicija}</td>
                    <td>{row.uloga}</td>
                    <td>
                      <div className="table-actions">
                        <Button variant="secondary" onClick={() => openEdit(row)}>
                          Izmeni
                        </Button>
                        <Button variant="danger" onClick={() => setDeleteId(row.zaposleni_id)}>
                          Obriši
                        </Button>
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
        open={deleteId != null}
        onClose={() => setDeleteId(null)}
        title="HR – Upravljanje ljudskim resursima"
        hideCloseButton
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteId(null)}>
              Otkaži
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (deleteId != null) {
                  handleDelete(deleteId);
                }
                setDeleteId(null);
              }}
            >
              Obriši zaposlenog
            </Button>
          </>
        }
      >
        <div className="form modal-form">
          <p>Da li ste sigurni da želite da obrišete zaposlenog?</p>
        </div>
      </Modal>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Izmeni zaposlenog" : "Dodaj zaposlenog"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Otkaži
            </Button>
            <Button type="submit" form="zaposleni-form">
              {editing ? "Sačuvaj" : "Dodaj"}
            </Button>
          </>
        }
      >
        <form id="zaposleni-form" onSubmit={handleSubmit} className="form modal-form">
          <Input label="Ime" value={form.ime} onChange={(e) => setForm({ ...form, ime: e.target.value })} required />
          <Input label="Prezime" value={form.prezime} onChange={(e) => setForm({ ...form, prezime: e.target.value })} required />
          <Input label="Pozicija" value={form.pozicija} onChange={(e) => setForm({ ...form, pozicija: e.target.value })} required />
          <Input label="Plata" type="number" value={form.plata} onChange={(e) => setForm({ ...form, plata: e.target.value })} required />
          <Input label="Datum dolaska" type="date" value={form.datum_dolaska} onChange={(e) => setForm({ ...form, datum_dolaska: e.target.value })} required />
          <Input
            label="Datum odlaska"
            type="date"
            value={form.datum_odlaska}
            onChange={(e) => setForm({ ...form, datum_odlaska: e.target.value })}
          />
          <Input label="Korisničko ime" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          <Input
            label={editing ? "Nova lozinka (opciono)" : "Lozinka"}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required={!editing}
          />
          <div className="form-row">
            <label className="form-label">Uloga</label>
            <select
              className="input"
              value={form.uloga}
              onChange={(e) => setForm({ ...form, uloga: e.target.value })}
            >
              {ULOGE.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
