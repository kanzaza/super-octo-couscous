import React, { useState } from 'react';
import { Lock, User, AlertCircle, EyeOff } from 'lucide-react';

interface LoginModalProps {
  onLoginSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    // Requirements: Usename คือ 'bnp123456' Password คือ '12345678' ไม่มีการสมัครสมาชิกเพิ่ม ไม่แสดงรหัสผ่าน
    setTimeout(() => {
      if (username.trim() === 'bnp123456' && password === '12345678') {
        sessionStorage.setItem('bnp_auth', 'authenticated');
        sessionStorage.setItem('bnp_user', 'bnp123456');
        onLoginSuccess();
      } else {
        setErrorMsg('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
      }
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div id="login-overlay" className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden">
      {/* Background Police / Civic motif decorative lights */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-700/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden mb-4 shadow-xl shadow-amber-500/20 border-2 border-amber-500/50 p-1 bg-slate-950">
            <img 
              src="/police_logo.jpg" 
              alt="ตราสัญลักษณ์ สภ.บางน้ำเปรี้ยว" 
              className="w-full h-full object-contain rounded-xl drop-shadow-lg"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-['Prompt']">
            สถานีตำรวจภูธรบางน้ำเปรี้ยว
          </h1>
          <p className="text-sm font-medium text-amber-400 mt-1">
            หน่วยงาน 70169 • ตำรวจภูธรจังหวัดฉะเชิงเทรา
          </p>
          <p className="text-xs text-slate-400 mt-2">
            ระบบ Insight Dashboard รายงานสถิติและยอดค่าปรับจราจร
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 bg-rose-950/60 border border-rose-800/80 rounded-xl flex items-center gap-3 text-rose-200 text-sm animate-shake">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              ชื่อผู้ใช้งาน (Username)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-5 h-5" />
              </div>
              <input
                id="login-username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="กรอกชื่อผู้ใช้ เช่น bnp123456"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors placeholder-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              รหัสผ่าน (Password)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-5 h-5" />
              </div>
              <input
                id="login-password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors placeholder-slate-500"
              />
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500" title="ซ่อนรหัสผ่านตามข้อกำหนดความปลอดภัย">
                <EyeOff className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
              <span>* ตามข้อกำหนดความปลอดภัย ระบบจะไม่แสดงรหัสผ่านในขณะกรอก</span>
            </p>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold rounded-xl text-sm transition-all duration-150 shadow-md shadow-amber-500/20 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ Dashboard'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
          <p className="text-xs text-slate-500">
            เฉพาะเจ้าหน้าที่ที่ได้รับอนุญาต • ไม่เปิดให้ลงทะเบียนบุคคลภายนอก
          </p>
          <p className="text-[11px] text-slate-600 mt-1">
            เชื่อมต่อฐานข้อมูล Google Cloud Firebase (traffic-fine-insight)
          </p>
        </div>
      </div>
    </div>
  );
};
