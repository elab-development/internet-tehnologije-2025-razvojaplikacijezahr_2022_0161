"use client";

import { useState, useEffect } from "react";
import Card from "@/src/components/ui/Card";
import Button from "@/src/components/ui/Button";
import Modal from "@/src/components/ui/Modal";
import { useAuth } from "@/src/components/AuthProvider";

interface IzvestajRow {
  izvestaj_id: number;
  sadrzaj: string;
  datum_kreiranja: string;
  pomenuti_zaposleni?: number[] | null;
  zaposleni_id?: number;
  ime?: string;
  prezime?: string;
}

interface ZaposleniRow {
  zaposleni_id: number;
  ime: string;
  prezime: string;
}

export default function IzvestajiPage() {
  const { user } = useAuth();
  const [list, setList] = useState<IzvestajRow[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<ZaposleniRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [sadrzaj, setSadrzaj] = useState("");

  const isManager = user?.uloga === "MENADZER U HR-u";

  async function fetchList() {
    setLoading(true);
    try {
      const res = await fetch("/api/izvestaji");
      const data = await res.json();
      if (res.ok) setList(Array.isArray(data.data) ? data.data : []);
      else setMessage(data.error || "Greška");
    } catch {
      setMessage("Došlo je do greške. Izveštaj nije generisan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchList();
  }, []);

  useEffect(() => {
    if (!isManager) return;

    async function fetchEmployees() {
      try {
        const res = await fetch("/api/zaposleni");
        const data = await res.json();
        if (res.ok && Array.isArray(data.data)) {
          // autor ne može da pomene samog sebe
          setEmployees(
            (data.data as ZaposleniRow[]).filter(
              (e) => e.zaposleni_id !== user?.zaposleni_id
            )
          );
        }
      } catch {
      }
    }
    fetchEmployees();
  }, [isManager, user?.zaposleni_id]);

  function openGenerateModal() {
    setSelectedIds(employees.map((e) => e.zaposleni_id));
    setSadrzaj("");
    setModalOpen(true);
  }

  async function handleGenerisi(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("/api/izvestaji", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sadrzaj,
          pomenuti_zaposleni: selectedIds,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Izveštaj je uspešno generisan.");
        setModalOpen(false);
        fetchList();
      } else {
        setMessage(data.error || "Došlo je do greške. Izveštaj nije generisan.");
      }
    } catch {
      setMessage("Došlo je do greške. Izveštaj nije generisan.");
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Izveštaji</h1>
      <Card>
        {isManager && (
          <div className="toolbar">
            <Button onClick={openGenerateModal}>Generiši izveštaj</Button>
          </div>
        )}
        {message && <p className="msg msg--success">{message}</p>}
        {loading ? (
          <p>Učitavanje...</p>
        ) : list.length === 0 ? (
          <p>Nema izveštaja.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Sadržaj</th>
                  <th>Datum kreiranja</th>
                  <th>Kreirao</th>
                </tr>
              </thead>
              <tbody>
                {list.map((row) => (
                  <tr key={row.izvestaj_id}>
                    <td>{row.izvestaj_id}</td>
                    <td>{row.sadrzaj}</td>
                    <td>{row.datum_kreiranja?.slice(0, 10)}</td>
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
        title="Generiši izveštaj"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Otkaži
            </Button>
            <Button type="submit" form="report-form">
              Generiši izveštaj
            </Button>
          </>
        }
      >
        <form id="report-form" onSubmit={handleGenerisi} className="form modal-form">
          <div className="form-row">
            <label className="form-label">Sadržaj izveštaja</label>
            <textarea
              className="input"
              rows={3}
              value={sadrzaj}
              onChange={(e) => setSadrzaj(e.target.value)}
              required
            />
          </div>
          <div className="form-row">
            <label className="form-label">Zaposleni u izveštaju</label>
            <div className="checkbox-list">
              {employees.length === 0 && (
                <span className="checkbox-empty">Nema drugih zaposlenih.</span>
              )}
              {employees.map((emp) => (
                <label key={emp.zaposleni_id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(emp.zaposleni_id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds((prev) =>
                          prev.includes(emp.zaposleni_id) ? prev : [...prev, emp.zaposleni_id]
                        );
                      } else {
                        setSelectedIds((prev) => prev.filter((id) => id !== emp.zaposleni_id));
                      }
                    }}
                  />
                  <span>
                    {emp.ime} {emp.prezime}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
