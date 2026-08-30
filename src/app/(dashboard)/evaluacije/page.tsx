"use client";

import { useState, useEffect } from "react";
import Card from "@/src/components/ui/Card";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import Modal from "@/src/components/ui/Modal";

interface EvalRow {
  evaluacija_id: number;
  sadrzaj: string;
  ocena: number;
  datum_podnosenja: string;
  naziv_projekta?: string;
  zaposleni_id?: number;
  ime?: string;
  prezime?: string;
}

export default function EvaluacijePage() {
  const [list, setList] = useState<EvalRow[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ sadrzaj: "", ocena: "5", naziv_projekta: "" });

  async function fetchList() {
    setLoading(true);
    try {
      const res = await fetch("/api/evaluacije");
      const data = await res.json();
      if (res.ok) setList(Array.isArray(data.data) ? data.data : []);
      else setMessage(data.error || "Greška");
    } catch {
      setMessage("Došlo je do greške. Evaluacija nije popunjena.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchList();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("/api/evaluacije", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sadrzaj: form.sadrzaj,
          ocena: Number(form.ocena),
          naziv_projekta: form.naziv_projekta,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Popunjena evaluacija.");
        setModalOpen(false);
        setForm({ sadrzaj: "", ocena: "5", naziv_projekta: "" });
        fetchList();
      } else {
        setMessage(data.error || "Došlo je do greške. Evaluacija nije popunjena.");
      }
    } catch {
      setMessage("Došlo je do greške. Evaluacija nije popunjena.");
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Evaluacije</h1>
      <Card>
        <div className="toolbar">
          <Button onClick={() => { setForm({ sadrzaj: "", ocena: "5", naziv_projekta: "" }); setModalOpen(true); }}>
            Podnesi evaluaciju
          </Button>
        </div>
        {message && <p className="msg msg--success">{message}</p>}
        {loading ? (
          <p>Učitavanje...</p>
        ) : list.length === 0 ? (
          <p>Nema evaluacija.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Sadržaj</th>
                  <th>Ocena</th>
                  <th>Naziv projekta</th>
                  <th>Datum</th>
                  <th>Zaposleni</th>
                </tr>
              </thead>
              <tbody>
                {list.map((row) => (
                  <tr key={row.evaluacija_id}>
                    <td>{row.sadrzaj}</td>
                    <td>{row.ocena}</td>
                    <td>{row.naziv_projekta}</td>
                    <td>{row.datum_podnosenja?.slice(0, 10)}</td>
                    <td>
                      {row.ime != null ? `${row.ime} ${row.prezime}` : "-"}
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
        title="Podnesi evaluaciju"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Otkaži</Button>
            <Button type="submit" form="eval-form">Podnesi</Button>
          </>
        }
      >
        <form id="eval-form" onSubmit={handleSubmit} className="form modal-form">
          <Input
            label="Naziv projekta"
            value={form.naziv_projekta}
            onChange={(e) => setForm({ ...form, naziv_projekta: e.target.value })}
            required
          />
          <div className="form-row">
            <label className="form-label">Sadržaj</label>
            <textarea
              className="input"
              rows={3}
              value={form.sadrzaj}
              onChange={(e) => setForm({ ...form, sadrzaj: e.target.value })}
              required
            />
          </div>
          <Input
            label="Ocena (1-10)"
            type="number"
            min={1}
            max={10}
            value={form.ocena}
            onChange={(e) => setForm({ ...form, ocena: e.target.value })}
            required
          />
        </form>
      </Modal>
    </div>
  );
}
