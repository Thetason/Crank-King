"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/src/hooks/useAuth";
import { apiClient } from "@/src/lib/api";

interface KeywordSummary {
  id: string;
  query: string;
  category?: string;
  status: string;
  latest_flag?: string | null;
  latest_run_at?: string | null;
}

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const mode = useAuthStore((state) => state.mode);
  const hydrated = useAuthStore((state) => state.hydrated);
  const setGuestId = useAuthStore((state) => state.setGuestId);

  const fetchKeywords = async () => {
    if (mode === "auth") {
      const response = await apiClient.get<KeywordSummary[]>("/keywords");
      return response.data;
    }
    const response = await apiClient.get<KeywordSummary[]>("/guest/keywords");
    return response.data;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["keywords", mode],
    queryFn: fetchKeywords,
    enabled: hydrated,
  });

  const crawlMutation = useMutation({
    mutationFn: async (id: string) => {
      const url = mode === "auth" ? `/keywords/${id}/crawl` : `/guest/keywords/${id}/crawl`;
      const response = await apiClient.post(url);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["keywords"] });
    },
  });

  const exportMutation = useMutation({
    mutationFn: async () => {
      const url = mode === "auth" ? "/keywords/export" : "/guest/keywords/export";
      const response = await apiClient.get(url, { responseType: "blob" });
      const blob = new Blob([response.data], { type: "text/csv;charset=utf-8" });
      const downloadUrl = URL.createObjectURL(blob);
      const disposition = response.headers["content-disposition"] as string | undefined;
      const fallbackName = mode === "auth" ? "keywords.csv" : "guest_keywords.csv";
      const fileName = extractFilenameFromDisposition(disposition) ?? fallbackName;

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    },
    onError: () => {
      if (typeof window !== "undefined") {
        window.alert("CSV 내보내기에 실패했습니다. 잠시 후 다시 시도해주세요.");
      }
    },
  });

  const handleLogout = () => {
    logout();
    apiClient
      .post("/guest/session")
      .then((res) => {
        setGuestId(res.data.id);
      })
      .catch(() => {
        setGuestId(null);
      });
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Crank King</h1>
            {mode === "guest" ? (
              <p className="text-xs text-slate-500">게스트 모드 · 최대 10개의 키워드를 저장할 수 있습니다.</p>
            ) : (
              <p className="text-xs text-slate-500">{user?.email}</p>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            {mode === "auth" ? (
              <button
                onClick={handleLogout}
                className="rounded bg-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-300"
              >
                로그아웃
              </button>
            ) : (
              <Link
                href="/login"
                className="rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
              >
                로그인하기
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">키워드 목록</h2>
            <p className="text-sm text-slate-500">
              네이버 검색 2페이지를 확인하고 HTTPS 상태에 따라 플래그를 확인하세요.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportMutation.mutate()}
              disabled={exportMutation.isPending}
              className="rounded border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {exportMutation.isPending ? "내보내는 중..." : "CSV 다운로드"}
            </button>
            <Link
              href="/keywords/new"
              className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              키워드 추가
            </Link>
          </div>
        </div>
        {!hydrated && <p>초기화 중...</p>}
        {hydrated && isLoading && <p>불러오는 중...</p>}
        {hydrated && error && <p className="text-red-600">데이터를 불러오지 못했습니다.</p>}
        {hydrated && data && (
          <div className="overflow-hidden rounded border border-slate-200 bg-white">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">키워드</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">카테고리</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">상태</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">최근 플래그</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">최근 크롤</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-500">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.map((keyword) => (
                  <tr key={keyword.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <Link className="hover:text-indigo-600" href={`/keywords/${keyword.id}`}>
                        {keyword.query}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{keyword.category ?? "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{keyword.status}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-1 text-xs font-semibold ${flagClass(keyword.latest_flag)}`}>
                        {keyword.latest_flag ? keyword.latest_flag.toUpperCase() : "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {keyword.latest_run_at ? new Date(keyword.latest_run_at).toLocaleString() : "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => crawlMutation.mutate(keyword.id)}
                        className="rounded bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-300"
                      >
                        {crawlMutation.isPending ? "크롤 중" : "재크롤"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {mode === "guest" && (
          <p className="mt-4 text-xs text-slate-500">
            더 많은 키워드를 저장하고 싶다면 언제든지 로그인 또는 회원가입을 진행하세요.
          </p>
        )}
      </main>
    </div>
  );
}

function extractFilenameFromDisposition(disposition?: string) {
  if (!disposition) return null;
  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch (error) {
      console.warn("Failed to decode filename", error);
    }
  }
  const asciiMatch = disposition.match(/filename="?([^";]+)"?/i);
  if (asciiMatch?.[1]) {
    return asciiMatch[1];
  }
  return null;
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
