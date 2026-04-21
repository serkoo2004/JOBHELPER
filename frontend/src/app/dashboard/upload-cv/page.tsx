"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileText,
  Sparkles,
  Target,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { resumeApi } from "@/lib/api";
import { cn } from "@/lib/utils";

type AnalysisResult = {
  title: string;
  summary: string;
  content: string;
  recommendations: string[];
  template?: string | null;
  template_reason?: string | null;
};

function toLines(text: string) {
  return text
    .replace(/\r/g, "\n")
    .split(/\n+/)
    .flatMap((part) => part.split(/(?<=[.!?])\s+/))
    .map((item) => item.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);
}

function formatAnalysisSectionTitle(title: string) {
  switch (title) {
    case "Summary":
      return "Ozet";
    case "Detailed Analysis":
      return "Detayli Analiz";
    case "Recommendations":
      return "Oneriler";
    default:
      return title;
  }
}

function uniqueItems(items: string[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildStrengths(result: AnalysisResult | null) {
  if (!result) return [];

  const keywords = ["güçlü", "strong", "iyi", "clear", "solid", "başarılı", "uygun"];
  const lines = toLines(result.content);

  return uniqueItems(
    lines.filter((line) =>
      keywords.some((keyword) => line.toLowerCase().includes(keyword)),
    ),
  ).slice(0, 4);
}

function buildWeaknesses(result: AnalysisResult | null) {
  if (!result) return [];

  const keywords = ["eksik", "zayıf", "risk", "gelişim", "missing", "improve", "revise", "uyum"];
  const lines = toLines(result.content);

  return uniqueItems(
    lines.filter((line) =>
      keywords.some((keyword) => line.toLowerCase().includes(keyword)),
    ),
  ).slice(0, 4);
}

function buildDetails(result: AnalysisResult | null) {
  if (!result) return [];
  return uniqueItems(toLines(result.content));
}

function classifyDetailTone(text: string) {
  const value = text.toLowerCase();
  if (
    ["güçlü", "guclu", "strong", "iyi", "clear", "solid", "başarılı", "basarili"].some(
      (keyword) => value.includes(keyword),
    )
  ) {
    return "positive";
  }
  if (
    ["eksik", "zayıf", "zayif", "risk", "gelişim", "gelisim", "improve", "missing", "revise"].some(
      (keyword) => value.includes(keyword),
    )
  ) {
    return "warning";
  }
  return "neutral";
}

function buildAnalysisClipboardText(result: AnalysisResult, targetRole: string) {
  const sections = [
    result.title,
    targetRole ? `Hedef rol: ${targetRole}` : "",
    result.template ? `Onerilen sablon: ${result.template}` : "",
    result.template_reason ? `Sablon nedeni: ${result.template_reason}` : "",
    "",
    formatAnalysisSectionTitle("Summary"),
    result.summary,
    "",
    formatAnalysisSectionTitle("Detailed Analysis"),
    result.content,
    "",
    formatAnalysisSectionTitle("Recommendations"),
    ...(result.recommendations?.length
      ? result.recommendations.map((item) => `- ${item}`)
      : ["- Acik bir oneriler listesi donmedi."]),
  ];

  return sections
    .filter((item, index, array) => {
      if (item) return true;
      return array[index - 1] !== "";
    })
    .join("\n");
}

function buildAnalysisReportText(result: AnalysisResult, targetRole: string, fileName?: string) {
  const now = new Date().toLocaleString("tr-TR");
  const lines = [
    "CV ANALIZ RAPORU",
    "================",
    `Olusturma tarihi: ${now}`,
    fileName ? `Dosya: ${fileName}` : "",
    targetRole ? `Hedef rol: ${targetRole}` : "Hedef rol: Belirtilmedi",
    result.template ? `Onerilen sablon: ${result.template}` : "",
    result.template_reason ? `Sablon nedeni: ${result.template_reason}` : "",
    "",
    "KISA OZET",
    "---------",
    result.summary,
    "",
    "DETAYLI DENETIM",
    "---------------",
    result.content,
    "",
    "ONCELIKLI DUZELTMELER",
    "---------------------",
    ...(result.recommendations?.length
      ? result.recommendations.map((item, index) => `${index + 1}. ${item}`)
      : ["1. Oneri donmedi; detayli denetim bolumunu kullan."]),
    "",
    "KULLANIM NOTU",
    "------------",
    "Bu rapordaki maddeleri tek tek Profile ve Resume Studio icinde duzelt. Metrik veya basari uydurma; gercek verin varsa ekle.",
  ];

  return lines.filter(Boolean).join("\n");
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export default function UploadCVPage() {
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const [drag, setDrag] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const strengths = useMemo(() => buildStrengths(result), [result]);
  const weaknesses = useMemo(() => buildWeaknesses(result), [result]);
  const details = useMemo(() => buildDetails(result), [result]);
  const reportText = useMemo(
    () => (result ? buildAnalysisReportText(result, targetRole, file?.name) : ""),
    [file?.name, result, targetRole],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  };

  const analyze = async () => {
    if (!file) return;

    setAnalyzing(true);
    setResult(null);

    try {
      const form = new FormData();
      form.append("file", file);
      const response = await resumeApi.analyzeUpload(form, targetRole || undefined);
      setResult(response);
      toast.success("Analysis complete.");
    } catch (error) {
      console.error(error);
      toast.error("CV could not be analyzed.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 pb-6" data-testid="upload-cv-page">
      <div>
        <div className="label-mono mb-3">Audit mode</div>
        <h1 className="font-heading text-4xl font-medium">Upload & Analyze</h1>
        <p className="mt-3 max-w-2xl text-base leading-8 text-[hsl(var(--muted-foreground))]">
          Mevcut CV&apos;ni yukle. Icerigi analiz edip zayif noktalari gosterecegiz
          ve daha guclu bir yeniden olusturma icin temiz bir baslangic verecegiz.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="p-7 lg:col-span-2">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all",
              drag
                ? "border-[hsl(var(--foreground))] bg-[hsl(var(--accent))]"
                : "border-[hsl(var(--border))] hover:border-[hsl(var(--foreground))]/30 hover:bg-[hsl(var(--accent))]/50",
            )}
            data-testid="upload-dropzone"
          >
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[hsl(var(--border))]">
              <Upload className="h-6 w-6" />
            </div>
            <div className="mb-2 font-heading text-xl">CV dosyasini buraya birak</div>
            <div className="text-sm text-[hsl(var(--muted-foreground))]">
              PDF, DOCX, or TXT
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <div className="label-mono">Hedef rol</div>
              <Input
                placeholder="Istege bagli, ama analizin role gore sekillenmesine yardim eder"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
            </div>

            {file ? (
              <div className="flex items-center justify-between rounded-xl border border-[hsl(var(--border))] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--muted))]">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="max-w-[180px] truncate text-base font-medium">
                      {file.name}
                    </div>
                    <div className="text-sm text-[hsl(var(--muted-foreground))]">
                      {Math.max(1, Math.round(file.size / 1024))} KB
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="xs" onClick={() => setFile(null)}>
                  Kaldir
                </Button>
              </div>
            ) : null}
          </div>

          <Button
            className="mt-4 w-full"
            size="lg"
            onClick={() => void analyze()}
            disabled={!file || analyzing}
            data-testid="upload-analyze"
          >
            <Sparkles className="h-4 w-4" />{" "}
            {analyzing ? "Analiz ediliyor..." : "CV'yi analiz et"}
          </Button>
        </Card>

        <div className="space-y-5 lg:col-span-3">
          {!result && !analyzing ? (
            <Card className="flex min-h-[560px] flex-col items-center justify-center p-12 text-center">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-[hsl(var(--border))]">
                <FileText className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />
              </div>
              <div className="text-base text-[hsl(var(--muted-foreground))]">
                Analizi gormek icin bir dosya yukle.
              </div>
            </Card>
          ) : null}

          {analyzing ? (
            <Card className="flex min-h-[560px] flex-col items-center justify-center p-12">
              <div className="mb-5 h-14 w-14 animate-spin rounded-full border border-[hsl(var(--border))] border-t-[hsl(var(--foreground))]" />
              <div className="font-heading text-2xl">CV okunuyor...</div>
              <div className="mt-2 text-base text-[hsl(var(--muted-foreground))]">
                Cozumleniyor, puanlaniyor ve karsilastiriliyor.
              </div>
            </Card>
          ) : null}

          {result ? (
            <Card className="space-y-7 p-7">
              <div className="overflow-hidden rounded-[28px] border border-[hsl(var(--border))] bg-[radial-gradient(circle_at_top_left,hsl(var(--accent))_0%,transparent_45%),linear-gradient(135deg,hsl(var(--background))_0%,hsl(var(--muted))_180%)] p-7">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                  <div className="max-w-3xl">
                    <div className="label-mono">Rapor</div>
                    <div className="mt-2 font-heading text-4xl leading-tight md:text-5xl">
                      {result.title}
                    </div>
                    <p className="mt-4 text-lg leading-8 text-[hsl(var(--muted-foreground))] md:text-xl">
                      {result.summary}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:w-[320px] xl:grid-cols-1">
                    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))]/80 p-4">
                      <div className="label-mono mb-2">Analiz modu</div>
                      <div className="text-base font-medium">AI CV Audit</div>
                    </div>
                    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))]/80 p-4">
                      <div className="label-mono mb-2">Baglam</div>
                      <div className="flex flex-wrap gap-2.5">
                        {result.template ? <Badge variant="mono">{result.template}</Badge> : null}
                        {targetRole ? (
                          <Badge variant="outline">
                            <Target className="mr-1 h-3 w-3" />
                            {targetRole}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Genel degerlendirme</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      downloadTextFile("cv-analiz-raporu.txt", reportText);
                      toast.success("TXT rapor indirildi.");
                    }}
                  >
                    <Download className="h-4 w-4" />
                    TXT raporu indir
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(reportText);
                      toast.success("Tam rapor panoya kopyalandi.");
                    }}
                  >
                    Tam raporu kopyala
                  </Button>
                </div>
              </div>

              <div className="grid gap-5 xl:grid-cols-3">
                <div className="min-h-[280px] rounded-2xl border border-[hsl(var(--border))] p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <div className="label-mono">Guclu yonler</div>
                  </div>
                  <ul className="space-y-3">
                    {(strengths.length ? strengths : ["One cikan guclu sinyaller otomatik olarak ayristirilamadi."]).map((item, index) => (
                      <li key={`${item}-${index}`} className="flex items-start gap-3 text-lg leading-8">
                        <Badge variant="success" className="mt-0.5 text-[10px]">
                          {index + 1}
                        </Badge>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="min-h-[280px] rounded-2xl border border-[hsl(var(--border))] p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <div className="label-mono">Zayif alanlar</div>
                  </div>
                  <ul className="space-y-3">
                    {(weaknesses.length ? weaknesses : ["Net zayif alanlar otomatik olarak ayristirilamadi."]).map((item, index) => (
                      <li key={`${item}-${index}`} className="flex items-start gap-3 text-lg leading-8">
                        <Badge variant="warning" className="mt-0.5 text-[10px]">
                          {index + 1}
                        </Badge>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="min-h-[280px] rounded-2xl border border-[hsl(var(--border))] p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <div className="label-mono">Onerilen duzeltmeler</div>
                  </div>
                  <ul className="space-y-3">
                    {(result.recommendations?.length
                      ? result.recommendations
                      : ["Duzenleme onerisi donmedi."]).map((item, index) => (
                      <li key={`${item}-${index}`} className="flex items-start gap-3 text-lg leading-8">
                        <Badge variant="outline" className="mt-0.5 text-[10px]">
                          {index + 1}
                        </Badge>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-2xl border border-[hsl(var(--border))] p-7">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="label-mono">Detayli analiz</div>
                  <Badge variant="outline">{details.length} denetim notu</Badge>
                </div>
                <div className="space-y-4">
                  {details.map((item, index) => (
                    <div
                      key={`${item}-${index}`}
                      className={cn(
                        "rounded-2xl border p-5",
                        classifyDetailTone(item) === "positive" &&
                          "border-[hsl(var(--success))]/20 bg-[hsl(var(--success))]/5",
                        classifyDetailTone(item) === "warning" &&
                          "border-[hsl(var(--warning))]/20 bg-[hsl(var(--warning))]/5",
                        classifyDetailTone(item) === "neutral" &&
                          "border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30",
                      )}
                    >
                      <div className="mb-2 flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[hsl(var(--border))] text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="label-mono">
                          {classifyDetailTone(item) === "positive"
                            ? "Guclu sinyal"
                            : classifyDetailTone(item) === "warning"
                              ? "Dikkat noktasi"
                              : "Analiz notu"}
                        </div>
                      </div>
                      <p className="text-lg leading-8 text-[hsl(var(--muted-foreground))]">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))]/50 p-7">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="label-mono">Indirilebilir TXT onizleme</div>
                    <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                      Butona bastiginda indirilecek raporun tam metni.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      downloadTextFile("cv-analiz-raporu.txt", reportText);
                      toast.success("TXT rapor indirildi.");
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Indir
                  </Button>
                </div>
                <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap rounded-2xl border border-[hsl(var(--border))] bg-black/20 p-5 text-sm leading-7 text-[hsl(var(--muted-foreground))]">
                  {reportText}
                </pre>
              </div>

              <div className="flex flex-wrap gap-3 border-t border-[hsl(var(--border))] pt-2">
                <Button asChild size="lg" className="min-w-[280px]">
                  <Link href="/dashboard/resume">
                    <Sparkles className="h-4 w-4" /> Duzeltmelerle taslak olustur
                  </Link>
                </Button>
                <Button
                  size="lg"
                  className="min-w-[180px]"
                  variant="secondary"
                  onClick={() => {
                    navigator.clipboard.writeText(buildAnalysisClipboardText(result, targetRole));
                    toast.success("Analiz panoya kopyalandi.");
                  }}
                >
                  Analizi kopyala
                </Button>
                <Button
                  size="lg"
                  className="min-w-[180px]"
                  variant="outline"
                  onClick={() => {
                    downloadTextFile("cv-analiz-raporu.txt", reportText);
                    toast.success("TXT rapor indirildi.");
                  }}
                >
                  <Download className="h-4 w-4" />
                  TXT indir
                </Button>
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
