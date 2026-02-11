"use client";

import React, { useCallback, useEffect, useState } from "react";

type PicItem = { id: number; name: string };

export default function AdminPage() {
  const [pics, setPics] = useState<PicItem[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPics = useCallback(() => {
    fetch("/api/company/pics")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPics(data);
          setError(null);
        } else {
          setError((data as { error?: string }).error || "목록을 불러올 수 없습니다.");
        }
      })
      .catch(() => setError("목록을 불러올 수 없습니다."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadPics();
  }, [loadPics]);

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    setLoading(true);
    fetch("/api/company/pics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (res.ok) {
          setNewName("");
          loadPics();
        } else {
          alert((data as { error?: string }).error || "추가 실패");
        }
      })
      .catch(() => alert("추가 중 오류가 발생했습니다."))
      .finally(() => setLoading(false));
  };

  const handleDelete = (id: number) => {
    if (!confirm("이 담당자를 목록에서 삭제할까요?")) return;
    fetch(`/api/company/pics/${id}`, { method: "DELETE" })
      .then((res) => res.json())
      .then((data) => {
        if (res.ok) {
          loadPics();
        } else {
          alert((data as { error?: string }).error || "삭제 실패");
        }
      })
      .catch(() => alert("삭제 중 오류가 발생했습니다."));
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      <h1 className="mb-6 text-xl font-bold text-gray-800">관리</h1>

      <section className="mb-8 max-w-xl rounded-lg border border-gray-200 bg-gray-50/50 p-5">
        <h2 className="mb-4 text-base font-semibold text-gray-800">담당자 설정</h2>
        <p className="mb-4 text-sm text-gray-600">
          여기서 등록한 담당자는 상담 등록·수정 시 담당자 선택 목록에 표시됩니다.
        </p>

        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="담당자명 입력"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={loading || !newName.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            추가
          </button>
        </div>

        {error && (
          <p className="mb-3 text-sm text-amber-600">{error}</p>
        )}

        {loading && pics.length === 0 ? (
          <p className="text-sm text-gray-500">불러오는 중...</p>
        ) : pics.length === 0 ? (
          <p className="text-sm text-gray-500">등록된 담당자가 없습니다. 위에서 추가해 주세요.</p>
        ) : (
          <ul className="space-y-2">
            {pics.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
              >
                <span className="font-medium text-gray-800">{item.name}</span>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="rounded px-2 py-1 text-red-600 hover:bg-red-50"
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
