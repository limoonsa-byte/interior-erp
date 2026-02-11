"use client";

import React, { useEffect, useState } from "react";

function getTodayDateLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatNumber(n: number): string {
  return n.toLocaleString("ko-KR");
}

type EstimateItem = {
  category: string;
  spec: string;
  unit: string;
  qty: number;
  unitPrice: number;
  note: string;
};

type Estimate = {
  id: number;
  consultationId?: number;
  customerName: string;
  contact: string;
  address: string;
  title: string;
  estimateDate?: string;
  note: string;
  items: EstimateItem[];
  createdAt?: string;
};

const emptyItem: EstimateItem = {
  category: "",
  spec: "",
  unit: "식",
  qty: 1,
  unitPrice: 0,
  note: "",
};

function amount(item: EstimateItem): number {
  return Number(item.qty) * Number(item.unitPrice);
}

function EstimateForm({
  estimate,
  consultationPreFill,
  onSave,
  onCancel,
}: {
  estimate: Estimate | null;
  consultationPreFill: { customerName: string; contact: string; address: string } | null;
  onSave: () => void;
  onCancel: () => void;
}) {
  const isEdit = estimate !== null;
  const [customerName, setCustomerName] = useState(estimate?.customerName ?? consultationPreFill?.customerName ?? "");
  const [contact, setContact] = useState(estimate?.contact ?? consultationPreFill?.contact ?? "");
  const [address, setAddress] = useState(estimate?.address ?? consultationPreFill?.address ?? "");
  const [title, setTitle] = useState(estimate?.title ?? "");
  const [estimateDate, setEstimateDate] = useState(estimate?.estimateDate ?? getTodayDateLocal());
  const [note, setNote] = useState(estimate?.note ?? "");
  const [items, setItems] = useState<EstimateItem[]>(
    estimate?.items?.length ? estimate.items.map((i) => ({ ...i, qty: Number(i.qty) || 0, unitPrice: Number(i.unitPrice) || 0 })) : [{ ...emptyItem }]
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (consultationPreFill && !isEdit) {
      setCustomerName(consultationPreFill.customerName);
      setContact(consultationPreFill.contact);
      setAddress(consultationPreFill.address);
    }
  }, [consultationPreFill, isEdit]);

  const addRow = () => setItems((prev) => [...prev, { ...emptyItem }]);
  const removeRow = (idx: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };
  const updateItem = (idx: number, field: keyof EstimateItem, value: string | number) => {
    setItems((prev) => {
      const next = [...prev];
      (next[idx] as Record<string, unknown>)[field] = value;
      if (field === "qty" || field === "unitPrice") {
        next[idx].qty = Number(next[idx].qty) || 0;
        next[idx].unitPrice = Number(next[idx].unitPrice) || 0;
      }
      return next;
    });
  };

  const subtotal = items.reduce((sum, it) => sum + amount(it), 0);
  const vat = Math.floor(subtotal * 0.1);
  const total = subtotal + vat;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        consultationId: estimate?.consultationId ?? (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("consultationId") : null),
        customerName: customerName.trim(),
        contact: contact.trim(),
        address: address.trim(),
        title: title.trim(),
        estimateDate: estimateDate || undefined,
        note: note.trim(),
        items: items.map((it) => ({
          category: it.category,
          spec: it.spec,
          unit: it.unit,
          qty: Number(it.qty) || 0,
          unitPrice: Number(it.unitPrice) || 0,
          note: it.note,
        })),
      };
      const url = isEdit ? `/api/estimates/${estimate.id}` : "/api/estimates";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "저장에 실패했습니다.");
        return;
      }
      alert(isEdit ? "수정되었습니다." : "저장되었습니다.");
      onSave();
    } catch {
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">고객명</label>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="고객명"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">연락처</label>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="연락처"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">주소</label>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="주소"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">견적 제목</label>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 거실 리모델링 견적"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">견적일자</label>
          <input
            type="date"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={estimateDate}
            onChange={(e) => setEstimateDate(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">비고</label>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="비고"
          />
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">견적 항목</h3>
        <button type="button" onClick={addRow} className="rounded-lg border border-blue-500 bg-white px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50">
          + 항목 추가
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-gray-700">
              <th className="p-2">공종/항목</th>
              <th className="p-2">규격</th>
              <th className="p-2 w-20">단위</th>
              <th className="p-2 w-24">수량</th>
              <th className="p-2 w-28">단가</th>
              <th className="p-2 w-28">금액</th>
              <th className="p-2">비고</th>
              <th className="w-10 p-2" />
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-100">
                <td className="p-2">
                  <input
                    type="text"
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                    value={item.category}
                    onChange={(e) => updateItem(idx, "category", e.target.value)}
                    placeholder="도배, 바닥 등"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                    value={item.spec}
                    onChange={(e) => updateItem(idx, "spec", e.target.value)}
                    placeholder="규격"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                    value={item.unit}
                    onChange={(e) => updateItem(idx, "unit", e.target.value)}
                    placeholder="식, m²"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    min={0}
                    step={1}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                    value={item.qty || ""}
                    onChange={(e) => updateItem(idx, "qty", e.target.value)}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                    value={item.unitPrice || ""}
                    onChange={(e) => updateItem(idx, "unitPrice", e.target.value)}
                  />
                </td>
                <td className="p-2 text-right font-medium">{formatNumber(amount(item))}</td>
                <td className="p-2">
                  <input
                    type="text"
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                    value={item.note}
                    onChange={(e) => updateItem(idx, "note", e.target.value)}
                    placeholder="비고"
                  />
                </td>
                <td className="p-2">
                  <button type="button" onClick={() => removeRow(idx)} className="text-red-500 hover:underline" disabled={items.length <= 1}>
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-end gap-4 border-t border-gray-200 pt-4">
        <div className="text-sm text-gray-600">
          소계: <strong>{formatNumber(subtotal)}</strong>원 · 부가세(10%): <strong>{formatNumber(vat)}</strong>원 · 합계: <strong>{formatNumber(total)}</strong>원
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          취소
        </button>
        <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
          {saving ? "저장 중..." : "저장"}
        </button>
      </div>
    </form>
  );
}

export default function EstimatePage() {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [formOpen, setFormOpen] = useState<"new" | number | null>(null);
  const [consultationPreFill, setConsultationPreFill] = useState<{ customerName: string; contact: string; address: string } | null>(null);

  const load = () => {
    fetch("/api/estimates")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setEstimates(data);
      })
      .catch(() => setEstimates([]));
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search);
    const cId = q.get("consultationId");
    if (cId) {
      fetch("/api/consultations")
        .then((res) => res.json())
        .then((list) => {
          const c = Array.isArray(list) ? list.find((x: { id: number }) => String(x.id) === cId) : null;
          if (c) setConsultationPreFill({ customerName: c.customerName ?? "", contact: c.contact ?? "", address: c.address ?? "" });
        })
        .catch(() => {});
    }
  }, []);

  const editingEstimate = formOpen !== null && formOpen !== "new" ? estimates.find((e) => e.id === formOpen) ?? null : null;
  const showForm = formOpen !== null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-900">견적서 작성</h1>
        <button
          type="button"
          onClick={() => setFormOpen("new")}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          신규 견적
        </button>
      </div>

      {showForm ? (
        <EstimateForm
          estimate={editingEstimate ?? null}
          consultationPreFill={formOpen === "new" ? consultationPreFill : null}
          onSave={() => {
            setFormOpen(null);
            load();
          }}
          onCancel={() => setFormOpen(null)}
        />
      ) : (
        <>
          <p className="text-sm text-gray-500">저장된 견적 목록입니다. 수정·삭제하거나 신규 견적을 작성할 수 있습니다.</p>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-gray-700">
                <tr>
                  <th className="p-3">견적일자</th>
                  <th className="p-3">고객명</th>
                  <th className="p-3">연락처</th>
                  <th className="p-3">제목</th>
                  <th className="p-3 text-right">합계</th>
                  <th className="w-24 p-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {estimates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      저장된 견적이 없습니다. &quot;신규 견적&quot;으로 작성해 보세요.
                    </td>
                  </tr>
                ) : (
                  estimates.map((est) => {
                    const subtotal = (est.items || []).reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.unitPrice) || 0), 0);
                    const total = subtotal + Math.floor(subtotal * 0.1);
                    return (
                      <tr key={est.id} className="text-gray-700 hover:bg-gray-50">
                        <td className="p-3">{est.estimateDate ?? "-"}</td>
                        <td className="p-3 font-medium">{est.customerName || "-"}</td>
                        <td className="p-3">{est.contact || "-"}</td>
                        <td className="p-3">{est.title || "-"}</td>
                        <td className="p-3 text-right">{formatNumber(total)}원</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setFormOpen(est.id)}
                              className="text-blue-600 hover:underline"
                            >
                              수정
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (!confirm("이 견적을 삭제할까요?")) return;
                                fetch(`/api/estimates/${est.id}`, { method: "DELETE" })
                                  .then((res) => res.ok && load())
                                  .catch(() => alert("삭제 실패"));
                              }}
                              className="text-red-500 hover:underline"
                            >
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
