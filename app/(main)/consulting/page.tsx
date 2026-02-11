"use client";

import React, { useEffect, useRef, useState } from "react";

/** 오늘 날짜 00:00 기준 (datetime-local 형식). 오늘·이후만 선택 가능하게 min에 사용 */
function getTodayDatetimeLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}T00:00`;
}

/** 오늘 날짜 (type="date"용 YYYY-MM-DD). 기준날짜/기본값용 */
function getTodayDateLocal(): string {
  return getTodayDatetimeLocal().slice(0, 10);
}

type Consultation = {
  id: number;
  customerName: string;
  contact: string;
  region: string;
  address: string;
  pyung: number;
  status: string;
  pic: string;
  note?: string;
  consultedAt?: string;
  scope?: string[];
  date: string;
};

type PicItem = { id: number; name: string };

function DetailModal({
  data,
  editId,
  picList,
  onClose,
  onSaved,
}: {
  data: Consultation;
  editId: number | null;
  /** 관리에서 설정한 담당자 목록 */
  picList: PicItem[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const defaultScopeItems = [
    "샤시제외", "전체시공", "도배", "바닥", "거실욕실", "안방욕실", "싱크대", "전기조명",
    "중문", "확장", "방수", "신발장", "붙박이장", "화장대", "문교체",
  ];
  const [scopeItems, setScopeItems] = useState<string[]>(() =>
    data.scope?.length
      ? [...new Set([...defaultScopeItems, ...data.scope])]
      : defaultScopeItems
  );
  const [scopeEditOpen, setScopeEditOpen] = useState(false);
  const [scopeNewItem, setScopeNewItem] = useState("");
  const [postcode, setPostcode] = useState(
    data.address ? data.address.slice(0, 5).replace(/\D/g, "") || "42496" : "42496"
  );
  const [roadAddress, setRoadAddress] = useState(
    data.address?.replace(/^\d+\s*/, "").trim() || "대구 남구 앞산순환로69길 19-1"
  );
  const [detailAddress, setDetailAddress] = useState(
    data.address?.includes("호") ? data.address.split(" ").pop() || "202호" : "202호"
  );

  const handleSearchAddress = () => {
    if (typeof window === "undefined") return;

    const openPostcode = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { daum } = window as any;
      if (!daum || !daum.Postcode) return;

      new daum.Postcode({
        oncomplete: (result: {
          zonecode: string;
          roadAddress: string;
          buildingName?: string;
        }) => {
          setPostcode(result.zonecode);
          const road = result.roadAddress || "";
          setRoadAddress(
            result.buildingName ? `${road} ${result.buildingName}` : road
          );
          setDetailAddress("");
        },
      }).open();
    };

    // 스크립트가 없으면 먼저 로드
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (!w.daum || !w.daum.Postcode) {
      const script = document.createElement("script");
      script.src =
        "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
      script.async = true;
      script.onload = openPostcode;
      document.body.appendChild(script);
    } else {
      openPostcode();
    }
  };

  const buildPayload = () => {
    if (!formRef.current) return null;
    const fd = new FormData(formRef.current);
    const address = `${postcode} ${roadAddress} ${detailAddress}`.trim();
    const scope = scopeItems.filter((label) => fd.get(`scope_${label}`) === "on");
    return {
      customerName: (fd.get("customerName") as string) ?? data.customerName,
      contact: (fd.get("contact") as string) ?? data.contact,
      region: data.region ?? "",
      address,
      pyung: Number(fd.get("pyung")) || data.pyung,
      status: (fd.get("status") as string) ?? data.status,
      pic: (fd.get("pic") as string) ?? data.pic,
      note: (fd.get("note") as string) ?? "",
      consultedAt: (fd.get("consultedAt") as string) || undefined,
      scope,
    };
  };

  const handleAction = (mode: "save" | "estimate") => {
    if (!formRef.current) return;
    const payload = buildPayload();
    if (!payload) return;

    if (mode === "save") {
      // editId가 있으면 무조건 수정(PATCH), 없으면 신규(POST)
      const isEdit = editId !== null && editId > 0;
      const url = isEdit
        ? `/api/consultations/${editId}`
        : "/api/consultations";
      const method = isEdit ? "PATCH" : "POST";

      fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(async (res) => {
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error((data as { error?: string }).error || "저장 실패");
          alert(isEdit ? "상담이 수정되었습니다." : "상담이 등록되었습니다.");
          onClose();
          onSaved();
        })
        .catch((e) => {
          alert(e instanceof Error ? e.message : "저장 중 오류가 발생했습니다.");
        });
      return;
    }

    window.location.href = "/estimate";
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <form ref={formRef}>
          {/* 상단 제목/닫기 */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">상담 상세</h2>
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-full text-gray-500 hover:bg-gray-100"
              aria-label="닫기"
            >
              ✕
            </button>
          </div>

        {/* 진행상태 */}
        <section className="mb-5">
          <h3 className="mb-2 text-sm font-semibold text-gray-700">
            진행상태
          </h3>
          <div className="flex flex-wrap gap-4 text-sm">
            {["접수", "현장실측", "견적미팅", "견적완료", "상담종단", "계약", "취소", "완료"].map(
              (label) => (
                <label
                  key={label}
                  className="flex cursor-pointer items-center gap-1"
                >
                  <input
                    type="radio"
                    name="status"
                    value={label}
                    defaultChecked={label === (data.status || "접수")}
                  />
                  {label}
                </label>
              )
            )}
          </div>
        </section>

        {/* 상담 예약날짜 */}
        <section className="mb-5">
          <p className="mb-2 text-sm font-semibold text-gray-700">상담 예약날짜</p>
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              if (typeof dateInputRef.current?.showPicker === "function") {
                dateInputRef.current.showPicker();
              } else {
                dateInputRef.current?.focus();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                if (typeof dateInputRef.current?.showPicker === "function") {
                  dateInputRef.current.showPicker();
                } else {
                  dateInputRef.current?.focus();
                }
              }
            }}
            className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm md:flex-row md:items-center md:gap-4 cursor-pointer hover:bg-gray-100/80 transition-colors"
          >
            <span className="whitespace-nowrap text-gray-700">상담 예약날짜</span>
            <input
              ref={dateInputRef}
              id="consulting-datetime"
              name="consultedAt"
              type="datetime-local"
              className="flex-1 min-w-0 cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
              defaultValue={data.consultedAt ? data.consultedAt.slice(0, 16) : getTodayDatetimeLocal()}
              min={getTodayDatetimeLocal()}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </section>

        {/* 기본 정보 */}
        <section className="mb-5 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                고객이름
              </label>
              <input
                type="text"
                name="customerName"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                defaultValue={data.customerName}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                연락처
              </label>
              <input
                type="text"
                name="contact"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                defaultValue={data.contact}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              주소
            </label>
            <div className="mb-2 flex gap-2">
              <input
                type="text"
                className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
              />
              <button
                type="button"
                onClick={handleSearchAddress}
                className="rounded-lg bg-gray-800 px-3 py-2 text-sm text-white"
              >
                검색
              </button>
            </div>
            <input
              type="text"
              className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={roadAddress}
              onChange={(e) => setRoadAddress(e.target.value)}
              placeholder="도로명 주소"
            />
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              아파트명, 상세주소
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={detailAddress}
              onChange={(e) => setDetailAddress(e.target.value)}
              placeholder="예: L앞산아파트 202호"
            />
          </div>
        </section>

        {/* 평수, 준공연도, 공사 시작 날짜, 입주일자 */}
        <section className="mb-5 grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                평수
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="pyung"
                  min={1}
                  max={999}
                  defaultValue={data.pyung || 0}
                  className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
                <span className="text-sm text-gray-600">평</span>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                공사 시작 날짜
              </label>
              <input
                type="date"
                className="w-full cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-sm"
                defaultValue={getTodayDateLocal()}
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                준공년도
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  defaultValue="2002"
                />
                <span className="text-sm text-gray-600">년</span>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                입주일자
              </label>
              <input
                type="date"
                className="w-full cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-sm"
                defaultValue={getTodayDateLocal()}
              />
            </div>
          </div>
        </section>

        {/* 시공범위 / 예산 / 담당자 / 요청사항 */}
        <section className="mb-5 space-y-4">
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700">
                시공범위
              </label>
              <button
                type="button"
                onClick={() => setScopeEditOpen(true)}
                className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
              >
                수정/추가
              </button>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              {scopeItems.map((label, idx) => (
                <label
                  key={`${label}-${idx}`}
                  className="flex cursor-pointer items-center gap-1"
                >
                  <input
                    type="checkbox"
                    name={`scope_${label}`}
                    defaultChecked={
                      data.scope
                        ? data.scope.includes(label)
                        : idx < 2 || label === "중문" || label === "확장"
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {scopeEditOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
                <h3 className="mb-4 text-base font-semibold text-gray-900">
                  시공범위 수정/추가
                </h3>
                <div className="mb-4 flex gap-2">
                  <input
                    type="text"
                    value={scopeNewItem}
                    onChange={(e) => setScopeNewItem(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (scopeNewItem.trim()) {
                          setScopeItems([...scopeItems, scopeNewItem.trim()]);
                          setScopeNewItem("");
                        }
                      }
                    }}
                    placeholder="새 항목 입력 후 추가"
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (scopeNewItem.trim()) {
                        setScopeItems([...scopeItems, scopeNewItem.trim()]);
                        setScopeNewItem("");
                      }
                    }}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    추가
                  </button>
                </div>
                <ul className="mb-4 max-h-48 space-y-1 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-2 text-sm">
                  {scopeItems.map((item, idx) => (
                    <li
                      key={`${item}-${idx}`}
                      className="flex items-center justify-between rounded px-2 py-1.5 hover:bg-gray-100"
                    >
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setScopeItems(scopeItems.filter((_, i) => i !== idx))
                        }
                        className="rounded px-2 py-0.5 text-red-600 hover:bg-red-50"
                      >
                        삭제
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setScopeEditOpen(false);
                      setScopeNewItem("");
                    }}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                시공예산
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  defaultValue="33,000,000"
                />
                <span className="text-sm text-gray-700">원</span>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                담당자
              </label>
              <select
                name="pic"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                defaultValue={data.pic}
              >
                <option value="">선택</option>
                {picList.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
                {data.pic && !picList.some((p) => p.name === data.pic) && (
                  <option value={data.pic}>{data.pic}</option>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              요청사항
            </label>
            <textarea
              name="note"
              className="h-24 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm"
              defaultValue={data.note ?? "빠른시공"}
            />
          </div>
        </section>

          {/* 하단 버튼 */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => handleAction("estimate")}
              className="rounded-lg border border-gray-400 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50"
            >
              견적작성
            </button>
            <button
              type="button"
              onClick={() => handleAction("save")}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const emptyConsultation: Consultation = {
  id: 0,
  customerName: "",
  contact: "",
  region: "대구광역시",
  address: "",
  pyung: 0,
  status: "접수",
  pic: "",
  date: "",
};

export default function ConsultingPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([
    {
      id: 1,
      customerName: "디무디",
      contact: "010-9787-9595",
      region: "대구광역시",
      address: "대구 남구 앞산순환로69길 19-1 202호",
      pyung: 33,
      status: "진행중",
      pic: "김담당",
      date: "2024-02-10",
    },
  ]);
  const [active, setActive] = useState<Consultation | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [picList, setPicList] = useState<PicItem[]>([]);

  const loadFromDb = () => {
    fetch("/api/consultations")
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        // DB 데이터로 항상 갱신 (수정 후에도 메인 목록에 반영)
        setConsultations(
          data.map((item: Record<string, unknown>) => ({
            id: Number(item.id),
            customerName: String(item.customerName ?? item.customer_name ?? ""),
            contact: String(item.contact ?? ""),
            region: String(item.region ?? ""),
            address: String(item.address ?? ""),
            pyung: Number(item.pyung ?? 0),
            status: String(item.status ?? ""),
            pic: String(item.pic ?? ""),
            note: item.note != null ? String(item.note) : undefined,
            consultedAt: item.consultedAt != null ? String(item.consultedAt) : undefined,
            scope: Array.isArray(item.scope) ? (item.scope as string[]) : undefined,
            date: "",
          }))
        );
      })
      .catch((err) => {
        console.error("consultations load error", err);
      });
  };

  useEffect(() => {
    loadFromDb();
  }, []);

  useEffect(() => {
    fetch("/api/company/pics")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPicList(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="p-6 bg-white min-h-screen">
      <h2 className="mb-6 text-xl font-bold text-gray-800">
        상담 <span className="text-blue-600">({consultations.length})</span>건
      </h2>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="flex items-center gap-2">
            <label className="w-16 text-sm font-bold text-gray-600">고객명</label>
            <input
              type="text"
              className="flex-1 rounded border border-gray-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="w-16 text-sm font-bold text-gray-600">
              진행상태
            </label>
            <select className="flex-1 rounded border border-gray-300 px-2 py-1.5 text-sm">
              <option>선택</option>
              <option>신규</option>
              <option>상담중</option>
              <option>완료</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="w-16 text-sm font-bold text-gray-600">
              담당자명
            </label>
            <select className="flex-1 rounded border border-gray-300 px-2 py-1.5 text-sm">
              <option>전체</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="w-16 text-sm font-bold text-gray-600">
                평수
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="w-20 rounded border border-gray-300 px-2 py-1.5 text-right text-sm"
                />
                <span className="text-sm text-gray-600">평 이상</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="w-16 text-sm font-bold text-gray-600">
                접수기간
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="date"
                  className="rounded border border-gray-300 px-2 py-1.5 text-sm"
                />
                <span className="text-gray-400">~</span>
                <input
                  type="date"
                  className="rounded border border-gray-300 px-2 py-1.5 text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2 text-sm">
              <label className="flex cursor-pointer items-center gap-1">
                <input type="radio" name="date" /> 금일
              </label>
              <label className="flex cursor-pointer items-center gap-1">
                <input type="radio" name="date" /> 작일
              </label>
              <label className="flex cursor-pointer items-center gap-1">
                <input type="radio" name="date" /> 당월
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="rounded border border-green-500 bg-white px-4 py-2 text-sm font-bold text-green-600 hover:bg-green-50">
              다운로드
            </button>
            <button className="rounded bg-blue-600 px-6 py-2 text-sm font-bold text-white hover:bg-blue-700">
              검색
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-center text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-gray-700">
            <tr>
              <th className="w-10 p-3">
                <input type="checkbox" />
              </th>
              <th className="w-16 p-3">No.</th>
              <th className="p-3">고객명</th>
              <th className="p-3">연락처</th>
              <th className="w-1/3 p-3">주소</th>
              <th className="p-3">평수</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {consultations.map((item, idx) => (
              <tr key={item.id} className="text-gray-700 hover:bg-gray-50">
                <td className="p-3">
                  <input type="checkbox" />
                </td>
                <td className="p-3">{idx + 1}</td>
                <td className="p-3 font-medium">
                  <button
                    type="button"
                    onClick={() => {
                      setActive(item);
                      setEditId(item.id);
                    }}
                    className="text-blue-600 underline-offset-2 hover:underline"
                  >
                    {item.customerName}
                  </button>
                </td>
                <td className="p-3">{item.contact}</td>
                <td className="p-3 truncate text-left">{item.address}</td>
                <td className="p-3">{item.pyung}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="w-20">
          <input
            type="text"
            value="20"
            readOnly
            className="w-full rounded border border-gray-300 px-2 py-1 text-center text-sm"
          />
        </div>

        <div className="flex gap-1">
          <button className="h-8 w-8 rounded border text-gray-500 hover:bg-gray-50">
            «
          </button>
          <button className="h-8 w-8 rounded border text-gray-500 hover:bg-gray-50">
            ‹
          </button>
          <button className="h-8 w-8 rounded border border-blue-200 bg-white font-bold text-blue-600">
            01
          </button>
          <button className="h-8 w-8 rounded border text-gray-500 hover:bg-gray-50">
            ›
          </button>
          <button className="h-8 w-8 rounded border text-gray-500 hover:bg-gray-50">
            »
          </button>
        </div>

        <div className="flex gap-2">
          <button className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
            고객평가 전송
          </button>
          <button className="rounded border border-red-400 bg-white px-4 py-2 text-sm text-red-500 hover:bg-red-50">
            선택삭제
          </button>
          <button
            type="button"
            onClick={() => {
              setActive(emptyConsultation);
              setEditId(null);
            }}
            className="rounded border border-blue-500 bg-white px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50"
          >
            신규등록
          </button>
        </div>
      </div>
      {active && (
        <DetailModal
          key={editId === null ? "new" : `edit-${editId}`}
          data={active}
          editId={editId}
          picList={picList}
          onClose={() => {
            setActive(null);
            setEditId(null);
          }}
          onSaved={loadFromDb}
        />
      )}
    </div>
  );
}
