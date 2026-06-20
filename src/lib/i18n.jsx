import { createContext, useContext, useState } from 'react'

export const LANGUAGES = [
  { code: 'en', name: 'English',    native: 'English',       dir: 'ltr', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi',      native: 'हिन्दी',         dir: 'ltr', flag: '🇮🇳' },
  { code: 'zh', name: 'Chinese',    native: '中文',            dir: 'ltr', flag: '🇨🇳' },
  { code: 'es', name: 'Spanish',    native: 'Español',        dir: 'ltr', flag: '🇪🇸' },
  { code: 'ar', name: 'Arabic',     native: 'العربية',         dir: 'rtl', flag: '🇸🇦' },
  { code: 'fr', name: 'French',     native: 'Français',       dir: 'ltr', flag: '🇫🇷' },
  { code: 'bn', name: 'Bengali',    native: 'বাংলা',          dir: 'ltr', flag: '🇧🇩' },
  { code: 'pt', name: 'Portuguese', native: 'Português',      dir: 'ltr', flag: '🇧🇷' },
  { code: 'ru', name: 'Russian',    native: 'Русский',        dir: 'ltr', flag: '🇷🇺' },
  { code: 'ur', name: 'Urdu',       native: 'اردو',           dir: 'rtl', flag: '🇵🇰' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia',dir: 'ltr', flag: '🇮🇩' },
  { code: 'de', name: 'German',     native: 'Deutsch',        dir: 'ltr', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese',   native: '日本語',           dir: 'ltr', flag: '🇯🇵' },
  { code: 'tr', name: 'Turkish',    native: 'Türkçe',         dir: 'ltr', flag: '🇹🇷' },
  { code: 'ko', name: 'Korean',     native: '한국어',           dir: 'ltr', flag: '🇰🇷' },
  { code: 'ta', name: 'Tamil',      native: 'தமிழ்',          dir: 'ltr', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi',    native: 'मराठी',          dir: 'ltr', flag: '🇮🇳' },
  { code: 'it', name: 'Italian',    native: 'Italiano',       dir: 'ltr', flag: '🇮🇹' },
  { code: 'te', name: 'Telugu',     native: 'తెలుగు',          dir: 'ltr', flag: '🇮🇳' },
  { code: 'th', name: 'Thai',       native: 'ภาษาไทย',        dir: 'ltr', flag: '🇹🇭' },
]

// ── Translation strings ────────────────────────────────────────────────────────
const T = {
  // Navigation
  home:        { en:'Today',     hi:'आज',        zh:'今天',     es:'Hoy',      ar:'اليوم',    fr:"Aujourd'hui",bn:'আজ',      pt:'Hoje',     ru:'Сегодня',  ur:'آج',       id:'Hari ini', de:'Heute',    ja:'今日',      tr:'Bugün',    ko:'오늘',     ta:'இன்று',    mr:'आज',       it:'Oggi',    te:'నేడు',     th:'วันนี้' },
  trends:      { en:'Trends',    hi:'ट्रेंड्स',  zh:'趋势',     es:'Tendencias',ar:'الاتجاهات',fr:'Tendances',bn:'ট্রেন্ড',  pt:'Tendências',ru:'Тренды',  ur:'رجحانات',  id:'Tren',     de:'Trends',   ja:'トレンド',  tr:'Eğilimler',ko:'트렌드',   ta:'போக்குகள்',mr:'ट्रेंड्स', it:'Tendenze', te:'ట్రెండ్స్', th:'แนวโน้ม' },
  reports:     { en:'Reports',   hi:'रिपोर्ट',   zh:'报告',     es:'Informes', ar:'التقارير', fr:'Rapports', bn:'রিপোর্ট',  pt:'Relatórios',ru:'Отчёты',  ur:'رپورٹیں',  id:'Laporan',  de:'Berichte', ja:'レポート',  tr:'Raporlar', ko:'보고서',   ta:'அறிக்கைகள்',mr:'अहवाल',  it:'Rapporti', te:'నివేదికలు',th:'รายงาน' },
  devices:     { en:'Devices',   hi:'डिवाइस',   zh:'设备',     es:'Dispositivos',ar:'الأجهزة',fr:'Appareils',bn:'ডিভাইস',  pt:'Dispositivos',ru:'Устройства',ur:'آلات',   id:'Perangkat',de:'Geräte',   ja:'デバイス',  tr:'Cihazlar', ko:'기기',     ta:'சாதனங்கள்',mr:'उपकरणे',  it:'Dispositivi',te:'పరికరాలు',th:'อุปกรณ์' },
  protocol:    { en:'Protocol',  hi:'प्रोटोकॉल', zh:'方案',     es:'Protocolo',ar:'البروتوكول',fr:'Protocole',bn:'প্রোটোকল',pt:'Protocolo',ru:'Протокол',ur:'پروٹوکول',id:'Protokol', de:'Protokoll',ja:'プロトコル',tr:'Protokol', ko:'프로토콜',ta:'நெறிமுறை',mr:'प्रोटोकॉल',it:'Protocollo',te:'ప్రోటోకాల్',th:'โปรโตคอล' },
  settings:    { en:'Settings',  hi:'सेटिंग्स',  zh:'设置',     es:'Configuración',ar:'الإعدادات',fr:'Paramètres',bn:'সেটিংস', pt:'Configurações',ru:'Настройки',ur:'ترتیبات',id:'Pengaturan',de:'Einstellungen',ja:'設定',   tr:'Ayarlar',  ko:'설정',     ta:'அமைப்புகள்',mr:'सेटिंग्ज',it:'Impostazioni',te:'సెట్టింగ్లు',th:'การตั้งค่า' },

  // Actions
  save:        { en:'Save',      hi:'सहेजें',    zh:'保存',     es:'Guardar',  ar:'حفظ',      fr:'Enregistrer',bn:'সংরক্ষণ', pt:'Salvar',   ru:'Сохранить',ur:'محفوظ کریں',id:'Simpan',  de:'Speichern',ja:'保存',      tr:'Kaydet',   ko:'저장',     ta:'சேமி',     mr:'जतन करा',  it:'Salva',    te:'సేవ్',    th:'บันทึก' },
  cancel:      { en:'Cancel',    hi:'रद्द करें', zh:'取消',     es:'Cancelar', ar:'إلغاء',    fr:'Annuler',  bn:'বাতিল',   pt:'Cancelar', ru:'Отмена',   ur:'منسوخ کریں',id:'Batal',   de:'Abbrechen',ja:'キャンセル',tr:'İptal',    ko:'취소',     ta:'ரத்துசெய்', mr:'रद्द करा',it:'Annulla',  te:'రద్దు',   th:'ยกเลิก' },
  back:        { en:'Back',      hi:'वापस',      zh:'返回',     es:'Volver',   ar:'رجوع',     fr:'Retour',   bn:'ফিরে যান',pt:'Voltar',   ru:'Назад',    ur:'واپس',     id:'Kembali',  de:'Zurück',   ja:'戻る',      tr:'Geri',     ko:'뒤로',     ta:'பின்செல்',  mr:'मागे',    it:'Indietro', te:'వెనుకకు',  th:'กลับ' },
  logout:      { en:'Logout',    hi:'लॉगआउट',   zh:'退出登录', es:'Cerrar sesión',ar:'تسجيل الخروج',fr:'Déconnexion',bn:'লগআউট',pt:'Sair',     ru:'Выйти',    ur:'لاگ آؤٹ',  id:'Keluar',   de:'Abmelden', ja:'ログアウト', tr:'Çıkış',    ko:'로그아웃',ta:'வெளியேறு',mr:'बाहेर पडा',it:'Esci',    te:'లాగ్అవుట్',th:'ออกจากระบบ' },
  delete_acct: { en:'Delete Account',hi:'खाता हटाएं',zh:'删除账户',es:'Eliminar cuenta',ar:'حذف الحساب',fr:'Supprimer le compte',bn:'অ্যাকাউন্ট মুছুন',pt:'Excluir conta',ru:'Удалить аккаунт',ur:'اکاؤنٹ حذف کریں',id:'Hapus Akun',de:'Konto löschen',ja:'アカウント削除',tr:'Hesabı sil',ko:'계정 삭제',ta:'கணக்கை நீக்கு',mr:'खाते हटवा',it:'Elimina account',te:'ఖాతా తొలగించు',th:'ลบบัญชี' },
  language:    { en:'Language',  hi:'भाषा',      zh:'语言',     es:'Idioma',   ar:'اللغة',    fr:'Langue',   bn:'ভাষা',    pt:'Idioma',   ru:'Язык',     ur:'زبان',     id:'Bahasa',   de:'Sprache',  ja:'言語',      tr:'Dil',      ko:'언어',     ta:'மொழி',     mr:'भाषा',    it:'Lingua',   te:'భాష',     th:'ภาษา' },
  profile:     { en:'Profile',   hi:'प्रोफ़ाइल', zh:'个人资料', es:'Perfil',   ar:'الملف الشخصي',fr:'Profil',  bn:'প্রোফাইল',pt:'Perfil',   ru:'Профиль',  ur:'پروفائل',  id:'Profil',   de:'Profil',   ja:'プロフィール',tr:'Profil',   ko:'프로필',   ta:'சுயவிவரம்',mr:'प्रोफाइल', it:'Profilo',  te:'ప్రొఫైల్', th:'โปรไฟล์' },
  notifications:{ en:'Notifications',hi:'सूचनाएं',zh:'通知',  es:'Notificaciones',ar:'الإشعارات',fr:'Notifications',bn:'বিজ্ঞপ্তি',pt:'Notificações',ru:'Уведомления',ur:'اطلاعات',id:'Notifikasi',de:'Benachrichtigungen',ja:'通知',  tr:'Bildirimler',ko:'알림',   ta:'அறிவிப்புகள்',mr:'सूचना',it:'Notifiche',te:'నోటిఫికేషన్లు',th:'การแจ้งเตือน' },
  privacy:     { en:'Privacy',   hi:'गोपनीयता',  zh:'隐私',     es:'Privacidad',ar:'الخصوصية',fr:'Confidentialité',bn:'গোপনীয়তা',pt:'Privacidade',ru:'Конфиденциальность',ur:'رازداری',id:'Privasi',de:'Datenschutz',ja:'プライバシー',tr:'Gizlilik',ko:'개인정보',ta:'தனியுரிமை',mr:'गोपनीयता',it:'Privacy',te:'గోపనీయత',th:'ความเป็นส่วนตัว' },
  help:        { en:'Help & Support',hi:'सहायता',zh:'帮助',    es:'Ayuda',    ar:'المساعدة',  fr:'Aide',     bn:'সাহায্য',  pt:'Ajuda',    ru:'Помощь',   ur:'مدد',      id:'Bantuan',  de:'Hilfe',    ja:'ヘルプ',    tr:'Yardım',   ko:'도움말',   ta:'உதவி',    mr:'मदत',     it:'Aiuto',    te:'సహాయం',   th:'ช่วยเหลือ' },
  // Onboarding / health
  bio_age:     { en:'Biological Age', hi:'जैविक आयु', zh:'生物年龄', es:'Edad biológica', ar:'العمر البيولوجي', fr:'Âge biologique', bn:'জৈবিক বয়স', pt:'Idade biológica', ru:'Биологический возраст', ur:'حیاتیاتی عمر', id:'Usia biologis', de:'Biologisches Alter', ja:'生物学的年齢', tr:'Biyolojik yaş', ko:'생물학적 나이', ta:'உயிரியல் வயது', mr:'जैविक वय', it:'Età biologica', te:'జీవ వయస్సు', th:'อายุทางชีววิทยา' },
  upload:      { en:'Upload Report', hi:'रिपोर्ट अपलोड करें', zh:'上传报告', es:'Subir informe', ar:'رفع التقرير', fr:'Télécharger le rapport', bn:'রিপোর্ট আপলोड करुन', pt:'Enviar relatório', ru:'Загрузить отчёт', ur:'رپورٹ اپلوڈ کریں', id:'Unggah laporan', de:'Bericht hochladen', ja:'レポートをアップロード', tr:'Rapor yükle', ko:'보고서 업로드', ta:'அறிக்கையை பதிவேற்று', mr:'अहवाल अपलोड करा', it:'Carica referto', te:'నివేదికను అప్‌లోడ్ చేయండి', th:'อัปโหลดรายงาน' },
}

export function t(key, lang = 'en') {
  const entry = T[key]
  if (!entry) return key
  return entry[lang] ?? entry.en ?? key
}

// ── Context ───────────────────────────────────────────────────────────────────
const LangCtx = createContext({ lang: 'en', setLang: () => {} })

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('healthos_lang') || 'en')
  function changeLang(code) {
    setLang(code)
    localStorage.setItem('healthos_lang', code)
    const dir = LANGUAGES.find(l => l.code === code)?.dir || 'ltr'
    document.documentElement.setAttribute('dir', dir)
    document.documentElement.setAttribute('lang', code)
  }
  return <LangCtx.Provider value={{ lang, setLang: changeLang }}>{children}</LangCtx.Provider>
}

export function useLang() { return useContext(LangCtx) }
export function useT()    {
  const { lang } = useLang()
  return (key) => t(key, lang)
}
