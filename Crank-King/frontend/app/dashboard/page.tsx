"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AuthGuard } from "@/src/components/auth-guard";
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

async function fetchKeywords() {
  const response = await apiClient.get<KeywordSummary[]>("/keywords");
  return response.data;
}

async function crawlKeyword(id: string) {
  const response = await apiClient.post(`/keywords/${id}/crawl`);
  return response.data;
}

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const { data, isLoading, error } = useQuery({ queryKey: ["keywords"], queryFn: fetchKeywords });

  const crawlMutation = useMutation({
    mutationFn: crawlKeyword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["keywords"] });
    },
  });

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-100">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <h1 className="text-xl font-semibold text-slate-900">Crank King 대시보드</h1>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              {user && <span>{user.email}</span>}
              <button onClick={handleLogout} className="rounded bg-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-300">
                로그아웃
              </button>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-10">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">키워드 목록</h2>
              <p className="text-sm text-slate-500">최신 크롤 결과와 플래그 상태를 확인하세요.</p>
            </div>
            <Link
              href="/keywords/new"
              className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              키워드 추가
            </Link>
          </div>
          {isLoading && <p>불러오는 중...</p>}
          {error && <p className="text-red-600">데이터를 불러오지 못했습니다.</p>}
          {data && (
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
        </main>
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
