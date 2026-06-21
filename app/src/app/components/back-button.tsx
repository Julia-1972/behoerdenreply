"use client";

import Link from "next/link";

export default function BackButton({ label, href }: { label: string; href?: string }) {
  if (href) {
    return (
      <Link href={href} className="btn-outline-white" style={{ fontSize: "0.85rem", padding: "0.35rem 0.9rem" }}>
        ← {label}
      </Link>
    );
  }

  return (
    <Link href="/" className="btn-outline-white" style={{ fontSize: "0.85rem", padding: "0.35rem 0.9rem" }}>
      ← {label}
    </Link>
  );
}
