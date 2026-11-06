"use client";
import { useActionState } from "react";
import { submitReview, type ReviewState } from "@/app/actions";

export default function ReviewForm({ productId, slug }: { productId: string; slug: string }) {
  const [state, action, pending] = useActionState<ReviewState, FormData>(submitReview, {});
  if (state.ok) return <div className="msg msg-ok" role="status">¡Gracias! Tu comentario se publicará cuando Tatiana lo revise.</div>;
  return (
    <form action={action} style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 640 }}>
      <input type="hidden" name="product_id" value={productId} />
      <input type="hidden" name="slug" value={slug} />
      <h3 style={{ fontSize: 24 }}>Deja tu comentario</h3>
      <fieldset style={{ border: 0, padding: 0, margin: 0, display: "flex", gap: 16, flexWrap: "wrap" }}>
        <legend style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Tu calificación</legend>
        {[5, 4, 3, 2, 1].map((n) => (
          <label key={n} style={{ display: "flex", gap: 6, alignItems: "center", minHeight: 44 }}>
            <input type="radio" name="rating" value={n} defaultChecked={n === 5} /> {n} ★
          </label>
        ))}
      </fieldset>
      <label className="field">Tu comentario
        <textarea name="comment" rows={4} required minLength={3} maxLength={1000} placeholder="Cuéntanos cómo usaste el material" />
      </label>
      {state.error && <div className="msg msg-err" role="alert">{state.error}</div>}
      <button className="btn btn-pri" disabled={pending} style={{ alignSelf: "flex-start" }}>{pending ? "Enviando…" : "Publicar comentario"}</button>
    </form>
  );
}
