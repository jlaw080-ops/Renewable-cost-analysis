// 리포트 탭 — PDF 다운로드 + 검토안 저장/불러오기.
"use client";

import { useEffect, useState } from "react";
import { useScenario } from "@/components/ScenarioContext";
import { Button, Card } from "@/components/ui/primitives";
import {
  deleteScenario,
  listScenarios,
  saveScenario,
  storageBackend,
  type SavedScenario,
} from "@/lib/storage/scenarios";

export function ReportPanel() {
  const { input, result, setInput } = useScenario();
  const [name, setName] = useState(input.이름 ?? "검토안");
  const [saved, setSaved] = useState<SavedScenario[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setSaved(await listScenarios());
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "목록 조회 실패");
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const handlePdf = async () => {
    if (!result) return;
    setBusy(true);
    setMsg(null);
    try {
      const [{ pdf }, { ReportDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./ReportDocument"),
      ]);
      const blob = await pdf(
        <ReportDocument input={{ ...input, 이름: name }} result={result} />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name || "검토안"}_경제성검토.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "PDF 생성 실패");
    } finally {
      setBusy(false);
    }
  };

  const handleSave = async () => {
    setBusy(true);
    setMsg(null);
    try {
      await saveScenario(name || "검토안", { ...input, 이름: name });
      await refresh();
      setMsg("저장되었습니다.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "저장 실패");
    } finally {
      setBusy(false);
    }
  };

  const handleLoad = (sc: SavedScenario) => {
    setInput(sc.input);
    setName(sc.name);
    setMsg(`'${sc.name}' 불러옴 (결과 재계산됨)`);
  };

  const handleDelete = async (id: string) => {
    setBusy(true);
    try {
      await deleteScenario(id);
      await refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "삭제 실패");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-5">
      <Card title="PDF 리포트" desc="현재 입력·결과를 A4 보고서로 내보냅니다.">
        <Button onClick={handlePdf} disabled={busy || !result}>
          {busy ? "생성 중…" : "PDF 다운로드"}
        </Button>
      </Card>

      <Card
        title="검토안 저장 / 불러오기"
        desc={`저장 위치: ${storageBackend() === "supabase" ? "Supabase" : "브라우저(localStorage)"} · 입력값만 저장하고 불러올 때 재계산합니다.`}
      >
        <div className="mb-4 flex items-end gap-2">
          <label className="flex-1">
            <span className="mb-1 block text-xs font-medium text-ink">검토안 이름</span>
            <input
              className="w-full rounded border border-line px-2 py-1.5 text-sm focus:border-ink focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <Button onClick={handleSave} disabled={busy}>
            저장
          </Button>
        </div>

        {msg && <p className="mb-3 text-xs text-muted">{msg}</p>}

        {saved.length === 0 ? (
          <p className="text-sm text-muted">저장된 검토안이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-line">
            {saved.map((sc) => (
              <li key={sc.id} className="flex items-center justify-between py-2">
                <div>
                  <span className="text-sm text-ink">{sc.name}</span>
                  <span className="ml-2 text-xs text-muted">
                    {new Date(sc.createdAt).toLocaleString("ko-KR")}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleLoad(sc)}>
                    불러오기
                  </Button>
                  <button
                    onClick={() => handleDelete(sc.id)}
                    className="px-2 text-sm text-muted hover:text-cost"
                    aria-label="삭제"
                  >
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
