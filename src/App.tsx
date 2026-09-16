import React, { useState, useEffect, useMemo } from 'react';
import { 
  RefreshCw, 
  FileSpreadsheet, 
  LogOut, 
  Layers, 
  DollarSign, 
  FileText, 
  Users, 
  LayoutDashboard,
  Lightbulb,
  UserCheck,
  BarChart3,
  Table
} from 'lucide-react';

import { TrafficFineRecord, DateSummary } from './types/traffic';
import { INITIAL_TRAFFIC_FINES } from './data/initialTrafficData';
import { fetchTrafficFinesFromFirestore } from './services/trafficService';
import { LoginModal } from './components/LoginModal';
import { UpdateDataModal } from './components/UpdateDataModal';
import { OfficerSection } from './components/OfficerSection';
import { ChartsSection } from './components/ChartsSection';
import { DataTableSection } from './components/DataTableSection';
import { ExecutiveInsights } from './components/ExecutiveInsights';
import { FilterToolbar, TimeframeMode } from './components/FilterToolbar';

// Helper to convert DD/MM/YYYY into numeric score YYYYMMDD
const parseDateScore = (dateStr: string): number => {
  if (!dateStr) return 0;
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const d = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    const y = parseInt(parts[2], 10) || 0;
    return y * 10000 + m * 100 + d;
  }
  return 0;
};

export default function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Data State
  const [records, setRecords] = useState<TrafficFineRecord[]>(INITIAL_TRAFFIC_FINES);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);

  // Filter States: Timeframe
  const [timeframeMode, setTimeframeMode] = useState<TimeframeMode>('ALL');
  const [startDate, setStartDate] = useState<string>('01/09/2569');
  const [endDate, setEndDate] = useState<string>('15/09/2569');
  const [singleDate, setSingleDate] = useState<string>('15/09/2569');

  // Filter States: Act Dropdown & Search & Officer
  const [selectedActFilter, setSelectedActFilter] = useState<string>('ALL');
  const [selectedOfficerFilter, setSelectedOfficerFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // View Navigation Tab for clean, relaxed UX
  const [activeViewTab, setActiveViewTab] = useState<'ALL' | 'INSIGHTS' | 'OFFICERS' | 'CHARTS' | 'TABLE'>('ALL');

  // Check initial authentication
  useEffect(() => {
    const auth = sessionStorage.getItem('bnp_auth');
    if (auth === 'authenticated') {
      setIsAuthenticated(true);
    }
    setAuthChecked(true);
  }, []);

  // Fetch data on load
  const loadData = async (showLoadingState = true) => {
    if (showLoadingState) setIsLoading(true);
    try {
      const data = await fetchTrafficFinesFromFirestore();
      if (data && data.length > 0) {
        setRecords(data);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('bnp_auth');
    sessionStorage.removeItem('bnp_user');
    setIsAuthenticated(false);
  };

  // Distinct dates available in dataset for dropdowns
  const availableDates = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.paymentDate) set.add(r.paymentDate);
    });
    return Array.from(set).sort((a, b) => {
      return parseDateScore(a) - parseDateScore(b);
    });
  }, [records]);

  // Set default start/end dates once dates are known
  useEffect(() => {
    if (availableDates.length > 0) {
      if (!startDate || !availableDates.includes(startDate)) {
        setStartDate(availableDates[0]);
      }
      if (!endDate || !availableDates.includes(endDate)) {
        setEndDate(availableDates[availableDates.length - 1]);
      }
      if (!singleDate || !availableDates.includes(singleDate)) {
        setSingleDate(availableDates[availableDates.length - 1]);
      }
    }
  }, [availableDates]);

  // 1. Records filtered by Timeframe (used to compute Act counts)
  const dateFilteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (timeframeMode === 'ALL') return true;
      if (timeframeMode === 'SINGLE') {
        return r.paymentDate === singleDate;
      }
      if (timeframeMode === 'LAST_7') {
        if (availableDates.length <= 7) return true;
        const last7 = availableDates.slice(-7);
        return last7.includes(r.paymentDate);
      }
      if (timeframeMode === 'WEEK_1') {
        const day = parseInt(r.paymentDate.split('/')[0], 10);
        return day >= 1 && day <= 7;
      }
      if (timeframeMode === 'WEEK_2') {
        const day = parseInt(r.paymentDate.split('/')[0], 10);
        return day >= 8 && day <= 15;
      }
      if (timeframeMode === 'CUSTOM') {
        const score = parseDateScore(r.paymentDate);
        const startScore = parseDateScore(startDate);
        const endScore = parseDateScore(endDate);
        const min = Math.min(startScore, endScore);
        const max = Math.max(startScore, endScore);
        if (min > 0 && score < min) return false;
        if (max > 0 && score > max) return false;
        return true;
      }
      return true;
    });
  }, [records, timeframeMode, singleDate, startDate, endDate, availableDates]);

  // 2. Act counts within the selected timeframe
  const actCounts = useMemo(() => {
    return {
      ALL: dateFilteredRecords.length,
      'พ.ร.บ.รถยนต์': dateFilteredRecords.filter(r => r.actType.includes('รถยนต์')).length,
      'พ.ร.บ.จราจรทางบก': dateFilteredRecords.filter(r => r.actType.includes('จราจร')).length,
      'พ.ร.บ.ขนส่ง': dateFilteredRecords.filter(r => r.actType.includes('ขนส่ง')).length,
    };
  }, [dateFilteredRecords]);

  // Records for Officer Section (keep all officer cards visible, so user can click to inspect/compare)
  const officerSectionRecords = useMemo(() => {
    return dateFilteredRecords.filter((r) => {
      if (selectedActFilter !== 'ALL' && !r.actType.includes(selectedActFilter)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = 
          r.ticketNumber.toLowerCase().includes(q) ||
          r.officerName.toLowerCase().includes(q) ||
          r.payerName.toLowerCase().includes(q) ||
          r.offense.toLowerCase().includes(q) ||
          r.legalSection.toLowerCase().includes(q) ||
          r.helmetCode.toLowerCase().includes(q) ||
          r.paymentDate.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [dateFilteredRecords, selectedActFilter, searchQuery]);

  // Records for DataTable (timeframe + officer filtered, allowing Act tabs & table search to operate smoothly)
  const tableBaseRecords = useMemo(() => {
    return dateFilteredRecords.filter((r) => {
      if (selectedOfficerFilter !== 'ALL' && r.officerName !== selectedOfficerFilter) {
        return false;
      }
      return true;
    });
  }, [dateFilteredRecords, selectedOfficerFilter]);

  // 3. Fully filtered records (Timeframe + Act Dropdown + Officer + Search)
  const filteredRecords = useMemo(() => {
    return dateFilteredRecords.filter((r) => {
      // Act dropdown filter
      if (selectedActFilter !== 'ALL' && !r.actType.includes(selectedActFilter)) {
        return false;
      }
      // Officer filter
      if (selectedOfficerFilter !== 'ALL' && r.officerName !== selectedOfficerFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = 
          r.ticketNumber.toLowerCase().includes(q) ||
          r.officerName.toLowerCase().includes(q) ||
          r.payerName.toLowerCase().includes(q) ||
          r.offense.toLowerCase().includes(q) ||
          r.legalSection.toLowerCase().includes(q) ||
          r.helmetCode.toLowerCase().includes(q) ||
          r.paymentDate.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [dateFilteredRecords, selectedActFilter, selectedOfficerFilter, searchQuery]);

  // Reset all filters in one click
  const handleResetAllFilters = () => {
    setTimeframeMode('ALL');
    setSelectedActFilter('ALL');
    setSelectedOfficerFilter('ALL');
    setSearchQuery('');
  };

  // Aggregate Metrics based on active filters
  const metrics = useMemo(() => {
    const totalAmount = filteredRecords.reduce((sum, r) => sum + r.amount, 0);
    const totalCount = filteredRecords.length;
    const avgFine = totalCount > 0 ? Math.round(totalAmount / totalCount) : 0;
    
    // Active officers in current selection
    const officerSet = new Set(filteredRecords.map((r) => r.officerName));
    const activeOfficersCount = officerSet.size;

    return {
      totalAmount,
      totalCount,
      avgFine,
      activeOfficersCount
    };
  }, [filteredRecords]);

  // Date summaries for charts
  const dateSummaries: DateSummary[] = useMemo(() => {
    const map = new Map<string, { count: number; totalAmount: number; ktbAmount: number; stationAmount: number }>();
    filteredRecords.forEach((r) => {
      const d = r.paymentDate;
      const current = map.get(d) || { count: 0, totalAmount: 0, ktbAmount: 0, stationAmount: 0 };
      current.count += 1;
      current.totalAmount += r.amount;
      if (r.paymentChannel.toUpperCase().includes('STATION')) {
        current.stationAmount += r.amount;
      } else {
        current.ktbAmount += r.amount;
      }
      map.set(d, current);
    });

    return Array.from(map.entries())
      .map(([date, val]) => ({ date, ...val }))
      .sort((a, b) => {
        return parseDateScore(a.date) - parseDateScore(b.date);
      });
  }, [filteredRecords]);

  if (!authChecked) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">กำลังโหลดระบบ...</div>;
  }

  if (!isAuthenticated) {
    return <LoginModal onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-['Sarabun'] antialiased selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navigation Bar - Clean, spacious, and uncluttered */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-amber-500/40 shrink-0 bg-slate-950 p-0.5">
              <img
                src="/police_logo.jpg"
                alt="ตราสัญลักษณ์ สภ.บางน้ำเปรี้ยว"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white font-['Prompt'] tracking-tight">
                  สภ.บางน้ำเปรี้ยว
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-semibold uppercase">
                  หน่วยงาน 70169
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                ระบบรายงานยอดค่าปรับจราจรและข้อมูลเชิงลึก (Traffic Fine Insight Dashboard)
              </p>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Update from Google Sheets button */}
            <button
              id="update-sheets-btn"
              onClick={() => setIsUpdateModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
              title="อัปเดตข้อมูลจาก Google Sheets เข้า Firebase"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">อัปเดตข้อมูล (Sheets)</span>
            </button>

            {/* Refresh Button */}
            <button
              id="refresh-data-btn"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 text-slate-200 text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
              title="รีเฟรชข้อมูลล่าสุด"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
              <span className="hidden sm:inline">{isRefreshing ? 'กำลังโหลด...' : 'รีเฟรช'}</span>
            </button>

            {/* Logout */}
            <button
              id="logout-btn"
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors cursor-pointer"
              title="ออกจากระบบ"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Unified Filter Toolbar: Custom Timeframe Selection + Dropdown พ.ร.บ. + Search */}
        <section>
          <FilterToolbar
            timeframeMode={timeframeMode}
            onSelectTimeframeMode={setTimeframeMode}
            startDate={startDate}
            onStartDateChange={setStartDate}
            endDate={endDate}
            onEndDateChange={setEndDate}
            singleDate={singleDate}
            onSingleDateChange={setSingleDate}
            availableDates={availableDates}
            selectedAct={selectedActFilter}
            onSelectAct={setSelectedActFilter}
            actCounts={actCounts}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedOfficer={selectedOfficerFilter}
            onClearOfficer={() => setSelectedOfficerFilter('ALL')}
            filteredCount={filteredRecords.length}
            totalCount={records.length}
            onResetAllFilters={handleResetAllFilters}
          />
        </section>

        {/* Top KPI Metrics Cards - Calming, refined, and responsive */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Revenue */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                ยอดค่าปรับรวม
              </p>
              <h3 className="text-2xl font-bold text-amber-400 font-['Prompt'] mt-1">
                ฿{metrics.totalAmount.toLocaleString()}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {timeframeMode === 'ALL' ? 'ยอดสะสมทั้งหมด' : 'คำนวณตามช่วงเวลาที่เลือก'}
              </p>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <DollarSign className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>

          {/* Card 2: Ticket Count */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                จำนวนใบสั่งที่ชำระแล้ว
              </p>
              <h3 className="text-2xl font-bold text-white font-['Prompt'] mt-1">
                {metrics.totalCount} <span className="text-sm font-normal text-slate-400">คดี</span>
              </h3>
              <p className="text-[11px] text-emerald-400 mt-0.5">
                จัดเก็บเข้าสำนักงานตำรวจแห่งชาติ
              </p>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <FileText className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>

          {/* Card 3: Active Officers */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                จนท. ที่มีผลงานออกใบสั่ง
              </p>
              <h3 className="text-2xl font-bold text-sky-400 font-['Prompt'] mt-1">
                {metrics.activeOfficersCount} <span className="text-sm font-normal text-slate-400">นาย</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                ตามช่วงเวลาและ พ.ร.บ. ที่เลือก
              </p>
            </div>
            <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
              <Users className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>

          {/* Card 4: Average Fine */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                ค่าปรับเฉลี่ยต่อคดี
              </p>
              <h3 className="text-2xl font-bold text-purple-400 font-['Prompt'] mt-1">
                ฿{metrics.avgFine.toLocaleString()}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                อัตราโทษเฉลี่ยในรอบที่เลือก
              </p>
            </div>
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
              <Layers className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
        </section>

        {/* Section View Navigation Tabs (Simple, Relaxed UX) */}
        <section className="flex items-center gap-1.5 p-1 bg-slate-900/50 border border-slate-800/70 rounded-xl overflow-x-auto">
          <button
            id="view-tab-all"
            type="button"
            onClick={() => setActiveViewTab('ALL')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeViewTab === 'ALL'
                ? 'bg-slate-800 text-amber-300 font-semibold shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>ภาพรวมทั้งหมด</span>
          </button>
          <button
            id="view-tab-insights"
            type="button"
            onClick={() => setActiveViewTab('INSIGHTS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeViewTab === 'INSIGHTS'
                ? 'bg-slate-800 text-amber-300 font-semibold shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>ข้อเสนอแนะผู้บริหาร</span>
          </button>
          <button
            id="view-tab-officers"
            type="button"
            onClick={() => setActiveViewTab('OFFICERS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeViewTab === 'OFFICERS'
                ? 'bg-slate-800 text-amber-300 font-semibold shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>ผลงานเจ้าหน้าที่ & รหัสหมวก</span>
          </button>
          <button
            id="view-tab-charts"
            type="button"
            onClick={() => setActiveViewTab('CHARTS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeViewTab === 'CHARTS'
                ? 'bg-slate-800 text-amber-300 font-semibold shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>สถิติ & กราฟแนวโน้ม</span>
          </button>
          <button
            id="view-tab-table"
            type="button"
            onClick={() => setActiveViewTab('TABLE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeViewTab === 'TABLE'
                ? 'bg-slate-800 text-amber-300 font-semibold shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>ตารางรายการคดี ({filteredRecords.length})</span>
          </button>
        </section>

        {/* Content Sections based on activeViewTab */}
        {(activeViewTab === 'ALL' || activeViewTab === 'INSIGHTS') && (
          <section>
            <ExecutiveInsights records={filteredRecords} />
          </section>
        )}

        {(activeViewTab === 'ALL' || activeViewTab === 'OFFICERS') && (
          <section>
            <OfficerSection 
              records={officerSectionRecords}
              selectedOfficerFilter={selectedOfficerFilter}
              onSelectOfficer={setSelectedOfficerFilter}
            />
          </section>
        )}

        {(activeViewTab === 'ALL' || activeViewTab === 'CHARTS') && (
          <section>
            <ChartsSection 
              records={filteredRecords}
              dateSummaries={dateSummaries}
            />
          </section>
        )}

        {(activeViewTab === 'ALL' || activeViewTab === 'TABLE') && (
          <section>
            <DataTableSection 
              records={tableBaseRecords}
              activeActTab={selectedActFilter}
              onSelectActTab={setSelectedActFilter}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </section>
        )}

        {/* Footer */}
        <footer className="pt-6 pb-12 border-t border-slate-800/70 text-center text-xs text-slate-500">
          <p>
            งานจราจร สถานีตำรวจภูธรบางน้ำเปรี้ยว ตำรวจภูธรจังหวัดฉะเชิงเทรา • รหัสหน่วยงาน 70169
          </p>
          <p className="text-[11px] text-slate-600 mt-1">
            ข้อมูลเชื่อมโยงกับฐานข้อมูลคลาวด์ Firebase Firestore โครงการ <strong>traffic-fine-insight</strong>
          </p>
        </footer>
      </main>

      {/* Google Sheets Update Modal */}
      <UpdateDataModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onDataUpdated={(newRecords) => {
          setRecords(newRecords);
        }}
      />
    </div>
  );
}

