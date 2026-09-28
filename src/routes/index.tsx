import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowDown, ChevronLeft, ChevronRight, Flame, Flower2, Heart, MailOpen, MapPin, Menu, Music2, Pause, Sparkles, Sun, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/rajasthan-wedding.jpg";
import detailImage from "@/assets/wedding-details.jpg";
import mehndiImage from "@/assets/wedding-mehndi.jpg";
import mandapImage from "@/assets/wedding-mandap.jpg";
import ganeshImage from "@/assets/ganesh-lineart.png";

const description = "खुशबू एवं शेखर के शुभ विवाह में सादर आमंत्रित हैं। 21 नवंबर 2026, श्रीमाधोपुर, सीकर, राजस्थान।";
export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "खुशबू एवं शेखर | शुभ विवाह निमंत्रण" },
    { name: "description", content: description },
    { property: "og:title", content: "खुशबू एवं शेखर | शुभ विवाह निमंत्रण" },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: WeddingInvitation,
});

const nav = [["मुख्य पृष्ठ", "home"], ["निमंत्रण", "invitation"], ["कार्यक्रम", "events"], ["यादें", "gallery"], ["विवाह स्थल", "venue"], ["आशीर्वाद", "blessings"]] as const;
const events = [
  { date: "11 नवंबर", name: "पीले चावल", icon: Flower2, description: "श्री गणेश जी की प्रार्थना" },
  { date: "16 नवंबर", name: "लगन टीका", icon: Sparkles, description: "शुभ परंपरा का उत्सव" },
  { date: "18 नवंबर", name: "हल्दी", icon: Sun, description: "स्नेह और खुशियों के रंग" },
  { date: "20 नवंबर", name: "मेहंदी", icon: Flower2, description: "हथेलियों पर सजे प्यार के रंग" },
  { date: "20 नवंबर — शाम", name: "संगीत", icon: Music2, description: "सुरों और उल्लास की शाम" },
  { date: "21 नवंबर", name: "शुभ विवाह", icon: Flame, description: "मंगल मिलन का शुभ दिन", featured: true },
];
// These images are illustrative placeholders, not photos of the couple or their family.
const gallery = [
  { category: "खुशबू", image: detailImage, alt: "विवाह के आभूषण और फूलों का सांकेतिक चित्र" },
  { category: "शेखर", image: heroImage, alt: "राजस्थानी विवाह स्थल का सांकेतिक चित्र" },
  { category: "परिवार", image: mandapImage, alt: "फूलों से सजे मंडप का सांकेतिक चित्र" },
  { category: "खूबसूरत पल", image: mehndiImage, alt: "मेहंदी और फूलों का सांकेतिक चित्र" },
  { category: "समारोह", image: mandapImage, alt: "विवाह मंडप का सांकेतिक चित्र" },
];

// Destination extracted from the supplied venue QR code; opens in the current tab.
const VENUE_MAP_URL = "https://maps.app.goo.gl/XcWKjjC2gxaQpCyb6";

// Clearly-marked sample blessings — replace these with real wishes when available.
const SAMPLE_WISHES = [
  "आप दोनों का जीवन प्रेम, आनंद और सुंदर यादों से भरा रहे।",
  "आपकी जीवन यात्रा में सदा हँसी, स्नेह और आशीर्वाद बना रहे।",
];

function Ornament({ light = false }: { light?: boolean }) {
  return <div className={`ornament ${light ? "ornament-light" : ""}`} aria-hidden="true"><span />✦<span /></div>;
}

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return <motion.div className={className} initial={reduce ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.7, ease: "easeOut" }}>{children}</motion.div>;
}

function SectionHeading({ eyebrow, title, light = false }: { eyebrow: string; title: string; light?: boolean }) {
  return <Reveal className="text-center"><p className={`eyebrow ${light ? "text-gold-light" : "text-terracotta"}`}>{eyebrow}</p><h2 className={`display-heading mt-4 ${light ? "text-ivory" : "text-primary"}`}>{title}</h2><Ornament light={light} /></Reveal>;
}

function Countdown() {
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => {
    const update = () => setRemaining(Math.max(0, new Date("2026-11-21T00:00:00+05:30").getTime() - Date.now()));
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, []);
  const duration = remaining ?? 0;
  const parts = [
    [Math.floor(duration / 86400000), "दिन"],
    [Math.floor(duration / 3600000) % 24, "घंटे"],
    [Math.floor(duration / 60000) % 60, "मिनट"],
    [Math.floor(duration / 1000) % 60, "सेकंड"],
  ] as const;
  return <div className="countdown" aria-label="विवाह तक शेष समय" aria-live="off">{parts.map(([value, label]) => <div key={label} className="countdown-cell"><span className="countdown-number">{remaining === null ? "--" : String(value).padStart(2, "0")}</span><span className="countdown-label">{label}</span></div>)}</div>;
}

// The exact venue QR code must live at public/images/location-qr.png, unmodified.
// Once the file is present it is shown automatically; a placeholder appears until then.
function VenueQr() {
  const [missing, setMissing] = useState(false);
  if (missing) return <div className="venue-qr-placeholder" aria-hidden="true"><span>✦</span><p>स्थान का क्यूआर कोड शीघ्र उपलब्ध होगा</p></div>;
  return <img src="/images/location-qr.png" alt="विवाह स्थल का क्यूआर कोड" width={512} height={512} onError={() => setMissing(true)} />;
}

// Gentle floating petals for the blessings section (skipped when reduced motion is set).
const PETALS = [
  { left: "6%", delay: 0, duration: 13, size: 12 },
  { left: "18%", delay: 3, duration: 15, size: 9 },
  { left: "34%", delay: 1.6, duration: 12, size: 11 },
  { left: "55%", delay: 4.5, duration: 14, size: 9 },
  { left: "70%", delay: 2.2, duration: 16, size: 12 },
  { left: "86%", delay: 0.8, duration: 13, size: 10 },
  { left: "94%", delay: 5.2, duration: 15, size: 8 },
];

function BlessingsPetals() {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return <div className="blessings-petals" aria-hidden="true">{PETALS.map((petal, i) => (
    <motion.span key={i} className="blessing-petal" style={{ left: petal.left, width: petal.size, height: petal.size * 1.35 }}
      initial={{ y: "-30px", opacity: 0, rotate: 0 }}
      animate={{ y: ["-30px", "30vh", "58vh", "85vh"], x: [0, 12, -8, 0], opacity: [0, .5, .5, 0], rotate: [0, 60, -30, 45] }}
      transition={{ duration: petal.duration, delay: petal.delay, repeat: Infinity, ease: "easeIn" }} />
  ))}</div>;
}

function WeddingInvitation() {
  const [opened, setOpened] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [blessingSent, setBlessingSent] = useState(false);
  const [wishes, setWishes] = useState<{ name: string; message: string }[]>([]);
  const [playing, setPlaying] = useState(false);
  const [musicError, setMusicError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const reduce = useReducedMotion();
  const activePhoto = selectedPhoto === null ? null : gallery[selectedPhoto];

  useEffect(() => { document.body.style.overflow = opened && selectedPhoto === null ? "" : "hidden"; return () => { document.body.style.overflow = ""; }; }, [opened, selectedPhoto]);
  useEffect(() => {
    if (selectedPhoto === null) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSelectedPhoto(null);
      if (e.key === "ArrowRight") setSelectedPhoto(i => i === null ? null : (i + 1) % gallery.length);
      if (e.key === "ArrowLeft") setSelectedPhoto(i => i === null ? null : (i + gallery.length - 1) % gallery.length);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedPhoto]);

  function openInvitation() {
    setOpened(true);
    window.scrollTo({ top: 0, behavior: "instant" });
    const audio = audioRef.current;
    if (audio) {
      void audio.play().then(() => { setPlaying(true); setMusicError(false); }).catch(() => { setPlaying(false); setMusicError(true); });
    }
  }
  function handleBlessing(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();
    if (!name || message.length < 2) return;
    setWishes(current => [{ name, message }, ...current]);
    setBlessingSent(true);
  }
  async function toggleMusic() {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); return; }
    try { await audioRef.current.play(); setMusicError(false); setPlaying(true); }
    catch { setMusicError(true); setPlaying(false); }
  }

  return <>
    <AnimatePresence>
      {!opened && <motion.div className="opening-screen" initial={false} exit={{ opacity: 0, y: -35, transition: { duration: reduce ? 0 : 0.75 } }}>
         <img src={heroImage} alt="" className="opening-image" aria-hidden="true" />
         <motion.div className="opening-shade" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }} />
        <BlessingsPetals />
         <motion.div className="opening-border" aria-hidden="true" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5, delay: 0.2 }} />
         {(["tl", "tr", "bl", "br"] as const).map((corner, index) => <motion.span key={corner} className={`opening-ornament opening-ornament-${corner}`} aria-hidden="true" initial={reduce ? false : { opacity: 0, scale: 0.7 }} animate={{ opacity: 0.45, scale: 1 }} transition={{ duration: 1.1, delay: 0.4 + index * 0.12 }}>❁</motion.span>)}
         <motion.p className="opening-topline" initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3 }}>परिवारजनों के आशीर्वाद से</motion.p>
         <div className="opening-content">
            <span className="opening-card-corner opening-card-corner-tl" aria-hidden="true">✥</span><span className="opening-card-corner opening-card-corner-tr" aria-hidden="true">✥</span><span className="opening-card-corner opening-card-corner-bl" aria-hidden="true">✥</span><span className="opening-card-corner opening-card-corner-br" aria-hidden="true">✥</span>
            <motion.div className="opening-ganesh" initial={reduce ? false : { opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.35, ease: "easeOut" }}>
             <img src={ganeshImage} alt="श्री गणेश जी" width={72} height={86} />
           </motion.div>
            <motion.p className="opening-prayer" initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.85 }}>॥ श्री गणेशाय नमः ॥</motion.p>
            <motion.p className="hindi-title" initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 1.3 }}>शुभ विवाह</motion.p>
             <motion.p className="opening-ceremony" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1.75 }}>शुभ विवाह समारोह</motion.p>
            <h1 className="opening-names"><motion.span initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, delay: 1.9 }}>खुशबू</motion.span><motion.em initial={reduce ? false : { opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.75, delay: 2.4 }}>♡</motion.em><motion.span initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, delay: 2.85 }}>शेखर</motion.span></h1>
            <motion.div initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 3.35 }}>
             <div className="card-divider" />
               <p className="card-date">21 नवंबर 2026</p>
             <p className="card-place">श्रीमाधोपुर, सीकर, राजस्थान</p>
           </motion.div>
            <motion.div initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 3.9, duration: 0.85 }}>
              <Button onClick={openInvitation} className="invitation-open-btn"><MailOpen size={17} aria-hidden="true" /> निमंत्रण खोलें <span aria-hidden="true">→</span></Button>
           </motion.div>
         </div>
          <motion.p className="opening-bottomline" initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 4.1 }}>प्रेम, स्नेह और साथ के इस शुभ अवसर पर आपका स्वागत है</motion.p>
      </motion.div>}
    </AnimatePresence>

    <div className="site-shell" inert={!opened} aria-hidden={!opened}>
      <header className="site-header">
        <a href="#home" className="brand" onClick={() => setMenuOpen(false)}>खुशबू <span>✦</span> शेखर</a>
        <nav className={`site-nav ${menuOpen ? "site-nav-open" : ""}`} aria-label="मुख्य नेविगेशन">{nav.map(([label, id]) => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>{label}</a>)}</nav>
        <Button variant="ghost" size="icon" className="mobile-menu" aria-label={menuOpen ? "मेनू बंद करें" : "मेनू खोलें"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</Button>
      </header>

      <main>
        <section id="home" className="hero-section">
           <img src={heroImage} alt="विवाह के लिए सजा राजस्थानी हवेली का सांकेतिक दृश्य" className="hero-image" width={1536} height={1024} />
           <div className="hero-shade" />
           <BlessingsPetals />
           <div className="hero-content">
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
               <p className="hero-overline">शुभ विवाह</p>
               <Ornament light />
               <h1 className="hero-title">खुशबू <span>एवं</span> शेखर</h1>
               <p className="hero-subtitle">दो दिल, एक रिश्ता और जीवन भर साथ निभाने का एक खूबसूरत वादा।</p>
               <div className="hero-details"><span>21 नवंबर 2026</span><span className="hero-dot">✦</span><span>श्रीमाधोपुर, सीकर, राजस्थान</span></div>
             </motion.div>
           </div>
           <a href="#invitation" className="hero-scroll" aria-label="निमंत्रण तक जाएं"><ArrowDown size={17} /></a>
         </section>

         <section id="invitation" className="invitation-section section-pad">
           <div className="corner-ornament corner-left" aria-hidden="true">✥</div><div className="corner-ornament corner-right" aria-hidden="true">✥</div>
           <div className="container-narrow"><SectionHeading eyebrow="॥ स्नेह सहित ॥" title="सादर आमंत्रण" /><Reveal><div className="invitation-copy"><p>ईश्वर की असीम कृपा और बड़ों के आशीर्वाद से<br />हमारे परिवार में एक शुभ अवसर आने वाला है।</p><p><em>खुशबू एवं शेखर</em><br />अपने जीवन की एक नई शुरुआत करने जा रहे हैं।</p><p>इस शुभ अवसर पर आपकी उपस्थिति,<br />स्नेह और आशीर्वाद हमारे लिए<br />सबसे अनमोल उपहार होंगे।</p><p>आप सपरिवार पधारकर<br />इस मंगल अवसर की शोभा बढ़ाएं।</p></div><p className="signature">सप्रेम आमंत्रण<br />समस्त तुंदवाल परिवार</p></Reveal></div>
         </section>

         <section className="countdown-band"><p className="eyebrow">शुभ मिलन में अब बस...</p><Countdown /><p className="countdown-note">हम आपके आगमन की प्रतीक्षा कर रहे हैं <Heart size={15} fill="currentColor" aria-hidden="true" /></p></section>

         <section id="events" className="events-section section-pad"><div className="container-wide"><SectionHeading eyebrow="शुभ अवसरों की श्रृंखला" title="विवाह के शुभ अवसर" /><div className="events-timeline">{events.map((event, index) => <Reveal key={event.name} className={`event-row ${index % 2 ? "event-row-right" : ""}`}><div className={`event-card ${event.featured ? "event-featured" : ""}`}><div className="event-top"><span className="event-date">{event.date}</span><span className="event-symbol" aria-hidden="true"><event.icon size={26} strokeWidth={1.4} /></span></div><h3>{event.name}</h3><p className="event-description">{event.description}</p></div><span className="timeline-node" aria-hidden="true" /></Reveal>)}</div></div></section>

         <section className="journey-section section-pad"><div className="container-wide"><SectionHeading eyebrow="॥ मंगल शुरुआत ॥" title="एक नई शुरुआत" light /><div className="journey-steps">{["दो परिवार", "दो दिल", "एक रिश्ता", "एक खूबसूरत नई शुरुआत"].map((step, i) => <Reveal key={step} className="journey-step"><span className="journey-index">0{i + 1}</span><span className="journey-icon" aria-hidden="true">{["✥", "♡", "✦", "∞"][i]}</span><h3>{step}</h3></Reveal>)}</div><Reveal><p className="journey-names">खुशबू <Heart size={20} fill="currentColor" aria-hidden="true" /> शेखर</p></Reveal></div></section>

         <section id="gallery" className="gallery-section section-pad"><div className="container-wide"><SectionHeading eyebrow="यादों की झलक" title="कुछ खूबसूरत यादें" /><p className="section-lead">इन खूबसूरत पलों को हमारे साथ महसूस कीजिए।</p><p className="gallery-disclaimer">ये चित्र सांकेतिक हैं; वास्तविक तस्वीरें बाद में जोड़ी जाएंगी।</p><div className="gallery-grid">{gallery.map((photo, index) => <motion.div key={photo.category} className={`gallery-item gallery-item-${index}`} {...(reduce ? {} : { whileHover: { scale: 1.015 } })} transition={{ duration: 0.3 }}><Button variant="ghost" aria-label={`${photo.category} का चित्र देखें`} onClick={() => setSelectedPhoto(index)} className="gallery-button"><img src={photo.image} alt={photo.alt} loading="lazy" width={1024} height={1280} /><span className="gallery-caption"><span>{photo.category}</span><span className="gallery-arrow">↗</span></span></Button></motion.div>)}</div></div></section>

        <section id="venue" className="venue-section section-pad"><div className="container-wide"><SectionHeading eyebrow="मंगल मिलन का स्थान" title="विवाह स्थल" /><p className="section-lead">श्रीमाधोपुर, सीकर, राजस्थान में आपका स्वागत है।</p><Reveal><div className="venue-frame"><span className="venue-corner venue-corner-tl" aria-hidden="true">✥</span><span className="venue-corner venue-corner-tr" aria-hidden="true">✥</span><span className="venue-corner venue-corner-bl" aria-hidden="true">✥</span><span className="venue-corner venue-corner-br" aria-hidden="true">✥</span><div className="venue-layout"><div className="venue-info"><div className="venue-location-card"><motion.span className="venue-pin" aria-hidden="true" animate={reduce ? { y: 0 } : { y: [0, -5, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}><MapPin size={27} strokeWidth={1.5} /></motion.span><div><h3>श्रीमाधोपुर</h3><p>सीकर, राजस्थान</p></div></div><p className="venue-note">सटीक स्थल का नाम और पता अभी उपलब्ध नहीं है।</p><div className="venue-floral" aria-hidden="true"><span />❁<span /></div></div><div className="venue-qr-column"><div className="venue-qr-card"><h3 className="venue-qr-title">स्थान के लिए स्कैन करें</h3><div className="venue-qr-frame"><VenueQr /></div><p className="venue-qr-caption">विवाह स्थल तक पहुंचने के लिए इस क्यूआर कोड को स्कैन करें।</p></div>{VENUE_MAP_URL.startsWith("http") ? <Button asChild className="solid-button"><a href={VENUE_MAP_URL}><MapPin size={16} /> स्थान देखें</a></Button> : <Button className="solid-button venue-directions" disabled>स्थान देखें <MapPin size={16} /></Button>}{!VENUE_MAP_URL.startsWith("http") && <p className="venue-directions-note">स्थान का लिंक उपलब्ध होने पर यहां दिखाई देगा।</p>}</div></div></div></Reveal></div></section>

        <section id="blessings" className="blessings-section section-pad"><BlessingsPetals /><div className="container-narrow"><SectionHeading eyebrow="मन से निकले शब्द" title="आपका आशीर्वाद" light /><p className="section-lead section-lead-light">आपके स्नेह और आशीर्वाद से यह शुभ अवसर और भी खास बन जाएगा।</p><div className="blessings-panel">{blessingSent ? <motion.div className="blessings-success" role="status" initial={{ opacity: 0, scale: .92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .5, ease: "easeOut" }}><motion.span className="success-heart" animate={reduce ? { scale: 1 } : { scale: [1, 1.18, 1] }} transition={{ duration: 1.4, repeat: Infinity, repeatDelay: .8, ease: "easeInOut" }}><Heart size={26} fill="currentColor" /></motion.span><h3>आपकी खूबसूरत शुभकामनाओं के लिए धन्यवाद।</h3><p>यह संदेश केवल इसी पृष्ठ पर दिख रहा है; इसे भेजा या सहेजा नहीं गया है।</p><Button variant="outline" className="outline-light" onClick={() => setBlessingSent(false)}>एक और आशीर्वाद लिखें</Button></motion.div> : <form className="blessings-form" onSubmit={handleBlessing}><label>आपका नाम<input name="name" type="text" placeholder="अपना नाम लिखें" required maxLength={100} /></label><label>अपना आशीर्वाद / शुभकामना लिखें<textarea name="message" rows={4} placeholder="मन की बात लिखें..." required minLength={2} maxLength={500} /></label><Button type="submit" className="blessings-submit">आशीर्वाद भेजें <Heart size={16} fill="currentColor" /></Button><p className="form-disclaimer">केवल नमूना — संदेश इसी पृष्ठ पर दिखाई देगा; भेजा या सहेजा नहीं जाएगा।</p></form>}</div><div className="blessings-grid">{SAMPLE_WISHES.map((message, i) => <Reveal key={`sample-${i}`} className="blessings-card"><p>“{message}”</p><small>नमूना शुभकामना</small></Reveal>)}{wishes.map((wish, i) => <Reveal key={`${wish.name}-${i}`} className="blessings-card"><p>“{wish.message}”</p><small>— {wish.name}</small></Reveal>)}</div><motion.p className="blessings-close" initial={reduce ? false : { opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>हमारे परिवार की ओर से स्नेह सहित <Heart size={20} fill="currentColor" aria-label="स्नेह" /></motion.p></div></section>

         <section className="closing-section"><div className="closing-inner"><span className="closing-flower" aria-hidden="true">✿</span><p className="eyebrow text-gold-light">॥ शुभ मंगल ॥</p><h2>आपकी उपस्थिति,<br />आपका स्नेह और आपका आशीर्वाद<br />हमारे लिए सबसे बड़ा उपहार है।</h2><Ornament light /><p className="closing-names">खुशबू <em>♡</em> शेखर</p><p className="closing-date">21 नवंबर 2026</p><p className="closing-place">श्रीमाधोपुर, सीकर, राजस्थान</p><p className="closing-invite">आप सादर आमंत्रित हैं।</p><span className="closing-flower closing-flower-bottom" aria-hidden="true">✿</span></div></section>
      </main>
      <footer><span>खुशबू एवं शेखर के शुभ विवाह के लिए सप्रेम निमंत्रण <Heart size={13} fill="currentColor" aria-label="स्नेह" /></span><span>॥ शुभ विवाह ॥</span></footer>
      <audio ref={audioRef} src="/music/AUD-20260928-WA0013.mp3" loop preload="none" onEnded={() => setPlaying(false)} onError={() => { setPlaying(false); setMusicError(true); }} />
       <div className="music-control"><Button className="music-button" onClick={toggleMusic} aria-label={playing ? "संगीत रोकें" : "संगीत चलाएं"} aria-pressed={playing} title={playing ? "संगीत रोकें" : "संगीत चलाएं"}>{playing ? <Pause size={19} aria-hidden="true" /> : <Music2 size={19} aria-hidden="true" />}<span>{playing ? "रोकें" : "संगीत"}</span></Button>{musicError && <span role="status" className="music-error">संगीत उपलब्ध नहीं है</span>}</div>
      <AnimatePresence>{selectedPhoto !== null && activePhoto && <motion.div className="lightbox" role="dialog" aria-modal="true" aria-label={`${activePhoto.category} का चित्र`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedPhoto(null)}><Button size="icon" variant="ghost" className="lightbox-close" aria-label="चित्र बंद करें" onClick={() => setSelectedPhoto(null)}><X /></Button><Button size="icon" variant="ghost" className="lightbox-prev" aria-label="पिछला चित्र" onClick={e => { e.stopPropagation(); setSelectedPhoto((selectedPhoto + gallery.length - 1) % gallery.length); }}><ChevronLeft /></Button><img src={activePhoto.image} alt={activePhoto.alt} onClick={e => e.stopPropagation()} /><Button size="icon" variant="ghost" className="lightbox-next" aria-label="अगला चित्र" onClick={e => { e.stopPropagation(); setSelectedPhoto((selectedPhoto + 1) % gallery.length); }}><ChevronRight /></Button><p>{activePhoto.category} · सांकेतिक चित्र</p></motion.div>}</AnimatePresence>
    </div>
  </>;
}
