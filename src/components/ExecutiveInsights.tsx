import React from 'react';
import { 
  TrendingUp, 
  CreditCard, 
  Building2, 
  AlertTriangle,
  Lightbulb,
  Clock,
  Car
} from 'lucide-react';
import { TrafficFineRecord } from '../types/traffic';

interface ExecutiveInsightsProps {
  records: TrafficFineRecord[];
}

export const ExecutiveInsights: React.FC<ExecutiveInsightsProps> = ({ records }) => {
  // Calculations
  const totalAmount = records.reduce((sum, r) => sum + r.amount, 0);
  const totalTickets = records.length;
  const avgAmount = totalTickets > 0 ? Math.round(totalAmount / totalTickets) : 0;

  // Channel breakdown
  const ktbRecords = records.filter(r => r.paymentChannel.toLowerCase().includes('ktb') || r.paymentChannel.toLowerCase().includes('mobile'));
  const stationRecords = records.filter(r => r.paymentChannel.toUpperCase().includes('STATION'));
  const ktbAmount = ktbRecords.reduce((sum, r) => sum + r.amount, 0);
  const stationAmount = stationRecords.reduce((sum, r) => sum + r.amount, 0);
  const ktbPercent = totalAmount > 0 ? Math.round((ktbAmount / totalAmount) * 100) : 0;
  const stationPercent = totalAmount > 0 ? 100 - ktbPercent : 0;

  // Act breakdown
  const actCar = records.filter(r => r.actType.includes('รถยนต์'));
  const actTraffic = records.filter(r => r.actType.includes('จราจร'));
  const actTransport = records.filter(r => r.actType.includes('ขนส่ง'));

  // Common offenses
  const offenseCountMap = new Map<string, { count: number; totalAmount: number }>();
  records.forEach(r => {
    // split combined offenses
    const parts = r.offense.split(',').map(s => s.trim()).filter(Boolean);
    parts.forEach(p => {
      const existing = offenseCountMap.get(p) || { count: 0, totalAmount: 0 };
      existing.count += 1;
      existing.totalAmount += r.amount / parts.length;
      offenseCountMap.set(p, existing);
    });
  });

  const sortedOffenses = Array.from(offenseCountMap.entries())
    .sort((a, b) => b[1].count - a[1].count);
  const topOffense = sortedOffenses[0];

  // Issue vs Payment turnaround (e.g. same day payment)
  let sameDayCount = 0;
  const dateCountMap = new Map<string, number>();
  records.forEach(r => {
    if (r.paymentDate === r.ticketDate) {
      sameDayCount++;
    }
    if (r.paymentDate) {
      dateCountMap.set(r.paymentDate, (dateCountMap.get(r.paymentDate) || 0) + 1);
    }
  });
  const sameDayPercent = totalTickets > 0 ? Math.round((sameDayCount / totalTickets) * 100) : 0;

  // Dynamically extract top dates and top offenses
  const topDates = Array.from(dateCountMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([d]) => d.split('/')[0]);
  const topDatesText = topDates.length > 0 ? `ช่วงวันที่ ${topDates.join(', ')}` : 'วันที่มีสถิติสูง';
  const topOffenseNames = sortedOffenses.slice(0, 3).map(o => o[0]).join(', ');

  if (records.length === 0) {
    return (
      <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl text-center text-slate-400 text-xs">
        <Lightbulb className="w-6 h-6 text-amber-400 mx-auto mb-2 opacity-60" />
        <p className="font-semibold text-slate-300">ไม่มีข้อมูลคดีตามเงื่อนไขที่เลือก</p>
        <p className="text-[11px] text-slate-500 mt-1">โปรดลองเลือกช่วงเวลาอื่น หรือเปลี่ยนตัวเลือก พ.ร.บ. ในแถบเครื่องมือ</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white font-['Prompt'] flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            ข้อมูลเชิงลึกและข้อเสนอแนะในการตัดสินใจของผู้บริหาร (Executive Insights & Recommendations)
          </h3>
          <p className="text-xs text-slate-400">
            วิเคราะห์เชิงยุทธศาสตร์เพื่อเพิ่มประสิทธิภาพการกวดขันวินัยจราจรและการจัดเก็บรายได้ สภ.บางน้ำเปรี้ยว
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Insight Card 1: Channel Adoption */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2 text-sky-400">
            <CreditCard className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">ช่องทางการชำระเงินดิจิทัล</span>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold text-white font-['Prompt']">{ktbPercent}%</span>
            <span className="text-xs text-slate-400">ชำระผ่าน KTB Mobile Banking</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            ประชาชนส่วนใหญ่ ({ktbRecords.length} จาก {totalTickets} คดี รวม ฿{ktbAmount.toLocaleString()}) ชำระผ่านระบบออนไลน์ทันที สะท้อนว่าระบบ e-Payment มีประสิทธิภาพสูง ควรส่งเสริม QR Code บนใบสั่งทุกประเภท
          </p>
          <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>ชำระที่สถานี (STATION):</span>
            <span className="text-amber-400 font-semibold">{stationPercent}% (฿{stationAmount.toLocaleString()})</span>
          </div>
        </div>

        {/* Insight Card 2: Highest Frequency Violation */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2 text-rose-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">ข้อหาที่มีความถี่สูงสุด</span>
          </div>
          <div className="mb-1">
            <span className="text-sm font-bold text-rose-300 line-clamp-1">
              {topOffense ? topOffense[0] : 'ใช้รถไม่เสียภาษี/เพิกถอน'}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            พบความผิดนี้ถึง <strong>{topOffense ? topOffense[1].count : 0} รายการ</strong> รองลงมาคือเรื่องไม่มีใบขับขี่ แนะนำจัดจุดตรวจเชิงรุกร่วมกับสำนักงานขนส่งในจุดยุทธศาสตร์ เช่น เส้นทางสายหลัก อ.บางน้ำเปรี้ยว
          </p>
          <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>สัดส่วน พ.ร.บ.รถยนต์:</span>
            <span className="text-emerald-400 font-semibold">{Math.round((actCar.length / (totalTickets || 1)) * 100)}% ({actCar.length} ใบ)</span>
          </div>
        </div>

        {/* Insight Card 3: Compliance & Same-Day Rate */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2 text-emerald-400">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">การชำระเงินในวันเดียวกัน</span>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold text-white font-['Prompt']">{sameDayPercent}%</span>
            <span className="text-xs text-slate-400">ชำระในวันออกใบสั่งทันที</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            มีจำนวน {sameDayCount} รายที่ชำระในวันเดียวกัน ส่วนที่เหลือนิยมชำระภายใน 7-14 วัน ช่วยลดภาระงานออกหมายเรียกหรือดำเนินคดีค้างชำระ
          </p>
          <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>ค่าปรับเฉลี่ยต่อใบสั่ง:</span>
            <span className="text-sky-300 font-semibold">฿{avgAmount.toLocaleString()} บาท</span>
          </div>
        </div>
      </div>

      {/* Strategic Recommendation Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-blue-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg shrink-0">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-slate-200 text-sm">
              แนวทางการวางแผนกำลังพลและจัดจุดตรวจประจำสัปดาห์
            </div>
            <p className="text-slate-400 mt-0.5">
              ข้อมูลชี้ว่า{topDatesText} มีการออกและชำระค่าปรับสูงสุด {topOffenseNames ? `โดยเฉพาะข้อหา${topOffenseNames}` : ''} ควรกำหนดเป็นเป้าหมายหลักในการตั้งจุดตรวจกวดขันวินัยจราจร
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0 self-end md:self-center">
          <span className="px-2.5 py-1 bg-blue-900/60 border border-blue-700 text-blue-200 rounded-md font-mono text-[11px]">
            รหัสหน่วยงาน: 70169
          </span>
        </div>
      </div>
    </div>
  );
};
