import { notFound } from "next/navigation"
import { Metadata } from "next"

export const dynamic = "force-dynamic"
export const revalidate = 60

const defaultPagesData: Record<
  string,
  {
    title: string
    subtitle?: string
    content: string
    updatedAt: string
  }
> = {
  "mesafeli-satis": {
    title: "Mesafeli Satış Sözleşmesi",
    subtitle: "6502 Sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği Uyarınca Hazırlanmıştır",
    updatedAt: "26.11.2026",
    content: `MADDE 1 - TARAFLAR

1.1. SATICI:
Ticari Unvan: ÖZSE MODA TEKSTİL KAFE GIDA İNŞAAT SAN. TİC. LTD. ŞTİ. (Çizgi Butik)
Adres: Merkez Mah. Muallim Naci Sk. No: 9 Güngören / İstanbul
Telefon: 0532 337 00 81
E-posta: info@cizgibutik.com
Mersis No: 0705060035500001
Vergi Dairesi & No: Güngören V.D. - 7050600355
Web Sitesi: https://cizgibutik.com

1.2. ALICI (TÜKETİCİ):
Web sitesi üzerinden sipariş veren, fatura ve teslimat bilgileri sipariş formunda belirtilen gerçek veya tüzel kişidir.

MADDE 2 - SÖZLEŞMENİN KONUSU
İşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait https://cizgibutik.com internet sitesinden elektronik ortamda siparişini yaptığı, sitede nitelikleri ve satış fiyatı belirtilen ürünlerin satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmelere Dair Yönetmelik hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.

MADDE 3 - SÖZLEŞME KONUSU ÜRÜN VE ÖDEME BİLGİLERİ
Ürünlerin cinsi, türü, miktarı, rengi, vergiler dahil satış bedeli, ödeme şekli ve teslimat bilgileri sipariş özeti ve fatura üzerinde belirtildiği gibidir. Sitemizde listelenen tüm fiyatlar Türk Lirası (TRY) cinsindendir ve KDV dahildir.

MADDE 4 - GENEL HÜKÜMLER
4.1. ALICI, SATICI'ya ait internet sitesinde sözleşme konusu ürünün temel nitelikleri, satış fiyatı, ödeme şekli ve teslimata ilişkin ön bilgileri okuyup bilgi sahibi olduğunu ve elektronik ortamda gerekli teyidi verdiğini beyan eder.
4.2. Sözleşme konusu ürün, yasal 30 günlük süreyi aşmamak koşulu ile her bir ürün için ALICI'nın yerleşim yerinin uzaklığına bağlı olarak internet sitesinde ön bilgiler içinde açıklanan süre içinde ALICI veya gösterdiği adresteki kişi/kuruluşa teslim edilir. Siparişler ortalama 1-3 iş günü içerisinde kargoya teslim edilmektedir.
4.3. Sözleşme konusu ürün, ALICI'dan başka bir kişi/kuruluşa teslim edilecek ise, teslim edilecek kişi/kuruluşun teslimatı kabul etmemesinden SATICI sorumlu tutulamaz.
4.4. SATICI, sözleşme konusu ürünün sağlam, eksiksiz, siparişte belirtilen niteliklere uygun ve varsa garanti belgeleri ve kullanım kılavuzları ile teslim edilmesinden sorumludur.

MADDE 5 - CAYMA HAKKI VE İADE KOŞULLARI
5.1. ALICI, sözleşme konusu ürünün kendisine veya gösterdiği adresteki kişi/kuruluşa tesliminden itibaren 14 (on dört) gün içinde hiçbir hukuki ve cezai sorumluluk üstlenmeksizin ve hiçbir gerekçe göstermeksizin cayma hakkını kullanabilir.
5.2. Cayma hakkının kullanılması için 14 günlük süre içinde SATICI'ya telefon, e-posta (info@cizgibutik.com) veya WhatsApp destek hattı (0532 337 00 81) ile yazılı bildirimde bulunulması ve ürünün kullanılmamış, etiketleri sökülmemiş ve tekrar satılabilirlik özelliğini kaybetmemiş olması şarttır.
5.3. Cayma hakkının kullanılması halinde, ürün SATICI'nın anlaşmalı kargo firması aracılığıyla SATICI'ya geri gönderilir. Ürünün SATICI'ya ulaşmasını takip eden 7 (yedi) iş günü içerisinde ürün bedeli ALICI'nın ödeme yaptığı yöntemle kesintisiz olarak iade edilir.

MADDE 6 - YETKİLİ MAHKEME
İşbu sözleşmenin uygulanmasında, Sanayi ve Ticaret Bakanlığınca ilan edilen değere kadar Tüketici Hakem Heyetleri ile ALICI'nın veya SATICI'nın yerleşim yerindeki Tüketici Mahkemeleri yetkilidir. Siparişin onaylanması durumunda ALICI işbu sözleşmenin tüm koşullarını kabul etmiş sayılır.`,
  },
  "iade-ve-degisim": {
    title: "İptal, İade ve Değişim Koşulları",
    subtitle: "Google Merchant Center ve 6502 Sayılı Tüketici Kanunu Uyumlu Şeffaf İade Politikası",
    updatedAt: "26.11.2026",
    content: `Çizgi Butik olarak müşteri memnuniyetini en üst düzeyde tutmayı ilke ediniyoruz. Google Merchant Center politikaları ve 6502 sayılı Tüketicinin Korunması Hakkında Kanun uyarınca hazırlanan resmi iptal, iade ve değişim politikamız aşağıda tüm detaylarıyla yer almaktadır:

İADE VE DEĞİŞİM POLİTİKASI ÖZET TABLOSU:
• İade Politikası URL: https://cizgibutik.com/tr/pages/iade-ve-degisim
• Geçerli Ülke: Türkiye
• İade Kabul Edilen Durumlar: Hem kusurlu hem de kusurlu olmayan (cayma hakkı) tüm ürünler için iade kabul edilir.
• Değişim (Borsalar): Evet, tüm ürünlerde 14 gün içinde değişim kabul edilir.
• Ürünün Durumu: Yalnızca yeni ürünler (kullanılmamış, yıkanmamış, tadilat görmemiş, orijinal etiketleri ve ambalajı zarar görmemiş).
• İade Aralığı / Süresi: Teslimat tarihinden itibaren 14 gün.
• İade Yöntemi: Postayla / Anlaşmalı kargo firmaları aracılığıyla depomuza iade.
• İade Kargo Ücreti / Etiketi: Müşterinin sorumluluğundadır (kusurlu veya ayıplı ürün gönderimlerinde kargo ücreti tamamen firmamıza aittir).
• Yeniden Stoka Ekleme Ücreti (Restocking Fee): Maliyet yok (0 TL / Ücretsizdir, herhangi bir stoklama kesintisi uygulanmaz).
• Geri Ödeme İşlem Süresi: İade edilen ürün depomuza ulaştıktan sonra 3 gün içinde tamamlanır.

1. İADE VE CAYMA HAKKI SÜRESİ
Müşterilerimiz, sipariş ettikleri ürünün kendilerine veya belirttikleri adresteki kişi/kuruluşa teslim edildiği tarihten itibaren 14 (on dört) gün içerisinde hiçbir gerekçe göstermeksizin ve cezai şart ödemeksizin cayma hakkını kullanarak iade edebilir veya değişim talep edebilir.

2. İADE EDİLEBİLECEK ÜRÜNLERİN DURUMU
- İade edilecek ürünler yalnızca "Yeni" durumda olmalıdır.
- Ürünün denenmesi haricinde kullanılmamış, yıkanmamış, parfüm veya kozmetik lekesi barındırmayan durumda olması gerekmektedir.
- Ürün üzerinde bulunan orijinal barkod, etiket ve koruyucu bantlar sökülmemiş olmalıdır.
- Ürünün varsa tüm aksesuarları ve orijinal kutusu ile birlikte eksiksiz olarak kargolanması gerekir.
- Sağlık ve hijyen açısından uygun olmayan ürünler (iç çamaşırı, küpe vb.) hijyen bandı açıldığı takdirde iade alınamamaktadır.

3. KUSURLU VE AYIPLI ÜRÜNLERDE İADE
Ürünün fabrikasyon kusurlu, hasarlı veya siparişinizden farklı çıkması halinde koşulsuz olarak iade veya anında birebir değişim yapılır. Bu durumda iade kargo ücreti firmamız tarafından karşılanır.

4. İADE VE DEĞİŞİM SÜRECİ (ADIM ADIM)
Adım 1: info@cizgibutik.com e-posta adresimize sipariş numaranızla yazabilir veya 0532 337 00 81 numaralı WhatsApp destek hattımıza iletebilirsiniz.
Adım 2: Size iletilen kargo iade takip kodunu kullanarak ürünü sağlam bir paket içerisinde hazırlayınız.
Adım 3: Paketi en yakın kargo şubesine teslim ediniz.

5. İADE VE DEPO TESLİMAT ADRESİ
Firma: ÖZSE MODA TEKSTİL KAFE GIDA İNŞAAT SAN. TİC. LTD. ŞTİ. (Çizgi Butik)
Adres: Merkez Mah. Muallim Naci Sk. No: 9 Güngören / İstanbul / Türkiye
Telefon: 0532 337 00 81
E-posta: info@cizgibutik.com

6. GERİ ÖDEME İŞLEM SÜRESİ (3 GÜN)
İade edilen ürün depomuza ulaşıp kalite kontrol uzmanlarımızca onaylandıktan sonra en geç 3 (üç) gün içinde geri ödemeniz bankanıza kesintisiz olarak iletilir. Bankanızın kart ve hesap tipine göre tutar ekstrenize yansıtılır.`,
  },
  "teslimat-kargo": {
    title: "Teslimat ve Kargo Şartları",
    subtitle: "Google Merchant Center Uyumlu Kargo Bilgileri ve Ücret Tablosu",
    updatedAt: "26.11.2026",
    content: `Çizgi Butik siparişleriniz, Türkiye'nin her noktasına hızlı, sigortalı ve güvenli şekilde ulaştırılmaktadır. Kargo süreçlerimiz ve ücretlendirme politikamız şeffaf şekilde aşağıda belirtilmiştir:

KARGO VE TESLİMAT BİLGİLERİ ÖZETİ:
• Geçerli Ülke: Türkiye (Tüm 81 il ve ilçeler)
• Son Sipariş Saati: Saat 14:00 (GMT+03:00 Türkiye Standart Saati - İstanbul)
• Sevkiyata Hazırlık Süresi (Handling Time): 0 - 1 gün (Pazartesi - Cumartesi günleri arasında)
• Nakliye Süresi (Transit Time): 0 - 3 gün (Pazartesi - Cumartesi günleri arasında)
• Toplam Teslimat Süresi: 0 - 4 iş günü

KARGO MALİYETLERİ VE FİYATLANDIRMA:
• 3.000,00 TL ve Üzeri Siparişler: KARGO ÜCRETSİZDİR (0,00 TL).
• 3.000,00 TL Altındaki Siparişler: Sabit 60,00 TL kargo ücreti tahsil edilir.
• Para Birimi: TRY (Türk Lirası).
• Gizli Maliyet Yoktur: Sipariş esnasında sepet ve ödeme adımında kargo ücreti açıkça gösterilir, ek bir sürpriz maliyet yansıtılmaz.

1. AYNI GÜN SEVKİYAT VE HAZIRLIK
Hafta içi ve Cumartesi günleri saat 14:00'e kadar verilen tüm siparişler aynı gün (0 gün) hazırlanarak kargo şirketine teslim edilir. Saat 14:00'ten sonra verilen siparişler takip eden ilk iş günü (maksimum 1 gün içinde) kargoya teslim edilmektedir.

2. NAKLİYE VE TESLİMAT SÜRESİ
Kargo firmasına teslim edilen paketler, alıcının bulunduğu il ve ilçeye bağlı olarak 0 ila 3 iş günü içinde adrese teslim edilir. Türkiye genelinde toplam teslimat süresi sipariş anından itibaren 0-4 iş günüdür.

3. KARGO TAKİBİ
Siparişiniz kargo görevlisine teslim edildiğinde, sistemimize kayıtlı cep telefonunuza SMS ve e-posta adresinize kargo takip numarası iletilir. Bu takip numarasıyla web sitemizden veya kargo firmasının sorgulama ekranından gönderinizin aşamalarını canlı takip edebilirsiniz.

4. TESLİMAT ESNASINDA DİKKAT EDİLECEKLER
Paketinizi teslim alırken kargo ambalajını kontrol ediniz. Fiziksel hasar veya ezilme tespit etmeniz durumunda kargo görevlisine Hasar Tespit Tutanağı tutturarak paketi teslim almayınız ve derhal 0532 337 00 81 numaralı destek hattımıza bildiriniz.`,
  },
  "iletisim": {
    title: "İletişim Bilgileri",
    subtitle: "Bize Her Zaman Ulaşabilirsiniz",
    updatedAt: "26.11.2026",
    content: `Çizgi Butik Müşteri Destek Ekibi olarak sorularınızı yanıtlamaktan, önerilerinizi dinlemekten ve siparişlerinizle ilgili her konuda yardımcı olmaktan memnuniyet duyarız.

RESMİ ŞİRKET BİLGİLERİ:
Ticari Unvan: ÖZSE MODA TEKSTİL KAFE GIDA İNŞAAT SAN. TİC. LTD. ŞTİ.
Marka Adı: Çizgi Butik
Adres: Merkez Mah. Muallim Naci Sk. No: 9 Güngören / İstanbul / Türkiye
Telefon: 0532 337 00 81
WhatsApp Destek Hattı: 0532 337 00 81
E-posta: info@cizgibutik.com
Mersis No: 0705060035500001
Vergi Dairesi: Güngören Vergi Dairesi
Vergi Numarası: 7050600355
Web Sitesi: https://cizgibutik.com

ÇALIŞMA SAATLERİ:
Pazartesi - Cuma: 09:00 - 19:00
Cumartesi: 10:00 - 18:00
Pazar: Kapalı (Web sitemiz üzerinden 7/24 online sipariş verebilirsiniz)

MÜŞTERİ HİZMETLERİ VE DESTEK:
Sipariş durumu, kargo takibi, ürün beden danışmanlığı, iptal, iade ve değişim talepleriniz için çalışma saatleri içerisinde müşteri hizmetleri numaramızdan, WhatsApp destek hattımızdan veya 7/24 info@cizgibutik.com e-posta adresimizden bize ulaşabilirsiniz. E-postalarınız en geç 24 saat içerisinde yanıtlanmaktadır.`,
  },
  "kvkk": {
    title: "Kişisel Verilerin Korunması ve Aydınlatma Metni",
    subtitle: "6698 Sayılı Kişisel Verilerin Korunması Kanunu Kapsamında Bilgilendirme",
    updatedAt: "26.11.2026",
    content: `ÖZSE MODA TEKSTİL KAFE GIDA İNŞAAT SAN. TİC. LTD. ŞTİ. (Çizgi Butik) olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, veri sorumlusu sıfatıyla kişisel verilerinizin güvenliğine ve gizliliğine azami hassasiyet göstermekteyiz.

1. VERİ SORUMLUSU
6698 sayılı KVKK uyarınca Veri Sorumlusu:
Şirket: ÖZSE MODA TEKSTİL KAFE GIDA İNŞAAT SAN. TİC. LTD. ŞTİ. (Çizgi Butik)
Adres: Merkez Mah. Muallim Naci Sk. No: 9 Güngören / İstanbul
Mersis No: 0705060035500001
E-posta: info@cizgibutik.com

2. KİŞİSEL VERİLERİN İŞLENME AMAÇLARI
Kişisel verileriniz (ad, soyad, telefon numarası, teslimat ve fatura adresi, e-posta adresi, sipariş ve ödeme işlem kayıtları);
- Web sitemiz üzerinden siparişlerinizin alınması, onaylanması ve faturalandırılması,
- Sipariş edilen ürünlerin kargo aracılığıyla adresinize teslimatının gerçekleştirilmesi,
- İptal, iade, değişim ve satış sonrası destek süreçlerinin yürütülmesi,
- Mevzuattan kaynaklanan yasal yükümlülüklerin ve muhasebe kayıtlarının yerine getirilmesi,
- Açık rıza vermeniz halinde kampanya, indirim ve yeni sezon bilgilendirmelerinin yapılması amaçlarıyla işlenmektedir.

3. KİŞİSEL VERİLERİN AKTARILMASI
Kişisel verileriniz yalnızca yasal zorunluluklar ve sözleşmesel hizmetin ifası kapsamında; siparişinizin teslimatı için anlaşmalı kargo firmalarına, ödemenin güvenli gerçekleşmesi için BDDK lisanslı ödeme kuruluşlarına ve yasal talep halinde yetkili kamu kurum ve kuruluşlarına aktarılmaktadır. Verileriniz hiçbir surette ticari amaçla üçüncü kişilere satılmaz veya devredilmez.

4. KİŞİSEL VERİ SAHİBİNİN HAKLARI (KVKK MADDE 11)
Kanunun 11. maddesi gereğince tarafımıza başvurarak:
a) Kişisel verilerinizin işlenip işlenmediğini öğrenme,
b) İşlenmişse buna ilişkin bilgi talep etme,
c) İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,
d) Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,
e) Eksik veya yanlış işlenmişse düzeltilmesini isteme,
f) KVKK şartları çerçevesinde silinmesini veya yok edilmesini isteme haklarına sahipsiniz.

Başvurularınızı kimliğinizi tevsik edici belgelerle birlikte info@cizgibutik.com e-posta adresimize veya şirket merkez adresimize yazılı olarak iletebilirsiniz.`,
  },
  "kullanici-sozlesmesi": {
    title: "Kullanıcı Sözleşmesi",
    subtitle: "Çizgi Butik Web Sitesi Kullanım Şart ve Kuralları",
    updatedAt: "26.11.2026",
    content: `1. GİRİŞ VE SÖZLEŞMENİN KABULÜ
Bu internet sitesini (https://cizgibutik.com) ziyaret eden, kullanan ve siteden alışveriş yapan tüm kullanıcılar işbu Kullanıcı Sözleşmesi'nde yer alan şartları peşinen kabul etmiş sayılır.

2. HİZMETLERİN KAPSAMI
Çizgi Butik, internet sitesi üzerinden kadın giyim, aksesuar ve moda ürünlerinin perakende satışını gerçekleştirmektedir. Çizgi Butik, sitede sunulan hizmetleri, ürün çeşitlerini, fiyatları ve sözleşme koşullarını önceden bildirmeksizin güncelleme hakkını saklı tutar.

3. KULLANICI YÜKÜMLÜLÜKLERİ
- Kullanıcı, siteye üye olurken veya sipariş verirken verdiği kişisel bilgilerin doğru, eksiksiz ve güncel olduğunu taahhüt eder.
- Kullanıcı, siteyi kullanırken yürürlükteki Türkiye Cumhuriyeti yasalarına, kamu düzenine ve genel ahlak kurallarına uymakla yükümlüdür.
- Sitenin güvenliğini tehdit edecek, yazılım ve altyapıya zarar verecek hiçbir girişimde bulunulamaz.

4. FİKRİ MÜLKİYET HAKLARI
https://cizgibutik.com web sitesinde yer alan tüm görsel tasarımlar, logolar, fotoğraflar, metinler, yazılımlar ve veri tabanları ÖZSE MODA TEKSTİL KAFE GIDA İNŞAAT SAN. TİC. LTD. ŞTİ.'ye aittir ve telif hakkı mevzuatıyla korunmaktadır. İzinsiz kopyalanamaz, çoğaltılamaz ve kullanılamaz.

5. FİYAT VE STOK GÜNCELLEMELERİ
Sitede yer alan ürünlerin stok durumları ve fiyatları güncel tutulmaktadır. Sistem hatalarından kaynaklanan bariz fiyat uyuşmazlıklarında Çizgi Butik, siparişi iptal ederek tutarı müşteriye eksiksiz iade etme hakkına sahiptir.`,
  },
  "gizlilik-sozlesmesi": {
    title: "Gizlilik ve Güvenlik Politikası",
    subtitle: "256-Bit SSL Sertifikalı Güvenli Alışveriş Standartları",
    updatedAt: "26.11.2026",
    content: `Çizgi Butik (ÖZSE MODA TEKSTİL KAFE GIDA İNŞAAT SAN. TİC. LTD. ŞTİ.) olarak müşterilerimizin güvenliğine ve gizliliğine en yüksek önemi veriyoruz.

1. BİLGİ GÜVENLİĞİ VE ŞİFRELEME
Web sitemiz üzerinden gerçekleştirdiğiniz tüm işlemler uluslararası güvenlik standardı olan 256-bit SSL (Secure Sockets Layer) şifreleme sertifikası ile korunmaktadır. Kredi kartı bilgileriniz doğrudan bankanın güvenli sanal pos sistemine şifreli olarak iletilir; sunucularımızda kesinlikle saklanmaz ve depolanmaz.

2. 3D SECURE İLE GÜVENLİ ÖDEME
Kredi kartı ile yapacağınız tüm ödemelerde bankanızın 3D Secure güvenli ödeme protokolü devrededir. Cep telefonunuza gelen tek kullanımlık SMS onay kodu ile işleminizi güvenle tamamlarsınız.

3. KİŞİSEL BİLGİLERİN GİZLİLİĞİ
Sipariş verirken paylaştığınız adres, telefon ve e-posta bilgileriniz sadece siparişinizin hazırlanması, faturalandırılması ve teslim edilmesi amacıyla kullanılır. Bilgileriniz kesinlikle üçüncü şahıs veya kurumlarla paylaşılmaz, ticari amaçla satılmaz.

4. ÇEREZ (COOKIE) KULLANIMI
Web sitemizde alışveriş deneyiminizi kolaylaştırmak, sepetinizi hatırlamak ve site performansını analiz etmek amacıyla çerezler kullanılmaktadır. Tarayıcı ayarlarınızdan dilediğiniz zaman çerez tercihlerinizi değiştirebilirsiniz.`,
  },
  "hakkimizda": {
    title: "Hakkımızda",
    subtitle: "Zarafet, Kalite ve Güvenle: Çizgi Butik Hikayesi",
    updatedAt: "26.11.2026",
    content: `Çizgi Butik, modern kadının şıklığını ve zarafetini en kaliteli kumaşlar ve özgün tasarımlarla buluşturmak amacıyla ÖZSE MODA TEKSTİL KAFE GIDA İNŞAAT SAN. TİC. LTD. ŞTİ. çatısı altında kurulmuştur.

MİSYONUMUZ:
Her kadının kendi tarzını özgürce yansıtabileceği, trendleri yakalayan, konforlu ve yüksek kaliteli giyim koleksiyonlarını erişilebilir fiyatlarla ve şeffaf hizmet anlayışıyla sunmaktır.

VİZYONUMUZ:
Türkiye'de ve bölgede e-ticaret alanında müşteri memnuniyeti, güvenilirlik ve kalite standartlarıyla öncü, sevilen bir kadın giyim markası olmaktır.

DEĞERLERİMİZ:
- %100 Müşteri Memnuniyeti: Satış öncesinde olduğu gibi satış sonrasında da müşterilerimizin daima yanındayız.
- Kalite ve Özen: Koleksiyonlarımızdaki her parça 1. sınıf kumaş ve özenli işçilikle üretilmektedir.
- Şeffaflık ve Güven: Fiyatlarımız, kargo süreçlerimiz ve iade politikalarımız tamamen açık ve şeffaftır.
- Hızlı Teslimat: Siparişlerinizi en hızlı şekilde paketleyerek güvenli kargo ağıyla kapınıza ulaştırıyoruz.

Bize güvendiğiniz ve gardırobunuzda Çizgi Butik'e yer verdiğiniz için teşekkür ederiz.`,
  },
  "siparis-takip": {
    title: "Sipariş Takibi",
    subtitle: "Siparişinizin Durumunu ve Kargo Hareketlerini Kolayca İzleyin",
    updatedAt: "26.11.2026",
    content: `Siparişinizin hangi aşamada olduğunu aşağıdaki adımları izleyerek kolayca öğrenebilirsiniz:

1. ÜYELİKSİZ SİPARİŞLER İÇİN:
Siparişiniz kargoya teslim edildiğinde, sipariş formunda belirttiğiniz cep telefonu numaranıza ve e-posta adresinize kargo takip linki ve takip numarası otomatik olarak gönderilmektedir. Bu linke tıklayarak kargonuzun nerede olduğunu anlık olarak görebilirsiniz.

2. ÜYE GİRİŞİ İLE:
Web sitemize üye girişi yaparak sağ üst köşedeki "Hesabım" > "Siparişlerim" bölümünden geçmiş ve aktif tüm siparişlerinizin durumunu ve kargo takip kodunu görüntüleyebilirsiniz.

3. DOĞRUDAN DESTEK:
Kargo takip numaranızı bulamadıysanız veya kargonuzla ilgili herhangi bir aksaklık yaşarsanız, ad-soyad ve telefon numaranızla birlikte 0532 337 00 81 numaralı WhatsApp destek hattımızdan veya info@cizgibutik.com adresimizden bize yazabilirsiniz. Destek ekibimiz anında kargo sorgulaması yaparak size bilgi verecektir.`,
  },
  "havale-bildirimleri": {
    title: "Havale / EFT Bildirimleri",
    subtitle: "Banka Havalesi ile Siparişlerinizde Hızlı Onay",
    updatedAt: "26.11.2026",
    content: `Havale veya EFT seçeneğiyle verdiğiniz siparişlerin en kısa sürede hazırlanıp kargoya verilebilmesi için lütfen aşağıdaki adımları takip ediniz:

1. ÖDEME AÇIKLAMASI
Banka transferinizi gerçekleştirirken açıklama kısmına lütfen SİPARİŞ NUMARANIZI ve AD-SOYADINIZI yazınız.

2. DEKONT BİLDİRİMİ
Havale/EFT işleminizi tamamladıktan sonra banka dekontunuzun ekran görüntüsünü veya PDF belgesini aşağıdaki kanallardan bize iletebilirsiniz:
- WhatsApp Destek Hattı: 0532 337 00 81
- E-posta: info@cizgibutik.com

3. SİPARİŞ ONAYI
Havale bildiriminiz muhasebe birimimiz tarafından kontrol edildikten sonra (mesai saatleri içerisinde genellikle 15-30 dakika içinde) siparişiniz onaylanır ve kargolama aşamasına geçirilir. Tarafınıza SMS ve e-posta ile onay bilgisi iletilir.`,
  },
}

async function getPagesData() {
  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
      process.env.MEDUSA_BACKEND_URL ||
      "https://api.cizgibutik.com"

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
      headers["x-publishable-api-key"] = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    }

    const res = await fetch(`${backendUrl}/store/pages`, {
      headers,
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      return defaultPagesData
    }

    const data = await res.json()
    return { ...defaultPagesData, ...(data.pages || {}) }
  } catch (error) {
    return defaultPagesData
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const { slug } = params
  const pagesContent = await getPagesData()
  const pageData = pagesContent[slug] || defaultPagesData[slug]

  if (!pageData) {
    return {
      title: "Çizgi Butik - Bilgi Sayfası",
    }
  }

  return {
    title: `${pageData.title} | Çizgi Butik`,
    description: `${pageData.title} - Çizgi Butik resmi kurumsal bilgi ve politika sayfası. Güvenli alışveriş, müşteri hakları ve şeffaf hizmet ilkeleri.`,
    alternates: {
      canonical: `https://cizgibutik.com/tr/pages/${slug}`,
    },
  }
}

export default async function StaticPage({
  params,
}: {
  params: { slug: string }
}) {
  const { slug } = params

  const pagesContent = await getPagesData()
  const pageData = pagesContent[slug] || defaultPagesData[slug]

  if (!pageData) {
    notFound()
  }

  return (
    <div className="content-container py-12 flex flex-col gap-8 min-h-[60vh] max-w-4xl mx-auto">
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
          {pageData.title}
        </h1>
        {pageData.subtitle && (
          <p className="text-sm md:text-base text-gray-500 mt-2">
            {pageData.subtitle}
          </p>
        )}
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
          <span>Çizgi Butik Kurumsal</span>
          <span>•</span>
          <span>Son Güncelleme: {pageData.updatedAt || "26.11.2026"}</span>
        </div>
      </div>

      <div className="prose prose-zinc max-w-none text-gray-700 whitespace-pre-line leading-relaxed text-sm md:text-base">
        {pageData.content}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-gray-500 bg-gray-50 p-4 rounded-lg">
        <div>
          <span className="font-semibold text-gray-700">Resmi İletişim: </span>
          <span>info@cizgibutik.com | 0532 337 00 81</span>
        </div>
        <div>
          <span>ÖZSE MODA TEKSTİL KAFE GIDA İNŞAAT SAN. TİC. LTD. ŞTİ.</span>
        </div>
      </div>
    </div>
  )
}
