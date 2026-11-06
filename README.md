# Rapid Flashcard Stream ⚡

> **Yüksek Hızlı, Sabit Odaklı ve Bilişsel Ergonomik İngilizce Kelime Tarama Masaüstü Uygulaması**  
> (YDS, TOEFL, IELTS, GRE ve YDT kelime çalışmaları için optimize edilmiştir)

---

## 📖 Genel Bakış

**Rapid Flashcard Stream**, kelime öğrenme ve pekiştirme sürecini geleneksel yavaş flashcard yöntemlerinden kurtaran; **50 ms – 2000 ms** arasında ayarlanabilir hızda kelimeleri ve anlamlarını ekranın tam merkezinde art arda gösteren, drift-free (zaman kaymasız) modern bir masaüstü uygulamasıdır.

Uygulama, bilişsel psikoloji ve görsel ergonomi prensipleri (gözün yatay sakkadik hareketlerini sıfırlama, tek odak noktası, anlık kesme) esas alınarak geliştirilmiştir.

---

## ✨ Öne Çıkan Özellikler

### 1. İki Fazlı Sıralı Döngü & Tekil Görünüm Kuralı (Single-Side Exclusivity)
- **Asla Alt Alta Gösterilmez**: Ekranda aynı anda hem kelime hem anlam yer almaz. Odak merkezinde her an yalnızca tek bir metin alanı bulunur.
- **Faz 1 (FRONT)**: Ekran merkezinde yalnızca İngilizce kelime belirir ve belirlenen süre kadar ekranda kalır.
- **Faz 2 (BACK)**: Süre dolduğunda kelime kaybolur, birebir aynı merkez noktasında Türkçe anlam belirir.
- **Sıfır Animasyon (Instant Cut)**: 3D çevirme veya kayma gibi dikkat dağıtan animasyonlar yerine göz yormayan anlık kesme kullanılır.

### 2. Doğrusal ve Hassas Süre Kontrolü (1 ms Hassasiyet)
- **1 ms Hassasiyetli Slider**: 50 ms ile 2000 ms aralığında kesintisiz doğrusal ayar.
- **Doğrudan Sayısal Giriş**: Slider yanında klavyeyle istediğiniz tam ms değerini (örn. `187` ms) girebileceğiniz senkronize kutu.
- **Süre Odaklı Butonlar**: `-` butonu süreyi azaltarak akışı hızlandırır; `+` butonu süreyi artırarak kartı ekranda daha uzun tutar.

### 3. Favorilerim Akış Modu
- **Türetilmiş Deste (Derived Deck)**: "Tüm Kartlar" ve "Favorilerim" arasında tek tıkla geçiş.
- **Hedefli Tekrar**: Zorlandığınız kelimeleri `F` tuşuyla veya yıldız ikonuyla favoriye ekleyip sadece bu kelimelerden oluşan bir akış başlatabilirsiniz.
- **Boş Favori Koruması**: Favori listesi boşken akış başlatıldığında bilgilendirici rehber kartı gösterilir.

### 4. Tek Kelimelik Anlam Ergonomisi (Zero Saccade)
- Yüksek hızlı görsel taramada gözün yatay hareket etmesini önlemek için her kelimenin karşılığı tek kelimeden oluşur (`1 İngilizce Kelime = 1 Türkçe Anlam`).
- Uygulama, önceden yüklenmiş 50 kelimelik yüksek frekanslı akademik YDS veri setiyle birlikte gelir.

### 5. Klavye Öncelikli Ergonomi (Hands-Free)
Gözünüzü ekrandan ayırmadan tüm akışı klavyeden yönetebilirsiniz:
- `Space`: Akışı Başlat / Duraklat (Play / Pause)
- `↑ / ↓`: Akış süresini (ms) artır / azalt
- `← / →`: Önceki / Sonraki karta manuel geçiş
- `Enter` veya `T`: Kart yüzünü manuel çevir (ÖN / ARKA)
- `F`: Aktif kartı Favorilere ekle / çıkar
- `Esc`: Desteler ana ekranına dön

### 6. Local-First & Hataya Dayanıklı CSV İçe Aktarma
- **Tamamen Çevrimdışı**: Tüm desteler ve ilerleme Dexie.js (IndexedDB) üzerinde yerel olarak saklanır; internet veya üyelik gerektirmez.
- **Esnek CSV Ayrıştırıcı**: Virgül (`,`), noktalı virgül (`;`) ve sekme (`\t`) ayırıcılarını otomatik tanır. Bozuk satırları atlayıp detaylı teşhis raporu sunar.

---

## 🛠️ Teknoloji Yığını

- **Masaüstü Kabuğu**: Electron (Katı ESM mimarisi: `node:url`, `fileURLToPath`)
- **Arayüz**: React 19 + TypeScript + Tailwind CSS + Lucide Icons
- **Zamanlama Motoru**: `performance.now()` tabanlı kaymasız delta-time akümülatör döngüsü
- **Veritabanı**: Dexie.js (IndexedDB)
- **Paketleme**: `electron-builder` (Standalone Windows `.exe`)
- **Testler**: Vitest (19 birim testi, %100 kapsama)

---

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js (v18 veya üzeri önerilir)
- npm

### 1. Bağımlılıkları Yükleyin
```bash
npm install
```

### 2. Geliştirme Modunda Başlatın
```bash
npm run dev
```

### 3. Birim Testlerini Çalıştırın
```bash
npm run test
```

### 4. Windows `.exe` Masaüstü Uygulamasını Paketleyin
```bash
npm run package
```
Üretilen taşınabilir Windows uygulaması `dist-release/win-unpacked/Rapid Flashcard Stream.exe` konumunda yer alır.

---

## 📂 Proje Yapısı

```text
yds-app/
├── specs/                   # Spec-Kit şartname, plan ve görev dokümantasyonu
│   └── 001-rapid-flashcard-stream/
├── src/
│   ├── core/                # Saf TypeScript iş mantığı (DOM/React bağımsız)
│   │   ├── models/          # Tip tanımları ve veri modelleri
│   │   ├── timing-engine/   # İki fazlı kaymasız zamanlayıcı motoru
│   │   ├── parser/          # CSV/TSV içe aktarma motoru
│   │   └── storage/         # Dexie.js yerel veritabanı ve örnek kelime seti
│   ├── electron/            # Native masaüstü kabuğu (ESM uyumlu main & preload)
│   └── ui/                  # React 19 sunum katmanı
│       ├── components/      # FocalCardView, SpeedControl, ProgressBar vb.
│       ├── hooks/           # useTimingEngine, useKeyboardControls, useDecks
│       └── views/           # DashboardView ve StreamView
└── tests/                   # Vitest birim testleri
```

---

## 📄 Lisans

MIT
