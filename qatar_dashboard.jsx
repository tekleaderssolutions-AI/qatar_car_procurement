import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area, RadialBarChart,
  RadialBar, Legend, ScatterChart, Scatter
} from "recharts";

// ─── SAMPLE DATA ──────────────────────────────────────────────
const marketTrendData = [
  { month: "Jan", transactions: 420, avgPrice: 138000, oil: 81 },
  { month: "Feb", transactions: 390, avgPrice: 135000, oil: 79 },
  { month: "Mar", transactions: 450, avgPrice: 141000, oil: 82 },
  { month: "Apr", transactions: 480, avgPrice: 144000, oil: 85 },
  { month: "May", transactions: 510, avgPrice: 147000, oil: 87 },
  { month: "Jun", transactions: 310, avgPrice: 128000, oil: 83 },
  { month: "Jul", transactions: 280, avgPrice: 124000, oil: 80 },
  { month: "Aug", transactions: 260, avgPrice: 121000, oil: 78 },
  { month: "Sep", transactions: 430, avgPrice: 139000, oil: 84 },
  { month: "Oct", transactions: 520, avgPrice: 148000, oil: 88 },
  { month: "Nov", transactions: 580, avgPrice: 155000, oil: 91 },
  { month: "Dec", transactions: 610, avgPrice: 162000, oil: 93 },
];

const topModels = [
  { model: "Land Cruiser 300", days: 21, price: 285000, risk: "Healthy" },
  { model: "Lexus LX 600",     days: 35, price: 420000, risk: "Healthy" },
  { model: "Prado GXR",        days: 24, price: 168000, risk: "Healthy" },
  { model: "Nissan Patrol",    days: 30, price: 155000, risk: "Monitor" },
  { model: "Hilux SR5",        days: 28, price: 112000, risk: "Healthy" },
  { model: "Fortuner VXR",     days: 32, price: 135000, risk: "Monitor" },
  { model: "Lexus GX 550",     days: 38, price: 245000, risk: "Monitor" },
  { model: "Camry GLX",        days: 45, price: 78000,  risk: "At Risk" },
];

const inventoryData = [
  { id: 1, make:"Toyota", model:"Land Cruiser 300", year:2022, color:"White",  days:18,  price:285000, aiPrice:290000, risk:12,  riskLabel:"Healthy",  action:"Hold" },
  { id: 2, make:"Lexus",  model:"LX 600",           year:2023, color:"Black",  days:42,  price:415000, aiPrice:420000, risk:28,  riskLabel:"Healthy",  action:"Hold" },
  { id: 3, make:"Toyota", model:"Prado GXR",         year:2021, color:"White",  days:28,  price:165000, aiPrice:168000, risk:22,  riskLabel:"Healthy",  action:"Hold" },
  { id: 4, make:"Nissan", model:"Patrol LE",         year:2020, color:"Silver", days:95,  price:148000, aiPrice:138000, risk:58,  riskLabel:"At Risk",  action:"Drop 7%" },
  { id: 5, make:"Toyota", model:"Hilux SR5",         year:2022, color:"White",  days:25,  price:112000, aiPrice:115000, risk:18,  riskLabel:"Healthy",  action:"Hold" },
  { id: 6, make:"Toyota", model:"Camry GLX",         year:2020, color:"Red",    days:142, price:78000,  aiPrice:65000,  risk:82,  riskLabel:"Critical", action:"Drop 16%" },
  { id: 7, make:"Lexus",  model:"GX 550",            year:2022, color:"Silver", days:68,  price:242000, aiPrice:238000, risk:48,  riskLabel:"Monitor",  action:"Review" },
  { id: 8, make:"Toyota", model:"Fortuner VXR",      year:2021, color:"Blue",   days:88,  price:132000, aiPrice:118000, risk:72,  riskLabel:"At Risk",  action:"Drop 10%" },
  { id: 9, make:"Nissan", model:"Pathfinder",        year:2021, color:"White",  days:55,  price:125000, aiPrice:122000, risk:38,  riskLabel:"Monitor",  action:"Review" },
  { id:10, make:"Toyota", model:"Corolla XLI",       year:2019, color:"Beige",  days:198, price:58000,  aiPrice:44000,  risk:91,  riskLabel:"Critical", action:"Auction" },
];

const googleTrends = [
  { week: "W1", landCruiser: 72, patrol: 55, prado: 61, lexusLX: 60 },
  { week: "W2", landCruiser: 75, patrol: 52, prado: 63, lexusLX: 62 },
  { week: "W3", landCruiser: 78, patrol: 58, prado: 65, lexusLX: 65 },
  { week: "W4", landCruiser: 82, patrol: 60, prado: 68, lexusLX: 68 },
  { week: "W5", landCruiser: 85, patrol: 62, prado: 71, lexusLX: 70 },
  { week: "W6", landCruiser: 88, patrol: 65, prado: 74, lexusLX: 73 },
  { week: "W7", landCruiser: 91, patrol: 63, prado: 76, lexusLX: 75 },
  { week: "W8", landCruiser: 94, patrol: 68, prado: 79, lexusLX: 78 },
];

const buyers = [
  { name: "Ahmed Al-Thani",   nationality:"Qatari",  budget:280000, wants:"Land Cruiser 300 White", score:94, status:"Ready Now",   upgrade:"12 days" },
  { name: "Mohammed Al-Kuwari",nationality:"Qatari",  budget:420000, wants:"Lexus LX 600 Black",    score:88, status:"Ready Now",   upgrade:"8 days"  },
  { name: "Raj Kumar",        nationality:"Indian",   budget:155000, wants:"Prado GXR White",        score:91, status:"Ready Now",   upgrade:"21 days" },
  { name: "Sarah Johnson",    nationality:"British",  budget:95000,  wants:"Fortuner White",         score:76, status:"60 Days",     upgrade:"45 days" },
  { name: "Ali Hassan",       nationality:"Egyptian", budget:72000,  wants:"Camry GLX Silver",       score:82, status:"Ready Now",   upgrade:"5 days"  },
];

const chatHistory = [
  { role:"user", text:"What should I buy this month?" },
  { role:"ai",   text:"Buy now. Market health: 81/100 — strong.\n\n📦 Recommended procurement:\n• 8× Land Cruiser GXR 2022 White — demand rising 4 weeks, only 3 in stock\n• 5× Prado 2022 White — winter peak in 6 weeks\n• 3× Lexus LX 600 Black — National Day demand building\n\nBuy before Oct 15. Oil at $88, confidence at 78 — market is HOT." },
  { role:"user", text:"Why is my red Camry not selling?" },
  { role:"ai",   text:"Your red Camry has been in stock 142 days vs 21 days average for white cars.\n\n🔴 Root cause: Red cars sell 4.5× slower in Qatar. Heat reflection preference + resale value perception.\n\n⚡ Actions:\n1. Drop price 16% immediately (QAR 78K → QAR 65K)\n2. Move to Dubizzle for price-sensitive buyers\n3. Never order red stock again — data is clear." },
];

const competitorData = [
  { id:1,  dealer:"Al Mannai Auto",    model:"Land Cruiser 300", trim:"GXR",  year:2022, color:"White",  mileage:42000, price:292000, platform:"Dubizzle",   location:"Doha",        our_price:285000, days_listed:8  },
  { id:2,  dealer:"Qatar Motors",      model:"Land Cruiser 300", trim:"GXR",  year:2022, color:"White",  mileage:48000, price:278000, platform:"OpenSooq",   location:"Al Wakrah",   our_price:285000, days_listed:21 },
  { id:3,  dealer:"Gulf Auto",         model:"Land Cruiser 300", trim:"VXR",  year:2023, color:"Black",  mileage:22000, price:345000, platform:"Dubizzle",   location:"Doha",        our_price:338000, days_listed:5  },
  { id:4,  dealer:"Hamad Auto",        model:"Prado GXR",        trim:"GXR",  year:2021, color:"White",  mileage:61000, price:171000, platform:"WhatsApp",   location:"Al Khor",     our_price:165000, days_listed:14 },
  { id:5,  dealer:"Al Sadd Cars",      model:"Prado GXR",        trim:"GXR",  year:2021, color:"Silver", mileage:73000, price:158000, platform:"OpenSooq",   location:"Doha",        our_price:165000, days_listed:32 },
  { id:6,  dealer:"Premium Autos",     model:"Lexus LX 600",     trim:"F-Sport",year:2023,color:"Black", mileage:18000, price:435000, platform:"Dubizzle",   location:"The Pearl",   our_price:415000, days_listed:11 },
  { id:7,  dealer:"Royal Motors",      model:"Lexus LX 600",     trim:"Luxury",year:2022, color:"White",  mileage:35000, price:398000, platform:"Cars24",    location:"Doha",        our_price:415000, days_listed:18 },
  { id:8,  dealer:"Desert Cars",       model:"Nissan Patrol",    trim:"LE",   year:2020, color:"Silver", mileage:98000, price:143000, platform:"Dubizzle",   location:"Al Rayyan",   our_price:148000, days_listed:27 },
  { id:9,  dealer:"Qatar Auto Hub",    model:"Nissan Patrol",    trim:"SE",   year:2021, color:"White",  mileage:65000, price:162000, platform:"OpenSooq",   location:"Doha",        our_price:148000, days_listed:9  },
  { id:10, dealer:"Al Duhail Motors",  model:"Toyota Hilux",     trim:"SR5",  year:2022, color:"White",  mileage:55000, price:118000, platform:"WhatsApp",   location:"Al Duhail",   our_price:112000, days_listed:6  },
  { id:11, dealer:"Falcon Cars",       model:"Toyota Hilux",     trim:"SR5",  year:2021, color:"Silver", mileage:72000, price:105000, platform:"Dubizzle",   location:"Industrial",  our_price:112000, days_listed:41 },
  { id:12, dealer:"City Motors",       model:"Toyota Fortuner",  trim:"VXR",  year:2021, color:"White",  mileage:68000, price:128000, platform:"OpenSooq",   location:"Doha",        our_price:132000, days_listed:15 },
  { id:13, dealer:"Al Khor Auto",      model:"Toyota Fortuner",  trim:"VXR",  year:2020, color:"Blue",   mileage:91000, price:112000, platform:"Dubizzle",   location:"Al Khor",     our_price:132000, days_listed:58 },
  { id:14, dealer:"Prestige Auto",     model:"Lexus GX 550",     trim:"Luxury",year:2022,color:"Silver", mileage:44000, price:251000, platform:"Dubizzle",   location:"The Pearl",   our_price:242000, days_listed:22 },
  { id:15, dealer:"Pearl Motors",      model:"Land Cruiser 300", trim:"GX",   year:2021, color:"Beige",  mileage:82000, price:242000, platform:"Cars24",     location:"Doha",        our_price:285000, days_listed:67 },
];

const platformColors = { "Dubizzle":"#FF6B35", "OpenSooq":"#00A651", "WhatsApp":"#25D366", "Cars24":"#E63B2E" };
const riskColor = (label) => ({
  "Healthy":  "#22c55e",
  "Monitor":  "#f59e0b",
  "At Risk":  "#f97316",
  "Critical": "#ef4444",
}[label] || "#94a3b8");

const riskBg = (label) => ({
  "Healthy":  "rgba(34,197,94,0.12)",
  "Monitor":  "rgba(245,158,11,0.12)",
  "At Risk":  "rgba(249,115,22,0.12)",
  "Critical": "rgba(239,68,68,0.12)",
}[label] || "rgba(148,163,184,0.1)");

const fmt = (n) => "QAR " + n.toLocaleString();

// ─── MAIN APP ─────────────────────────────────────────────────
export default function QatarAIPlatform() {
  const [activeTab, setActiveTab] = useState("market");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState(chatHistory);
  const [pricingForm, setPricingForm] = useState({ make:"Toyota", model:"Land Cruiser", year:"2022", color:"White", mileage:45000, condition:"Excellent" });
  const [priceResult, setPriceResult] = useState(null);
  const [csvData, setCsvData] = useState(null);
  const [csvInsights, setCsvInsights] = useState(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvDragOver, setCsvDragOver] = useState(false);
  const [csvFilter, setCsvFilter] = useState("All");
  const [csvSort, setCsvSort] = useState("score");
  const [invFilter, setInvFilter] = useState("All");

  const tabs = [
    { id:"market",     label:"Market Hub",        icon:"📊" },
    { id:"inventory",  label:"Inventory Health",  icon:"🏪" },
    { id:"pricing",    label:"Pricing Tool",       icon:"💰" },
    { id:"competitor", label:"Competitor Prices",  icon:"⚔️" },
    { id:"trends",     label:"Trends",             icon:"📈" },
    { id:"buyers",     label:"Buyer Matcher",      icon:"🤝" },
    { id:"chat",       label:"AI Advisor",         icon:"🤖" },
  ];

  const [compFilter, setCompFilter] = useState("All");
  const [compSort, setCompSort]     = useState("gap");
  const [compSearch, setCompSearch] = useState("");

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setMessages(m => [...m, { role:"user", text: chatInput }]);
    setChatInput("");
    setTimeout(() => {
      setMessages(m => [...m, { role:"ai", text:"📊 Analyzing all 10 datasets...\n\nBased on current market data:\n• Market Health Score: 81/100 (Strong)\n• Oil Price: $88/barrel — HOT signal\n• Top restock: Land Cruiser 300 (demand rising 4 weeks)\n• 3 buyers ready to purchase now in your database\n\nRecommendation: List White SUVs immediately at full price. Winter peak starts in 6 weeks." }]);
    }, 1200);
  };

  const calcPrice = () => {
    setPriceResult({ recommended: 289000, low: 272000, high: 305000, confidence: 87, days: 24, transactions: 34 });
  };

  // ── CSV PARSING ──
  const parseCSV = (text) => {
    const lines = text.trim().split("\n");
    const headers = lines[0].split(",").map(h => h.trim().replace(/"/g,"").toLowerCase());
    return lines.slice(1).filter(l=>l.trim()).map(line => {
      const vals = line.split(",").map(v=>v.trim().replace(/"/g,""));
      const obj = {};
      headers.forEach((h,i) => obj[h] = vals[i] || "");
      return obj;
    });
  };

  // ── BUY/SELL SCORING ENGINE ──
  const analyzeCarRow = (car) => {
    const make     = (car.make || car.brand || "").toLowerCase();
    const model    = (car.model || "").toLowerCase();
    const color    = (car.color || car.colour || "").toLowerCase();
    const mileage  = parseInt(car.mileage || car.mileage_km || car.km || 0);
    const year     = parseInt(car.year || car.model_year || new Date().getFullYear());
    const price    = parseInt((car.price || car.asking_price || car.listed_price || "0").toString().replace(/[^0-9]/g,""));
    const accident = (car.accident || car.accident_history || "none").toLowerCase();
    const service  = (car.service || car.service_history || "full").toLowerCase();
    const age      = new Date().getFullYear() - year;

    let score = 70; // base
    const flags = [];
    const warnings = [];
    const positives = [];

    // ── COLOR RULE ──
    if (color.includes("white") || color.includes("pearl")) { score += 10; positives.push("White/Pearl — fastest selling color (+4-5% premium)"); }
    else if (color.includes("silver") || color.includes("grey") || color.includes("gray")) { score += 2; positives.push("Silver — neutral, market average demand"); }
    else if (color.includes("black")) { score += 2; positives.push("Black — market average demand"); }
    else if (color.includes("beige") || color.includes("bronze")) { score -= 8; warnings.push("Beige/Bronze — -5 to -7% price penalty, slower to sell"); }
    else if (color.includes("red") || color.includes("blue") || color.includes("green")) { score -= 20; flags.push("Red/Blue/Green — sells 4.5x SLOWER in Qatar. High stagnation risk."); }

    // ── MODEL DEMAND ──
    if (model.includes("land cruiser") || model.includes("lc")) { score += 15; positives.push("Land Cruiser — #1 demand model, avg 21 days to sell"); }
    else if (model.includes("prado")) { score += 12; positives.push("Prado — high demand, avg 24 days to sell"); }
    else if (model.includes("patrol")) { score += 8; positives.push("Nissan Patrol — strong demand, avg 30 days"); }
    else if (model.includes("hilux")) { score += 8; positives.push("Hilux — stable fleet/expat demand"); }
    else if (model.includes("lx") || model.includes("gx")) { score += 10; positives.push("Lexus LX/GX — luxury segment, high margin, rising demand"); }
    else if (model.includes("fortuner")) { score += 5; positives.push("Fortuner — family SUV, steady demand"); }
    else if (model.includes("camry") || model.includes("corolla")) { score -= 5; warnings.push("Sedan — lower demand vs SUVs in Qatar market"); }

    // ── AGE / YEAR ──
    if (age <= 2) { score += 10; positives.push(`${year} model — very recent, high buyer confidence`); }
    else if (age <= 4) { score += 5; positives.push(`${year} model — good age, within sweet spot`); }
    else if (age >= 7) { score -= 10; warnings.push(`${year} model — ${age} years old, depreciation accelerating`); }

    // ── MILEAGE ──
    const issuv = model.includes("land cruiser")||model.includes("prado")||model.includes("patrol")||model.includes("fortuner")||model.includes("lx")||model.includes("gx");
    const avgMileage = issuv ? 80000 : 70000;
    if (mileage < avgMileage * 0.5) { score += 8; positives.push(`Low mileage (${mileage.toLocaleString()} km) — well below average`); }
    else if (mileage > avgMileage * 1.5) { score -= 12; warnings.push(`High mileage (${mileage.toLocaleString()} km) — ${Math.round(mileage/10000)*1.8}% price deduction applies`); }
    else { positives.push(`Mileage OK (${mileage.toLocaleString()} km)`); }

    // ── ACCIDENT HISTORY ──
    if (accident.includes("none") || accident === "") { score += 5; positives.push("No accident history — clean record premium"); }
    else if (accident.includes("minor")) { score -= 8; warnings.push("Minor accident — -7 to -10% price adjustment"); }
    else if (accident.includes("moderate")) { score -= 18; flags.push("Moderate accident — -16 to -20% penalty. Verify repair quality."); }
    else if (accident.includes("major")) { score -= 30; flags.push("Major accident — -28 to -35% penalty. HIGH RISK. Avoid unless very low price."); }

    // ── SERVICE HISTORY ──
    if (service.includes("full") || service.includes("dealer")) { score += 6; positives.push("Full dealer service history — +5% price premium"); }
    else if (service.includes("partial")) { score -= 3; warnings.push("Partial service history — -2% adjustment"); }
    else if (service.includes("unknown") || service === "") { score -= 10; warnings.push("Unknown service history — -8 to -12% risk penalty"); }

    // ── MAKE ──
    if (make.includes("toyota") || make.includes("lexus")) { score += 5; positives.push("Toyota/Lexus brand — dominant Qatar market share (32%), strong resale"); }
    else if (make.includes("jetour") || make.includes("haval") || make.includes("geely") || make.includes("tank")) { score -= 8; warnings.push("Chinese brand — rising market share but resale value unproven in Qatar"); }

    score = Math.max(0, Math.min(100, score));

    // ── VERDICT ──
    let verdict, verdictColor, verdictBg, verdictIcon;
    if (score >= 80) { verdict = "STRONG BUY"; verdictColor = "#22c55e"; verdictBg = "rgba(34,197,94,0.15)"; verdictIcon = "🟢"; }
    else if (score >= 65) { verdict = "BUY"; verdictColor = "#84cc16"; verdictBg = "rgba(132,204,22,0.12)"; verdictIcon = "✅"; }
    else if (score >= 50) { verdict = "CONSIDER"; verdictColor = "#f59e0b"; verdictBg = "rgba(245,158,11,0.12)"; verdictIcon = "⚠️"; }
    else if (score >= 35) { verdict = "AVOID"; verdictColor = "#f97316"; verdictBg = "rgba(249,115,22,0.12)"; verdictIcon = "🔴"; }
    else { verdict = "DO NOT BUY"; verdictColor = "#ef4444"; verdictBg = "rgba(239,68,68,0.15)"; verdictIcon = "⛔"; }

    // ── ESTIMATED RESELL PRICE ──
    const basePrices = { "land cruiser":285000, "prado":168000, "patrol":155000, "hilux":112000, "lx":420000, "gx":245000, "fortuner":135000, "camry":78000, "corolla":62000 };
    let basePrice = 120000;
    Object.entries(basePrices).forEach(([k,v]) => { if(model.includes(k)) basePrice = v; });
    const ageFactor = Math.pow(0.88, age);
    const mileageFactor = mileage > avgMileage ? 1 - ((mileage - avgMileage)/10000) * (issuv?0.018:0.022) : 1;
    const colorFactor = color.includes("white")?1.04:color.includes("red")||color.includes("blue")?0.88:1;
    const estimatedResell = Math.round(basePrice * ageFactor * Math.max(0.5, mileageFactor) * colorFactor / 1000) * 1000;
    const profitPotential = price ? estimatedResell - price : null;

    return { score, verdict, verdictColor, verdictBg, verdictIcon, flags, warnings, positives, estimatedResell, profitPotential, make: car.make||car.brand||"—", model: car.model||"—", year, color: car.color||car.colour||"—", mileage, price, accident: car.accident||car.accident_history||"—", service: car.service||car.service_history||"—" };
  };

  const handleCSVFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rows = parseCSV(e.target.result);
        setCsvData(rows);
        setCsvLoading(true);
        setCsvInsights(null);
        setTimeout(() => {
          const insights = rows.map(r => analyzeCarRow(r));
          setCsvInsights(insights);
          setCsvLoading(false);
        }, 1400);
      } catch(err) { alert("Could not parse CSV. Check format."); }
    };
    reader.readAsText(file);
  };

  const csvSummary = csvInsights ? {
    strongBuy:  csvInsights.filter(c=>c.verdict==="STRONG BUY").length,
    buy:        csvInsights.filter(c=>c.verdict==="BUY").length,
    consider:   csvInsights.filter(c=>c.verdict==="CONSIDER").length,
    avoid:      csvInsights.filter(c=>c.verdict==="AVOID" || c.verdict==="DO NOT BUY").length,
    totalProfit:csvInsights.filter(c=>c.profitPotential>0).reduce((s,c)=>s+(c.profitPotential||0),0),
    avgScore:   Math.round(csvInsights.reduce((s,c)=>s+c.score,0)/csvInsights.length),
  } : null;

  const filteredCSV = csvInsights ? csvInsights
    .filter(c => csvFilter==="All" || c.verdict===csvFilter || (csvFilter==="AVOID" && (c.verdict==="AVOID"||c.verdict==="DO NOT BUY")))
    .sort((a,b) => csvSort==="score" ? b.score-a.score : csvSort==="profit" ? (b.profitPotential||0)-(a.profitPotential||0) : a.model.localeCompare(b.model))
    : [];

  const filteredInv = invFilter === "All" ? inventoryData : inventoryData.filter(i => i.riskLabel === invFilter);

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#0a0e1a", minHeight: "100vh", color: "#e2e8f0" }}>

      {/* ── TOP NAV ── */}
      <div style={{ background: "linear-gradient(135deg, #0f1729 0%, #111827 100%)", borderBottom: "1px solid rgba(251,191,36,0.2)", padding: "0 24px", display: "flex", alignItems: "center", gap: 24, height: 64, position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, background:"linear-gradient(135deg,#f59e0b,#d97706)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🚗</div>
          <div>
            <div style={{ fontWeight:800, fontSize:16, color:"#fbbf24", letterSpacing:"0.05em" }}>QAUTO-AI</div>
            <div style={{ fontSize:10, color:"#64748b", letterSpacing:"0.1em" }}>QATAR USED CAR INTELLIGENCE</div>
          </div>
        </div>

        <div style={{ flex:1 }} />

        <div style={{ display:"flex", gap:4 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              padding: "8px 14px", borderRadius:8, border:"none", cursor:"pointer", fontSize:13, fontWeight:activeTab===t.id?700:500, transition:"all 0.2s",
              background: activeTab===t.id ? "linear-gradient(135deg,#f59e0b,#d97706)" : "transparent",
              color: activeTab===t.id ? "#0a0e1a" : "#94a3b8",
            }}>
              <span style={{marginRight:5}}>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.3)", borderRadius:20, padding:"6px 14px" }}>
          <div style={{width:8,height:8,borderRadius:"50%",background:"#22c55e",boxShadow:"0 0 8px #22c55e"}} />
          <span style={{fontSize:12,color:"#22c55e",fontWeight:600}}>LIVE</span>
        </div>
      </div>

      <div style={{ padding: "24px 28px" }}>

        {/* ════════════════════════════════════════
            DASHBOARD 1 — MARKET HUB
        ════════════════════════════════════════ */}
        {activeTab === "market" && (
          <div>
            <div style={{ marginBottom:24 }}>
              <h1 style={{ fontSize:26, fontWeight:800, color:"#fbbf24", margin:0 }}>Market Intelligence Hub</h1>
              <p style={{ fontSize:13, color:"#64748b", margin:"4px 0 0" }}>Real-time Qatar used car market overview · February 2026</p>
            </div>

            {/* KPI Row */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:14, marginBottom:24 }}>
              {[
                { label:"Market Health", value:"81/100", sub:"Strong ↑", color:"#22c55e", icon:"🏥" },
                { label:"Avg Days (SUV)", value:"27 days", sub:"−3 vs last month", color:"#3b82f6", icon:"⏱" },
                { label:"Oil Price", value:"$88/bbl", sub:"HOT signal", color:"#f59e0b", icon:"🛢" },
                { label:"Active Buyers", value:"47", sub:"Ready < 60 days", color:"#a78bfa", icon:"👥" },
                { label:"Critical Stock", value:"6 cars", sub:"Need action now", color:"#ef4444", icon:"🚨" },
                { label:"LC300 Trend", value:"↑ 94", sub:"Rising 4 weeks", color:"#06b6d4", icon:"📈" },
              ].map((kpi,i) => (
                <div key={i} style={{ background:"linear-gradient(135deg,#111827,#0f172a)", border:`1px solid ${kpi.color}30`, borderRadius:14, padding:16, position:"relative", overflow:"hidden" }}>
                  <div style={{ position:"absolute", top:-10, right:-10, fontSize:40, opacity:0.08 }}>{kpi.icon}</div>
                  <div style={{ fontSize:11, color:"#64748b", fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase" }}>{kpi.label}</div>
                  <div style={{ fontSize:24, fontWeight:800, color:kpi.color, margin:"8px 0 2px" }}>{kpi.value}</div>
                  <div style={{ fontSize:11, color:"#94a3b8" }}>{kpi.sub}</div>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20, marginBottom:20 }}>

              {/* Monthly Transactions */}
              <div style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:20 }}>
                <div style={{ fontWeight:700, fontSize:14, color:"#e2e8f0", marginBottom:16 }}>Monthly Transactions & Avg Price 2025</div>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={marketTrendData}>
                    <defs>
                      <linearGradient id="txGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="prGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="month" stroke="#475569" tick={{fontSize:11}} />
                    <YAxis yAxisId="left"  stroke="#475569" tick={{fontSize:11}} />
                    <YAxis yAxisId="right" orientation="right" stroke="#475569" tick={{fontSize:11}} />
                    <Tooltip contentStyle={{ background:"#1e293b", border:"1px solid #334155", borderRadius:8, fontSize:12 }} />
                    <Area yAxisId="left"  type="monotone" dataKey="transactions" stroke="#f59e0b" fill="url(#txGrad)" strokeWidth={2} name="Transactions" />
                    <Area yAxisId="right" type="monotone" dataKey="avgPrice"     stroke="#3b82f6" fill="url(#prGrad)" strokeWidth={2} name="Avg Price QAR" />
                  </AreaChart>
                </ResponsiveContainer>
                <div style={{display:"flex",gap:20,marginTop:8}}>
                  <span style={{fontSize:11,color:"#f59e0b",display:"flex",alignItems:"center",gap:4}}><span style={{width:12,height:3,background:"#f59e0b",display:"inline-block",borderRadius:2}}/>Transactions</span>
                  <span style={{fontSize:11,color:"#3b82f6",display:"flex",alignItems:"center",gap:4}}><span style={{width:12,height:3,background:"#3b82f6",display:"inline-block",borderRadius:2}}/>Avg Price QAR</span>
                  <span style={{fontSize:11,color:"#ef444480",background:"rgba(239,68,68,0.1)",borderRadius:4,padding:"2px 8px"}}>☀️ Summer slow</span>
                  <span style={{fontSize:11,color:"#22c55e80",background:"rgba(34,197,94,0.1)",borderRadius:4,padding:"2px 8px"}}>❄️ Winter peak</span>
                </div>
              </div>

              {/* Top Models */}
              <div style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:20 }}>
                <div style={{ fontWeight:700, fontSize:14, color:"#e2e8f0", marginBottom:16 }}>Top Models — Days to Sell</div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={topModels} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                    <XAxis type="number" stroke="#475569" tick={{fontSize:10}} domain={[0,60]} />
                    <YAxis type="category" dataKey="model" stroke="#475569" tick={{fontSize:10}} width={100} />
                    <Tooltip contentStyle={{ background:"#1e293b", border:"1px solid #334155", borderRadius:8, fontSize:11 }} />
                    <Bar dataKey="days" radius={[0,6,6,0]} name="Days to Sell">
                      {topModels.map((m,i) => (
                        <rect key={i} fill={m.days < 30 ? "#22c55e" : m.days < 40 ? "#f59e0b" : "#ef4444"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Market Signals Row */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
              {[
                { title:"🛢 Oil Price Signal", value:"$88/barrel", status:"BUY", statusColor:"#22c55e", desc:"Above $85 threshold. Consumer confidence at 78. Market is HOT — recommend listing at full price and buying stock aggressively." },
                { title:"📅 Next Event", value:"National Day", status:"6 WEEKS", statusColor:"#f59e0b", desc:"December 18. Luxury segment demand spike — Lexus, Land Rover, BMW. Stock luxury models in November before demand peaks." },
                { title:"👥 Expat Signal", value:"2.9M expats", statusColor:"#3b82f6", status:"RETURNING", desc:"September–October return season. Supply is tightening. Demand spike incoming. Best time to raise prices by 5–8%." },
              ].map((s,i) => (
                <div key={i} style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:18 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                    <span style={{ fontSize:13, fontWeight:700, color:"#e2e8f0" }}>{s.title}</span>
                    <span style={{ fontSize:11, fontWeight:700, color:s.statusColor, background:`${s.statusColor}20`, borderRadius:6, padding:"3px 10px" }}>{s.status}</span>
                  </div>
                  <div style={{ fontSize:22, fontWeight:800, color:s.statusColor, marginBottom:8 }}>{s.value}</div>
                  <div style={{ fontSize:12, color:"#94a3b8", lineHeight:1.6 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            DASHBOARD 2 — INVENTORY HEALTH
        ════════════════════════════════════════ */}
        {activeTab === "inventory" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:20 }}>
              <div>
                <h1 style={{ fontSize:26, fontWeight:800, color:"#fbbf24", margin:0 }}>Inventory Health Monitor</h1>
                <p style={{ fontSize:13, color:"#64748b", margin:"4px 0 0" }}>10,000 vehicles · Real-time risk scoring</p>
              </div>
              {/* Filters */}
              <div style={{ display:"flex", gap:8 }}>
                {["All","Healthy","Monitor","At Risk","Critical"].map(f => (
                  <button key={f} onClick={() => setInvFilter(f)} style={{
                    padding:"7px 14px", borderRadius:8, border:"none", cursor:"pointer", fontSize:12, fontWeight:600, transition:"all 0.2s",
                    background: invFilter===f ? riskColor(f==="All"?"Healthy":f) : "rgba(255,255,255,0.05)",
                    color: invFilter===f ? "#0a0e1a" : "#94a3b8",
                  }}>{f}</button>
                ))}
              </div>
            </div>

            {/* Summary Bars */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
              {[
                { label:"Healthy",  count:4, pct:40, color:"#22c55e" },
                { label:"Monitor",  count:3, pct:30, color:"#f59e0b" },
                { label:"At Risk",  count:2, pct:20, color:"#f97316" },
                { label:"Critical", count:2, pct:20, color:"#ef4444" },
              ].map((s,i) => (
                <div key={i} style={{ background:"#111827", border:`1px solid ${s.color}30`, borderRadius:12, padding:16 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    <span style={{ fontSize:12, color:"#94a3b8" }}>{s.label}</span>
                    <span style={{ fontSize:18, fontWeight:800, color:s.color }}>{s.count}</span>
                  </div>
                  <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:4, height:4 }}>
                    <div style={{ background:s.color, height:4, borderRadius:4, width:`${s.pct}%`, transition:"width 0.8s" }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Table */}
            <div style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, overflow:"hidden" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                <thead>
                  <tr style={{ background:"rgba(245,158,11,0.1)", borderBottom:"1px solid rgba(245,158,11,0.2)" }}>
                    {["Risk","Vehicle","Year","Color","Days in Stock","Listed Price","AI Price","Gap","Action"].map(h => (
                      <th key={h} style={{ padding:"12px 14px", textAlign:"left", color:"#f59e0b", fontWeight:700, fontSize:11, letterSpacing:"0.05em", whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredInv.map((car,i) => (
                    <tr key={car.id} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)", background: i%2===0?"transparent":"rgba(255,255,255,0.015)", transition:"background 0.2s" }}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(245,158,11,0.05)"}
                        onMouseLeave={e=>e.currentTarget.style.background= i%2===0?"transparent":"rgba(255,255,255,0.015)"}>
                      <td style={{ padding:"10px 14px" }}>
                        <span style={{ background:riskBg(car.riskLabel), color:riskColor(car.riskLabel), border:`1px solid ${riskColor(car.riskLabel)}40`, borderRadius:6, padding:"3px 8px", fontWeight:700, fontSize:10 }}>
                          {car.riskLabel === "Critical" ? "⛔" : car.riskLabel === "At Risk" ? "🔴" : car.riskLabel === "Monitor" ? "🟡" : "🟢"} {car.riskLabel}
                        </span>
                      </td>
                      <td style={{ padding:"10px 14px", fontWeight:600, color:"#e2e8f0" }}>{car.make} {car.model}</td>
                      <td style={{ padding:"10px 14px", color:"#94a3b8" }}>{car.year}</td>
                      <td style={{ padding:"10px 14px" }}>
                        <span style={{ display:"inline-flex", alignItems:"center", gap:5 }}>
                          <span style={{ width:10, height:10, borderRadius:"50%", background:car.color==="White"?"#f8fafc":car.color==="Black"?"#0f172a":car.color==="Silver"?"#94a3b8":car.color==="Red"?"#ef4444":car.color==="Blue"?"#3b82f6":"#d97706", border:"1px solid rgba(255,255,255,0.2)", flexShrink:0 }} />
                          {car.color}
                        </span>
                      </td>
                      <td style={{ padding:"10px 14px", color: car.days > 90 ? "#ef4444" : car.days > 60 ? "#f59e0b" : "#22c55e", fontWeight:700 }}>{car.days}d</td>
                      <td style={{ padding:"10px 14px", color:"#e2e8f0" }}>QAR {car.price.toLocaleString()}</td>
                      <td style={{ padding:"10px 14px", color:"#3b82f6" }}>QAR {car.aiPrice.toLocaleString()}</td>
                      <td style={{ padding:"10px 14px" }}>
                        {car.price > car.aiPrice
                          ? <span style={{ color:"#ef4444", fontWeight:700 }}>−QAR {(car.price-car.aiPrice).toLocaleString()}</span>
                          : <span style={{ color:"#22c55e", fontWeight:700 }}>+QAR {(car.aiPrice-car.price).toLocaleString()}</span>}
                      </td>
                      <td style={{ padding:"10px 14px" }}>
                        <span style={{ background: car.action==="Hold"?"rgba(34,197,94,0.1)":car.action==="Review"?"rgba(245,158,11,0.1)":car.action==="Auction"?"rgba(239,68,68,0.2)":"rgba(249,115,22,0.15)", color: car.action==="Hold"?"#22c55e":car.action==="Review"?"#f59e0b":car.action==="Auction"?"#ef4444":"#f97316", borderRadius:6, padding:"3px 10px", fontSize:11, fontWeight:700 }}>
                          {car.action}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            DASHBOARD 3 — PRICING TOOL
        ════════════════════════════════════════ */}
        {activeTab === "pricing" && (
          <div>
            <h1 style={{ fontSize:26, fontWeight:800, color:"#fbbf24", margin:"0 0 6px" }}>AI Pricing Tool</h1>
            <p style={{ fontSize:13, color:"#64748b", margin:"0 0 24px" }}>Enter car details to get an instant AI-powered price recommendation</p>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
              {/* Input Form */}
              <div style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:24 }}>
                <div style={{ fontWeight:700, fontSize:15, color:"#fbbf24", marginBottom:20 }}>📋 Car Details</div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
                  {[
                    { label:"Make", key:"make", options:["Toyota","Lexus","Nissan","Kia","Ford"] },
                    { label:"Model", key:"model", options:["Land Cruiser","Prado","Patrol","Hilux","Camry","Fortuner","LX 600","GX 550"] },
                    { label:"Year", key:"year", options:["2024","2023","2022","2021","2020","2019","2018"] },
                    { label:"Condition", key:"condition", options:["Excellent","Very Good","Good","Fair"] },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ fontSize:11, color:"#64748b", fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase", display:"block", marginBottom:6 }}>{f.label}</label>
                      <select value={pricingForm[f.key]} onChange={e => setPricingForm(p => ({...p,[f.key]:e.target.value}))}
                        style={{ width:"100%", background:"#0f172a", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"9px 12px", color:"#e2e8f0", fontSize:13, cursor:"pointer" }}>
                        {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>

                {/* Color Picker */}
                <div style={{ marginBottom:20 }}>
                  <label style={{ fontSize:11, color:"#64748b", fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase", display:"block", marginBottom:10 }}>Color</label>
                  <div style={{ display:"flex", gap:10 }}>
                    {[
                      { name:"White",  hex:"#f8fafc" },
                      { name:"Silver", hex:"#94a3b8" },
                      { name:"Black",  hex:"#1e293b" },
                      { name:"Red",    hex:"#ef4444" },
                      { name:"Blue",   hex:"#3b82f6" },
                      { name:"Beige",  hex:"#d4b896" },
                    ].map(c => (
                      <button key={c.name} onClick={() => setPricingForm(p=>({...p,color:c.name}))}
                        style={{ width:36, height:36, borderRadius:"50%", background:c.hex, border: pricingForm.color===c.name ? "3px solid #f59e0b" : "2px solid rgba(255,255,255,0.15)", cursor:"pointer", transition:"all 0.2s", title:c.name }} title={c.name} />
                    ))}
                    <span style={{ fontSize:12, color:"#94a3b8", alignSelf:"center", marginLeft:4 }}>{pricingForm.color}</span>
                  </div>
                </div>

                {/* Mileage */}
                <div style={{ marginBottom:24 }}>
                  <label style={{ fontSize:11, color:"#64748b", fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase", display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    Mileage <span style={{ color:"#f59e0b" }}>{pricingForm.mileage.toLocaleString()} km</span>
                  </label>
                  <input type="range" min={0} max={300000} step={5000} value={pricingForm.mileage}
                    onChange={e => setPricingForm(p=>({...p,mileage:+e.target.value}))}
                    style={{ width:"100%", accentColor:"#f59e0b" }} />
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#475569" }}>
                    <span>0 km</span><span>300,000 km</span>
                  </div>
                </div>

                <button onClick={calcPrice} style={{ width:"100%", background:"linear-gradient(135deg,#f59e0b,#d97706)", border:"none", borderRadius:10, padding:"13px", color:"#0a0e1a", fontWeight:800, fontSize:14, cursor:"pointer", letterSpacing:"0.03em" }}>
                  ⚡ GET AI PRICE RECOMMENDATION
                </button>
              </div>

              {/* Output Panel */}
              <div>
                {priceResult ? (
                  <div style={{ background:"#111827", border:"1px solid rgba(245,158,11,0.3)", borderRadius:16, padding:24 }}>
                    <div style={{ fontWeight:700, fontSize:15, color:"#fbbf24", marginBottom:20 }}>💡 AI Recommendation</div>

                    <div style={{ textAlign:"center", background:"linear-gradient(135deg,rgba(245,158,11,0.15),rgba(245,158,11,0.05))", borderRadius:14, padding:24, marginBottom:20, border:"1px solid rgba(245,158,11,0.2)" }}>
                      <div style={{ fontSize:11, color:"#94a3b8", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:8 }}>Recommended Price</div>
                      <div style={{ fontSize:44, fontWeight:900, color:"#fbbf24" }}>QAR 289,000</div>
                      <div style={{ fontSize:13, color:"#64748b", marginTop:6 }}>Range: QAR 272,000 — QAR 305,000</div>
                      <div style={{ display:"inline-flex", gap:6, marginTop:12, background:"rgba(34,197,94,0.1)", borderRadius:8, padding:"6px 16px", border:"1px solid rgba(34,197,94,0.2)" }}>
                        <span style={{ color:"#22c55e", fontWeight:700 }}>87% Confidence</span>
                        <span style={{ color:"#475569" }}>·</span>
                        <span style={{ color:"#64748b", fontSize:12 }}>34 similar transactions</span>
                      </div>
                    </div>

                    <div style={{ marginBottom:16 }}>
                      <div style={{ fontWeight:700, fontSize:12, color:"#94a3b8", marginBottom:10, letterSpacing:"0.05em" }}>TIME TO SELL</div>
                      {[
                        { price:"QAR 289,000", days:24, label:"Recommended" },
                        { price:"QAR 272,000", days:14, label:"Fast Sale −6%" },
                        { price:"QAR 305,000", days:48, label:"Max Price +6%" },
                      ].map((row,i) => (
                        <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 12px", background:"rgba(255,255,255,0.03)", borderRadius:8, marginBottom:6 }}>
                          <span style={{ fontSize:13, color:"#e2e8f0", fontWeight: i===0?700:400 }}>{row.price}</span>
                          <span style={{ fontSize:12, color:"#64748b" }}>{row.label}</span>
                          <span style={{ fontSize:13, color: i===0?"#f59e0b":i===1?"#22c55e":"#94a3b8", fontWeight:700 }}>~{row.days} days</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginBottom:16 }}>
                      <div style={{ fontWeight:700, fontSize:12, color:"#94a3b8", marginBottom:10, letterSpacing:"0.05em" }}>MARKET CONTEXT</div>
                      {[
                        { icon:"✅", text:"Winter peak season — buyers active, prices firm" },
                        { icon:"✅", text:"Oil $88 — strong consumer confidence (78/100)" },
                        { icon:"✅", text:"White color premium: +4–5% above market average" },
                        { icon:"⚠️", text:"4 similar Land Cruisers listed at QAR 282K–295K" },
                      ].map((m,i) => (
                        <div key={i} style={{ display:"flex", gap:8, padding:"6px 0", borderBottom:"1px solid rgba(255,255,255,0.04)", fontSize:12, color:"#94a3b8" }}>
                          <span>{m.icon}</span><span>{m.text}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:10, padding:14 }}>
                      <div style={{ fontWeight:700, fontSize:12, color:"#fbbf24", marginBottom:6 }}>🤖 AI ADVICE</div>
                      <div style={{ fontSize:12, color:"#94a3b8", lineHeight:1.7 }}>
                        "List now. Market is strong. White color premium intact. Price at QAR 291K to stand out from competition at QAR 289K. Expect offer within 2–3 weeks."
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:24, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:16 }}>
                    <div style={{ fontSize:64, opacity:0.3 }}>💰</div>
                    <div style={{ fontSize:15, color:"#475569", textAlign:"center" }}>Fill in car details and click<br/><strong style={{color:"#f59e0b"}}>Get AI Price Recommendation</strong></div>
                    <div style={{ fontSize:12, color:"#334155", textAlign:"center" }}>Powered by 10,000 historical transactions<br/>+ live market data + economic indicators</div>
                  </div>
                )}
              </div>
            </div>

            {/* ─── CSV BULK UPLOAD SECTION ─── */}
            <div style={{ marginTop:32 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
                <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.06)" }} />
                <span style={{ fontSize:12, color:"#475569", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase" }}>or analyse a bulk list</span>
                <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.06)" }} />
              </div>

              <div style={{ marginTop:20 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:12 }}>
                  <div>
                    <h2 style={{ fontSize:18, fontWeight:800, color:"#e2e8f0", margin:0 }}>📂 Bulk CSV Car Analysis</h2>
                    <p style={{ fontSize:12, color:"#64748b", margin:"4px 0 0" }}>Upload a CSV of cars you're considering buying — AI scores each one instantly</p>
                  </div>
                  <button onClick={() => {
                    const sample = `make,model,year,color,mileage,price,accident,service\nToyota,Land Cruiser,2022,White,45000,275000,None,Full Dealer\nNissan,Patrol,2020,Silver,95000,148000,Minor,Partial\nToyota,Camry,2019,Red,142000,72000,None,Unknown\nLexus,LX 600,2023,Black,22000,410000,None,Full Dealer\nToyota,Prado,2021,White,60000,160000,None,Full Dealer\nJetour,X90,2022,Blue,55000,88000,None,Unknown`;
                    const blob = new Blob([sample], {type:"text/csv"});
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(blob);
                    a.download = "sample_cars.csv";
                    a.click();
                  }} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"7px 14px", color:"#94a3b8", fontSize:11, cursor:"pointer", fontWeight:600 }}>
                    ⬇ Download Sample CSV
                  </button>
                </div>

                {/* Drop Zone */}
                {!csvInsights && !csvLoading && (
                  <div
                    onDragOver={e=>{e.preventDefault();setCsvDragOver(true)}}
                    onDragLeave={()=>setCsvDragOver(false)}
                    onDrop={e=>{e.preventDefault();setCsvDragOver(false);handleCSVFile(e.dataTransfer.files[0])}}
                    style={{ border:`2px dashed ${csvDragOver?"#f59e0b":"rgba(255,255,255,0.1)"}`, borderRadius:16, padding:48, textAlign:"center", background:csvDragOver?"rgba(245,158,11,0.05)":"rgba(255,255,255,0.02)", transition:"all 0.2s", cursor:"pointer" }}
                    onClick={()=>document.getElementById("csvFileInput").click()}
                  >
                    <input id="csvFileInput" type="file" accept=".csv" style={{display:"none"}} onChange={e=>handleCSVFile(e.target.files[0])} />
                    <div style={{ fontSize:48, marginBottom:12, opacity:0.5 }}>📋</div>
                    <div style={{ fontSize:15, fontWeight:700, color:"#94a3b8", marginBottom:6 }}>
                      {csvDragOver ? "Drop your CSV here!" : "Drag & drop your CSV file here"}
                    </div>
                    <div style={{ fontSize:12, color:"#475569", marginBottom:16 }}>or click to browse</div>
                    <div style={{ display:"flex", justifyContent:"center", gap:16 }}>
                      {["make","model","year","color","mileage","price","accident","service"].map(col=>(
                        <span key={col} style={{ fontSize:10, background:"rgba(245,158,11,0.1)", color:"#f59e0b", borderRadius:4, padding:"2px 8px", fontWeight:600 }}>{col}</span>
                      ))}
                    </div>
                    <div style={{ fontSize:11, color:"#334155", marginTop:10 }}>Required columns · Extra columns are ignored</div>
                  </div>
                )}

                {/* Loading */}
                {csvLoading && (
                  <div style={{ background:"#111827", border:"1px solid rgba(245,158,11,0.2)", borderRadius:16, padding:48, textAlign:"center" }}>
                    <div style={{ fontSize:40, marginBottom:16, animation:"spin 1s linear infinite" }}>⚙️</div>
                    <div style={{ fontSize:15, fontWeight:700, color:"#fbbf24", marginBottom:8 }}>Analysing {csvData?.length} cars...</div>
                    <div style={{ fontSize:12, color:"#64748b" }}>Applying Qatar market rules · Checking color penalties · Scoring demand signals</div>
                    <div style={{ marginTop:20, background:"rgba(255,255,255,0.04)", borderRadius:8, height:6, overflow:"hidden" }}>
                      <div style={{ background:"linear-gradient(90deg,#f59e0b,#22c55e)", height:6, borderRadius:8, width:"70%", animation:"progress 1.4s ease-in-out" }} />
                    </div>
                    <style>{`@keyframes progress{from{width:0%}to{width:95%}}`}</style>
                  </div>
                )}

                {/* Results */}
                {csvInsights && (
                  <div>
                    {/* Summary Cards */}
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:12, marginBottom:20 }}>
                      {[
                        { label:"Cars Analysed", value:csvInsights.length, color:"#3b82f6", icon:"📊" },
                        { label:"Strong Buy",    value:csvSummary.strongBuy, color:"#22c55e", icon:"🟢" },
                        { label:"Buy",           value:csvSummary.buy, color:"#84cc16", icon:"✅" },
                        { label:"Consider",      value:csvSummary.consider, color:"#f59e0b", icon:"⚠️" },
                        { label:"Avoid",         value:csvSummary.avoid, color:"#ef4444", icon:"⛔" },
                        { label:"Avg Score",     value:csvSummary.avgScore+"/100", color:"#a78bfa", icon:"🎯" },
                      ].map((s,i)=>(
                        <div key={i} style={{ background:"#111827", border:`1px solid ${s.color}30`, borderRadius:12, padding:14, textAlign:"center" }}>
                          <div style={{ fontSize:20, marginBottom:4 }}>{s.icon}</div>
                          <div style={{ fontSize:22, fontWeight:900, color:s.color }}>{s.value}</div>
                          <div style={{ fontSize:10, color:"#64748b", marginTop:2 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Total Profit Potential */}
                    {csvSummary.totalProfit > 0 && (
                      <div style={{ background:"linear-gradient(135deg,rgba(34,197,94,0.12),rgba(34,197,94,0.04))", border:"1px solid rgba(34,197,94,0.25)", borderRadius:12, padding:"14px 20px", marginBottom:16, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        <div>
                          <div style={{ fontSize:12, color:"#16a34a", fontWeight:700, letterSpacing:"0.05em" }}>💰 TOTAL PROFIT POTENTIAL (Buy Price vs Market Value)</div>
                          <div style={{ fontSize:11, color:"#64748b", marginTop:2 }}>Sum of estimated profit across all Buy/Strong Buy cars</div>
                        </div>
                        <div style={{ fontSize:28, fontWeight:900, color:"#22c55e" }}>QAR {csvSummary.totalProfit.toLocaleString()}</div>
                      </div>
                    )}

                    {/* Filters & Sort */}
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                      <div style={{ display:"flex", gap:8 }}>
                        {["All","STRONG BUY","BUY","CONSIDER","AVOID"].map(f=>(
                          <button key={f} onClick={()=>setCsvFilter(f)} style={{
                            padding:"6px 12px", borderRadius:7, border:"none", cursor:"pointer", fontSize:11, fontWeight:600,
                            background:csvFilter===f?"#f59e0b":"rgba(255,255,255,0.05)",
                            color:csvFilter===f?"#0a0e1a":"#94a3b8"
                          }}>{f}</button>
                        ))}
                      </div>
                      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                        <span style={{ fontSize:11, color:"#64748b" }}>Sort:</span>
                        {[["score","Score"],["profit","Profit"],["model","Model"]].map(([v,l])=>(
                          <button key={v} onClick={()=>setCsvSort(v)} style={{ padding:"5px 10px", borderRadius:6, border:"none", cursor:"pointer", fontSize:11, background:csvSort===v?"rgba(245,158,11,0.2)":"rgba(255,255,255,0.04)", color:csvSort===v?"#f59e0b":"#64748b" }}>{l}</button>
                        ))}
                        <button onClick={()=>{setCsvInsights(null);setCsvData(null);}} style={{ padding:"5px 12px", borderRadius:6, border:"1px solid rgba(255,255,255,0.08)", background:"transparent", color:"#64748b", fontSize:11, cursor:"pointer", marginLeft:8 }}>↺ Upload New</button>
                      </div>
                    </div>

                    {/* Results Table */}
                    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                      {filteredCSV.map((car, i) => (
                        <div key={i} style={{ background:"#111827", border:`1px solid ${car.verdictColor}25`, borderRadius:14, padding:18, transition:"border-color 0.2s" }}
                             onMouseEnter={e=>e.currentTarget.style.borderColor=car.verdictColor+"60"}
                             onMouseLeave={e=>e.currentTarget.style.borderColor=car.verdictColor+"25"}>
                          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr", gap:16, alignItems:"center" }}>

                            {/* Car Identity */}
                            <div>
                              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                                <span style={{ fontSize:20 }}>{car.verdictIcon}</span>
                                <div>
                                  <div style={{ fontWeight:800, fontSize:15, color:"#e2e8f0" }}>{car.make} {car.model}</div>
                                  <div style={{ fontSize:11, color:"#64748b" }}>{car.year} · {car.color} · {car.mileage.toLocaleString()} km</div>
                                </div>
                              </div>
                              <span style={{ fontSize:11, fontWeight:800, color:car.verdictColor, background:car.verdictBg, borderRadius:6, padding:"3px 10px", border:`1px solid ${car.verdictColor}30` }}>
                                {car.verdict}
                              </span>
                            </div>

                            {/* Score Gauge */}
                            <div style={{ textAlign:"center" }}>
                              <div style={{ fontSize:10, color:"#64748b", marginBottom:4, letterSpacing:"0.05em" }}>AI SCORE</div>
                              <div style={{ fontSize:32, fontWeight:900, color:car.verdictColor }}>{car.score}</div>
                              <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:4, height:5, marginTop:6 }}>
                                <div style={{ background:car.verdictColor, height:5, borderRadius:4, width:`${car.score}%`, transition:"width 0.8s" }} />
                              </div>
                            </div>

                            {/* Asking Price */}
                            <div style={{ textAlign:"center" }}>
                              <div style={{ fontSize:10, color:"#64748b", marginBottom:4, letterSpacing:"0.05em" }}>ASKING PRICE</div>
                              <div style={{ fontSize:15, fontWeight:700, color:"#e2e8f0" }}>{car.price ? "QAR "+car.price.toLocaleString() : "—"}</div>
                            </div>

                            {/* Est. Market Value */}
                            <div style={{ textAlign:"center" }}>
                              <div style={{ fontSize:10, color:"#64748b", marginBottom:4, letterSpacing:"0.05em" }}>EST. MARKET VALUE</div>
                              <div style={{ fontSize:15, fontWeight:700, color:"#3b82f6" }}>QAR {car.estimatedResell.toLocaleString()}</div>
                            </div>

                            {/* Profit Potential */}
                            <div style={{ textAlign:"center" }}>
                              <div style={{ fontSize:10, color:"#64748b", marginBottom:4, letterSpacing:"0.05em" }}>PROFIT POTENTIAL</div>
                              {car.profitPotential !== null ? (
                                <div style={{ fontSize:15, fontWeight:700, color:car.profitPotential>0?"#22c55e":"#ef4444" }}>
                                  {car.profitPotential>0?"+":""}{car.profitPotential.toLocaleString()} QAR
                                </div>
                              ) : <div style={{ color:"#475569" }}>—</div>}
                            </div>
                          </div>

                          {/* Insight Pills */}
                          <div style={{ marginTop:14, paddingTop:12, borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                              {car.positives.map((p,j)=>(
                                <span key={j} style={{ fontSize:10, background:"rgba(34,197,94,0.1)", color:"#22c55e", borderRadius:5, padding:"3px 9px" }}>✓ {p}</span>
                              ))}
                              {car.warnings.map((w,j)=>(
                                <span key={j} style={{ fontSize:10, background:"rgba(245,158,11,0.1)", color:"#f59e0b", borderRadius:5, padding:"3px 9px" }}>⚠ {w}</span>
                              ))}
                              {car.flags.map((f,j)=>(
                                <span key={j} style={{ fontSize:10, background:"rgba(239,68,68,0.12)", color:"#ef4444", borderRadius:5, padding:"3px 9px" }}>🚩 {f}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            DASHBOARD 4 — TRENDS
        ════════════════════════════════════════ */}
        {activeTab === "trends" && (
          <div>
            <h1 style={{ fontSize:26, fontWeight:800, color:"#fbbf24", margin:"0 0 6px" }}>Market Trends & Demand Signals</h1>
            <p style={{ fontSize:13, color:"#64748b", margin:"0 0 24px" }}>Google Trends + Social Media · 8 weeks rolling</p>

            <div style={{ display:"grid", gridTemplateColumns:"3fr 1fr", gap:20, marginBottom:20 }}>
              <div style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:20 }}>
                <div style={{ fontWeight:700, fontSize:14, color:"#e2e8f0", marginBottom:16 }}>Google Search Trend Score (Qatar) — Top 4 Models</div>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={googleTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="week" stroke="#475569" tick={{fontSize:11}} />
                    <YAxis stroke="#475569" tick={{fontSize:11}} domain={[40,100]} />
                    <Tooltip contentStyle={{ background:"#1e293b", border:"1px solid #334155", borderRadius:8, fontSize:11 }} />
                    <Line type="monotone" dataKey="landCruiser" stroke="#f59e0b" strokeWidth={3} dot={{ fill:"#f59e0b", r:4 }} name="Land Cruiser 300" />
                    <Line type="monotone" dataKey="prado"       stroke="#22c55e" strokeWidth={2} dot={{ fill:"#22c55e", r:3 }} name="Prado" />
                    <Line type="monotone" dataKey="lexusLX"     stroke="#a78bfa" strokeWidth={2} dot={{ fill:"#a78bfa", r:3 }} name="Lexus LX 600" />
                    <Line type="monotone" dataKey="patrol"      stroke="#3b82f6" strokeWidth={2} dot={{ fill:"#3b82f6", r:3 }} name="Nissan Patrol" />
                  </LineChart>
                </ResponsiveContainer>
                <div style={{display:"flex",gap:20,marginTop:8}}>
                  {[["#f59e0b","Land Cruiser 300"],["#22c55e","Prado"],["#a78bfa","Lexus LX 600"],["#3b82f6","Nissan Patrol"]].map(([c,n])=>(
                    <span key={n} style={{fontSize:11,color:c,display:"flex",alignItems:"center",gap:4}}>
                      <span style={{width:16,height:3,background:c,display:"inline-block",borderRadius:2}}/>  {n}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {[
                  { model:"Land Cruiser 300", score:94, signal:"HIGH DEMAND", color:"#f59e0b", alert:"Rising 4 weeks → BUY NOW" },
                  { model:"Lexus LX 600",     score:78, signal:"HIGH DEMAND", color:"#a78bfa", alert:"National Day approaching" },
                  { model:"Prado GXR",        score:74, signal:"RISING",      color:"#22c55e", alert:"Demand building" },
                  { model:"Nissan Patrol",    score:65, signal:"MODERATE",    color:"#3b82f6", alert:"Stable — watch" },
                ].map((m,i) => (
                  <div key={i} style={{ background:"#111827", border:`1px solid ${m.color}30`, borderRadius:12, padding:14, flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:"#e2e8f0", marginBottom:4 }}>{m.model}</div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                      <span style={{ fontSize:22, fontWeight:900, color:m.color }}>{m.score}</span>
                      <span style={{ fontSize:10, fontWeight:700, color:m.color, background:`${m.color}15`, borderRadius:5, padding:"2px 7px" }}>{m.signal}</span>
                    </div>
                    <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:4, height:3, marginBottom:6 }}>
                      <div style={{ background:m.color, height:3, borderRadius:4, width:`${m.score}%` }} />
                    </div>
                    <div style={{ fontSize:10, color:"#64748b" }}>{m.alert}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Brand Sentiment */}
            <div style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:20 }}>
              <div style={{ fontWeight:700, fontSize:14, color:"#e2e8f0", marginBottom:16 }}>Social Media Sentiment Score by Brand</div>
              <div style={{ display:"flex", gap:16 }}>
                {[
                  { brand:"Toyota",     score:0.71, mentions:2100, trend:"Stable",  color:"#f59e0b" },
                  { brand:"Lexus",      score:0.78, mentions:980,  trend:"Rising",  color:"#a78bfa" },
                  { brand:"Nissan",     score:0.63, mentions:1400, trend:"Stable",  color:"#3b82f6" },
                  { brand:"Land Rover", score:0.72, mentions:620,  trend:"Rising",  color:"#22c55e" },
                  { brand:"TANK",       score:0.55, mentions:410,  trend:"Rising ↑",color:"#f97316" },
                  { brand:"Jetour",     score:0.52, mentions:380,  trend:"Rising ↑",color:"#f97316" },
                  { brand:"Haval",      score:0.50, mentions:290,  trend:"Rising",  color:"#ef4444" },
                  { brand:"Geely",      score:0.48, mentions:240,  trend:"Rising",  color:"#ef4444" },
                ].map((b,i) => (
                  <div key={i} style={{ flex:1, background:"rgba(255,255,255,0.03)", borderRadius:10, padding:14, textAlign:"center" }}>
                    <div style={{ fontSize:12, fontWeight:700, color:"#e2e8f0", marginBottom:8 }}>{b.brand}</div>
                    <div style={{ fontSize:20, fontWeight:900, color:b.color, marginBottom:4 }}>{b.score.toFixed(2)}</div>
                    <div style={{ fontSize:10, color:"#64748b", marginBottom:8 }}>{b.mentions.toLocaleString()} mentions</div>
                    <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:4, height:3 }}>
                      <div style={{ background:b.color, height:3, borderRadius:4, width:`${(b.score+1)/2*100}%` }} />
                    </div>
                    <div style={{ fontSize:9, color:b.trend.includes("↑")?"#f97316":"#64748b", marginTop:6, fontWeight:600 }}>{b.trend}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            DASHBOARD 5 — BUYER MATCHER
        ════════════════════════════════════════ */}
        {activeTab === "buyers" && (
          <div>
            <h1 style={{ fontSize:26, fontWeight:800, color:"#fbbf24", margin:"0 0 6px" }}>Buyer–Listing Matcher</h1>
            <p style={{ fontSize:13, color:"#64748b", margin:"0 0 24px" }}>47 buyers ready to purchase · Matched against current inventory</p>

            <div style={{ display:"grid", gap:16 }}>
              {buyers.map((b,i) => (
                <div key={i} style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:20, display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:20, alignItems:"center" }}>
                  {/* Buyer Info */}
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
                      <div style={{ width:42, height:42, borderRadius:"50%", background:`linear-gradient(135deg,${b.score>88?"#f59e0b":"#3b82f6"},${b.score>88?"#d97706":"#1d4ed8"})`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:16, color:"white" }}>
                        {b.name.split(" ")[0][0]}
                      </div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:14, color:"#e2e8f0" }}>{b.name}</div>
                        <div style={{ fontSize:11, color:"#64748b" }}>{b.nationality}</div>
                      </div>
                    </div>
                    <div style={{ fontSize:12, color:"#94a3b8" }}>💰 Budget: <span style={{ color:"#fbbf24", fontWeight:700 }}>QAR {b.budget.toLocaleString()}</span></div>
                    <div style={{ fontSize:12, color:"#94a3b8", marginTop:4 }}>🚗 Wants: <span style={{ color:"#e2e8f0" }}>{b.wants}</span></div>
                    <div style={{ fontSize:12, color:"#94a3b8", marginTop:4 }}>⏱ Upgrade in: <span style={{ color:b.upgrade.includes("8")||b.upgrade.includes("5")?"#ef4444":"#f59e0b", fontWeight:700 }}>{b.upgrade}</span></div>
                  </div>

                  {/* Match Score */}
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:11, color:"#64748b", marginBottom:8, letterSpacing:"0.05em" }}>MATCH SCORE</div>
                    <div style={{ position:"relative", display:"inline-block" }}>
                      <svg width="90" height="90" viewBox="0 0 90 90">
                        <circle cx="45" cy="45" r="36" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
                        <circle cx="45" cy="45" r="36" fill="none" stroke={b.score>88?"#22c55e":b.score>75?"#f59e0b":"#f97316"} strokeWidth="8"
                          strokeDasharray={`${2*Math.PI*36*b.score/100} ${2*Math.PI*36*(1-b.score/100)}`}
                          strokeLinecap="round" transform="rotate(-90 45 45)" />
                        <text x="45" y="48" textAnchor="middle" fontSize="20" fontWeight="800" fill={b.score>88?"#22c55e":b.score>75?"#f59e0b":"#f97316"}>{b.score}%</text>
                      </svg>
                    </div>
                    <div style={{ fontSize:11, background: b.status==="Ready Now"?"rgba(34,197,94,0.15)":"rgba(245,158,11,0.15)", color:b.status==="Ready Now"?"#22c55e":"#f59e0b", borderRadius:6, padding:"4px 12px", display:"inline-block", fontWeight:700, marginTop:4 }}>
                      {b.status}
                    </div>
                  </div>

                  {/* Action */}
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    <button style={{ background:"linear-gradient(135deg,#22c55e,#16a34a)", border:"none", borderRadius:10, padding:"10px 16px", color:"white", fontWeight:700, fontSize:12, cursor:"pointer", textAlign:"left" }}>
                      💬 Send WhatsApp
                    </button>
                    <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:8, padding:10, fontSize:11, color:"#94a3b8", lineHeight:1.6 }}>
                      "Hi {b.name.split(" ")[0]}, we have a {b.wants} that matches exactly what you're looking for. Available now — price within your budget. Interested?"
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            DASHBOARD 6 — AI CHAT
        ════════════════════════════════════════ */}
        {activeTab === "chat" && (
          <div style={{ maxWidth:820, margin:"0 auto" }}>
            <h1 style={{ fontSize:26, fontWeight:800, color:"#fbbf24", margin:"0 0 6px" }}>QAUTO-AI Advisor</h1>
            <p style={{ fontSize:13, color:"#64748b", margin:"0 0 20px" }}>Ask anything in English or Arabic · Powered by all 10 datasets</p>

            {/* Example Questions */}
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
              {["What should I buy this month?","Which cars are at risk?","Best time to sell a Prado?","Why aren't my red cars selling?"].map(q=>(
                <button key={q} onClick={()=>setChatInput(q)} style={{ background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.25)", borderRadius:20, padding:"6px 14px", color:"#f59e0b", fontSize:12, cursor:"pointer", fontWeight:500 }}>{q}</button>
              ))}
            </div>

            {/* Chat Window */}
            <div style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:20, minHeight:420, marginBottom:16, display:"flex", flexDirection:"column", gap:14 }}>
              {messages.map((m,i) => (
                <div key={i} style={{ display:"flex", gap:12, justifyContent: m.role==="user"?"flex-end":"flex-start" }}>
                  {m.role==="ai" && (
                    <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#f59e0b,#d97706)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>🤖</div>
                  )}
                  <div style={{
                    maxWidth:"75%", padding:"12px 16px", borderRadius: m.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",
                    background: m.role==="user" ? "linear-gradient(135deg,#1d4ed8,#1e40af)" : "rgba(255,255,255,0.05)",
                    border: m.role==="ai" ? "1px solid rgba(255,255,255,0.08)" : "none",
                    fontSize:13, color:"#e2e8f0", lineHeight:1.7, whiteSpace:"pre-line"
                  }}>
                    {m.text}
                    {m.role==="ai" && (
                      <div style={{ fontSize:10, color:"#475569", marginTop:8, borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:8 }}>
                        📊 Sources: [INVENTORY] [SALES] [ECONOMICS] [CALENDAR] [TRENDS]
                      </div>
                    )}
                  </div>
                  {m.role==="user" && (
                    <div style={{ width:36, height:36, borderRadius:10, background:"#1d4ed8", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>👤</div>
                  )}
                </div>
              ))}
            </div>

            {/* Input */}
            <div style={{ display:"flex", gap:10 }}>
              <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()}
                placeholder="Ask in English or Arabic... e.g. ما هي أفضل سيارة للشراء؟"
                style={{ flex:1, background:"#111827", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"12px 16px", color:"#e2e8f0", fontSize:13, outline:"none" }} />
              <button onClick={sendChat} style={{ background:"linear-gradient(135deg,#f59e0b,#d97706)", border:"none", borderRadius:12, padding:"12px 20px", color:"#0a0e1a", fontWeight:800, fontSize:13, cursor:"pointer" }}>
                Send ➤
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            DASHBOARD 7 — COMPETITOR PRICE MATCHING
        ════════════════════════════════════════ */}
        {activeTab === "competitor" && (() => {
          const filtered = competitorData
            .filter(c => compFilter === "All" || c.model.includes(compFilter))
            .filter(c => !compSearch || c.model.toLowerCase().includes(compSearch.toLowerCase()) || c.dealer.toLowerCase().includes(compSearch.toLowerCase()))
            .map(c => ({ ...c, gap: c.our_price - c.price, gapPct: Math.round(((c.our_price - c.price) / c.price) * 100) }))
            .sort((a, b) => compSort === "gap" ? Math.abs(b.gap) - Math.abs(a.gap) : compSort === "price" ? a.price - b.price : b.days_listed - a.days_listed);

          const underUs   = filtered.filter(c => c.price < c.our_price).length;
          const overUs    = filtered.filter(c => c.price > c.our_price).length;
          const sameas    = filtered.filter(c => Math.abs(c.gap) <= 3000).length;
          const avgGap    = Math.round(filtered.reduce((s,c)=>s+c.gap,0)/filtered.length);
          const cheapest  = [...filtered].sort((a,b)=>a.price-b.price)[0];
          const mostStale = [...filtered].sort((a,b)=>b.days_listed-a.days_listed)[0];

          return (
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:20 }}>
                <div>
                  <h1 style={{ fontSize:26, fontWeight:800, color:"#fbbf24", margin:0 }}>⚔️ Competitor Price Matching</h1>
                  <p style={{ fontSize:13, color:"#64748b", margin:"4px 0 0" }}>Live competitor listings vs your prices · Source: Dubizzle, OpenSooq, Cars24, WhatsApp</p>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <input value={compSearch} onChange={e=>setCompSearch(e.target.value)} placeholder="Search model or dealer..."
                    style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"8px 14px", color:"#e2e8f0", fontSize:12, outline:"none", width:220 }} />
                </div>
              </div>

              {/* KPI Row */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:14, marginBottom:24 }}>
                {[
                  { label:"Total Competitors", value:filtered.length,  color:"#3b82f6",  icon:"🏢", sub:"Active listings tracked" },
                  { label:"Cheaper Than Us",   value:underUs,          color:"#ef4444",  icon:"📉", sub:"Price below our listing" },
                  { label:"More Expensive",    value:overUs,           color:"#22c55e",  icon:"📈", sub:"We're cheaper — advantage" },
                  { label:"Avg Price Gap",     value:(avgGap>0?"+":"")+"QAR "+Math.abs(avgGap).toLocaleString(), color: avgGap>=0?"#22c55e":"#ef4444", icon:"💱", sub: avgGap>=0?"We are below market":"We are above market" },
                  { label:"Stale Listing",     value:mostStale?.dealer, color:"#f59e0b", icon:"⏳", sub:`${mostStale?.days_listed} days listed — may drop price` },
                ].map((k,i) => (
                  <div key={i} style={{ background:"#111827", border:`1px solid ${k.color}25`, borderRadius:14, padding:16 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                      <span style={{ fontSize:20 }}>{k.icon}</span>
                      <span style={{ fontSize:10, color:"#475569", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.04em" }}>{k.label}</span>
                    </div>
                    <div style={{ fontSize:i===4?13:22, fontWeight:800, color:k.color, marginBottom:4 }}>{k.value}</div>
                    <div style={{ fontSize:10, color:"#475569" }}>{k.sub}</div>
                  </div>
                ))}
              </div>

              {/* Alert Banners */}
              {filtered.filter(c=>c.gap > 10000).length > 0 && (
                <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:12, padding:"12px 18px", marginBottom:14, display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:20 }}>🚨</span>
                  <div>
                    <span style={{ fontWeight:700, color:"#ef4444", fontSize:13 }}>Price Alert: </span>
                    <span style={{ fontSize:13, color:"#94a3b8" }}>
                      {filtered.filter(c=>c.gap>10000).length} competitor(s) are listing the same models for <strong style={{color:"#ef4444"}}>QAR 10,000+ cheaper</strong> than your price. Review immediately.
                    </span>
                  </div>
                </div>
              )}
              {filtered.filter(c=>c.days_listed>45).length > 0 && (
                <div style={{ background:"rgba(245,158,11,0.07)", border:"1px solid rgba(245,158,11,0.25)", borderRadius:12, padding:"12px 18px", marginBottom:20, display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:20 }}>⏳</span>
                  <div>
                    <span style={{ fontWeight:700, color:"#f59e0b", fontSize:13 }}>Opportunity: </span>
                    <span style={{ fontSize:13, color:"#94a3b8" }}>
                      {filtered.filter(c=>c.days_listed>45).length} competitor listing(s) have been sitting <strong style={{color:"#f59e0b"}}>45+ days unsold</strong>. They will likely drop price soon — hold or undercut.
                    </span>
                  </div>
                </div>
              )}

              {/* Model Filter Pills */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {["All","Land Cruiser","Prado","Lexus","Patrol","Hilux","Fortuner"].map(f=>(
                    <button key={f} onClick={()=>setCompFilter(f)} style={{
                      padding:"6px 14px", borderRadius:20, border:"none", cursor:"pointer", fontSize:12, fontWeight:600, transition:"all 0.2s",
                      background:compFilter===f?"#f59e0b":"rgba(255,255,255,0.05)",
                      color:compFilter===f?"#0a0e1a":"#94a3b8"
                    }}>{f}</button>
                  ))}
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <span style={{ fontSize:11, color:"#64748b" }}>Sort by:</span>
                  {[["gap","Price Gap"],["price","Lowest Price"],["days_listed","Stale First"]].map(([v,l])=>(
                    <button key={v} onClick={()=>setCompSort(v)} style={{ padding:"5px 11px", borderRadius:6, border:"none", cursor:"pointer", fontSize:11,
                      background:compSort===v?"rgba(245,158,11,0.2)":"rgba(255,255,255,0.04)",
                      color:compSort===v?"#f59e0b":"#64748b" }}>{l}</button>
                  ))}
                </div>
              </div>

              {/* Competitor Cards */}
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {filtered.map((c,i) => {
                  const cheaper  = c.price < c.our_price;
                  const bigGap   = Math.abs(c.gap) > 10000;
                  const stale    = c.days_listed > 30;
                  const borderCol = cheaper && bigGap ? "#ef4444" : !cheaper ? "#22c55e" : "#f59e0b";

                  return (
                    <div key={c.id} style={{ background:"#111827", border:`1px solid ${borderCol}25`, borderRadius:14, padding:18, transition:"border 0.2s" }}
                         onMouseEnter={e=>e.currentTarget.style.borderColor=borderCol+"60"}
                         onMouseLeave={e=>e.currentTarget.style.borderColor=borderCol+"25"}>
                      <div style={{ display:"grid", gridTemplateColumns:"2.2fr 1fr 1fr 1fr 1.2fr 1.3fr", gap:16, alignItems:"center" }}>

                        {/* Dealer + Car */}
                        <div>
                          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                            <div style={{ width:32, height:32, borderRadius:8, background:`${platformColors[c.platform] || "#475569"}22`, border:`1px solid ${platformColors[c.platform] || "#475569"}50`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>
                              {c.platform==="Dubizzle"?"D":c.platform==="OpenSooq"?"O":c.platform==="Cars24"?"C":"W"}
                            </div>
                            <div>
                              <div style={{ fontWeight:700, fontSize:13, color:"#e2e8f0" }}>{c.dealer}</div>
                              <div style={{ fontSize:10, color: platformColors[c.platform]||"#64748b", fontWeight:600 }}>{c.platform} · {c.location}</div>
                            </div>
                          </div>
                          <div style={{ fontSize:13, color:"#94a3b8" }}>{c.model} <span style={{color:"#64748b"}}>{c.trim}</span></div>
                          <div style={{ fontSize:11, color:"#475569", marginTop:2 }}>{c.year} · {c.color} · {c.mileage.toLocaleString()} km</div>
                        </div>

                        {/* Their Price */}
                        <div>
                          <div style={{ fontSize:10, color:"#64748b", marginBottom:4, letterSpacing:"0.05em" }}>THEIR PRICE</div>
                          <div style={{ fontSize:17, fontWeight:800, color:"#e2e8f0" }}>QAR {c.price.toLocaleString()}</div>
                          <div style={{ fontSize:10, color:"#475569", marginTop:2 }}>{c.days_listed}d listed {stale ? "⏳" : ""}</div>
                        </div>

                        {/* Our Price */}
                        <div>
                          <div style={{ fontSize:10, color:"#64748b", marginBottom:4, letterSpacing:"0.05em" }}>OUR PRICE</div>
                          <div style={{ fontSize:17, fontWeight:800, color:"#3b82f6" }}>QAR {c.our_price.toLocaleString()}</div>
                        </div>

                        {/* Gap */}
                        <div>
                          <div style={{ fontSize:10, color:"#64748b", marginBottom:4, letterSpacing:"0.05em" }}>PRICE GAP</div>
                          <div style={{ fontSize:17, fontWeight:800, color: cheaper ? "#ef4444" : "#22c55e" }}>
                            {cheaper ? "▼" : "▲"} QAR {Math.abs(c.gap).toLocaleString()}
                          </div>
                          <div style={{ fontSize:10, color:"#475569" }}>{cheaper?"They're cheaper":"We're cheaper"} by {Math.abs(c.gapPct)}%</div>
                        </div>

                        {/* Position Badge */}
                        <div style={{ textAlign:"center" }}>
                          <div style={{ fontSize:10, color:"#64748b", marginBottom:6, letterSpacing:"0.05em" }}>POSITION</div>
                          <span style={{
                            fontSize:11, fontWeight:800, borderRadius:8, padding:"5px 12px", display:"inline-block",
                            background: cheaper && bigGap ? "rgba(239,68,68,0.15)" : cheaper ? "rgba(249,115,22,0.12)" : "rgba(34,197,94,0.12)",
                            color:       cheaper && bigGap ? "#ef4444"               : cheaper ? "#f97316"              : "#22c55e",
                            border:`1px solid ${cheaper && bigGap ? "#ef444430" : cheaper ? "#f9731630" : "#22c55e30"}`
                          }}>
                            {cheaper && bigGap ? "🔴 UNDERCUT" : cheaper ? "⚠️ LOWER" : "🟢 ADVANTAGE"}
                          </span>
                        </div>

                        {/* AI Action */}
                        <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:10, padding:"10px 12px" }}>
                          <div style={{ fontSize:10, color:"#64748b", marginBottom:5, fontWeight:600 }}>🤖 AI ACTION</div>
                          <div style={{ fontSize:11, color:"#94a3b8", lineHeight:1.6 }}>
                            {cheaper && bigGap
                              ? `Drop price to QAR ${(c.price - 1000).toLocaleString()} to undercut. Likely losing buyers now.`
                              : cheaper
                              ? `Monitor. Within normal range. Their listing is ${c.days_listed}d old.`
                              : stale
                              ? `Hold price. Their listing stale (${c.days_listed}d) — buyer will come to you.`
                              : `Hold price. You're QAR ${Math.abs(c.gap).toLocaleString()} cheaper — strong position.`}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Platform Summary */}
              <div style={{ marginTop:24, background:"#111827", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:20 }}>
                <div style={{ fontWeight:700, fontSize:14, color:"#e2e8f0", marginBottom:16 }}>Listings by Platform</div>
                <div style={{ display:"flex", gap:16 }}>
                  {Object.entries(
                    competitorData.reduce((acc,c)=>{ acc[c.platform]=(acc[c.platform]||0)+1; return acc; }, {})
                  ).map(([platform, count]) => (
                    <div key={platform} style={{ flex:1, background:"rgba(255,255,255,0.03)", borderRadius:10, padding:16, textAlign:"center", border:`1px solid ${platformColors[platform]||"#475569"}30` }}>
                      <div style={{ fontSize:22, fontWeight:900, color:platformColors[platform]||"#94a3b8" }}>{count}</div>
                      <div style={{ fontSize:12, color:"#e2e8f0", fontWeight:600, marginTop:4 }}>{platform}</div>
                      <div style={{ fontSize:10, color:"#475569", marginTop:2 }}>
                        Avg: QAR {Math.round(competitorData.filter(c=>c.platform===platform).reduce((s,c)=>s+c.price,0)/count).toLocaleString()}
                      </div>
                      <div style={{ marginTop:8, background:"rgba(255,255,255,0.05)", borderRadius:4, height:4 }}>
                        <div style={{ background:platformColors[platform]||"#475569", height:4, borderRadius:4, width:`${(count/competitorData.length)*100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
}
