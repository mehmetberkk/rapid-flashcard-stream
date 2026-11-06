<!--
Sync Impact Report:
- Version Change: Uninitialized Template -> 1.0.0
- Bump Rationale: İlk sürüm anayasa kabulü (Initial ratification) - Hızlı İngilizce Kelime Tarama (Rapid Flashcard Stream) projesinin temel prensipleri ve yönetim kuralları belirlendi.
- Modified Principles:
  - [PRINCIPLE_1_NAME] -> I. Bilişsel Ergonomi ve Sabit Odak (Fixed Focal Point)
  - [PRINCIPLE_2_NAME] -> II. Hassas Zamanlama Motoru (Drift-Free Timing)
  - [PRINCIPLE_3_NAME] -> III. Klavye Öncelikli Kontrol (Keyboard-First Ergonomics)
  - [PRINCIPLE_4_NAME] -> IV. Local-First ve Hataya Dayanıklı Veri Girişi (Offline-Ready & Fault-Tolerant)
  - [PRINCIPLE_5_NAME] -> V. Headless İş Mantığı ve Test Edilebilirlik (Decoupled Core & Pure TypeScript)
- Added Sections:
  - Performans ve Teknik Kısıtlar (Technical Constraints & Performance Standards)
  - Geliştirme İş Akışı ve Kalite Eşikleri (Quality Gates & Development Workflow)
- Removed Sections: Yok
- Follow-up TODOs: Yok (Tüm alanlar eksiksiz tanımlandı)
-->

# Rapid Flashcard Stream Constitution

## Core Principles

### I. Bilişsel Ergonomi ve Sabit Odak (Fixed Focal Point)
- **Sabit Optik Eksen**: Kelime ve Türkçe anlamı ekranın tam merkezinde, aynı optik hizada gösterilmelidir. Kullanıcının göz hareketlerini (sakkadik sıçramaları) minimize etmek ve odak kaybını engellemek esastır.
- **Anlık Geçiş Zorunluluğu (Instant Cut)**: Yüksek hızlı tarama sırasında bilişsel yorgunluğu ve görsel gürültüyü önlemek için 3D kart çevirme (flip), kayma (slide) gibi dikkat dağıtıcı animasyonlar KESİNLİKLE YASAKTIR. Kart geçişleri sıfır animasyonlu anlık kesme (instant cut) ile yapılmalıdır.
- **Yüksek Kontrast ve Tipografik Netlik**: Görsel hiyerarşi, yüksek kontrastlı ve göz yormayan bir tipografi üzerine kurulmalıdır; anlam ve kelime arasındaki ayrım net olmalı fakat gözü odak merkezinden uzaklaştırmamalıdır.

### II. Hassas Zamanlama Motoru (Drift-Free Timing)
- **Milisaniye Hassasiyetinde Ayarlanabilirlik**: Kart geçiş süreleri milisaniye bazında (en az 150ms ile 3000ms aralığında) kesintisiz ve hassas bir şekilde ayarlanabilir OLMALIDIR.
- **Kaymasız (Drift-Free) Döngü Mimarisi**: Standart `setInterval` ve `setTimeout` çağrıları, ana iş parçacığı (main thread) yükü veya arka plan sekme optimizasyonları nedeniyle ciddi zaman kaymalarına (drift) yol açar. Zamanlayıcı motoru `performance.now()` ve `requestAnimationFrame` (veya delta-time biriktiricili döngü / Web Worker) mimarisiyle çalışmalıdır.
- **Deterministik Delta Hesaplaması**: Tarayıcı kare düşüşleri (frame drop) veya sekme geçişlerinde motor, geçen zamanı deterministik delta değerleriyle hesaplayarak kart atlama ve zamanlama bütünlüğünü korumalıdır.

### III. Klavye Öncelikli Kontrol (Keyboard-First Ergonomics)
- **Gözü Ekranda Tutan Kontrol Akışı**: Kullanıcı kelime tarama esnasında gözünü ekrandan ayırıp fare aramamalıdır. Tüm hayati etkileşimler ve navigasyon klavye kısayolları üzerinden gerçekleştirilmelidir.
- **Standart Tuş Kombinasyonları**:
  - `Space`: Akışı Başlat / Durdur (Play / Pause).
  - `Yukarı Ok` / `Aşağı Ok`: Akış hızını artır / azalt.
  - `Sağ Ok` / `Sol Ok`: Sonraki karta geç / Önceki karta geri sar (Manuel navigasyon).
  - Desteklenen ek fonksiyonlar (favorileme, anlam gizleme/gösterme) doğrudan tek tuş kısayollarıyla tetiklenmelidir.
- **Global Kısayol Yönetimi ve Çakışma Koruması**: Arama kutusu veya metin alanları haricinde klavye kısayolları ekranın her yerinde kesintisiz çalışmalı, tarayıcının varsayılan çakışan eylemleri (`preventDefault`) kontrollü yönetilmelidir.

### IV. Local-First ve Hataya Dayanıklı Veri Girişi (Offline-Ready & Fault-Tolerant)
- **Tam Yerel ve Bağımsız Çalışma**: Uygulama herhangi bir harici backend sunucusuna ihtiyaç duymadan, doğrudan tarayıcı ortamında yerel depolama (`IndexedDB` ve `LocalStorage`) ile çalışmalıdır. Kullanıcı verisi ve kelime havuzu cihazda yerel kalmalıdır.
- **Bozuk Satır Toleransı**: CSV, TSV ve JSON dosya yükleme ayrıştırıcısı (parser); bozuk satırlar, eksik virgüller, beklenmeyen ayırıcılar veya BOM/karakter kodlama anomalilerinde tüm işlemi iptal etmemeli, geçerli satırları ayıklayıp içeri almalıdır.
- **Şeffaf Doğrulama Raporu**: İçe aktarma işlemi sonrasında hatalı satırların satır numaraları ve hata nedenleri kullanıcıya anlaşılır, filtrelenebilir bir doğrulama raporu olarak sunulmalıdır.

### V. Headless İş Mantığı ve Test Edilebilirlik (Decoupled Core & Pure TypeScript)
- **Arayüzden Bağımsız Çekirdek (Pure TypeScript)**: Dosya ayrıştırma motoru (parser), kelime akış zamanlayıcısı (stream engine) ve oturum durumu yönetimi (session state), herhangi bir UI framework'üne (React/Vue/DOM) bağımlı olmadan saf TypeScript olarak tasarlanmalıdır.
- **Kapsamlı Birim Testleri**: Zamanlayıcı motoru, delta-time döngüsü, parser sınır durumları (edge cases) ve durum geçişleri; DOM bağımlılığı olmaksızın simüle edilmiş zaman (fake timers) ve mock `performance.now()` ile birim testlerle (unit test) tam olarak doğrulanabilir olmalıdır.
- **Olay Tabanlı UI Entegrasyonu**: UI bileşenleri, headless çekirdeğe yalnızca olay abonelikleri (event listener / state observer) ve açık komut API'leri üzerinden bağlanmalıdır.

## Performans Standartları ve Teknik Kısıtlar

- **Sıfır Görsel Titreme ve Yüksek Kare Hızı**: Akış sırasında DOM reflow/repaint yükü minimum seviyede tutulmalı; 60 FPS (mümkünse yüksek yenileme hızlı ekranlarda 120 FPS) akıcılık korunmalıdır.
- **Hafif Bağımlılık Mimarisi**: Çekirdek iş mantığında harici ağır kütüphaneler yerine sıfır bağımlılıklı, hafif veri yapıları ve algoritmalar tercih edilmelidir.
- **Gizlilik ve Güvenlik**: Yüklenen kelime listeleri hiçbir uzak sunucuya veya üçüncü taraf telemetri servisine aktarılamaz.

## Geliştirme İş Akışı ve Kalite Eşikleri

- **TDD (Test-Driven Development) Disiplini**: Headless ayrıştırıcı ve zamanlama motorundaki her yeni özellik veya kural değişikliği, öncelikle başarısız olan bir birim testi ile tanımlanmalı, ardından kodlanmalıdır.
- **Katı Tip Güvenliği**: TypeScript `strict` modu tavizsiz uygulanır; `any` tipi kullanımı kesinlikle yasaktır.
- **Modüler Sözleşmeler**: UI ile çekirdek motor arasındaki veri iletişimi değişmez (immutable) veri modelleri ve tip tanımlı arayüzler (interfaces) üzerinden yürütülür.

## Governance

- **Anayasanın Üstünlüğü**: Bu anayasada yer alan ergonomi, zamanlama ve headless mimari prensipleri tüm diğer geliştirme kararlarından üstündür. Çelişki durumunda anayasa hükümleri geçerlidir.
- **Değişiklik ve Versiyonlama Politikası**:
  - **MAJOR (X.0.0)**: Temel ergonomi prensiplerinin kaldırılması, local-first yaklaşımının terk edilmesi veya geriye dönük uyumsuz mimari dönüşümler.
  - **MINOR (1.X.0)**: Yeni ilkelerin eklenmesi, performans veya erişilebilirlik standartlarının genişletilmesi.
  - **PATCH (1.0.X)**: Yazım düzeltmeleri, ilke açıklamalarının netleştirilmesi ve biçimsel güncellemeler.
- **Uyumluluk Denetimi**: Her pull request, özellik tasarımı (`spec.md`) ve görev planı (`tasks.md`), özellikle bilişsel sabit odak, instant-cut geçiş ve headless motor kuralları doğrultusunda denetlenmelidir.
- **Uygulama Rehberi**: Geliştirme süreci boyunca `.specify/memory/constitution.md` belgesi tek doğruluk kaynağı (source of truth) olarak kabul edilir.

**Version**: 1.0.0 | **Ratified**: 2026-11-05 | **Last Amended**: 2026-11-05
