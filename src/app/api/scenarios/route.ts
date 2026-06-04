// 검토안 저장 API — GitHub Gist 백엔드. 미설정 시 클라이언트가 localStorage로 폴백.
import { NextResponse } from "next/server";
import { gistConfigured, readScenarios, writeScenarios } from "@/lib/storage/gist";
import type { SavedScenario } from "@/lib/storage/scenarios";
import type { ScenarioInput } from "@/types/inputs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : "알 수 없는 오류";
}

export async function GET() {
  if (!gistConfigured()) {
    return NextResponse.json({ configured: false, scenarios: [] });
  }
  try {
    const scenarios = await readScenarios();
    return NextResponse.json({ configured: true, scenarios });
  } catch (e) {
    return NextResponse.json({ configured: true, error: errMsg(e) }, { status: 502 });
  }
}

export async function POST(req: Request) {
  if (!gistConfigured()) {
    return NextResponse.json({ error: "GitHub 저장 미설정" }, { status: 501 });
  }
  try {
    const body = (await req.json()) as { name?: string; input?: ScenarioInput };
    if (!body.input) {
      return NextResponse.json({ error: "input 누락" }, { status: 400 });
    }
    const list = await readScenarios();
    const saved: SavedScenario = {
      id: crypto.randomUUID(),
      name: body.name || "검토안",
      input: body.input,
      createdAt: new Date().toISOString(),
    };
    await writeScenarios([saved, ...list]);
    return NextResponse.json(saved);
  } catch (e) {
    return NextResponse.json({ error: errMsg(e) }, { status: 502 });
  }
}

export async function DELETE(req: Request) {
  if (!gistConfigured()) {
    return NextResponse.json({ error: "GitHub 저장 미설정" }, { status: 501 });
  }
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id 누락" }, { status: 400 });
    const list = await readScenarios();
    await writeScenarios(list.filter((s) => s.id !== id));
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return NextResponse.json({ error: errMsg(e) }, { status: 502 });
  }
}
