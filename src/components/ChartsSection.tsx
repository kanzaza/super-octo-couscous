import React from 'react';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  Calendar, 
  ShieldAlert, 
  Smartphone,
  Landmark
} from 'lucide-react';
import { TrafficFineRecord, DateSummary } from '../types/traffic';

interface ChartsSectionProps {
  records: TrafficFineRecord[];
  dateSummaries: DateSummary[];
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  records,
  dateSummaries
}) => {
  const totalAmount = records.reduce((s, r) => s + r.amount, 0);

  // Group by offense categories
  const categoryMap: Record<string, { count: number; amount: number }> = {};
  records.forEach((r) => {
    // Categorize by primary offense keywords
    let cat = 'ความผิดอื่นๆ';
    const text = r.offense;
    if (text.includes('ภาษี') || text.includes('เพิกถอน') || text.includes('แจ้งไม่ใช้')) {
      cat = 'ไม่เสียภาษี / ใช้รถถูกเพิกถอน';
    } else if (text.includes('ใบอนุญาตขับรถ') || text.includes('ใบขับขี่')) {
      cat = 'ไม่มีใบขับขี่ / สิ้นอายุ';
    } else if (text.includes('ป้ายทะเบียน') || text.includes('ปิดบังแผ่นป้าย')) {
      cat = 'ป้ายทะเบียนไม่ถูกต้อง / ไม่ติดป้าย';
    } else if (text.includes('เปลี่ยนแปลงตัวรถ') || text.includes('ต่อเติมรถ')) {
      cat = 'ดัดแปลงสภาพรถ / เปลี่ยนแปลงตัวรถ';
    } else if (text.includes('อุปกรณ์') || text.includes('ส่วนควบคุม')) {
      cat = 'อุปกรณ์ส่วนควบไม่สมบูรณ์';
    } else if (text.includes('ประมาท')) {
      cat = 'ขับรถโดยประมาท / ทรัพย์สินเสียหาย';
    } else if (text.includes('ทะเบียนระงับ')) {
      cat = 'ใช้รถที่ทะเบียนระงับ';
    } else if (text.includes('หมวกนิรภัย')) {
      cat = 'ไม่สวมหมวกนิรภัย';
    }

    if (!categoryMap[cat]) {
      categoryMap[cat] = { count: 0, amount: 0 };
    }
    categoryMap[cat].count += 1;
    categoryMap[cat].amount += r.amount;
  });

  const categoryList = Object.entries(categoryMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.amount - a.amount);

  // Payment channel stats
  let ktbSum = 0;
  let stationSum = 0;
  records.forEach((r) => {
    if (r.paymentChannel.toUpperCase().includes('STATION')) {
      stationSum += r.amount;
    } else {
      ktbSum += r.amount;
    }
  });

  const maxDailyAmount = Math.max(...dateSummaries.map((d) => d.totalAmount), 1);
  const maxCategoryAmount = Math.max(...categoryList.map((c) => c.amount), 1);

  const peakDay = dateSummaries.length > 0 
    ? [...dateSummaries].sort((a, b) => b.totalAmount - a.totalAmount)[0]
    : null;

  const ktbPercent = totalAmount > 0 ? Math.round((ktbSum / totalAmount) * 100) : 0;

  const THAI_MONTH_SHORT: Record<string, string> = {
    '01': 'ม.ค.', '02': 'ก.พ.', '03': 'มี.ค.', '04': 'เม.ย.',
    '05': 'พ.ค.', '06': 'มิ.ย.', '07': 'ก.ค.', '08': 'ส.ค.',
    '09': 'ก.ย.', '10': 'ต.ค.', '11': 'พ.ย.', '12': 'ธ.ค.'
  };

  const formatShortDate = (dStr: string) => {
    const parts = dStr.split('/');
    if (parts.length >= 2) {
      const day = parts[0];
      const m = parts[1];
      return `${day} ${THAI_MONTH_SHORT[m] || m}`;
    }
    return dStr;
  };

  if (records.length === 0) {
    return (
      <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl text-center text-slate-400 text-xs">
        <BarChart3 className="w-6 h-6 text-amber-400 mx-auto mb-2 opacity-60" />
        <p className="font-semibold text-slate-300">ไม่มีข้อมูลกราฟสถิติตามเงื่อนไขที่เลือก</p>
        <p className="text-[11px] text-slate-500 mt-1">โปรดลองขยายช่วงเวลา หรือเปลี่ยนตัวเลือก พ.ร.บ.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Daily Revenue Proportion & Trend */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-['Prompt']">
                    สัดส่วนและแนวโน้มยอดค่าปรับตามวันที่ชำระเงิน (Daily Fine Collections)
                  </h3>
                  <p className="text-xs text-slate-400">
                    เปรียบเทียบยอดรวมค่าปรับในแต่ละวันและช่องทางการชำระ (KTB Mobile Banking vs Station)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-3 h-3 rounded-xs bg-sky-500 inline-block" />
                  <span>KTB Mobile</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-3 h-3 rounded-xs bg-amber-500 inline-block" />
                  <span>สภ. (STATION)</span>
                </div>
              </div>
            </div>

            {/* Visual Bar Chart */}
            <div className="mt-6 pt-4 border-t border-slate-800/80">
              <div className="h-56 flex items-end gap-2 sm:gap-3 px-1">
                {dateSummaries.map((item) => {
                  const heightPercent = Math.min(
                    100,
                    Math.round((item.totalAmount / maxDailyAmount) * 100)
                  );
                  const ktbRatio = item.totalAmount > 0 ? (item.ktbAmount / item.totalAmount) : 1;
                  const stationRatio = item.totalAmount > 0 ? (item.stationAmount / item.totalAmount) : 0;

                  return (
                    <div
                      key={item.date}
                      className="flex-1 flex flex-col items-center h-full justify-end group relative"
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 bg-slate-800 border border-slate-700 text-[11px] rounded-lg p-2 shadow-xl whitespace-nowrap">
                        <div className="font-semibold text-amber-400">{item.date}</div>
                        <div className="text-white">รวม: ฿{item.totalAmount.toLocaleString()} ({item.count} ใบ)</div>
                        <div className="text-sky-300">KTB: ฿{item.ktbAmount.toLocaleString()}</div>
                        <div className="text-amber-300">Station: ฿{item.stationAmount.toLocaleString()}</div>
                      </div>

                      {/* Bar with split segments */}
                      <div className="w-full max-w-[32px] flex flex-col justify-end rounded-t-md overflow-hidden bg-slate-800 transition-all duration-300 group-hover:brightness-110"
                           style={{ height: `${Math.max(heightPercent, 4)}%` }}>
                        {item.stationAmount > 0 && (
                          <div 
                            className="w-full bg-amber-500 transition-all"
                            style={{ height: `${stationRatio * 100}%` }}
                          />
                        )}
                        {item.ktbAmount > 0 && (
                          <div 
                            className="w-full bg-sky-500 transition-all"
                            style={{ height: `${ktbRatio * 100}%` }}
                          />
                        )}
                      </div>

                      <span className="text-[10px] text-slate-400 mt-2 rotate-0 truncate max-w-[48px] text-center font-mono">
                        {formatShortDate(item.date)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400">
            <span>
              วันที่ชำระสูงสุด: <strong>{peakDay ? peakDay.date : '-'}</strong> {peakDay ? `(฿${peakDay.totalAmount.toLocaleString()} บาท • ${peakDay.count} ใบสั่ง)` : ''}
            </span>
            <span>ยอดชำระเฉลี่ยต่อวัน: <strong>฿{dateSummaries.length > 0 ? Math.round(totalAmount / dateSummaries.length).toLocaleString() : 0} บาท</strong></span>
          </div>
        </div>

        {/* Chart 2: Payment Channel Share (Donut / Card representation) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
                <PieIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-['Prompt']">
                  สัดส่วนช่องทางการรับชำระ
                </h3>
                <p className="text-xs text-slate-400">
                  เปรียบเทียบระหว่างดิจิทัลและเคาน์เตอร์
                </p>
              </div>
            </div>

            {/* Visual breakdown bars */}
            <div className="mt-5 space-y-4">
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-medium text-slate-200 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-sky-400" />
                    KTB Mobile Banking
                  </span>
                  <span className="font-bold text-sky-400">
                    ฿{ktbSum.toLocaleString()} ({ktbPercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-sky-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${totalAmount > 0 ? (ktbSum / totalAmount) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-medium text-slate-200 flex items-center gap-1.5">
                    <Landmark className="w-4 h-4 text-amber-400" />
                    เคาน์เตอร์สถานี (STATION)
                  </span>
                  <span className="font-bold text-amber-400">
                    ฿{stationSum.toLocaleString()} ({totalAmount > 0 ? 100 - ktbPercent : 0}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-amber-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${totalAmount > 0 ? (stationSum / totalAmount) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs text-slate-300">
              <div className="font-semibold text-amber-300 mb-1">
                ข้อสังเกตการปฏิบัติการ:
              </div>
              <p className="text-slate-400 leading-relaxed">
                การชำระผ่านระบบดิจิทัลคิดเป็น {ktbPercent}% สะท้อนความสะดวกของประชาชน แนะนำลดขั้นตอนเอกสารกระดาษที่เคาน์เตอร์ และใช้ระบบใบเสร็จอิเล็กทรอนิกส์เต็มรูปแบบ
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex justify-between">
            <span>ยอดรวมทั้งหมด:</span>
            <span className="font-bold text-white">฿{totalAmount.toLocaleString()} บาท</span>
          </div>
        </div>
      </div>

      {/* Chart 3: Category ranking horizontal progress */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-['Prompt']">
                มูลค่าและปริมาณค่าปรับแยกตามประเภทข้อหาสำคัญ (Offense Volume & Revenue)
              </h3>
              <p className="text-xs text-slate-400">
                วิเคราะห์ว่าข้อหาใดสร้างมูลค่าค่าปรับและเกิดบ่อยที่สุดในเขต สภ.บางน้ำเปรี้ยว
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            แสดง {categoryList.length} หมวดหมู่
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pt-2">
          {categoryList.map((cat, idx) => {
            const pct = Math.round((cat.amount / maxCategoryAmount) * 100);
            return (
              <div key={cat.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-200 truncate max-w-[240px]">
                    {idx + 1}. {cat.name}
                  </span>
                  <div className="text-right flex items-center gap-2">
                    <span className="text-slate-400">{cat.count} คดี</span>
                    <span className="font-bold text-amber-400 min-w-[70px] text-right">
                      ฿{cat.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-rose-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(pct, 5)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
