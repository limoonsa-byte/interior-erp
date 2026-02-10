"use client";

import React, { useState } from "react";

export default function ConsultingPage() {
  const [consultations] = useState([
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
            <label className="w-16 text-sm font-bold text-gray-600">지역</label>
            <select className="flex-1 rounded border border-gray-300 px-2 py-1.5 text-sm">
              <option>전체</option>
              <option>서울</option>
              <option>경기</option>
              <option>대구</option>
            </select>
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
              <th className="p-3">지역</th>
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
                <td className="p-3 font-medium">{item.customerName}</td>
                <td className="p-3">{item.contact}</td>
                <td className="p-3">{item.region}</td>
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
          <button className="rounded border border-blue-500 bg-white px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50">
            신규등록
          </button>
        </div>
      </div>
    </div>
  );
}
