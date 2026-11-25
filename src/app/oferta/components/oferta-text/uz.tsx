import type { OfertaProps } from '@/types/oferta'

export const UZ = (props: OfertaProps) => {
	return (
		<div style={{ padding: '16px', fontSize: '14px' }}>
			<h1
				style={{
					textAlign: 'center',
					fontSize: '24px',
					fontWeight: 'bold',
					marginBottom: '20px',
				}}
			>
				{props.name}
			</h1>
			<h2
				style={{
					textAlign: 'center',
					fontSize: '20px',
					fontWeight: '600',
					marginBottom: '16px',
				}}
			>
				OMMAVIY OFERTA SHARTNOMASI
			</h2>

			<section style={{ marginBottom: '16px' }}>
				<h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
					1. UMUMIY QOIDALAR
				</h3>
				<p style={{ marginBottom: '8px' }}>
					1.1. Ushbu hujjat {props.name} kompaniyasining (keyingi o‘rinlarda “Internet-do‘kon” deb
					yuritiladi) rasmiy ommaviy ofertasi hisoblanadi va Tovar va/yoki Xizmatlarga buyurtma
					berish, sotish, shuningdek, Xaridorga yetkazib berishning barcha muhim shartlarini ichiga
					oladi.
				</p>
				<p style={{ marginBottom: '8px' }}>
					1.2. O‘zbekiston Respublikasi Fuqarolik Kodeksining 369-moddasiga muvofiq, quyida
					ko‘rsatilgan shartlarni qabul qilgan va Tovarlar va/yoki Xizmatlar uchun haq to‘lagan
					taqdirda, ushbu ofertani akseptlagan (qabul qilgan) jismoniy shaxs Xaridor,
					internet-do‘kon va Xaridor birgalikda Oferta shartnomasining Taraflariga aylanadi.
				</p>
				<p style={{ marginBottom: '8px' }}>
					1.3. Yuqorida e’lon qilinganlar bilan bog‘liq holda, ushbu ofertaning matnini diqqat bilan
					tanishib chiqing va uning shartlari va qoidalari yoki uning shartlarining boshqa biron
					bandiga rozi bo‘lmasangiz, Internet-do‘kon sizga Oferta shartnomasini tuzishdan bosh
					tortishni va xizmat ko‘rsatish uchun to‘g‘ridan-to‘g‘ri shartnoma tuzish orqali
					Internet-do‘kon xizmatlaridan foydalanishni taklif qiladi.
				</p>
			</section>

			<section style={{ marginBottom: '16px' }}>
				<h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>2. ATAMALAR</h3>
				<p style={{ marginBottom: '8px' }}>
					1.1. Ushbu Oferta maqsadlari uchun quyidagi atamalar quyidagi ma’nolarda qo‘llaniladi:
				</p>
				<ul style={{ marginBottom: '8px', paddingLeft: '8px', listStyleType: 'disc' }}>
					<li style={{ marginBottom: '8px' }}>
						&quot;Oferta&quot; - ushbu hujjat, Ommaviy oferta, oldi-sotdini amalga oshirishning bitimi bo‘lib,
						unga ko‘ra bir Taraf (Internet-do‘kon) ikkinchi Taraf (Xaridor)ga mulk sifatida
						Tovarlarni topshirish va/yoki Xizmatlarni ko‘rsatish majburiyatini oladi, Xaridor esa
						ushbu Tovarni va/yoki Xizmatni qabul qilish va buning uchun Internet-do‘kon tomonidan
						belgilangan pul summasini (narxini) to‘lash majburiyatini oladi.
					</li>
					<li style={{ marginBottom: '8px' }}>
						“Ofertani akseptlash” – ushbu Ofertaning 4-qismida ko‘rsatilgan harakatlarni bajarish
						orqali Ofertani to‘liq va qaytarib bo‘lmaydigan tarzda qabul qilish. Ofertani akseptlash
						Oferta shartnomasini nazarda tutadi.
					</li>
					<li style={{ marginBottom: '8px' }}>
						&quot;Oferta shartnomasi&quot; – ushbu kelishuvni qabul qilish orqali xaridor va Internet-do‘kon
						tomonidan tuzilgan oldi-sotdi shartnomasi.
					</li>
					<li style={{ marginBottom: '8px' }}>
						“Xaridor” – Ofertani akseptlagan va https://click.robosell.uz/{props.slug} manzilidagi
						Internet sahifasi orqali Tovar va/yoki Xizmatlarga buyurtma bergan shaxs.
					</li>
					<li style={{ marginBottom: '8px' }}>
						&quot;Internet-do‘kon&quot; – xaridorga sotish va yetkazib berishni amalga oshiruvchi tovar
						va/yoki xizmat sotuvchisi.
					</li>
					<li style={{ marginBottom: '8px' }}>
						&quot;Tovar&quot; – https://click.robosell.uz/{props.slug} manzili bo‘yicha veb-saytda taqdim
						etilgan namunalar bo‘yicha buyurtma berish amalga oshiriladigan oziq-ovqat mahsulotlari,
						tegishli tovar va/yoki xizmat.
					</li>
				</ul>
				<p style={{ marginBottom: '8px' }}>
					1.2. Ushbu Ofertada 2.1-bandda belgilanmagan atamalar ishlatilishi mumkin. Bu holda bunday
					atamaning talqini ushbu Oferta matniga muvofiq amalga oshiriladi. Oferta matnida atamaning
					bir ma’noli talqini bo‘lmasa, atamaning birinchi navbatda - Internet-do‘kon veb-saytidagi,
					ikkinchi navbatda - Internetda tarmog‘ida shakllangan talqiniga amal qilish lozim.
				</p>
			</section>

			<section style={{ marginBottom: '16px' }}>
				<h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
					3. SHARTNOMANING MAVZUSI
				</h3>
				<p style={{ marginBottom: '8px' }}>
					3.1. https://click.robosell.uz/{props.slug} manzili bo‘yicha veb-saytda ko‘rsatilgan
					Oferta shartlari va narxlarga muvofiq Xaridorga Tovar va/yoki Xizmatlarni sotish,
					shuningdek, Xaridor tomonidan ushbu shartnoma shartlariga muvofiq Tovar va/yoki
					Xizmatlarga xaq to‘lanishi va qabul qilinishi ushbu Ofertaning predmeti hisoblanadi.
				</p>
				<p style={{ marginBottom: '8px' }}>
					3.2. Ommaviy oferta rasmiy hujjat bo‘lib, Internet-do‘kon veb-saytida e’lon qilinadi.
				</p>
				<p style={{ marginBottom: '8px' }}>
					3.3. Internet-do‘kon joriy etilgan shartlarni ular kuchga kirishidan kamida bir kun avval
					Internet-do‘kon veb-saytida, shuningdek, ushbu hujjatlarni ko‘rib chiqish uchun ochiq
					joyda e’lon qilinishini ta’minlagan holda, xaridor bilan oldindan kelishuvchiz Tovar
					va/yoki Xizmatlarning narxini, ushbu Ommaviy oferta shartlarini va ommaviy ofertaga
					kiritilgan qo‘shimchalarni o‘zgartirishga haqli.
				</p>
			</section>

			<section style={{ marginBottom: '16px' }}>
				<h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
					4. OFERTANI AKSEPTLASH VA OFERTA SHARTNOMASINI TUZISH.
				</h3>
				<p style={{ marginBottom: '8px' }}>
					4.1. Xaridor Tovarlar va/yoki Xizmatlar uchun to‘lovni amalga oshirish orqali Ofertani
					qabul qiladi, bu esa ushbu Ofertada ko‘rsatilgan shartlar bo‘yicha chakana oldi-sotdi
					shartnomasi tuzilishini anglatadi.
				</p>
				<p style={{ marginBottom: '8px' }}>
					Shartnoma kassa yoki tovar cheki yoxud tovar va/yoki xizmat uchun to‘lov amalga
					oshirilganini tasdiqlovchi boshqa hujjat (jumladan, lekin shu bilan cheklanmagan holda,
					xaridor tomonidan bank kartasidan foydalangan holda amalga oshirilgan to‘lovning bank
					tasdiqnomasi) Xaridorga berilgan paytdan yoki Xaridorning Tovar va/yoki Xizmatni sotib
					olish niyati to‘g‘risida Sotuvchi xabar olgan paytdan boshlab tuzilgan hisoblanadi.
				</p>
			</section>

			<section style={{ marginBottom: '16px' }}>
				<h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
					5. XIZMATLAR TAVSIFI
				</h3>
				<p style={{ marginBottom: '8px' }}>
					5.1. Internet-do‘kon – Sotuvchi tomonidan taklif etilayotgan tovar va/yoki xizmatni
					Xaridor tomonidan qidirish, buyurtma qilish va to‘lash uchun axborot tizimi hisoblanadi.
				</p>
				<p style={{ marginBottom: '8px' }}>
					5.2. Buyurtma ish uchun qabul qilingan vaqtda buyurtma qilingan Tovar(lar) va/yoki
					Xizmatlar mavjud bo‘lmasa, sotuvchining xodimi Xaridor bilan Tovarni va/yoki Xizmatni
					almashtirish to‘g‘risida kelishish yoki yetishmayotgan Tovar va/yoki Xizmatni istisno
					qilishga haqli.
				</p>
				<p style={{ marginBottom: '8px' }}>
					5.3. Sotuvchi Tovarni yetkazib berish uchun buyurtma olganida, yetkazib berish xizmati
					xodimi Xaridor tomonidan buyurtma berishda ko‘rsatilgan aloqa usulidan foydalangan holda
					Xaridor bilan bog‘lanadi.
				</p>
				<p style={{ marginBottom: '8px' }}>
					5.4. Tovarlarni yetkazib berish O‘zbekiston bo‘ylab, xaridor tomonidan buyurtma berishda
					ko‘rsatilgan manzilga muvofiq va sotuvchi tomonidan yetkazib berilganligi tasdiqlanishi
					sharti bilan amalga oshiriladi. Yetkazib berish xaridor bilan kelishilgan sana va vaqtga
					muvofiq amalga oshiriladi. Yetkazib berishni tasdiqlash sotuvchi tomonidan telefon orqali
					amalga oshiriladi.
				</p>
				<p style={{ marginBottom: '8px' }}>
					5.5. Xaridor buyurtmaning bajarilishi to‘g‘risida ro‘yxatdan o‘tish va (yoki) buyurtma
					berish paytida ko‘rsatilgan telefon raqamlariga sotuvchining operatorlari va kurerlaridan
					va va yetkazib berish xizmatidan qo‘ng‘iroqlarni hamda SMS-xabarlar va elektron pochta
					xabarlarini olishga, shuningdek, boshqa belgilangan aloqa vositalari orqali xabarlarni
					qabul qilishga rozi bo‘ladi. Xaridor buyurtma qilingan Tovarni yetkazib berish xizmati
					xodimidan yoki uning tomonidan vakolatlangan shaxsdan ro‘yxatdan o‘tkazish va/yoki
					buyurtma berishda Xaridor tomonidan ko‘rsatilgan manzil bo‘yicha qabul qilishga rozi.
				</p>
				<p style={{ marginBottom: '8px' }}>
					5.6. Buyurtma berish chog‘ida Xaridor sotuvchiga va/yoki yetkazib berish xizmatiga o‘zi
					ko‘rsatgan manzilda joylashgan joyi to‘g‘risida maksimal darajada aniq ma’lumotlarni
					taqdim etishi, shuningdek yetkazib berish xizmati xodimining va uning tomonidan
					vakolatlangan shaxsning Xaridor tomonidan ko‘rsatilgan manzilga erkin va to‘siqsiz
					kirishini ta’minlashi shart.
				</p>
				<p style={{ marginBottom: '8px' }}>
					5.7. Internet-do‘konda taqdim etilgan barcha materiallar faqat ma’lumot uchun
					mo‘ljallangan va har doim ham Tovar va/yoki xizmatning xususiyatlari to‘g‘risida ishonchli
					ma’lumotni to‘liq yetkazib bera olmaydi. Tovarlarning iste’mol xususiyatlariga oid axborot
					(oziq-ovqat va energetik qiymati, saqlash sharoitlari, ingrediyentlarni ishlab
					chiqaruvchilar va sh.k.) tovarlar va (yoki) xizmatlarni yetkazib beruvchilar tomonidan
					taqdim etilgan ma’lumotlar asosida ko‘rsatiladi. Sotuvchi va ishlab chiqaruvchi haqiqiy
					xususiyatlariga mos kelmasligi uchun javobgar bo‘lmaydi. Yetkazib berilgan Tovar va uning
					tarkibiy qismlarining saqlash muddati o‘ramda ko‘rsatiladi. Sotuvchi va ishlab chiqaruvchi
					xaridor tomonidan sotib olingan tovarlar va ingrediyentlarni saqlash shartlari va
					muddatlarini buzishi natijasida yetkazilgan ziyon uchun javobgar bo‘lmaydi.
				</p>
			</section>

			<section style={{ marginBottom: '16px' }}>
				<h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
					6. XIZMATLARNI TAQDIM ETISHNING SHARTLARI VA TARTIBI
				</h3>
				<p style={{ marginBottom: '8px' }}>
					6.1. Internet-do‘konda Xaridor buyurtmasini rasmiylashtirish uchun Xaridor kontakt
					ma’lumotlarini to‘ldiradi, shu tarzda ushbu Oferta bilan tanishganligini tasdiqlaydi va
					shaklda taklif qilingan savollar bo‘yicha o‘zi to‘g‘risida aniq va to‘liq ma’lumot
					berishga rozi bo‘ladi.
				</p>
				<p style={{ marginBottom: '8px' }}>
					6.2. Xaridor noto‘g‘ri ma’lumot taqdim etsa yoki Internet-do‘kon yoxud sotuvchida u
					tomonidan taqdim etilgan ma’lumotlar noto‘g‘ri, noto‘liq yoki noto‘g‘ri ekanligini taxmin
					qilishga jiddiy asoslar bo‘lsa, Internet-do‘kon o‘z xizmatlaridan Xaridorning foydalanish
					huquqini to‘xtatib qo‘yishga haqli.
				</p>
				<p style={{ marginBottom: '8px' }}>
					6.3. Xaridor ushbu bilan, xaridorning shaxsiy ma’lumotlarini o‘z ichiga olishi mumkin
					bo‘lgan ko‘rsatilgan axborot Internet-do‘konda va sotuvchining bo‘limlarida buyurtmalarni
					keyingi rasmiylashtirish va qayta ishlash uchun ishlatilishiga rozi bo‘ladi. Buyurtmani
					joylashtirishda Internet-do‘kon va Sotuvchi shaxsiy ma’lumotlarni O‘zbekiston
					Respublikasining “Shaxsiy ma’lumotlar to‘g‘risida”gi qonuniga muvofiq qayta ishlaydi.
					Sotuvchi qabul qilingan shaxsiy ma’lumotlarni tegishlicha himoya qilinishi uchun amaldagi
					qonun hujjatlarida nazarda tutilgan barcha choralarni ko‘rish va uchinchi shaxslarga
					bermaslik majburiyatini oladi, ma’lumotlarni uzatish ushbu Shartnoma maqsadlari uchun
					sotuvchining xaridor oldidagi majburiyatlarini bajarishi uchun zarur bo‘lgan hollar bundan
					mustasno..
				</p>
				<p style={{ marginBottom: '8px' }}>
					6.4. O‘zining telefon raqami va elektron pochta manzilini ko‘rsatgan holda, xaridor
					sotuvchidan yoki Internet-do‘kon egasidan axborot tusidagi SMS va Email xabarlarini
					olishga rozi bo‘ladi.
				</p>
				<p style={{ marginBottom: '8px' }}>
					6.5. Internet-do‘konning https://click.robosell.uz/{props.slug} veb-saytida
					joylashtirilgan tovar va/yoki xizmat ro‘yxati bilan tanishib, Tovar va/yoki xizmatlar
					turini tanlab, xaridor buyurtma beradi.
				</p>
				<p style={{ marginBottom: '8px' }}>
					6.6. Xizmat ko‘rsatilgan kundan e’tiboran uch kun ichida Xaridor foydalanilmagan Tovar
					va/yoki Xizmat bo‘yicha yozma e’tiroz taqdim qilmasa, Tovar e’tirozsiz qabul qilingan,
					Xizmatlar to‘g‘ri va to‘liq hajmda taqdim etilgan deb hisoblanadi. Yozma e’tiroz bo‘lmagan
					taqdirda, bajarilgan ishlarni (xizmatlarni) qabul qilishva topshirish dalolatnomasi
					imzolangan, Xizmatlar esa tegishli tarzda taqdim etilgan deb hisoblanadi.
				</p>
				<p style={{ marginBottom: '8px' }}>
					6.7. Ushbu shartnoma bo‘yicha xizmatlar ko‘rsatilgandan so‘ng, Taraflar bir-biriga
					nisbatan hech qanday da’voga ega bo‘lmaydi.
				</p>
			</section>

			<section style={{ marginBottom: '16px' }}>
				<h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
					7. XIZMATLARNING NARXI VA SHARTNOMA BO‘YICHA HISOB-KITOB QILISH TARTIBI
				</h3>
				<p style={{ marginBottom: '8px' }}>
					7.1. Xarid qilinayotgan tovar va/yoki xizmatni yetkazib berish xarajatlari va to‘lov
					usullari https://click.robosell.uz/{props.slug} veb-saytining tegishli bo‘limlarida
					ko‘rsatilgan. Buyurtmani rasmiylashtirish orqali Xaridor Tovar va/yoki Xizmatlar narxi,
					shuningdek Tovarni yetkazib berish narxi xususida xabardorligini va haqini to‘lashga
					roziligini bildiradi.
				</p>
				<p style={{ marginBottom: '8px' }}>
					7.2. To‘lov Xaridor tomonidan https://click.uz veb-saytida onlayn to‘lov orqali amalga
					oshiriladi
				</p>
				<p style={{ marginBottom: '8px' }}>
					7.3. Tovar va (yoki) xizmat qabul qilinganda va uning uchun haq to‘langanda, xaridor
					buyurtmani (uning bir qismini) qabul qilish yoki rad etish va to‘langan summalar
					to‘g‘risida qayd qo‘yib, ilova hujjatlarini imzolashi shart.
				</p>
				<p style={{ marginBottom: '8px' }}>
					7.4. Xaridor o‘zi tomonidan qabul qilingan Tovarlar va/yoki Xizmatlarning to‘lov vaqtida
					taqdim etilgan narxini, shuningdek, tovarni yetkazib berish va o‘ramlash xarajatlarini,
					jumladan, amaldagi barcha soliqlarni to‘lashi shart.
				</p>
			</section>

			<section style={{ marginBottom: '16px' }}>
				<h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
					8. TOVAR YOKI PUL MABLAG‘LARINI QAYTARILISHI
				</h3>
				<p style={{ marginBottom: '8px' }}>
					8.1. Xaridor istalgan vaqtda, lekin kelishilgan yetkazib berish muddatidan 24 soat oldin
					(“Buyurtmani bajarish payti”) buyurtma qilingan Tovarni olishdan bosh tortishga haqli.
					Tovarni yetkazib berish uchun sotuvchining kureriga topshirish vaqti buyurtmani bajarish
					payti bo‘lib, bu tovarga qo‘shimcha hujjatlari tarkibidagi tovar chekiga qo‘yiladigan qayd
					bilan tasdiqlanadi. Bank kartasi orqali to‘lashda pul mablag‘lari ayni to‘lov amalga
					oshirilgan kartaga qaytariladi. Xaridor puli to‘langan tegishli sifatdagi Buyurtmadan
					(yoki uning bir qismidan) bosh tortishga haqli emas. Tegishli sifatdagi tovarlar
					almashtirilmaydi yoki qaytarib olinmaydi.
				</p>
				<p style={{ marginBottom: '8px' }}>
					8.2. Xaridor, sotuvchi bilan kelishilgan holda, buyurtmani o‘zgartirish huquqiga ega.
					Bunday o‘zgartirish kelishilgan yetkazib berish muddatidan 24 soat oldin amalga
					oshirilishi lozim. Bundan tashqari, agar to‘lov naqdsiz tarzda amalga oshirilgan bo‘lsa,
					sotuvchi pul mablag‘larining bir qismini Xaridorning hisob-kitob raqamiga qaytarish yoki
					qo‘shimcha to‘lov uchun talabnoma berish orqali to‘lovni to‘g‘irlaydi.
				</p>
				<p style={{ marginBottom: '8px' }}>
					8.3. Tovarlar buyurtmada ko‘rsatilgan manzilga va muddatda yetkazib berilgan, lekin
					sotuvchiga bog‘liq bo‘lmagan sabablarga ko‘ra Xaridorga topshirilmagan bo‘lsa (Xaridorning
					tegishli sifatli Tovarni qabul qilishdan bosh tortishi; Xaridor buyurtma berish paytida
					noto‘g‘ri manzilni ko‘rsatgan, belgilangan vaqtda 15 daqiqa ichida ko‘rsatilgan manzilda
					hech kim Tovarni qabul qilmagan va shu paytda buyurtma berish paytida ko‘rsatilgan telefon
					raqamiga qilingan qo‘ng‘iroqqa hech kim javob bermagan va sh.k.), sotuvchi Xaridordan rad
					etilgan tovarlarning to‘liq qiymatini qoplashini talab qilishga haqli. To‘lov naqdsiz
					hisob-kitob yo‘li bilan orqali amalga oshirilgan bo‘lsa, sotuvchi pulni qaytarib bermaydi.
					To‘lov naqd pulda hisob-kitob yo‘li bilan orqali amalga oshirilishi lozim bo‘lgan taqdirda
					sotuvchi xaridordan qabul qilinmagan Tovarning to‘liq qiymatini to‘lashni talab qilishga
					haqli.
				</p>
				<p style={{ marginBottom: '8px' }}>
					8.4. Tovarlarda nuqsonlar aniqlansa, xaridor o‘z ixtiyoriga ko‘ra bunday Tovarni tegishli
					sifatdagi tovarga almashtirishni yoki xarid narxini mutanosib ravishda kamaytirishni talab
					qilishga haqli. Ushbu talablarni taqdim etish o‘rniga, Xaridor sotib olingan Tovarni
					olishdan bosh tortishga va Tovar uchun to‘langan summani qaytarishni talab qilishga haqli.
					Bunday holda, xaridor sotuvchining talabiga binoan va uning hisobidan olingan tegishli
					sifatda bo‘lmagan tovarni qaytarishi lozim.
				</p>
			</section>

			<section style={{ marginBottom: '16px' }}>
				<h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
					9. INTERNET-DO‘KONDA JOYLASHTIRILGAN MATERIALLARDAN FOYDALANISH SHARTLARI
				</h3>
				<p style={{ marginBottom: '8px' }}>
					9.1. Internet-do‘konda mualliflik huquqi bilan himoyalangan materiallar, tovar belgilari
					va qonun bilan himoyalangan boshqa materiallar, jumladan, lekin ular bilan cheklanmagan
					holda: matnlar, fotosuratlar, grafik tasvirlar mavjud.
				</p>
				<p style={{ marginBottom: '8px' }}>
					9.2. Internet-do‘kon uning tarkibidagi materiallardan foydalanish bo‘yicha eksklyuziv
					huquqlarga ega (jumladan, Internet-do‘kondagi ma’lumotlarni tanlash, tartibga solish,
					tartibga solish va o‘zgartirish huquqi, shuningdek, boshlang‘ich ma’lumotlar va
					materiallarga huquq), saytida chop etilgan materiallarning mazsunida alohida qayd etilgan
					hollar bundan mustasno.
				</p>
				<p style={{ marginBottom: '8px' }}>
					9.3. Xaridor, shuningdek, Internet-do‘kon veb-saytiga tashrif buyurgan har qanday shaxs
					Internet-do‘konning mazmunini qisman yoki to‘liq o‘zgartirish, nashr qilish, uchinchi
					shaxslarga topshirish, sotish yoki tasarrufdan chiqarishda ishtirok etish, hosila
					mahsulotlarini yaratish yoki boshqacha tarzda foydalanishga haqli emas. Internet-do‘kon
					bilan kelishmasdan turib Internet-do‘kon mazmunini tashkil etuvchi ma’lumotlarni tashkil
					etish, to‘plash, kompilyatsiya qilish, magnitli tarjima qilish, raqamli o‘zgartirish va
					materiallardan foydalanish bilan bog‘liq boshqa harakatlar, shuningdek, ularni to‘liq yoki
					qisman nusxalash, qayta tarqatish, foydalanish yoki nashr etish taqiqlanadi.
				</p>
				<p style={{ marginBottom: '8px' }}>
					9.4. Xaridor, shuningdek, Internet-do‘kon veb-saytiga tashrif buyurgan har qanday shaxs,
					quyidagi turdagi materiallarni Internet-do‘kon sahifalariga joylashtirmaslik yoki
					Internet-do‘kon orqali jo‘natmaslik majburiyatini oladi:
				</p>
				<p style={{ marginBottom: '8px' }}>
					9.4.1. qonunchilikni buzuvchi, tahdid va haqoratlarni o‘z ichiga oluvchi, boshqa
					shaxslarning obro‘sini to‘kuvchi;
				</p>
				<p style={{ marginBottom: '8px' }}>
					9.4.2. fuqarolarning shaxsiy hayotiga yoki jamoat tartibiga daxl qiluvchi, odobsizlik
					tusiga ega;
				</p>
				<p style={{ marginBottom: '8px' }}>
					9.4.3. boshqa shaxslarning sha’ni va qadr-qimmatini, huquq va qonun bilan qo‘riqlanadigan
					manfaatlarini u yoki bu darajada buzuvchi;
				</p>
				<p style={{ marginBottom: '8px' }}>
					9.4.4. diniy, irqiy yoki etnik adovatni qo‘zg‘atishga qaratilgan yoki shunday
					chaqiriqlarni o‘z ichiga olgan, adovatni qo‘zg‘atishga urinishlar yoki zo‘ravonlikka
					da’vatlarni o‘z ichiga olgan chaqiriqlarni;
				</p>
				<p style={{ marginBottom: '8px' }}>
					9.4.5. shuningdek, boshqa shaxslarni qonung zid harakatlarga undovchi, jinoiy, fuqarolik
					yoki boshqa javobgarlikka olib keluvchi yoki biron tarzda qonunchilik qoidalarini
					buzuvchi, har qanday tovar va/yoki xizmatni reklamasi bo‘lgan, har qanday tovar va/yoki
					xizmatni reklama qiluvchi yoki sotishni boshqa usulda rag‘batlantiruvchi, jumladan, lekin
					ular bilan cheklanmagan holda, oldindan yozma rozilik olmasdan, interfaol xizmat
					ko‘rsatishning boshqa tizimiga obuna bo‘lishni rag‘batlantiruvchi.
				</p>
				<p style={{ marginBottom: '8px' }}>
					9.4.6. Xaridor, shuningdek, Internet-do‘kon veb-saytiga tashrif buyurgan har qanday shaxs
					intellektual mulk to‘g‘risidagi qonunchilik bilan himoyalangan har qanday materiallarni
					(jumladan, mualliflik huquqi, tova belgilari to‘g‘risidagi qonunchilik), shuningdek,
					qonunchilik bilan himoyalangan boshqa materiallarni himoyalangan huquq egasining yaqqol
					roziligini olmadan turib yuklamaslik, joylashtirmaslik yoki internet-do‘kon sahifalarida
					boshqacha tarzda foydalanmaslik majburiyatini oladi. Shu bilan birga, Xaridor tomonidan
					internet-do‘kon veb-saytida joylashtirilgan materiallarni uchinchi shaxslarning mualliflik
					huquqi, turdosh va boshqa huquqlarini buzmasligini isbotlash yuki Xaridor zimmasiga
					tushadi.
				</p>
			</section>

			<section style={{ marginBottom: '16px' }}>
				<h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
					10. TARAFLARNING MAJBURIYATLARI
				</h3>
				<p style={{ marginBottom: '8px' }}>
					10.1. Internet-do‘kon quyidagi majburiyatlarni zimmasiga oladi:
				</p>
				<p style={{ marginBottom: '8px' }}>
					10.1.1. Ushbu Oferta shartnomasiga muvofiq buyurtmaning qabul qilinishi, to‘lovning qabul
					qilinishi va yetkazib berilishini ta’minlash;
				</p>
				<p style={{ marginBottom: '8px' }}>
					10.1.2. Tovarlarni, shuningdek, zarur qo‘shimcha anjomlarni xaridor bilan kelishilgan
					miqdor va assortimentda buyurtmada ko‘rsatilgan manzilga yetkazib berish;
				</p>
				<p style={{ marginBottom: '8px' }}>
					10.1.3. Taraflar tomonidan kelishilgan ushbu Shartnoma bo‘yicha xizmatlar ko‘rsatish
					tartibi bo‘yicha xaridorning ko‘rsatmalarini bajarish;
				</p>
				<p style={{ marginBottom: '8px' }}>
					10.1.4. O‘zbekiston Respublikasining amaldagi qonunchiligida nazarda tutilgan hollardan
					mustasno, xaridor ma’lumotlarining maxfiyligini ta’minlash;
				</p>
				<p style={{ marginBottom: '8px' }}>
					10.1.5. Sifatli xizmatlarni taqdim etish. Ko‘rsatilayotgan xizmatlar sifati buzilishining
					oldini olish va tartibga solish bo‘yicha o‘z vaqtida choralar ko‘rish. Ushbu shartnoma
					bo‘yicha ko‘rsatiladigan xizmatlar tarkibidagi o‘zgarishlar va ularni ko‘rsatish shartlari
					to‘g‘risida Xaridorni darhol xabardor qilish.
				</p>
				<p style={{ marginBottom: '8px' }}>10.2. Internet-do‘kon quyidagilarga haqli:</p>
				<p style={{ marginBottom: '8px' }}>
					10.2.1. Xizmatlar ko‘rsatish uchun xaridor oldida javobgar bo‘lgani holda Xaridorga
					xizmatlar ko‘rsatish uchun uchinchi shaxslarni jalb qilish;
				</p>
				<p style={{ marginBottom: '8px' }}>
					10.2.2. Xaridor ushbu Shartnoma bo‘yicha o‘z majburiyatlarini bajarmagan taqdirda
					Tovarlarni topshirishdan va/yoki Xizmatlarni ko‘rsatishdan bosh tortish;
				</p>
				<p style={{ marginBottom: '8px' }}>
					10.2.3. Xizmatlarni ko‘rsatish chog‘ida yuzaga keladigan masalalar bo‘yicha
					tushuntirishlar va qo‘shimcha axborot olish;
				</p>
				<p style={{ marginBottom: '8px' }}>
					10.2.4. Xaridor tomonidan 6.2-bandda nazarda tutilgan (xizmatlarni o‘z vaqtida to‘lash
					to‘g‘risida) majburiyatlar bajarilmagan taqdirda, ushbu shartnomani bir tomonlama bekor
					qilish;
				</p>
				<p style={{ marginBottom: '8px' }}>
					10.2.5. Ushbu Ofertani bajarish bo‘yicha vakolatlarni Xaridorning avvaldan
					ogohlantirmasdan va u bilan ushbu harakatni kelishmasdan uchinchi shaxslarga o‘tkazish.
				</p>
				<p style={{ marginBottom: '8px' }}>10.3. Xaridor quyidagilarni zimmasiga oladi:</p>
				<p style={{ marginBottom: '8px' }}>
					10.3.1. Ushbu Oferta shartlariga muvofiq, Oferta shartnomasi bo‘yicha Internet-do‘kon
					xizmatlari uchun o‘z vaqtida haq to‘lash;
				</p>
				<p style={{ marginBottom: '8px' }}>
					10.3.2. Ushbu Ofertada bayon etilgan barcha talablarni bajarish, xizmatlarni taqdim
					etishda yuzaga keladigan savollarga javob berish va zarur ma’lumotlarni taqdim etish.
				</p>
				<p style={{ marginBottom: '8px' }}>10.4. Xaridor quyidagilarga haqli:</p>
				<p style={{ marginBottom: '8px' }}>
					10.4.1. Ushbu Oferta shartlariga muvofiq tovar va/yoki xizmatni olish;
				</p>
				<p style={{ marginBottom: '8px' }}>
					10.4.2. Internet-do‘kon faoliyati va u taqdim etayotgan xizmatlar to‘g‘risida zarur va
					haqqoniy ma’lumotlarni olish;
				</p>
				<p style={{ marginBottom: '8px' }}>
					10.4.3. Xaridor Internet-do‘konga o‘z fikrlari, takliflari va tavsiyalarini yuborish
					huquqiga ega;
				</p>
				<p style={{ marginBottom: '8px' }}>
					10.4.4. Istalgan vaqtda, Internet-do‘konning xo‘jalik faoliyatiga aralashmasdan, ushbu
					Shartnomaning bajarilish jarayonini tekshirish.
				</p>
			</section>

			<section style={{ marginBottom: '16px' }}>
				<h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
					11. TARAFLARNING JAVOBGARLIGI
				</h3>
				<p style={{ marginBottom: '8px' }}>
					11.1. Xaridor yoki uning vakili bo‘lgan shaxslar ushbu shartnoma bo‘yicha o‘z
					majburiyatlarini lozim darajada bajarmagan yoki internet-do‘kon xodimlarining talablarini
					buzgan taqdirda Xaridorning faoliyatiga yetkazilgan ziyon uchun Internet-do‘kon javobgar
					bo‘lmaydi.
				</p>
				<p style={{ marginBottom: '8px' }}>
					11.2. Oferta shartnomasi bo‘yicha Internet-do‘kon xizmatlari uchun to‘lovni amalga
					oshirgan holda, Xaridor ushbu Shartnoma shartlariga, ushbu Shartnomaning amal qilish
					muddati davomida va amal qilish muddatidan keyin ham Internet-do‘kondan yetkazilgan
					ma’naviy, moddiy zarar yoki Xaridorga yetkazilgan ziyon uchun kompensatsiyani talab
					qilishga haqli bo‘lmasligiga rozi bo‘ladi, ushbu qonunchilikda to‘g‘ridan-to‘g‘ri nazarda
					tutilgan hollar bundan mustasno.
				</p>
				<p style={{ marginBottom: '8px' }}>
					11.3. Internet-do‘kon hech bir holatda Oferta shartnomasi bo‘yicha quyidagilar uchun
					javobgarlikni zimmasiga olmaydi:
				</p>
				<p style={{ marginBottom: '8px' }}>
					a) Internet-do‘kon tomonidan jalb etilmagan har qanday uchinchi shaxslarning
					harakatlari/harakatsizligining bevosita yoki bilvosita natijasi bo‘lgan har qanday
					harakatlar va/yoki harakatsizlik;
				</p>
				<p style={{ marginBottom: '8px' }}>
					b) Internet-do‘kon bunday yo‘qotishlar ehtimolini oldindan ko‘ra olgani yoki yo‘qligidan
					qat’i nazar, xaridor va/yoki uchinchi shaxslarning bilvosita yo‘qotishlari va/yoki qo‘ldan
					chiqarilgan foydalari.
				</p>
				<p style={{ marginBottom: '8px' }}>
					11.4. Oferta shartnomasi, uni tuzish va rasmiylashtirish O‘zbekiston Respublikasining
					amaldagi qonunchiligiga muvofiq tartibga solinadi.
				</p>
				<p style={{ marginBottom: '8px' }}>
					11.5. Taraflardan birining Shartnomani lozim darajada bajarmagani oqibatila ikkinchi Taraf
					uchun salbiy oqibatlar yuzaga kelganda, O‘zbekiston Respublikasining amaldagi
					qonunchiligiga muvofiq javobgarlik yuzaga keladi.
				</p>
				<p style={{ marginBottom: '8px' }}>
					11.6. CLICK hech qanday nizolar uchun javobgarlikni o&apos;z zimmasiga olmaydi va CLICK
					operatorlari ularni hal qilishda ishtirok etish majburiyatiga ega emas. Shuningdek, CLICK
					yetkazib beruvchi tomonidan taqdim etiladigan xizmatlarning sifati uchun javobgar emas.
				</p>
			</section>

			<section style={{ marginBottom: '16px' }}>
				<h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>12. MAXFIYLIK</h3>
				<p style={{ marginBottom: '8px' }}>
					12.1. Taraflar bir-birining o‘zaro roziligisiz Taraflardan istalgan birining tijorat
					sirini tashkil etuvchi tashkiliy-texnologik, tijorat, moliyaviy va boshqa axborotni,
					basharti bu axborot uchinchi shaxslarga noma’lumligi sababli haqiqiy yoki ehtimoliy
					tijorat qiymatiga ega bo‘lsa, uchinchi shaxslarga bermaslik yoki shartnoma shartlarida
					nazarda tutilmagan boshqa usulda foydalanmaslik majburiyatini oladilar.
				</p>
				<p style={{ marginBottom: '8px' }}>
					12.2. Maxfiy axborotni himoya qilish muddati Taraflar tomonidan Oferta shartnomasining
					amal qilish muddati tugagan kundan boshlab kamida bir yil etib belgilanadi.
				</p>
			</section>

			<section style={{ marginBottom: '16px' }}>
				<h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
					13. BOSHQA SHARTLAR
				</h3>
				<p style={{ marginBottom: '8px' }}>
					13.1. Oferta shartnomasi bo‘yicha har qanday bildirishnomalar bir Taraf tomonidan ikkinchi
					Tarafga quyidagicha yuborilishi mumkin: xabarni oluvchi Xaridor bo‘lsa, ushbu Ofertaning
					oxirida ko‘rsatilgan, xizmatlarga buyurtma berishda ko‘rsatilgan xaridorning elektron
					pochta manziliga elektron pochta orqali; Xaridorning murojaat chog‘ida ko‘rsatgan elektron
					pochta manzilidan ushbu Ofertaning oxirida ko‘rsatilgan Internet-do‘konning ko‘rsatilgan
					elektron pochta manziliga.
				</p>
				<p style={{ marginBottom: '8px' }}>
					13.2. Oferta shartnomasi Internet-do‘kon va Xaridor o‘rtasidagi to‘liq shartlashuvni
					ifodalaydi. Internet-do‘kon Oferta shartnomasining bajarilishini tartibga soluvchi
					Ofertada ko‘rsatilgan shartlardan tashqari Oferta mazmuniga nisbatan hech qanday shart va
					majburiyatlarni zimmasiga olmaydi, bunday shartlar yoki majburiyatlar yozma shaklda qayd
					etilib, Internet-do‘kon va Xaridorning vakolatli vakillari tomonidan imzolanmagan holat
					bundan mustasno. Oferta shartnomasiga ilovalar yoki qo‘shimcha kelishuvlarning biron
					shartlari Oferta shartlariga zid kelsa, Oferta qoidalari ustunlik qiladi.
				</p>
			</section>
			<section style={{ marginBottom: '16px' }}>
				<h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
					14. TARAFLARNING MANZILLARI VA BANK REKVIZITLARI
				</h3>
				<p style={{ marginBottom: '8px' }}>
					&quot;{props.name}&quot; MCHJ
					<br />
					Manzil: {props.address}
					<br />
					Телефон: {props.phone}
					<br />
					INN: {props.tin_or_pinfl}
					<br />
					MFO: {props.mfo}
					<br />
					X/r: {props.bank_account}
				</p>
			</section>
		</div>
	)
}
