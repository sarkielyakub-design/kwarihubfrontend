"use client";
import { ReactNode } from "react";
export function Spinner() { return <div className="spinner" aria-label="Loading" />; }
export function PageState({ type, children }: { type: "loading" | "empty" | "error"; children?: ReactNode }) { return <div className="page-state">{type === "loading" ? <Spinner /> : <div className="state-icon">{type === "error" ? "!" : "◇"}</div>}<p>{children || (type === "loading" ? "Loading your data…" : "Nothing to show yet.")}</p></div>; }
export function Badge({ children }: { children: ReactNode }) { return <span className={`badge badge-${String(children).toLowerCase()}`}>{children}</span>; }
export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) { return <div className="modal-backdrop" onMouseDown={onClose}><section className="modal" onMouseDown={e => e.stopPropagation()}><div className="modal-title"><h2>{title}</h2><button className="icon-button" onClick={onClose}>×</button></div>{children}</section></div>; }
export function Toast({ message, type }: { message: string; type: "success" | "error" }) { return <div className={`toast ${type}`}>{message}</div>; }
