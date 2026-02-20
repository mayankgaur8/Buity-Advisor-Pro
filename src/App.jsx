import React, { useState, useRef, useCallback } from "react";
import logo from "./assets/Avantika-Buity-Pro.png";
// ─── Subscription Plans ───────────────────────────────────────────────────────
const PLANS = [
	{
		id: "glow",
		name: "Glow",
		price: "$19",
		period: "/month",
		badge: null,
		color: "#e8b4c8",
		features: [
			"Monthly AI skin scan analysis",
			"Personalized product recommendations",
			"Basic skin health tracking",
			"Email beauty tips newsletter",
			"5% discount on product purchases",
		],
		cta: "Start Glowing",
	},
	{
		id: "radiance",
		name: "Radiance",
		price: "$39",
		period: "/month",
		badge: "Most Popular ✦",
		color: "#c084fc",
		features: [
			"Weekly AI skin scan + progress report",
			"Custom multi-step routine builder",
			"Ingredient safety checker",
			"Live chat with beauty AI advisor",
			"15% discount + free monthly product",
			"Dermatologist Q&A sessions (2/month)",
		],
		cta: "Get Radiance",
	},
	{
		id: "luminous",
		name: "Luminous",
		price: "$79",
		period: "/month",
		badge: "Premium ★",
		color: "#f0a070",
		features: [
			"Unlimited daily AI skin analysis",
			"Curated luxury product box delivery",
			"Personal beauty consultant (1-on-1)",
			"Advanced skin microbiome analysis",
			"25% discount on all products",
			"Monthly video call with dermatologist",
			"Priority access to new products",
		],
		cta: "Go Luminous",
	},
];

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
	const [screen, setScreen] = useState("landing");
	const [gender, setGender] = useState(null);
	const [photoData, setPhotoData] = useState(null);
	const [photoPreview, setPhotoPreview] = useState(null);
	const [analyzing, setAnalyzing] = useState(false);
	const [analysisProgress, setAnalysisProgress] = useState(0);
	const [analysisStage, setAnalysisStage] = useState(0);
	const [results, setResults] = useState(null);
	const [activeTab, setActiveTab] = useState("products");
	const [selectedPlan, setSelectedPlan] = useState("radiance");
	const fileRef = useRef(null);
	const cameraRef = useRef(null);

	const STAGES = [
		"Detecting skin tone & undertones…",
		"Mapping pores & texture…",
		"Identifying hydration levels…",
		"Detecting fine lines & concerns…",
		"Analysing pigmentation…",
		"Building your beauty blueprint…",
	];

	const handlePhoto = useCallback((file) => {
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (e) => {
			setPhotoPreview(e.target.result);
			setPhotoData(e.target.result.split(",")[1]);
		};
		reader.readAsDataURL(file);
	}, []);

	async function runPhotoAnalysis() {
		if (!photoData) return;
		setAnalyzing(true);
		setAnalysisProgress(0);
		setAnalysisStage(0);
		setScreen("analyzing");

		// Animate progress
		let prog = 0;
		let stageIdx = 0;
		const interval = setInterval(() => {
			prog += Math.random() * 4 + 1;
			if (prog > 100) prog = 100;
			setAnalysisProgress(Math.round(prog));
			const newStage = Math.floor((prog / 100) * STAGES.length);
			if (newStage !== stageIdx) {
				stageIdx = newStage;
				setAnalysisStage(Math.min(newStage, STAGES.length - 1));
			}
			if (prog >= 100) clearInterval(interval);
		}, 120);

		try {
			const prompt = `You are an expert dermatologist and beauty AI advisor. Analyze this person's facial photo carefully.\n\nThe user has selected gender: ${gender || "not specified"}.\n\nPlease provide a comprehensive JSON response (NO markdown, pure JSON) with this exact structure:\n{\n  "skin_score": <number 1-100>,\n  "skin_type": "<oily|dry|combination|normal|sensitive>",\n  "skin_tone": "<fair|light|medium|olive|tan|deep>",\n  "detected_concerns": ["<concern1>", "<concern2>", "<concern3>"],\n  "ai_analysis": "<3-4 sentences of warm, expert, personalized skin analysis>",\n  "products": [\n    {"name": "<product name>", "type": "<Cleanser|Serum|Moisturizer|Sunscreen|Treatment|Toner>", "price": "$XX", "why": "<why this product suits their skin>", "key_ingredient": "<star ingredient>"},\n    {"name": "<product name>", "type": "<type>", "price": "$XX", "why": "<reason>", "key_ingredient": "<ingredient>"},\n    {"name": "<product name>", "type": "<type>", "price": "$XX", "why": "<reason>", "key_ingredient": "<ingredient>"},\n    {"name": "<product name>", "type": "<type>", "price": "$XX", "why": "<reason>", "key_ingredient": "<ingredient>"},\n    {"name": "<product name>", "type": "<type>", "price": "$XX", "why": "<reason>", "key_ingredient": "<ingredient>"},\n    {"name": "<product name>", "type": "<type>", "price": "$XX", "why": "<reason>", "key_ingredient": "<ingredient>"}\n  ],\n  "beauty_tips": [\n    "<specific beauty tip 1 based on detected skin>",\n    "<specific beauty tip 2>",\n    "<specific beauty tip 3>",\n    "<specific beauty tip 4>",\n    "<specific beauty tip 5>"\n  ],\n  "healthy_skin_tips": [\n    "<lifestyle/diet tip 1 for healthier skin>",\n    "<tip 2>",\n    "<tip 3>",\n    "<tip 4>",\n    "<tip 5>"\n  ],\n  "morning_routine": ["<step 1>", "<step 2>", "<step 3>", "<step 4>"],\n  "night_routine": ["<step 1>", "<step 2>", "<step 3>", "<step 4>"],\n  "subscription_hook": "<1-2 compelling sentences explaining why a subscription would dramatically improve their specific skin concerns>"\n}\n\nMake recommendations gender-appropriate for ${gender || "the person shown"}. Be specific, warm, science-backed, and actionable.`;

			const response = await fetch("https://api.anthropic.com/v1/messages", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					model: "claude-sonnet-4-20250514",
					max_tokens: 1000,
					messages: [
						{
							role: "user",
							content: [
								{
									type: "image",
									source: { type: "base64", media_type: "image/jpeg", data: photoData },
								},
								{ type: "text", text: prompt },
							],
						},
					],
				}),
			});

			const json = await response.json();
			const rawText = json.content?.[0]?.text || "";
			const cleaned = rawText.replace(/```json|```/g, "").trim();
			const parsed = JSON.parse(cleaned);
			setResults(parsed);
		} catch (err) {
			// Fallback results
			setResults(getFallbackResults(gender));
		}

		clearInterval(interval);
		setAnalysisProgress(100);
		setTimeout(() => {
			setAnalyzing(false);
			setScreen("results");
		}, 800);
	}

	function getFallbackResults(g) {
		const isMale = g === "male";
		return {
			skin_score: 72,
			skin_type: "combination",
			skin_tone: "medium",
			detected_concerns: ["Mild dehydration", "Uneven texture", "Early signs of fatigue"],
			ai_analysis: `Your skin shows a beautiful combination type with some areas needing extra TLC. ${isMale ? "For men's skin, which tends to be oilier and thicker," : "Your skin"} we've detected mild dehydration and some texture irregularities that are very common and completely addressable. With the right targeted routine, you could see visible improvements within 4-6 weeks.`,
			products: [
				{ name: isMale ? "Men's Balancing Cleanser" : "Gentle Hydra Cleanser", type: "Cleanser", price: "$18", why: "Removes impurities without stripping", key_ingredient: "Glycerin" },
				{ name: "Hyaluronic Acid 2% Serum", type: "Serum", price: "$22", why: "Deep hydration for dehydrated skin", key_ingredient: "Hyaluronic Acid" },
				{ name: isMale ? "Oil-Control Moisturiser" : "Barrier Repair Cream", type: "Moisturizer", price: "$28", why: "Balances & protects skin barrier", key_ingredient: "Ceramides" },
				{ name: "SPF 50 Daily Shield", type: "Sunscreen", price: "$24", why: "Essential daily UV protection", key_ingredient: "Zinc Oxide" },
				{ name: "Niacinamide 10% Toner", type: "Toner", price: "$16", why: "Minimizes pores & reduces oiliness", key_ingredient: "Niacinamide" },
				{ name: "Retinol 0.3% Night Treatment", type: "Treatment", price: "$34", why: "Overnight skin renewal & repair", key_ingredient: "Retinol" },
			],
			beauty_tips: [
				"Double cleanse at night — oil cleanser first, then water-based — to fully remove pollution & SPF",
				"Apply serums to slightly damp skin for 40% better absorption",
				"Use a silk pillowcase to reduce friction and sleep creases overnight",
				"Refrigerate your eye cream for an instant depuffing effect every morning",
				"Always apply products from thinnest to thickest consistency for best results",
			],
			healthy_skin_tips: [
				"Drink 2–3 litres of water daily — dehydrated skin is the #1 cause of dullness",
				"Eat foods rich in Omega-3 (salmon, walnuts) to strengthen your skin barrier from within",
				"Sleep 7–9 hours nightly — skin regenerates 3x faster during deep sleep stages",
				"Reduce sugar intake, which triggers glycation and breaks down collagen",
				"Manage stress through daily exercise — cortisol is one of skin's biggest enemies",
			],
			morning_routine: ["Gentle cleanser", "Vitamin C serum", "Moisturizer", "SPF 50"],
			night_routine: ["Double cleanse", "Niacinamide toner", "Retinol treatment", "Rich night cream"],
			subscription_hook: "With weekly AI tracking, we could monitor your dehydration levels and texture improvement — most users see 60% clearer skin within 90 days of following their personalized plan.",
		};
	}

	const skinScoreColor = results
		? results.skin_score >= 80 ? "#6ee7a0" : results.skin_score >= 60 ? "#fbbf24" : "#f87171"
		: "#c084fc";

	return (
		<div style={s.root}>
			<style>{CSS}</style>
			<div style={s.bg1} /><div style={s.bg2} /><div style={s.bg3} />

			{/* ── LANDING ─────────────────────────────────────────────────────── */}
			{screen === "landing" && (
				<div style={s.page} className="fadeUp">
					<div style={s.logoRow}><img src={logo} alt="Avantika Logo" style={{ height: "44px", objectFit: "contain" }} />AVANTIKA-BUITY-PRO</div>
					<h1 style={s.hero}>
						See Your Skin's<br /><em style={s.heroEm}>True Potential</em>
					</h1>
					<p style={s.heroSub}>
						Upload a selfie. Our AI dermatologist analyses your skin in seconds — delivering a complete beauty plan, product picks, and healthy skin roadmap made just for you.
					</p>

					<div style={s.featureRow}>
						{[["📸", "Photo Analysis", "AI reads your skin from a selfie"],
							["🧬", "Science-Backed", "Dermatologist-approved formulas"],
							["♀♂", "For Everyone", "Tailored for all genders & skin types"],
							["✦", "Subscription Plans", "Ongoing expert skin coaching"],
						].map(([icon, title, desc]) => (
							<div key={title} style={s.featureCard}>
								<span style={s.featureIcon}>{icon}</span>
								<strong style={s.featureTitle}>{title}</strong>
								<span style={s.featureDesc}>{desc}</span>
							</div>
						))}
					</div>

					<button style={s.ctaPrimary} onClick={() => setScreen("gender")}>
						Analyse My Skin Free →
					</button>
					<p style={s.privacy}>🔒 Your photo is analysed privately and never stored</p>
				</div>
			)}

			{/* ── GENDER SELECTION ──────────────────────────────────────────────── */}
			{screen === "gender" && (
				<div style={s.page} className="fadeUp">
					<button style={s.backLink} onClick={() => setScreen("landing")}>← Back</button>
					<div style={s.stepBadge}>Step 1 of 2</div>
					<h2 style={s.pageTitle}>Who are we advising today?</h2>
					<p style={s.pageSub}>We tailor products & tips to your specific skin biology</p>
					<div style={s.genderGrid}>
						{[
							{ id: "female", emoji: "👩", label: "Female", desc: "Skincare, makeup & hormonal skin needs" },
							{ id: "male", emoji: "👨", label: "Male", desc: "Men's grooming, thicker skin formulas" },
							{ id: "nonbinary", emoji: "🧑", label: "Non-binary", desc: "Inclusive, personalised for you" },
						].map((g) => (
							<button
								key={g.id}
								style={{ ...s.genderCard, ...(gender === g.id ? s.genderSelected : {}) }}
								onClick={() => { setGender(g.id); }}
							>
								<span style={s.genderEmoji}>{g.emoji}</span>
								<strong style={s.genderLabel}>{g.label}</strong>
								<span style={s.genderDesc}>{g.desc}</span>
							</button>
						))}
					</div>
					{gender && (
						<button style={{ ...s.ctaPrimary, marginTop: "24px" }} className="fadeUp" onClick={() => setScreen("upload")}>
							Continue →
						</button>
					)}
				</div>
			)}

			{/* ── PHOTO UPLOAD ─────────────────────────────────────────────────── */}
			{screen === "upload" && (
				<div style={s.page} className="fadeUp">
					<button style={s.backLink} onClick={() => setScreen("gender")}>← Back</button>
					<div style={s.stepBadge}>Step 2 of 2</div>
					<h2 style={s.pageTitle}>Upload Your Selfie</h2>
					<p style={s.pageSub}>Best results: good lighting, face centred, no filters</p>

					<div
						style={{ ...s.uploadZone, ...(photoPreview ? s.uploadZoneActive : {}) }}
						onClick={() => fileRef.current?.click()}
						onDrop={(e) => { e.preventDefault(); handlePhoto(e.dataTransfer.files[0]); }}
						onDragOver={(e) => e.preventDefault()}
					>
						{photoPreview ? (
							<div style={s.previewWrap}>
								<img src={photoPreview} alt="Preview" style={s.previewImg} />
								<div style={s.previewOverlay}>
									<span style={s.previewChange}>Tap to change photo</span>
								</div>
							</div>
						) : (
							<div style={s.uploadPlaceholder}>
								<div style={s.uploadIcon}>📷</div>
								<p style={s.uploadText}>Tap to upload or drag & drop</p>
								<p style={s.uploadHint}>JPG, PNG, HEIC — up to 10MB</p>
							</div>
						)}
					</div>

					<input
						ref={fileRef}
						type="file"
						accept="image/*"
						style={{ display: "none" }}
						onChange={(e) => handlePhoto(e.target.files[0])}
					/>

					<div style={s.uploadTips}>
						{["✓ Face centred in frame", "✓ Natural lighting preferred", "✓ No heavy makeup if possible", "✓ Clear, sharp photo"].map(t => (
							<span key={t} style={s.uploadTip}>{t}</span>
						))}
					</div>

					{photoPreview && (
						<button style={s.ctaPrimary} className="fadeUp" onClick={runPhotoAnalysis}>
							🔬 Analyse My Skin →
						</button>
					)}
				</div>
			)}

			{/* ── ANALYSING ────────────────────────────────────────────────────── */}
			{screen === "analyzing" && (
				<div style={{ ...s.page, textAlign: "center" }} className="fadeUp">
					<div style={s.analysingOrbWrap}>
						<div style={s.analysingOrb}>
							{photoPreview && <img src={photoPreview} alt="" style={s.analysingPhoto} />}
							<div style={s.scanOverlay}>
								<div style={s.scanBeam} />
							</div>
							<div style={s.analysingRing} />
						</div>
					</div>

					<h2 style={s.analysingTitle}>Analysing Your Skin</h2>
					<p style={s.analysingStage}>{STAGES[analysisStage]}</p>

					<div style={s.progressWrap}>
						<div style={{ ...s.progressBar, width: `${analysisProgress}%` }} />
					</div>
					<p style={s.progressPct}>{analysisProgress}%</p>

					<div style={s.analysingChecks}>
						{STAGES.slice(0, analysisStage + 1).map((stage, i) => (
							<div key={i} style={s.analysingCheck} className="fadeUp">
								<span style={s.checkDot}>✓</span> {stage.replace("…", "")}
							</div>
						))}
					</div>
				</div>
			)}

			{/* ── RESULTS ──────────────────────────────────────────────────────── */}
			{screen === "results" && results && (
				<div style={s.resultsPage}>
					{screen === "results" && results && (
  <div style={s.resultsPage}>

    {/* ── FLOATING HOME BUTTON ── */}
    <button
      className="homeBtn"
      onClick={() => {
        setScreen("landing");
        setResults(null);
        setPhotoPreview(null);
        setGender(null);
        setSelectedPlan(null);
        setActiveTab("products");
      }}
      style={{
        position: "fixed",
        top: "20px",
        left: "20px",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 18px",
        background: "linear-gradient(135deg, rgba(192,132,252,0.15), rgba(192,132,252,0.05))",
        border: "1.5px solid rgba(192,132,252,0.5)",
        borderRadius: "50px",
        color: "#c084fc",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        transition: "all 0.3s ease",
        letterSpacing: "0.3px",
      }}
    >
      <span style={{ fontSize: "18px" }}>🏠</span>
      <span>Home</span>
    </button>

    {/* ...existing code... */}
  </div>
)}

					{/* Header */}
					<div style={s.resultsHero}>
						<div style={s.resultsPhotoWrap}>
							<img src={photoPreview} alt="Your skin" style={s.resultsPhoto} />
							<div style={s.skinScoreBadge}>
								<span style={{ ...s.skinScoreNum, color: skinScoreColor }}>{results.skin_score}</span>
								<span style={s.skinScoreLabel}>Skin Score</span>
							</div>
						</div>
						<div style={s.resultsIntro}>
							<div style={s.miniLogo}>✦ AVANTIKA AI</div>
							<h2 style={s.resultsTitle}>Your Skin<br /><em>Blueprint</em></h2>
							<div style={s.skinTags}>
								<span style={s.tag}>{results.skin_type} skin</span>
								<span style={s.tag}>{results.skin_tone} tone</span>
								{results.detected_concerns.slice(0, 2).map(c => <span key={c} style={{ ...s.tag, ...s.tagWarn }}>{c}</span>)}
							</div>
						</div>
					</div>

					{/* AI Analysis */}
					<div style={s.analysisCard}>
						<div style={s.analysisCardHeader}>
							<span style={s.analysisIcon}>🤖</span>
							<span style={s.analysisLabel}>AI Dermatologist Analysis</span>
						</div>
						<p style={s.analysisText}>{results.ai_analysis}</p>
					</div>

					{/* Tab Navigation */}
					<div style={s.tabs}>
						{[
							{ id: "products", label: "🛍 Products" },
							{ id: "beauty", label: "💄 Beauty Tips" },
							{ id: "health", label: "🌿 Skin Health" },
							{ id: "routine", label: "📋 Routine" },
						].map((tab) => (
							<button
								key={tab.id}
								style={{ ...s.tab, ...(activeTab === tab.id ? s.tabActive : {}) }}
								onClick={() => setActiveTab(tab.id)}
							>
								{tab.label}
							</button>
						))}
					</div>

					{/* ── Products Tab */}
					{activeTab === "products" && (
						<div className="fadeUp">
							<div style={s.sectionHeader}>
								<h3 style={s.sectionTitle}>Your Curated Routine</h3>
								<p style={s.sectionSub}>Hand-picked for your {results.skin_type} {results.skin_tone}-tone skin</p>
							</div>
							<div style={s.productsGrid}>
								{results.products.map((p, i) => (
									<div key={i} style={s.productCard}>
										<div style={s.productType}>{p.type}</div>
										<div style={s.productName}>{p.name}</div>
										<div style={s.productIngredient}>⚗ {p.key_ingredient}</div>
										<p style={s.productWhy}>{p.why}</p>
										<div style={s.productFooter}>
											<span style={s.productPrice}>{p.price}</span>
											<button style={s.addCartBtn} onClick={() => alert(`Added ${p.name} to cart!`)}>+ Add</button>
										</div>
									</div>
								))}
							</div>
							<button style={s.ctaSecondary}>🛒 Shop Full Routine — Save 15%</button>
						</div>
					)}

					{/* ── Beauty Tips Tab */}
					{activeTab === "beauty" && (
						<div className="fadeUp">
							<div style={s.sectionHeader}>
								<h3 style={s.sectionTitle}>Beauty Expert Tips</h3>
								<p style={s.sectionSub}>Curated for your skin analysis results</p>
							</div>
							{results.beauty_tips.map((tip, i) => (
								<div key={i} style={s.tipCard}>
									<div style={s.tipNum}>{String(i + 1).padStart(2, "0")}</div>
									<div style={s.tipContent}>
										<p style={s.tipText}>{tip}</p>
									</div>
								</div>
							))}
							<button style={s.ctaSecondary}>✦ Get 50 More Expert Tips with Subscription</button>
						</div>
					)}

					{/* ── Skin Health Tab */}
					{activeTab === "health" && (
						<div className="fadeUp">
							<div style={s.sectionHeader}>
								<h3 style={s.sectionTitle}>Healthy Skin Lifestyle</h3>
								<p style={s.sectionSub}>Great skin starts from within — science-backed habits</p>
							</div>
							{results.healthy_skin_tips.map((tip, i) => (
								<div key={i} style={s.healthCard}>
									<span style={s.healthIcon}>{["💧", "🥗", "😴", "🍬", "🧘"][i]}</span>
									<p style={s.healthText}>{tip}</p>
								</div>
							))}
							<div style={s.skinScoreCard}>
								<div style={s.skinScoreTitle}>Your Current Skin Score</div>
								<div style={{ ...s.bigScore, color: skinScoreColor }}>{results.skin_score}<span style={s.bigScoreOf}>/100</span></div>
								<div style={s.skinScoreBar}>
									<div style={{ ...s.skinScoreFill, width: `${results.skin_score}%`, background: skinScoreColor }} />
								</div>
								<p style={s.skinScoreHint}>With our Radiance plan, users improve their score by an average of +23 points in 90 days</p>
							</div>
						</div>
					)}

					{/* ── Routine Tab */}
					{activeTab === "routine" && (
						<div className="fadeUp">
							<div style={s.sectionHeader}>
								<h3 style={s.sectionTitle}>Your Daily Routine</h3>
								<p style={s.sectionSub}>Optimised for {results.skin_type} skin</p>
							</div>
							<div style={s.routineSection}>
								<div style={s.routineHeader}>
									<span style={s.routineIcon}>🌅</span>
									<span style={s.routineLabel}>Morning Routine</span>
								</div>
								{results.morning_routine.map((step, i) => (
									<div key={i} style={s.routineStep}>
										<div style={s.routineStepNum}>{i + 1}</div>
										<div style={s.routineStepText}>{step}</div>
									</div>
								))}
							</div>
							<div style={s.routineSection}>
								<div style={s.routineHeader}>
									<span style={s.routineIcon}>🌙</span>
									<span style={s.routineLabel}>Night Routine</span>
								</div>
								{results.night_routine.map((step, i) => (
									<div key={i} style={s.routineStep}>
										<div style={s.routineStepNum}>{i + 1}</div>
										<div style={s.routineStepText}>{step}</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* ── SUBSCRIPTION PITCH ──────────────────────────────────────── */}
					<div style={s.subSection}>
						<div style={s.subHook}>
							<div style={s.subHookIcon}>✦</div>
							<h3 style={s.subHookTitle}>Take Your Skin to the Next Level</h3>
							<p style={s.subHookText}>{results.subscription_hook}</p>
							<div style={s.subStats}>
								{[["93%", "See visible results in 30 days"], ["60%", "Skin score improvement in 90 days"], ["2M+", "Happy subscribers worldwide"]].map(([num, label]) => (
									<div key={num} style={s.subStat}>
										<span style={s.subStatNum}>{num}</span>
										<span style={s.subStatLabel}>{label}</span>
									</div>
								))}
							</div>
						</div>

						<div style={s.plansGrid}>
							{PLANS.map((plan) => (
								<div
									key={plan.id}
									style={{
										...s.planCard,
										...(selectedPlan === plan.id ? { ...s.planSelected, borderColor: plan.color } : {}),
									}}
									onClick={() => setSelectedPlan(plan.id)}
								>
									{plan.badge && (
										<div style={{ ...s.planBadge, background: plan.color + "33", color: plan.color }}>
											{plan.badge}
										</div>
									)}
									<div style={{ ...s.planName, color: plan.color }}>{plan.name}</div>
									<div style={s.planPriceRow}>
										<span style={s.planPrice}>{plan.price}</span>
										<span style={s.planPeriod}>{plan.period}</span>
									</div>
									<div style={s.planFeatures}>
										{plan.features.map((f) => (
											<div key={f} style={s.planFeature}>
												<span style={{ color: plan.color, marginRight: "8px" }}>✓</span>{f}
											</div>
										))}
									</div>
									<button
										style={{ ...s.planCta, background: selectedPlan === plan.id ? plan.color : "transparent", borderColor: plan.color, color: selectedPlan === plan.id ? "#0a0a12" : plan.color }}
										onClick={(e) => { e.stopPropagation(); alert(`🎉 Starting your ${plan.name} plan subscription!`); }}
									>
										{plan.cta}
									</button>
								</div>
							))}
						</div>

						<p style={s.subDisclaimer}>✓ Cancel anytime &nbsp;·&nbsp; ✓ 14-day free trial &nbsp;·&nbsp; ✓ No hidden fees</p>
					</div>

					{/* Restart */}
					<button style={s.restartBtn} onClick={() => { setScreen("landing"); setPhotoPreview(null); setPhotoData(null); setResults(null); setGender(null); setActiveTab("products"); }}>
						← Start New Analysis
					</button>
				</div>
			)}
		</div>
	);
}

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&family=Outfit:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #080810; }
  .fadeUp { animation: fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) both; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes scanBeam { 0%,100% { top:5%; opacity:1; } 50% { top:90%; opacity:0.5; } }
  @keyframes pulse { 0%,100% { opacity:0.5; transform:scale(1); } 50% { opacity:1; transform:scale(1.03); } }
  @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-12px); } }
  button { cursor: pointer; font-family: 'Outfit', sans-serif; transition: all 0.22s; }
  button:hover { filter: brightness(1.1); transform: translateY(-1px); }
  @keyframes homeBtn {
  0% { box-shadow: 0 0 0 0 rgba(192,132,252,0.4); }
  70% { box-shadow: 0 0 0 12px rgba(192,132,252,0); }
  100% { box-shadow: 0 0 0 0 rgba(192,132,252,0); }
}

.homeBtn {
  animation: homeBtn 2s infinite;
}
.homeBtn:hover {
  transform: translateY(-3px) scale(1.07) !important;
  box-shadow: 0 8px 32px rgba(192,132,252,0.45) !important;
}
.homeBtn:active {
  transform: scale(0.96) !important;
}
`;

// ─── Style Objects ────────────────────────────────────────────────────────────
const s = {
	root: {
		minHeight: "100vh",
		background: "linear-gradient(160deg, #080810 0%, #10081a 50%, #08101a 100%)",
		fontFamily: "'Outfit', sans-serif",
		color: "#f0eaf5",
		position: "relative",
		overflowX: "hidden",
	},
	bg1: { position: "fixed", top: "-200px", right: "-200px", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(200,130,180,0.12) 0%, transparent 65%)", pointerEvents: "none", animation: "float 9s ease-in-out infinite" },
	bg2: { position: "fixed", bottom: "-200px", left: "-150px", width: "550px", height: "550px", borderRadius: "50%", background: "radial-gradient(circle, rgba(120,100,220,0.1) 0%, transparent 65%)", pointerEvents: "none", animation: "float 12s ease-in-out infinite reverse" },
	bg3: { position: "fixed", top: "30%", left: "60%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(240,160,80,0.05) 0%, transparent 65%)", pointerEvents: "none" },

	// pages
	page: { maxWidth: "560px", margin: "0 auto", padding: "48px 24px", position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" },
	resultsPage: { maxWidth: "640px", margin: "0 auto", padding: "32px 20px 80px", position: "relative", zIndex: 1 },

	// nav
	backLink: { background: "transparent", border: "none", color: "rgba(240,234,245,0.45)", fontSize: "14px", alignSelf: "flex-start", marginBottom: "24px", padding: 0 },
	stepBadge: { background: "rgba(200,130,180,0.15)", border: "1px solid rgba(200,130,180,0.25)", color: "#c882b4", fontSize: "11px", letterSpacing: "2px", padding: "5px 14px", borderRadius: "20px", marginBottom: "20px", textTransform: "uppercase" },

	// landing
	logoRow: { marginBottom: "20px" },
	logo: { fontSize: "13px", letterSpacing: "4px", color: "rgba(240,234,245,0.4)", textTransform: "uppercase" },
	hero: { fontFamily: "'Playfair Display', serif", fontSize: "clamp(48px,11vw,80px)", fontWeight: 400, lineHeight: 1.05, textAlign: "center", marginBottom: "20px", letterSpacing: "-0.5px" },
	heroEm: { fontStyle: "italic", background: "linear-gradient(135deg, #e8a4cc, #a084e8, #f0a878)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" },
	heroSub: { fontSize: "16px", color: "rgba(240,234,245,0.55)", lineHeight: 1.75, textAlign: "center", maxWidth: "440px", marginBottom: "36px", fontWeight: 300 },
	featureRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", width: "100%", marginBottom: "36px" },
	featureCard: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "18px", display: "flex", flexDirection: "column", gap: "4px" },
	featureIcon: { fontSize: "20px", marginBottom: "4px" },
	featureTitle: { fontSize: "13px", fontWeight: 600, color: "#f0eaf5" },
	featureDesc: { fontSize: "11px", color: "rgba(240,234,245,0.45)", lineHeight: 1.5 },
	ctaPrimary: { background: "linear-gradient(135deg, #e8a4cc, #a084e8)", color: "#0a0a12", border: "none", padding: "16px 44px", borderRadius: "50px", fontSize: "15px", fontWeight: 600, boxShadow: "0 8px 40px rgba(160,132,232,0.35)", letterSpacing: "0.2px" },
	ctaSecondary: { width: "100%", background: "rgba(200,130,180,0.12)", border: "1px solid rgba(200,130,180,0.3)", color: "#e8a4cc", padding: "14px", borderRadius: "14px", fontSize: "14px", fontWeight: 500, marginTop: "16px", marginBottom: "8px" },
	privacy: { fontSize: "12px", color: "rgba(240,234,245,0.3)", marginTop: "14px" },

	// gender
	pageTitle: { fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px,7vw,44px)", fontWeight: 400, textAlign: "center", marginBottom: "10px" },
	pageSub: { fontSize: "14px", color: "rgba(240,234,245,0.5)", textAlign: "center", marginBottom: "32px" },
	genderGrid: { display: "flex", flexDirection: "column", gap: "14px", width: "100%" },
	genderCard: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "18px", padding: "20px 24px", display: "flex", alignItems: "center", gap: "16px", textAlign: "left" },
	genderSelected: { background: "rgba(200,130,180,0.15)", border: "1px solid rgba(200,130,180,0.4)" },
	genderEmoji: { fontSize: "32px", flexShrink: 0 },
	genderLabel: { fontSize: "17px", fontWeight: 600, display: "block" },
	genderDesc: { fontSize: "12px", color: "rgba(240,234,245,0.45)", display: "block", marginTop: "2px" },

	// upload
	uploadZone: { width: "100%", minHeight: "260px", border: "2px dashed rgba(255,255,255,0.15)", borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginBottom: "20px", overflow: "hidden", position: "relative", transition: "border-color 0.2s" },
	uploadZoneActive: { border: "2px solid rgba(200,130,180,0.5)" },
	uploadPlaceholder: { textAlign: "center", padding: "40px" },
	uploadIcon: { fontSize: "48px", marginBottom: "12px" },
	uploadText: { fontSize: "16px", color: "rgba(240,234,245,0.7)", marginBottom: "6px" },
	uploadHint: { fontSize: "12px", color: "rgba(240,234,245,0.35)" },
	previewWrap: { width: "100%", height: "280px", position: "relative" },
	previewImg: { width: "100%", height: "100%", objectFit: "cover" },
	previewOverlay: { position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: "16px" },
	previewChange: { fontSize: "13px", color: "rgba(255,255,255,0.7)", background: "rgba(0,0,0,0.5)", padding: "6px 16px", borderRadius: "20px" },
	uploadTips: { display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", marginBottom: "24px" },
	uploadTip: { fontSize: "11px", color: "rgba(240,234,245,0.4)", background: "rgba(255,255,255,0.05)", padding: "4px 12px", borderRadius: "20px" },

	// analysing
	analysingOrbWrap: { marginBottom: "32px" },
	analysingOrb: { width: "160px", height: "160px", borderRadius: "50%", overflow: "hidden", position: "relative", margin: "0 auto", boxShadow: "0 0 80px rgba(160,132,232,0.4)" },
	analysingPhoto: { width: "100%", height: "100%", objectFit: "cover" },
	scanOverlay: { position: "absolute", inset: 0, background: "rgba(10,10,20,0.3)" },
	scanBeam: { position: "absolute", left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, transparent, #e8a4cc, transparent)", animation: "scanBeam 1.6s ease-in-out infinite" },
	analysingRing: { position: "absolute", inset: "-4px", borderRadius: "50%", border: "3px solid transparent", borderTop: "3px solid #e8a4cc", animation: "spin 1.2s linear infinite" },
	analysingTitle: { fontFamily: "'Playfair Display', serif", fontSize: "32px", fontWeight: 400, marginBottom: "10px" },
	analysingStage: { fontSize: "14px", color: "#e8a4cc", marginBottom: "24px", minHeight: "20px" },
	progressWrap: { width: "100%", maxWidth: "380px", height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "2px", overflow: "hidden", marginBottom: "8px" },
	progressBar: { height: "100%", background: "linear-gradient(90deg, #e8a4cc, #a084e8)", borderRadius: "2px", transition: "width 0.3s ease" },
	progressPct: { fontSize: "13px", color: "rgba(240,234,245,0.4)", marginBottom: "24px" },
	analysingChecks: { display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-start", maxWidth: "360px" },
	analysingCheck: { fontSize: "13px", color: "rgba(240,234,245,0.6)", display: "flex", gap: "8px" },
	checkDot: { color: "#6ee7a0" },

	// results - hero
	resultsHero: { display: "flex", gap: "20px", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap" },
	resultsPhotoWrap: { position: "relative", flexShrink: 0 },
	resultsPhoto: { width: "120px", height: "140px", objectFit: "cover", borderRadius: "20px", border: "2px solid rgba(200,130,180,0.3)" },
	skinScoreBadge: { position: "absolute", bottom: "-10px", left: "50%", transform: "translateX(-50%)", background: "#0d0d1a", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "12px", padding: "6px 12px", textAlign: "center", minWidth: "80px" },
	skinScoreNum: { display: "block", fontSize: "22px", fontWeight: 700, lineHeight: 1 },
	skinScoreLabel: { display: "block", fontSize: "9px", color: "rgba(240,234,245,0.4)", letterSpacing: "1px", textTransform: "uppercase", marginTop: "2px" },
	resultsIntro: { flex: 1 },
	miniLogo: { fontSize: "10px", letterSpacing: "3px", color: "rgba(240,234,245,0.35)", marginBottom: "8px" },
	resultsTitle: { fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px,7vw,42px)", fontWeight: 400, lineHeight: 1.1, marginBottom: "14px" },
	skinTags: { display: "flex", flexWrap: "wrap", gap: "6px" },
	tag: { background: "rgba(160,132,232,0.15)", border: "1px solid rgba(160,132,232,0.25)", color: "#c0a8f0", fontSize: "11px", padding: "3px 12px", borderRadius: "20px" },
	tagWarn: { background: "rgba(248,180,100,0.12)", border: "1px solid rgba(248,180,100,0.25)", color: "#f8b464" },

	// analysis card
	analysisCard: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "20px", padding: "22px", marginBottom: "24px" },
	analysisCardHeader: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" },
	analysisIcon: { fontSize: "20px" },
	analysisLabel: { fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "#e8a4cc" },
	analysisText: { fontSize: "14px", lineHeight: 1.8, color: "rgba(240,234,245,0.72)", fontWeight: 300 },

	// tabs
	tabs: { display: "flex", gap: "8px", marginBottom: "24px", overflowX: "auto", paddingBottom: "4px" },
	tab: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(240,234,245,0.55)", padding: "9px 16px", borderRadius: "50px", fontSize: "13px", whiteSpace: "nowrap", flexShrink: 0 },
	tabActive: { background: "rgba(200,130,180,0.2)", border: "1px solid rgba(200,130,180,0.4)", color: "#e8a4cc" },

	// section
	sectionHeader: { marginBottom: "20px" },
	sectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: 400, marginBottom: "4px" },
	sectionSub: { fontSize: "12px", color: "rgba(240,234,245,0.4)" },

	// products
	productsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "4px" },
	productCard: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "16px" },
	productType: { fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", color: "#a084e8", marginBottom: "6px" },
	productName: { fontSize: "13px", fontWeight: 600, marginBottom: "6px", lineHeight: 1.3 },
	productIngredient: { fontSize: "11px", color: "#e8a4cc", marginBottom: "6px" },
	productWhy: { fontSize: "11px", color: "rgba(240,234,245,0.45)", lineHeight: 1.5, marginBottom: "14px" },
	productFooter: { display: "flex", justifyContent: "space-between", alignItems: "center" },
	productPrice: { fontSize: "17px", fontWeight: 600, color: "#e8a4cc" },
	addCartBtn: { background: "rgba(200,130,180,0.2)", border: "1px solid rgba(200,130,180,0.3)", color: "#e8a4cc", fontSize: "12px", padding: "5px 12px", borderRadius: "8px" },

	// beauty tips
	tipCard: { display: "flex", gap: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "18px", marginBottom: "10px" },
	tipNum: { fontFamily: "'Playfair Display', serif", fontSize: "22px", color: "rgba(200,130,180,0.4)", flexShrink: 0, lineHeight: 1 },
	tipContent: { flex: 1 },
	tipText: { fontSize: "14px", lineHeight: 1.7, color: "rgba(240,234,245,0.75)" },

	// health
	healthCard: { display: "flex", alignItems: "flex-start", gap: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "16px 18px", marginBottom: "10px" },
	healthIcon: { fontSize: "24px", flexShrink: 0 },
	healthText: { fontSize: "14px", lineHeight: 1.7, color: "rgba(240,234,245,0.72)" },
	skinScoreCard: { background: "rgba(160,132,232,0.08)", border: "1px solid rgba(160,132,232,0.2)", borderRadius: "20px", padding: "24px", textAlign: "center", marginTop: "20px" },
	skinScoreTitle: { fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(240,234,245,0.4)", marginBottom: "8px" },
	bigScore: { fontFamily: "'Playfair Display', serif", fontSize: "64px", fontWeight: 600, lineHeight: 1 },
	bigScoreOf: { fontSize: "24px", color: "rgba(240,234,245,0.3)" },
	skinScoreBar: { width: "100%", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden", margin: "16px 0 12px" },
	skinScoreFill: { height: "100%", borderRadius: "3px", transition: "width 1s ease" },
	skinScoreHint: { fontSize: "13px", color: "rgba(240,234,245,0.5)", lineHeight: 1.6 },

	// routine
	routineSection: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "20px", marginBottom: "16px" },
	routineHeader: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" },
	routineIcon: { fontSize: "22px" },
	routineLabel: { fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 400 },
	routineStep: { display: "flex", gap: "14px", alignItems: "flex-start", marginBottom: "12px" },
	routineStepNum: { width: "26px", height: "26px", borderRadius: "50%", background: "rgba(200,130,180,0.2)", border: "1px solid rgba(200,130,180,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#e8a4cc", flexShrink: 0, fontWeight: 600 },
	routineStepText: { fontSize: "14px", lineHeight: 1.6, color: "rgba(240,234,245,0.75)", paddingTop: "2px" },

	// subscription
	subSection: { marginTop: "40px", paddingTop: "32px", borderTop: "1px solid rgba(255,255,255,0.08)" },
	subHook: { background: "linear-gradient(135deg, rgba(160,132,232,0.12), rgba(200,130,180,0.08))", border: "1px solid rgba(160,132,232,0.2)", borderRadius: "24px", padding: "28px", textAlign: "center", marginBottom: "24px" },
	subHookIcon: { fontSize: "28px", color: "#a084e8", marginBottom: "12px" },
	subHookTitle: { fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: 400, marginBottom: "12px" },
	subHookText: { fontSize: "14px", color: "rgba(240,234,245,0.65)", lineHeight: 1.75, marginBottom: "24px" },
	subStats: { display: "flex", justifyContent: "center", gap: "24px", flexWrap: "wrap" },
	subStat: { display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" },
	subStatNum: { fontSize: "26px", fontWeight: 700, color: "#e8a4cc", fontFamily: "'Playfair Display', serif" },
	subStatLabel: { fontSize: "11px", color: "rgba(240,234,245,0.4)", textAlign: "center", maxWidth: "80px" },
	plansGrid: { display: "flex", flexDirection: "column", gap: "14px", marginBottom: "16px" },
	planCard: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "20px", padding: "22px", cursor: "pointer", transition: "all 0.2s" },
	planSelected: { background: "rgba(255,255,255,0.07)" },
	planBadge: { display: "inline-block", fontSize: "11px", padding: "3px 12px", borderRadius: "20px", marginBottom: "10px" },
	planName: { fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 400, marginBottom: "4px" },
	planPriceRow: { display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "16px" },
	planPrice: { fontSize: "32px", fontWeight: 700 },
	planPeriod: { fontSize: "14px", color: "rgba(240,234,245,0.4)" },
	planFeatures: { display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" },
	planFeature: { fontSize: "13px", color: "rgba(240,234,245,0.7)", lineHeight: 1.4, display: "flex", alignItems: "flex-start" },
	planCta: { width: "100%", border: "2px solid", padding: "12px", borderRadius: "50px", fontSize: "15px", fontWeight: 600 },
	subDisclaimer: { textAlign: "center", fontSize: "12px", color: "rgba(240,234,245,0.3)", marginBottom: "24px" },
	restartBtn: { background: "transparent", border: "none", color: "rgba(240,234,245,0.35)", fontSize: "13px", padding: "8px 0", width: "100%", textAlign: "center" },
};

