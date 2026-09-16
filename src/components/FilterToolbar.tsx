import React from 'react';
import { 
  Calendar, 
  Search, 
  Filter, 
  RotateCcw, 
  ArrowRight, 
  BookOpen, 
  Check, 
  X,
  SlidersHorizontal,
  Clock
} from 'lucide-react';

export type TimeframeMode = 'ALL' | 'LAST_7' | 'WEEK_1' | 'WEEK_2' | 'CUSTOM' | 'SINGLE';

interface FilterToolbarProps {
  // Timeframe
  timeframeMode: TimeframeMode;
  onSelectTimeframeMode: (mode: TimeframeMode) => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
  singleDate: string;
  onSingleDateChange: (date: string) => void;
  availableDates: string[]; // ['01/09/2569', '02/09/2569', ...]

  // Act Dropdown
  selectedAct: string;
  onSelectAct: (act: string) => void;
  actCounts: Record<string, number>;

  // Search & Officer
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedOfficer: string;
  onClearOfficer: () => void;

  // Stats
  filteredCount: number;
  totalCount: number;
  onResetAllFilters: () => void;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  timeframeMode,
  onSelectTimeframeMode,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  singleDate,
  onSingleDateChange,
  availableDates,
  selectedAct,
  onSelectAct,
  actCounts,
  searchQuery,
  onSearchChange,
  selectedOfficer,
  onClearOfficer,
  filteredCount,
  totalCount,
  onResetAllFilters
}) => {
  const isAnyFilterActive = 
    timeframeMode !== 'ALL' || 
    selectedAct !== 'ALL' || 
    selectedOfficer !== 'ALL' || 
    searchQuery.trim() !== '';

  return (
    <div className="bg-slate-900/80 backdrop-blur border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
      {/* Top Row: Timeframe Presets & Act Dropdown */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Timeframe Presets Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 shrink-0">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>ช่วงเวลาข้อมูล:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/70 border border-slate-800 rounded-xl">
            <button
              id="timeframe-preset-all"
              type="button"
              onClick={() => onSelectTimeframeMode('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                timeframeMode === 'ALL'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ทั้งหมด (01-15 ก.ย.)
            </button>
            <button
              id="timeframe-preset-last7"
              type="button"
              onClick={() => onSelectTimeframeMode('LAST_7')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                timeframeMode === 'LAST_7'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              7 วันล่าสุด (09-15 ก.ย.)
            </button>
            <button
              id="timeframe-preset-w1"
              type="button"
              onClick={() => onSelectTimeframeMode('WEEK_1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                timeframeMode === 'WEEK_1'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              สัปดาห์ที่ 1 (01-07 ก.ย.)
            </button>
            <button
              id="timeframe-preset-w2"
              type="button"
              onClick={() => onSelectTimeframeMode('WEEK_2')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                timeframeMode === 'WEEK_2'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              สัปดาห์ที่ 2 (08-15 ก.ย.)
            </button>
            <button
              id="timeframe-preset-custom"
              type="button"
              onClick={() => onSelectTimeframeMode('CUSTOM')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                timeframeMode === 'CUSTOM'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              กำหนดช่วงวันเอง
            </button>
            <button
              id="timeframe-preset-single"
              type="button"
              onClick={() => onSelectTimeframeMode('SINGLE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                timeframeMode === 'SINGLE'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              เลือกวันเฉพาะ
            </button>
          </div>
        </div>

        {/* Dropdown เลือกแสดงข้อมูลแยกตาม พ.ร.บ. */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 shrink-0">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>แยกตาม พ.ร.บ.:</span>
          </div>
          <div className="relative min-w-[220px]">
            <select
              id="act-filter-dropdown"
              value={selectedAct}
              onChange={(e) => onSelectAct(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700/80 text-white font-medium rounded-xl px-3.5 py-2 pr-8 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400 cursor-pointer shadow-sm"
            >
              <option value="ALL">
                📜 ทุก พ.ร.บ. (ทั้งหมด {actCounts['ALL'] || 0} คดี)
              </option>
              <option value="พ.ร.บ.รถยนต์">
                🚗 พ.ร.บ.รถยนต์ พ.ศ. 2522 ({actCounts['พ.ร.บ.รถยนต์'] || 0} คดี)
              </option>
              <option value="พ.ร.บ.จราจรทางบก">
                🚦 พ.ร.บ.จราจรทางบก พ.ศ. 2522 ({actCounts['พ.ร.บ.จราจรทางบก'] || 0} คดี)
              </option>
              <option value="พ.ร.บ.ขนส่ง">
                🚛 พ.ร.บ.การขนส่งทางบก พ.ศ. 2522 ({actCounts['พ.ร.บ.ขนส่ง'] || 0} คดี)
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Conditional Sub-Row: Custom Date Range Pickers OR Single Date Picker */}
      {timeframeMode === 'CUSTOM' && (
        <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-950/50 border border-slate-800 rounded-xl text-xs">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <Calendar className="w-4 h-4" />
            <span>ระบุช่วงวันที่ต้องการดูข้อมูล:</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">จากวันที่</span>
            <select
              id="custom-start-date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {availableDates.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="text-slate-400">ถึงวันที่</span>
            <select
              id="custom-end-date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {availableDates.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <span className="text-[11px] text-slate-400 ml-auto">
            กำลังแสดงข้อมูลช่วง: <strong className="text-amber-300">{startDate} ถึง {endDate}</strong>
          </span>
        </div>
      )}

      {timeframeMode === 'SINGLE' && (
        <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-950/50 border border-slate-800 rounded-xl text-xs">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <Calendar className="w-4 h-4" />
            <span>เลือกวันที่เฉพาะเจาะจง:</span>
          </div>

          <select
            id="single-date-select"
            value={singleDate}
            onChange={(e) => onSingleDateChange(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            {availableDates.map((d) => (
              <option key={d} value={d}>
                วันที่ {d}
              </option>
            ))}
          </select>

          <span className="text-[11px] text-slate-400 ml-auto">
            กำลังแสดงข้อมูลเฉพาะวันที่: <strong className="text-amber-300">{singleDate}</strong>
          </span>
        </div>
      )}

      {/* Bottom Row: Search Box & Active Filter Status Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 border-t border-slate-800/60">
        
        {/* Search input with clear button */}
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ค้นหาชื่อเจ้าหน้าที่, รหัสหมวก, เลขใบสั่ง, ข้อหา..."
            className="w-full pl-9 pr-8 py-2 bg-slate-800/70 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
              title="ล้างคำค้นหา"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status badges & Reset button */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end text-xs">
          {/* Active filter badges */}
          <div className="flex flex-wrap items-center gap-2">
            {selectedOfficer !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-500/10 border border-sky-500/30 rounded-lg text-[11px] text-sky-300">
                จนท: <strong>{selectedOfficer}</strong>
                <button 
                  onClick={onClearOfficer}
                  className="hover:text-white ml-0.5 cursor-pointer"
                  title="ยกเลิกการกรองเจ้าหน้าที่"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedAct !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-[11px] text-amber-300">
                พ.ร.บ: <strong>{selectedAct}</strong>
                <button 
                  onClick={() => onSelectAct('ALL')}
                  className="hover:text-white ml-0.5 cursor-pointer"
                  title="ยกเลิกการกรอง พ.ร.บ."
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          <div className="text-slate-400 font-medium">
            พบ <strong className="text-white">{filteredCount}</strong> / {totalCount} รายการ
          </div>

          {isAnyFilterActive && (
            <button
              id="reset-all-filters-btn"
              type="button"
              onClick={onResetAllFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium transition-colors cursor-pointer"
              title="ล้างตัวกรองทั้งหมด"
            >
              <RotateCcw className="w-3 h-3" />
              <span>ล้างตัวกรอง</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
