import React, { useState } from 'react';
import { 
  Table, 
  Search, 
  Filter, 
  Calendar, 
  CreditCard, 
  ExternalLink,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { TrafficFineRecord } from '../types/traffic';

interface DataTableSectionProps {
  records: TrafficFineRecord[];
  activeActTab: string; // 'ALL' | 'พ.ร.บ.รถยนต์' | 'พ.ร.บ.จราจรทางบก' | 'พ.ร.บ.ขนส่ง'
  onSelectActTab: (tab: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const DataTableSection: React.FC<DataTableSectionProps> = ({
  records,
  activeActTab,
  onSelectActTab,
  searchQuery,
  onSearchChange
}) => {
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedChannel, setSelectedChannel] = useState('ALL');

  // Filter records
  const filtered = records.filter((r) => {
    // Act tab filter
    if (activeActTab !== 'ALL' && !r.actType.includes(activeActTab)) {
      return false;
    }
    // Channel filter
    if (selectedChannel !== 'ALL') {
      if (selectedChannel === 'KTB' && !r.paymentChannel.toUpperCase().includes('KTB')) return false;
      if (selectedChannel === 'STATION' && !r.paymentChannel.toUpperCase().includes('STATION')) return false;
    }
    // Search query (officer, payer, ticketNumber, legalSection, offense)
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

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;

  // Auto-clamp page if filter changes reduced the number of pages
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const actCounts = {
    ALL: records.length,
    'พ.ร.บ.รถยนต์': records.filter(r => r.actType.includes('รถยนต์')).length,
    'พ.ร.บ.จราจรทางบก': records.filter(r => r.actType.includes('จราจร')).length,
    'พ.ร.บ.ขนส่ง': records.filter(r => r.actType.includes('ขนส่ง')).length,
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
      {/* Act Tabs Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white font-['Prompt'] flex items-center gap-2">
            <Table className="w-5 h-5 text-amber-400" />
            ตารางรายการชำระค่าปรับแยกตาม พ.ร.บ. และรายละเอียดคดี
          </h3>
          <p className="text-xs text-slate-400">
            แสดงรายละเอียดใบสั่ง วันที่ชำระ บทมาตรา ข้อหา ผู้มาชำระเงิน และเจ้าหน้าที่ออกใบสั่ง
          </p>
        </div>

        {/* Act Type Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/70 border border-slate-800 rounded-xl">
          <button
            onClick={() => { onSelectActTab('ALL'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeActTab === 'ALL'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ทั้งหมด ({actCounts.ALL})
          </button>
          <button
            onClick={() => { onSelectActTab('พ.ร.บ.รถยนต์'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeActTab === 'พ.ร.บ.รถยนต์'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            พ.ร.บ.รถยนต์ ({actCounts['พ.ร.บ.รถยนต์']})
          </button>
          <button
            onClick={() => { onSelectActTab('พ.ร.บ.จราจรทางบก'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeActTab === 'พ.ร.บ.จราจรทางบก'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            พ.ร.บ.จราจรทางบก ({actCounts['พ.ร.บ.จราจรทางบก']})
          </button>
          <button
            onClick={() => { onSelectActTab('พ.ร.บ.ขนส่ง'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeActTab === 'พ.ร.บ.ขนส่ง'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            พ.ร.บ.ขนส่ง ({actCounts['พ.ร.บ.ขนส่ง']})
          </button>
        </div>
      </div>

      {/* Search and Secondary Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { onSearchChange(e.target.value); setCurrentPage(1); }}
            placeholder="ค้นหาเลขที่ใบสั่ง, ชื่อเจ้าหน้าที่, ผู้ชำระ, ข้อหา..."
            className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
          {/* Dropdown for Act */}
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="hidden sm:inline">พ.ร.บ.:</span>
            <select
              id="datatable-act-dropdown"
              value={activeActTab}
              onChange={(e) => { onSelectActTab(e.target.value); setCurrentPage(1); }}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium cursor-pointer"
            >
              <option value="ALL">ทุก พ.ร.บ. ({actCounts.ALL})</option>
              <option value="พ.ร.บ.รถยนต์">พ.ร.บ.รถยนต์ ({actCounts['พ.ร.บ.รถยนต์']})</option>
              <option value="พ.ร.บ.จราจรทางบก">พ.ร.บ.จราจรทางบก ({actCounts['พ.ร.บ.จราจรทางบก']})</option>
              <option value="พ.ร.บ.ขนส่ง">พ.ร.บ.ขนส่ง ({actCounts['พ.ร.บ.ขนส่ง']})</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>ช่องทาง:</span>
            <select
              value={selectedChannel}
              onChange={(e) => { setSelectedChannel(e.target.value); setCurrentPage(1); }}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              <option value="ALL">ทุกช่องทาง</option>
              <option value="KTB">KTB Mobile</option>
              <option value="STATION">เคาน์เตอร์ สภ.</option>
            </select>
          </div>

          <div className="text-slate-400 px-2 py-1 bg-slate-950/60 rounded-lg border border-slate-800 text-[11px]">
            พบ <strong>{filtered.length}</strong> รายการ
          </div>
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-3.5">วันที่ชำระ/ออก</th>
              <th className="py-3 px-3.5">เลขที่ใบสั่ง</th>
              <th className="py-3 px-3.5">ประเภท พ.ร.บ.</th>
              <th className="py-3 px-3.5">บทมาตรา & ฐานความผิด</th>
              <th className="py-3 px-3.5 text-right">จำนวนเงิน</th>
              <th className="py-3 px-3.5">ช่องทางชำระ</th>
              <th className="py-3 px-3.5">ผู้มาชำระเงิน</th>
              <th className="py-3 px-3.5">เจ้าหน้าที่ออกใบสั่ง</th>
              <th className="py-3 px-3.5 text-center">รหัสหมวก</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500">
                  ไม่พบข้อมูลรายการใบสั่งตามเงื่อนไขที่เลือก
                </td>
              </tr>
            ) : (
              paginated.map((row) => (
                <tr key={row.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <div className="font-medium text-white">{row.paymentDate}</div>
                    <div className="text-[10px] text-slate-500">ออก: {row.ticketDate}</div>
                  </td>
                  <td className="py-3 px-3.5 whitespace-nowrap font-mono text-amber-400">
                    {row.ticketNumber}
                  </td>
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                      row.actType.includes('รถยนต์')
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : row.actType.includes('จราจร')
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    }`}>
                      {row.actType}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 max-w-[280px]">
                    <div className="font-semibold text-slate-200 truncate" title={row.offense}>
                      {row.offense}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {row.legalSection}
                    </div>
                  </td>
                  <td className="py-3 px-3.5 text-right whitespace-nowrap font-bold text-white font-['Prompt']">
                    ฿{row.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      row.paymentChannel.toUpperCase().includes('STATION')
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'bg-sky-500/15 text-sky-300'
                    }`}>
                      {row.paymentChannel}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <div className="text-slate-200">{row.payerName || '-'}</div>
                    {row.citizenId && (
                      <div className="text-[10px] text-slate-500 font-mono">
                        บัตร: {row.citizenId.slice(0, 3)}xxxxx{row.citizenId.slice(-3)}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3.5 whitespace-nowrap text-slate-200">
                    {row.officerName}
                  </td>
                  <td className="py-3 px-3.5 text-center whitespace-nowrap font-mono text-amber-400 font-semibold">
                    {row.helmetCode}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 pt-2">
        <div>
          {filtered.length === 0 ? (
            'แสดง 0 รายการ'
          ) : (
            `แสดง ${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, filtered.length)} จากทั้งหมด ${filtered.length} รายการ`
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
          >
            ก่อนหน้า
          </button>
          <span>
            หน้า <strong>{currentPage}</strong> / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
          >
            ถัดไป
          </button>
        </div>
      </div>
    </div>
  );
};
