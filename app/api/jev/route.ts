import { NextResponse } from "next/server";
import { askJev, type TypedQuestion } from "@/lib/jev";

export async function POST(req: Request) {
  const q = (await req.json()) as TypedQuestion;

  if (!q?.question?.trim() || !Array.isArray(q?.options) || q.options.length < 2) {
    return NextResponse.json(
      { error: "Se requiere question (string) y options (array de al menos 2 strings)" },
      { status: 400 }
    );
  }

  try {
    const decision = await askJev({ ...q, id: q.id ?? "adhoc" });
    // La Decision viaja como JSON plano (sin p()); el cliente la rehidrata con createDecision.
    const { p: _p, ...body } = decision;
    return NextResponse.json(body);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error consultando Jev" },
      { status: 502 }
    );
  }
}
