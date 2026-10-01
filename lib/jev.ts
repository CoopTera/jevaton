export type TypedQuestion = {
  id: string;
  question: string;
  options: string[]; // schema de opciones: ["si","no"], ["spam","no_spam"], etc.
};

export type Decision = {
  questionId: string;
  probabilities: Record<string, number>;
  top: string;
  p: (option: string) => number;
};

export function createDecision(
  questionId: string,
  probabilities: Record<string, number>
): Decision {
  const top = Object.entries(probabilities).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
  return {
    questionId,
    probabilities,
    top,
    p: (option) => probabilities[option] ?? 0,
  };
}

// djb2: el mock tiene que dar siempre lo mismo para la misma pregunta (demo reproducible)
function hash(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h;
}

function mockAsk(q: TypedQuestion): Decision {
  const seed = hash(q.question.trim().toLowerCase());
  const raw = q.options.map((opt, i) => 0.15 + (hash(`${opt}:${seed}:${i}`) % 1000) / 1000);
  const total = raw.reduce((a, b) => a + b, 0);
  const probabilities = Object.fromEntries(
    q.options.map((opt, i) => [opt, Math.round((raw[i] / total) * 1000) / 1000])
  );
  return createDecision(q.id, probabilities);
}

export async function askJev(q: TypedQuestion): Promise<Decision> {
  if (!process.env.JEV_API_KEY) return mockAsk(q);

  // Única integración real con Jev: si la doc oficial difiere, se ajusta acá y en ningún otro lado.
  const res = await fetch(`${process.env.JEV_API_URL}/decide`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.JEV_API_KEY}`,
    },
    body: JSON.stringify({ id: q.id, question: q.question, options: q.options }),
  });
  if (!res.ok) throw new Error(`Jev respondió ${res.status}`);
  const data = (await res.json()) as { probabilities: Record<string, number> };
  return createDecision(q.id, data.probabilities);
}
