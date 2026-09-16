import React, { useState } from 'react';
import { 
  UserCheck, 
  Award, 
  ChevronRight, 
  TrendingUp, 
  Shield, 
  Filter,
  Receipt
} from 'lucide-react';
import { TrafficFineRecord, OfficerSummary } from '../types/traffic';

interface OfficerSectionProps {
  records: TrafficFineRecord[];
  onSelectOfficer?: (officerName: string) => void;
  selectedOfficerFilter?: string;
}

export const OfficerSection: React.FC<OfficerSectionProps> = ({
  records,
  onSelectOfficer,
  selectedOfficerFilter
}) => {
  // Aggregate data per officer
  const officerMap = new Map<string, OfficerSummary>();

  records.forEach((r) => {
    const key = r.officerName || 'ไม่ระบุชื่อเจ้าหน้าที่';
    const helmet = r.helmetCode || '-';

    if (!officerMap.has(key)) {
      officerMap.set(key, {
        officerName: key,
        helmetCode: helmet,
        ticketCount: 0,
        totalAmount: 0,
        avgFine: 0,
        actDistribution: {}
      });
    }

    const current = officerMap.get(key)!;
    current.ticketCount += 1;
    current.totalAmount += r.amount;
    if (r.helmetCode && r.helmetCode !== '-' && current.helmetCode === '-') {
      current.helmetCode = r.helmetCode;
    }
    current.actDistribution[r.actType] = (current.actDistribution[r.actType] || 0) + 1;
  });

  const officerList = Array.from(officerMap.values()).map((o) => ({
    ...o,
    avgFine: o.ticketCount > 0 ? Math.round(o.totalAmount / o.ticketCount) : 0
  })).sort((a, b) => b.totalAmount - a.totalAmount);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-['Prompt']">
              ผลการปฏิบัติงานเจ้าหน้าที่ออกใบสั่ง (Officer Performance & Helmet Code)
            </h3>
            <p className="text-xs text-slate-400">
              ข้อมูลชื่อ-สกุล เจ้าหน้าที่ออกใบสั่ง, รหัสหมวก, จำนวนเงิน และจำนวนใบสั่ง (คำนวณสดตามช่วงเวลาที่เลือก)
            </p>
          </div>
        </div>

        {selectedOfficerFilter && selectedOfficerFilter !== 'ALL' && (
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-lg text-xs text-amber-300">
            <span>กำลังกรองเจ้าหน้าที่: <strong>{selectedOfficerFilter}</strong></span>
            {onSelectOfficer && (
              <button 
                onClick={() => onSelectOfficer('ALL')}
                className="underline hover:text-white cursor-pointer ml-1"
              >
                ล้างการเลือก
              </button>
            )}
          </div>
        )}
      </div>

      {/* Grid of Officer Summary Cards */}
      {officerList.length === 0 ? (
        <div className="py-8 text-center text-slate-500 text-xs bg-slate-950/40 rounded-xl border border-slate-800/60">
          ไม่พบข้อมูลเจ้าหน้าที่ออกใบสั่งตามเงื่อนไขที่เลือก
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {officerList.map((officer, index) => {
            const isSelected = selectedOfficerFilter === officer.officerName;
            return (
              <div
                key={officer.officerName}
                onClick={() => onSelectOfficer && onSelectOfficer(isSelected ? 'ALL' : officer.officerName)}
                className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-950/40 border-amber-500/80 shadow-lg shadow-amber-900/20'
                    : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                {/* Rank Badge */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 
                        ? 'bg-amber-400 text-slate-950' 
                        : index === 1 
                        ? 'bg-slate-300 text-slate-950' 
                        : index === 2 
                        ? 'bg-amber-700 text-white' 
                        : 'bg-slate-700 text-slate-300'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 font-mono text-xs text-amber-400 font-semibold">
                      หมวก: {officer.helmetCode}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Receipt className="w-3.5 h-3.5" />
                    {officer.ticketCount} คดี
                  </span>
                </div>

                {/* Name */}
                <div className="mb-3">
                  <h4 className="text-sm font-semibold text-white truncate" title={officer.officerName}>
                    {officer.officerName}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span>สภ.บางน้ำเปรี้ยว</span>
                    <span>•</span>
                    <span>เฉลี่ย ฿{officer.avgFine.toLocaleString()}/ใบ</span>
                  </div>
                </div>

                {/* Stats Footer */}
                <div className="pt-2.5 border-t border-slate-700/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">ยอดรวมค่าปรับ</span>
                    <span className="text-base font-bold text-amber-400 font-['Prompt']">
                      ฿{officer.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 bg-slate-900'
                  }`}>
                    {isSelected ? 'กำลังเลือก' : 'คลิกเพื่อกรอง'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
