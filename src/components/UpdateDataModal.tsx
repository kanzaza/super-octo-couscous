import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Database,
  ExternalLink,
  X
} from 'lucide-react';
import { parseRawCsv } from '../data/initialTrafficData';
import { batchImportTrafficFines } from '../services/trafficService';
import { TrafficFineRecord } from '../types/traffic';

interface UpdateDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataUpdated: (newRecords: TrafficFineRecord[]) => void;
}

export const UpdateDataModal: React.FC<UpdateDataModalProps> = ({
  isOpen,
  onClose,
  onDataUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'sheet_url' | 'csv_upload'>('sheet_url');
  const [sheetUrl, setSheetUrl] = useState('');
  const [csvText, setCsvText] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSyncFromUrl = async () => {
    if (!sheetUrl.trim()) {
      setStatusMessage({ type: 'error', text: 'กรุณาระบุ URL หรือ Link ของ Google Sheets' });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      // If it's a normal Google Sheets link, convert to CSV export format
      let csvExportUrl = sheetUrl.trim();
      if (csvExportUrl.includes('docs.google.com/spreadsheets/d/')) {
        const match = csvExportUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        const gidMatch = csvExportUrl.match(/[#&?]gid=([0-9]+)/);
        if (match && match[1]) {
          const sheetId = match[1];
          const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : '';
          csvExportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gidParam}`;
        }
      }

      const res = await fetch(csvExportUrl);
      if (!res.ok) {
        throw new Error('ไม่สามารถดาวน์โหลดไฟล์ได้ กรุณาตรวจสอบสิทธิ์การแชร์ (ต้องตั้งเป็น Anyone with link can view)');
      }
      const text = await res.text();
      const records = parseRawCsv(text);
      if (records.length === 0) {
        throw new Error('ไม่พบข้อมูลตามรูปแบบรายงานใบสั่ง กรุณาตรวจสอบหัวตาราง วันที่ชำระเงิน และ เลขที่ใบสั่ง');
      }

      // Save to Firebase
      await batchImportTrafficFines(records);
      onDataUpdated(records);
      setStatusMessage({ 
        type: 'success', 
        text: `อัปเดตและบันทึกข้อมูลเข้า Firebase เรียบร้อยแล้ว จำนวน ${records.length} รายการ` 
      });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการดึงข้อมูล';
      setStatusMessage({ 
        type: 'error', 
        text: `${msg} (หากแผ่นงานยังไม่ได้เปิดสาธารณะ ท่านสามารถคัดลอกข้อความ CSV หรืออัปโหลดไฟล์ในแท็บด้านข้างได้)` 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualCsvImport = async () => {
    if (!csvText.trim()) {
      setStatusMessage({ type: 'error', text: 'กรุณาวางเนื้อหาข้อความ CSV จาก Google Sheets' });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const records = parseRawCsv(csvText);
      if (records.length === 0) {
        throw new Error('ไม่พบข้อมูลตามโครงสร้างตารางค่าปรับ (ต้องมีคอลัมน์ วันที่ชำระเงิน, เลขที่ใบสั่ง, ฯลฯ)');
      }

      await batchImportTrafficFines(records);
      onDataUpdated(records);
      setStatusMessage({
        type: 'success',
        text: `นำเข้าและบันทึกข้อมูลเข้า Firebase สำเร็จ ${records.length} รายการ`
      });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการประมวลผลข้อมูล';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content) {
        setCsvText(content);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Prompt']">
                อัปเดตข้อมูลรายงานค่าปรับจราจร (Google Sheets)
              </h2>
              <p className="text-xs text-slate-400">
                ซิงค์ข้อมูลล่าสุดและบันทึกลง Firebase Firestore (traffic-fine-insight)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 pt-3 gap-3">
          <button
            onClick={() => setActiveTab('sheet_url')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'sheet_url'
                ? 'border-amber-400 text-amber-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ExternalLink className="w-4 h-4" />
            ลิงก์ Google Sheets โดยตรง
          </button>
          <button
            onClick={() => setActiveTab('csv_upload')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'csv_upload'
                ? 'border-amber-400 text-amber-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            อัปโหลดไฟล์ / วางข้อความ CSV
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-3 text-sm ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                  : 'bg-rose-950/60 border-rose-800 text-rose-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {activeTab === 'sheet_url' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  URL ของ Google Sheets หรือ ลิงก์เผยแพร่ (Publish to Web CSV)
                </label>
                <input
                  type="url"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                  className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-xs text-slate-400 mt-2">
                  * หมายเหตุ: ต้องแชร์สิทธิ์เป็น <strong>&quot;ทุกคนที่มีลิงก์มีสิทธิ์ดู&quot; (Anyone with the link can view)</strong> หรือใช้ฟังก์ชัน File &gt; Share &gt; Publish to web แล้วเลือก Export เป็น CSV
                </p>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/60 text-xs text-slate-300 space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                  <Database className="w-4 h-4" />
                  <span>ระบบบันทึกอัตโนมัติไปยัง Firebase Firestore</span>
                </div>
                <p className="text-slate-400">
                  เมื่อกดซิงค์ ข้อมูลจะถูกประมวลผล ตรวจสอบความถูกต้องของคอลัมน์ และบันทึกเข้าสู่ Collection <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">traffic_fines</code> ในโปรเจกต์ <strong>traffic-fine-insight</strong> ทันที
                </p>
              </div>

              <button
                onClick={handleSyncFromUrl}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium rounded-xl text-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'กำลังดึงข้อมูลและบันทึกลง Firebase...' : 'ซิงค์ข้อมูลจาก Google Sheets ทันที'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  เลือกไฟล์ CSV จากเครื่องคอมพิวเตอร์
                </label>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-amber-400 hover:file:bg-slate-700 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  หรือ วางเนื้อหา CSV ตรงนี้
                </label>
                <textarea
                  rows={6}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="วันที่ชำระเงิน,วันที่ออกใบสั่ง,เลขที่ใบสั่ง,บทมาตรา,ความผิด,จำนวนเงิน..."
                  className="w-full p-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                onClick={handleManualCsvImport}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold rounded-xl text-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'กำลังประมวลผลและอัปเดต...' : 'บันทึกข้อมูลเข้าสู่ Firebase'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
