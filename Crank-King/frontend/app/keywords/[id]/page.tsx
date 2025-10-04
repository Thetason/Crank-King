"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AuthGuard } from "@/src/components/auth-guard";
import { apiClient } from "@/src/lib/api";

interface CrawlRun {
  id: string;
  status: string;
  flag?: string | null;
  started_at: string;
  completed_at?: string | null;
  https_issues?: Record<string, string> | null;
  serp_entries: SerpEntry[];
  http_checks: HttpCheck[];
}

interface SerpEntry {
  id: string;
  rank: number;
  page: number;
  title: string;
  display_url: string;
  landing_url: string;
  is_match: boolean;
  match_reason?: string | null;
}

interface HttpCheck {
  id: string;
  url: string;
  protocol: string;
  status_code?: number | null;
  ssl_valid?: boolean | null;
  ssl_error?: string | null;
}

interface KeywordDetail {
  id: string;
  query: string;
  category?: string | null;
  status: string;
  target_names: string[];
  target_domains: string[];
  notes?: string | null;
  recent_runs: CrawlRun[];
}

async function fetchKeywordDetail(id: string) {
  const response = await apiClient.get<KeywordDetail>(`/keywords/${id}`);
  return response.data;
}

async function triggerCrawl(id: string) {
  const response = await apiClient.post(`/keywords/${id}/crawl`);
  return response.data;
}

export default function KeywordDetailPage() {
  const params = useParams<{ id: string }>();
  const keywordId = params?.id;
  const queryClient = useQueryClient();

  if (!keywordId) {
    notFound();
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ["keyword", keywordId],
    queryFn: () => fetchKeywordDetail(keywordId!),
  });

  const crawlMutation = useMutation({
    mutationFn: () => triggerCrawl(keywordId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["keyword", keywordId] });
      queryClient.invalidateQueries({ queryKey: ["keywords"] });
    },
  });

  return (
    <AuthGuard>
      <div className="mx-auto min-h-screen max-w-5xl px-6 py-10">
        <Link href="/dashboard" className="text-sm text-indigo-600">← 대시보드로 돌아가기</Link>
        {isLoading && <p className="mt-6">불러오는 중...</p>}
        {error && <p className="mt-6 text-red-600">데이터를 가져오지 못했습니다.</p>}
        {data && (
          <div className="mt-6 space-y-8">
            <div className="rounded border border-slate-200 bg-white p-6 shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-slate-900">{data.query}</h1>
                  <p className="mt-1 text-sm text-slate-500">카테고리: {data.category ?? "-"} · 상태: {data.status}</p>
                </div>
                <button
                  onClick={() => crawlMutation.mutate()}
                  className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  {crawlMutation.isPending ? "크롤 중..." : "즉시 크롤"}
                </button>
              </div>
              <div className="mt-4 grid gap-4 text-sm text-slate-600 md:grid-cols-2">
                <div>
                  <h2 className="font-semibold text-slate-800">타깃 상호명</h2>
                  <p className="mt-1 whitespace-pre-wrap">{data.target_names.length ? data.target_names.join(", ") : "-"}</p>
                </div>
                <div>
                  <h2 className="font-semibold text-slate-800">타깃 도메인</h2>
                  <p className="mt-1 whitespace-pre-wrap">{data.target_domains.length ? data.target_domains.join(", ") : "-"}</p>
                </div>
                <div className="md:col-span-2">
                  <h2 className="font-semibold text-slate-800">메모</h2>
                  <p className="mt-1 whitespace-pre-wrap">{data.notes || "-"}</p>
                </div>
              </div>
            </div>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">최근 크롤 이력</h2>
              {data.recent_runs.length === 0 && <p className="text-sm text-slate-500">아직 크롤 기록이 없습니다.</p>}
              {data.recent_runs.map((run) => (
                <article key={run.id} className="rounded border border-slate-200 bg-white p-6 shadow">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm text-slate-500">{new Date(run.started_at).toLocaleString()} 시작</p>
                      <p className="text-sm text-slate-500">
                        완료: {run.completed_at ? new Date(run.completed_at).toLocaleString() : "-"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-700">{run.status}</span>
                      <span className={`rounded px-2 py-1 text-xs font-semibold ${flagClass(run.flag)}`}>
                        {run.flag ? run.flag.toUpperCase() : "-"}
                      </span>
                    </div>
                  </div>

                  {run.https_issues && Object.keys(run.https_issues).length > 0 && (
                    <div className="mt-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      <p className="font-semibold">HTTPS 이슈</p>
                      <ul className="mt-1 list-disc space-y-1 pl-5">
                        {Object.entries(run.https_issues).map(([url, issue]) => (
                          <li key={url}>
                            <span className="font-medium">{url}</span>: {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-slate-800">SERP 결과</h3>
                    <div className="mt-2 overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-3 py-2 text-left">순위</th>
                            <th className="px-3 py-2 text-left">제목</th>
                            <th className="px-3 py-2 text-left">URL</th>
                            <th className="px-3 py-2 text-left">매칭</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {run.serp_entries.map((entry) => (
                            <tr key={entry.id} className={entry.is_match ? "bg-emerald-50" : ""}>
                              <td className="px-3 py-2">{entry.page}-{entry.rank}</td>
                              <td className="px-3 py-2 text-slate-700">{entry.title}</td>
                              <td className="px-3 py-2 text-slate-600">
                                <a href={entry.landing_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600">
                                  {entry.display_url}
                                </a>
                              </td>
                              <td className="px-3 py-2 text-slate-600">
                                {entry.is_match ? entry.match_reason ?? "매칭" : "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}

function flagClass(flag?: string | null) {
  if (!flag) return "bg-slate-200 text-slate-700";
  switch (flag) {
    case "green":
      return "bg-emerald-100 text-emerald-700";
    case "yellow":
      return "bg-amber-100 text-amber-700";
    case "purple":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-slate-200 text-slate-700";
  }
}
