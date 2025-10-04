"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { AuthGuard } from "@/src/components/auth-guard";
import { apiClient } from "@/src/lib/api";

interface KeywordPayload {
  query: string;
  category?: string;
  target_names: string[];
  target_domains: string[];
  notes?: string;
}

async function createKeyword(payload: KeywordPayload) {
  const response = await apiClient.post("/keywords", payload);
  return response.data;
}

export default function NewKeywordPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [targetNames, setTargetNames] = useState("");
  const [targetDomains, setTargetDomains] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: createKeyword,
    onSuccess: (data) => {
      router.push(`/keywords/${data.id}`);
    },
    onError: () => setError("키워드를 생성하지 못했습니다."),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    mutation.mutate({
      query,
      category: category || undefined,
      target_names: parseCommaSeparated(targetNames),
      target_domains: parseCommaSeparated(targetDomains),
      notes: notes || undefined,
    });
  };

  return (
    <AuthGuard>
      <div className="mx-auto min-h-screen max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-semibold text-slate-900">새 키워드 추가</h1>
        <p className="mt-2 text-sm text-slate-500">대상 사이트의 상호나 도메인을 입력해 매칭 정확도를 높이세요.</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded border border-slate-200 bg-white p-6 shadow">
          <div>
            <label className="block text-sm font-medium text-slate-700">검색 키워드</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              required
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">카테고리</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="예: region_business"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">타깃 상호명 (콤마로 구분)</label>
            <input
              type="text"
              value={targetNames}
              onChange={(e) => setTargetNames(e.target.value)}
              placeholder="예: 강남 피부과, 강남피부과의원"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">타깃 도메인 (콤마로 구분)</label>
            <input
              type="text"
              value={targetDomains}
              onChange={(e) => setTargetDomains(e.target.value)}
              placeholder="예: kangnamskin.co.kr"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">메모</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {mutation.isPending ? "저장 중..." : "저장"}
          </button>
        </form>
      </div>
    </AuthGuard>
  );
}

function parseCommaSeparated(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}
