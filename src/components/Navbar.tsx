"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Modal from "./ui/Modal";
import { useAuth } from "./AuthProvider";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const linkClass = (path: string) =>
    pathname === path ? "nav-link active" : "nav-link";

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage("");
    if (newPassword !== newPasswordConfirm) {
      setPasswordMessage("Nova lozinka i potvrda se ne poklapaju.");
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordMessage("Lozinka je uspešno promenjena.");
        setOldPassword("");
        setNewPassword("");
        setNewPasswordConfirm("");
        setPasswordModalOpen(false);
      } else {
        setPasswordMessage(data.error || "Lozinka nije promenjena.");
      }
    } catch {
      setPasswordMessage("Došlo je do greške. Lozinka nije promenjena.");
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <nav className="nav">
      <div className="nav-links">
        <Link href="/" className={linkClass("/")}>
          Početna
        </Link>
        {user && (
          <>
            {(user.uloga === "ZAPOSLENI U HR-u" || user.uloga === "MENADZER U HR-u") && (
              <Link href="/zaposleni" className={linkClass("/zaposleni")}>
                Zaposleni
              </Link>
            )}
            <Link href="/zahtevi" className={linkClass("/zahtevi")}>
              Zahtevi
            </Link>
            <Link href="/evaluacije" className={linkClass("/evaluacije")}>
              Evaluacije
            </Link>
            <Link href="/izvestaji" className={linkClass("/izvestaji")}>
              Izveštaji
            </Link>
          </>
        )}
      </div>
      <div className="nav-user">
        {user ? (
          <>
            <span className="nav-user-name">
              {user.ime} {user.prezime} ({user.uloga})
            </span>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setOldPassword("");
                setNewPassword("");
                setNewPasswordConfirm("");
                setPasswordMessage("");
                setPasswordModalOpen(true);
              }}
            >
              Promeni lozinku
            </Button>
            <Button type="button" variant="secondary" onClick={() => logout()}>
              Odjava
            </Button>
          </>
        ) : (
          <Link href="/login">
            <Button>Prijava</Button>
          </Link>
        )}
      </div>

      <Modal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        title="Promeni lozinku"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPasswordModalOpen(false)}>
              Otkaži
            </Button>
            <Button type="submit" form="change-password-form" disabled={passwordLoading}>
              {passwordLoading ? "Čuvanje..." : "Sačuvaj"}
            </Button>
          </>
        }
      >
        <form id="change-password-form" onSubmit={handleChangePassword} className="form modal-form">
          <Input
            label="Stara lozinka"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
          <Input
            label="Nova lozinka"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Input
            label="Potvrda nove lozinke"
            type="password"
            value={newPasswordConfirm}
            onChange={(e) => setNewPasswordConfirm(e.target.value)}
            required
          />
          {passwordMessage && (
            <p
              className={
                passwordMessage.includes("uspešno") ? "msg msg--success" : "msg msg--error"
              }
            >
              {passwordMessage}
            </p>
          )}
        </form>
      </Modal>
    </nav>
  );
}
