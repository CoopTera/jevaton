"use client";

import { useEffect, useRef, useState } from "react";
import { createDecision, type Decision } from "@/lib/jev";

const BAR_WIDTH = 28;

async function decide(question: string, options: string[], id: string): Promise<Decision> {
  const res = await fetch("/api/jev", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, question, options }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "error consultando Jev");
  return createDecision(json.questionId, json.probabilities);
}

function Bar({ label, value, highlight }: { label: string; value: number; highlight: boolean }) {
  const filled = Math.round(value * BAR_WIDTH);
  const bar = "█".repeat(filled) + "░".repeat(BAR_WIDTH - filled);
  return (
    <div className={`flex items-baseline gap-3 font-mono text-sm ${highlight ? "text-emerald-300" : "text-zinc-500"}`}>
      <span className="w-24 shrink-0 text-right">{label}</span>
      <span className="tracking-tighter">{bar}</span>
      <span className="tabular-nums">{value.toFixed(3)}</span>
      {highlight && <span className="text-emerald-500">◄ top</span>}
    </div>
  );
}

function DecisionView({ decision }: { decision: Decision }) {
  return (
    <div className="space-y-1">
      {Object.entries(decision.probabilities)
        .sort((a, b) => b[1] - a[1])
        .map(([opt, prob]) => (
          <Bar key={opt} label={opt} value={prob} highlight={opt === decision.top} />
        ))}
    </div>
  );
}

export default function Home() {
  // --- demo 1: hello decision ---
  const [question, setQuestion] = useState("¿Lanzamos el feature hoy?");
  const [decision, setDecision] = useState<Decision | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ask() {
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    try {
      setDecision(await decide(question, ["si", "no"], "hello"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "error");
    } finally {
      setLoading(false);
    }
  }

  // --- demo 2: clasificador spam, resultado instantáneo (debounced) ---
  const [text, setText] = useState("GANASTE UN PREMIO!!! hacé click acá para reclamarlo ya");
  const [spam, setSpam] = useState<Decision | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (!text.trim()) {
      setSpam(null);
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        setSpam(await decide(text, ["spam", "no_spam"], "spam-filter"));
      } catch {
        setSpam(null);
      }
    }, 350);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [text]);

  const SPAM_THRESHOLD = 0.6;
  const HELLO_THRESHOLD = 0.7;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 font-mono">
      <header className="mb-10 border-b border-zinc-800 pb-6">
        <p className="text-xs text-zinc-600">jev@hackathon:~$ ./jevaton --demo</p>
        <h1 className="mt-2 text-2xl font-bold text-emerald-300">TERMINAL DE DECISIONES</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Jev no devuelve texto: devuelve <span className="text-emerald-400">probabilidades</span>.
          Qué hacer con ellas lo decide <span className="text-amber-300">tu código</span>.
        </p>
        <p className="mt-1 text-xs text-zinc-600">
          mock mode activo si no hay JEV_API_KEY — mismas preguntas, mismas probabilidades
        </p>
      </header>

      {/* ---------- DEMO 1 ---------- */}
      <section className="mb-12">
        <h2 className="mb-3 text-sm font-bold text-zinc-300">
          <span className="text-emerald-500">01 /</span> HELLO DECISION
        </h2>
        <div className="flex gap-2">
          <span className="py-2 text-emerald-500">&gt;</span>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask()}
            placeholder="Escribí una pregunta con opciones si/no…"
            className="w-full border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none placeholder:text-zinc-700 focus:border-emerald-600"
          />
          <button
            onClick={ask}
            disabled={loading}
            className="shrink-0 border border-emerald-700 bg-emerald-950 px-4 py-2 text-sm text-emerald-300 hover:bg-emerald-900 disabled:opacity-40"
          >
            {loading ? "[…]" : "[decidir]"}
          </button>
        </div>

        {error && <p className="mt-3 text-sm text-red-400">error: {error}</p>}

        {decision && (
          <div className="mt-5 space-y-5">
            <DecisionView decision={decision} />

            <div className="border border-zinc-800 bg-zinc-950">
              <p className="border-b border-zinc-800 px-4 py-2 text-xs text-zinc-500">
                política.ts — esto vive en TU código, no en la API
              </p>
              <pre className="overflow-x-auto px-4 py-3 text-sm leading-relaxed">
                <code>
                  <span className="text-purple-400">if</span>
                  <span className="text-zinc-300"> (decision.</span>
                  <span className="text-emerald-300">p</span>
                  <span className="text-zinc-300">(</span>
                  <span className="text-amber-300">"si"</span>
                  <span className="text-zinc-300">) &gt; </span>
                  <span className="text-amber-300">{HELLO_THRESHOLD.toFixed(1)}</span>
                  <span className="text-zinc-300">) {"{"}</span>
                  {"\n  "}
                  <span className="text-emerald-300">ejecutarAccion</span>
                  <span className="text-zinc-300">();</span>
                  <span className="text-zinc-600">  // el umbral lo elegís vos</span>
                  {"\n"}
                  <span className="text-zinc-300">{"}"}</span>
                </code>
              </pre>
              <p className="border-t border-zinc-800 px-4 py-2 text-xs">
                <span className="text-zinc-500">→ política evaluada: </span>
                {decision.p("si") > HELLO_THRESHOLD ? (
                  <span className="text-emerald-400">
                    EJECUTAR ACCIÓN (p(si)={decision.p("si").toFixed(3)} &gt; {HELLO_THRESHOLD})
                  </span>
                ) : (
                  <span className="text-zinc-400">
                    NO HACER NADA (p(si)={decision.p("si").toFixed(3)} ≤ {HELLO_THRESHOLD})
                  </span>
                )}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ---------- DEMO 2 ---------- */}
      <section>
        <h2 className="mb-3 text-sm font-bold text-zinc-300">
          <span className="text-emerald-500">02 /</span> CLASIFICADOR BINARIO: ¿ES SPAM?
        </h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Pegá un mensaje…"
          className="w-full border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none placeholder:text-zinc-700 focus:border-emerald-600"
        />
        {spam ? (
          <div className="mt-4 space-y-4">
            <DecisionView decision={spam} />
            <div className="border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm">
              <code className="text-zinc-400">
                if (decision.p(<span className="text-amber-300">"spam"</span>) &gt;{" "}
                <span className="text-amber-300">{SPAM_THRESHOLD.toFixed(1)}</span>) moverASpam()
              </code>
              <p className="mt-2 text-xs">
                <span className="text-zinc-500">→ acción: </span>
                {spam.p("spam") > SPAM_THRESHOLD ? (
                  <span className="font-bold text-red-400">MOVER A SPAM 🗑</span>
                ) : (
                  <span className="font-bold text-emerald-400">DEJAR EN INBOX ✉</span>
                )}
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-xs text-zinc-600">esperando input…</p>
        )}
      </section>

      <footer className="mt-14 border-t border-zinc-800 pt-4 text-xs text-zinc-600">
        hackathon rule: tu app tiene que tomar <span className="text-zinc-400">UNA</span> decisión real usando Jev.
      </footer>
    </main>
  );
}
