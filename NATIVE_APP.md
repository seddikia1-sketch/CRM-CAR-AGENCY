# تحويل AutoCRM إلى تطبيق أصلي (Android / iOS)

تم تجهيز المشروع بـ **Capacitor** ليصبح تطبيقاً أصلياً على الهاتف والآيباد.

---

## ما الفرق؟

| النوع | المعنى |
|--------|--------|
| الموقع الحالي (PWA) | يُثبَّت من المتصفح — يعمل الآن |
| تطبيق Android (APK) | ملف تثبّته على أي هاتف أندرويد |
| تطبيق iOS | يحتاج جهاز Mac + حساب Apple مطوّر |

---

## متطلبات أندرويد (الأسهل)

1. تثبيت **Node.js** من: https://nodejs.org
2. تثبيت **Android Studio** من: https://developer.android.com/studio
3. على الكمبيوتر نفّذ:

```bash
cd CRM-CAR-AGENCY
git pull
npm install
npm run cap:add:android
npm run cap:android
```

4. من Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
5. انقل ملف الـ APK إلى الهاتف وثبّته.

---

## متطلبات آيفون / آيباد

- جهاز **Mac**
- برنامج **Xcode** من App Store
- حساب **Apple Developer** (مدفوع ~99 دولار/سنة للنشر على المتجر)

```bash
npm run cap:add:ios
npm run cap:ios
```

ثم من Xcode اربط حسابك وابنِ التطبيق.

---

## بديل سريع بدون برمجة

إذا لا تريد تثبيت Android Studio:

1. استمر باستخدام النسخة المثبتة من المتصفح (PWA) — تعمل كتطبيق على الشاشة الرئيسية.
2. أو اطلب من مطوّر/مركز خدمات بناء ملف APK لك من هذا المستودع.

المستودع: https://github.com/seddikia1-sketch/CRM-CAR-AGENCY

---

## ملاحظات

- بيانات التطبيق تُحفظ على الجهاز (localStorage).
- معرف التطبيق: `dz.autocrm.app`
- اسم التطبيق: **AutoCRM**
