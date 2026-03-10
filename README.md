# ♠️ حسابات المور

تطبيق ويب لتتبع نتائج مباريات الورق، وإدارة اللاعبين، وعرض الإحصائيات بشكل مرتب وسهل الاستخدام.

---

## 🎯 فكرة التطبيق

حسابات المور هو تطبيق مصمم خصيصاً لمجموعات الأصدقاء والعائلة الذين يلعبون الورق بانتظام. بدلاً من الاعتماد على الورقة والقلم أو تطبيقات الحاسبة العامة، يوفر التطبيق نظاماً متكاملاً لتسجيل النتائج ومتابعة الأداء عبر الزمن.

---

## ✨ المميزات

- **إدارة اللاعبين** — أضف لاعبين جدد واحذف القديمين
- **تسجيل المباريات** — أنشئ مباراة جديدة وسجّل نتائج كل لاعب
- **لوحة النتائج** — عرض فوري للترتيب الحالي
- **سجل المباريات** — تاريخ كامل لجميع الجلسات السابقة
- **الإحصائيات** — تحليل أداء كل لاعب عبر الوقت
- **تسجيل الدخول** — كل مستخدم يرى بياناته الخاصة فقط

---

## 🛠️ التقنيات المستخدمة

| التقنية | الاستخدام |
|---------|-----------|
| React + TypeScript | واجهة المستخدم |
| Vite | أداة البناء |
| Tailwind CSS | التصميم |
| Supabase | قاعدة البيانات والمصادقة |
| React Query | إدارة الحالة والبيانات |
| React Router | التنقل بين الصفحات |
| shadcn/ui | مكونات الواجهة |

---

## 🚀 تشغيل المشروع

### المتطلبات
- Node.js 18+
- حساب على [Supabase](https://supabase.com)

### الخطوات

```bash
# 1. استنساخ المشروع
git clone https://github.com/username/hesabat-almor.git
cd hesabat-almor

# 2. تثبيت الباكيجات
npm install

# 3. إنشاء ملف البيئة
cp env.txt .env

# 4. عدّل .env بمفاتيح Supabase الخاصة بك
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# 5. تشغيل التطبيق
npm run dev
```

### إعداد قاعدة البيانات

شغّل هذا الـ SQL في **Supabase → SQL Editor**:

```sql
CREATE TABLE players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE match_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own players" ON players FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own matches" ON matches FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own results" ON match_results FOR ALL
  USING (match_id IN (SELECT id FROM matches WHERE user_id = auth.uid()));
```

---

## 📁 هيكل المشروع

```
src/
├── components/        # مكونات قابلة للإعادة
│   ├── ui/           # مكونات shadcn/ui
│   └── NavLink.tsx   # رابط التنقل
├── hooks/            # Custom hooks (useAuth, ...)
├── pages/            # صفحات التطبيق
│   ├── Index.tsx     # الصفحة الرئيسية
│   ├── Players.tsx   # إدارة اللاعبين
│   ├── NewMatch.tsx  # مباراة جديدة
│   ├── Scoreboard.tsx # لوحة النتائج
│   ├── MatchHistory.tsx # سجل المباريات
│   ├── Stats.tsx     # الإحصائيات
│   └── Auth.tsx      # تسجيل الدخول
└── App.tsx           # نقطة الدخول
```

---

## 🌐 النشر (Deploy)

الأسهل عبر **Vercel**:

1. ارفع الكود على GitHub
2. اربط الـ repo بـ Vercel
3. أضف متغيرات البيئة في إعدادات Vercel
4. اضغط Deploy ✅

---

## 📄 الرخصة

MIT License
