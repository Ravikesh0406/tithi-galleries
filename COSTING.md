# Tithi — Costing, Pricing & Margin Analysis

Last updated: Feb 2026. Infra prices verified live from vendor pricing pages.

---

## 1. What we charge (annual, INR)

| Plan | Price/year | Target |
|---|---|---|
| Free | ₹0 | Try the product (3 galleries, 50 photos each) |
| Starter | ₹2,999 | New photographers (20 galleries, 5,000 photos) |
| Pro | ₹5,999 | Growing studios (unlimited galleries, 25,000 photos) |
| Studio | ₹11,999 | Busy teams (unlimited*, team access, white-label) |

Store commission (revenue share on photo sales through the gallery):
Free 15% · Starter 5% · Pro 3% · Studio 2%

**Why annual:** India's photographer tools (FTPix, Picsora) sell on annual subscriptions;
annual upfront gives us cash flow to fund storage, and 12-month retention beats monthly churn.

---

## 2. Our costs (verified Feb 2026)

### Hosting — Vercel
| Plan | Price | What we get |
|---|---|---|
| Hobby | **$0/mo** | 1M CDN requests, 100 GB Fast Data Transfer, 1M function invocations, 4 hrs active CPU |
| Pro | **$20/mo** (≈₹1,700) | 10M CDN requests, **1 TB** transfer, 10M invocations, $20 usage credit |

→ Start on **Hobby (₹0)**. Move to Pro when we pass ~100 GB/month traffic or need team access.

### Photo storage + delivery — Cloudflare R2 (the key decision)
| Item | Price |
|---|---|
| Storage | **$0.015 / GB-month** (Standard), $0.01 (Infrequent Access) |
| **Egress (delivery to guests)** | **FREE — ₹0** |
| Class A ops (uploads) | $4.50 / million (first 1M/mo free) |
| Class B ops (reads) | $0.36 / million (first 10M/mo free) |
| Free tier | 10 GB storage, 1M Class A, 10M Class B per month |

→ **Egress being free is why this business can hit 80% margin.** On AWS S3, egress is
~$0.09/GB — a gallery delivering 100 GB/month would cost ~$9/mo/user and destroy margin.

### Other costs
| Item | Cost |
|---|---|
| Domain (tithi.in / .com) | ₹800–1,200/year |
| Payment gateway (Razorpay/PhonePe) | **~2% of transaction** + GST on the fee |
| Email (Resend free tier / SMTP) | ₹0 up to 3,000 emails/mo |
| AI face search (Phase 2) | **Free if self-hosted** (open-source models + small VPS ≈ ₹500–1,500/mo) · Paid APIs: AWS Rekognition ≈ $1/1,000 images indexed |
| GST compliance / accounting | ₹5,000–15,000/year (CA) |
| Support / marketing / founder time | The real cost — not infra |

---

## 3. Unit economics per paying user (Pro plan, ₹5,999/year)

| Cost item | Calculation | ₹/year |
|---|---|---|
| Storage (avg 60 GB accumulated) | 60 GB × $0.015 × 12 | **770** |
| Egress to guests | R2 = free | **0** |
| Vercel hosting (amortised) | ₹1,700 ÷ users | **170** (at 100 users) |
| Operations (uploads/reads) | free tier absorbs | **0** |
| Payment gateway | 2% × ₹5,999 | **120** |
| Domain + misc | amortised | **100** |
| **Total COGS** | | **≈ ₹1,160** |
| **Gross profit** | ₹5,999 − ₹1,160 | **≈ ₹4,840** |
| **Gross margin** | | **≈ 81%** |

Starter (₹2,999): COGS ≈ ₹700 → **77% margin**
Studio (₹11,999): COGS ≈ ₹2,200 (more storage + team) → **82% margin**

**Blended gross margin across plans: ~78–82%.** ✅ The 80% target holds on infra.

---

## 4. But gross margin ≠ profit. Break-even math

**Monthly fixed costs (realistic, lean):**

| Item | ₹/month |
|---|---|
| Vercel Pro (when needed) | 1,700 |
| R2 storage (grows with users) | ~1,500 at 100 users |
| Domain, email, tools, CA | 2,000 |
| Marketing (modest: Instagram/ads) | 10,000 |
| **Subtotal, no salary** | **≈ ₹15,200** |
| + 2 founders at ₹50,000 each | **≈ ₹1,15,200** |

**Contribution per user:** blended ARPU ₹5,700/yr × 78% margin = **≈ ₹4,400/user/year = ₹367/month**

| Scenario | Break-even |
|---|---|
| Bootstrapped, no salary, ₹10K marketing | **~41 paying users** |
| 2 founders paid ₹50K/mo each + ₹10K marketing | **~314 paying users** |
| + ₹50K/mo marketing | **~450 paying users** |

---

## 5. Honest verdict

| Question | Answer |
|---|---|
| **80% gross margin on infra?** | **Yes — ~78–82%**, because R2 egress is free and Vercel Hobby is ₹0. |
| **Profitable in Year 1?** | **Only if founder salary + marketing stay low** (break-even ≈ 40–100 paying users). |
| **Net margin at scale (500+ users)?** | Realistically **30–50%** after salaries, marketing, support, GST/CA — not 80%. 80% *net* is not how SaaS works. |
| **What will destroy the margin?** | (1) Paid AI API per image, (2) storing unlimited photos on plans, (3) egress on a non-free-egress CDN, (4) monthly plans → churn. |

### Guardrails to protect the margin
1. **Storage caps per plan** (already in pricing) — biggest variable cost.
2. **R2 + free egress only** — never AWS S3 standard for delivery.
3. **Self-host AI face search** (Phase 2) instead of per-image paid APIs.
4. **Annual billing only** — upfront cash + 12-month retention.
5. **Free plan is a lead magnet, not a cost centre** — cap it hard (3 galleries / 50 photos).
6. **Store commission** = pure-margin revenue on top of subscriptions (no infra cost per sale).

---

## 6. Sensitivity: what if we're wrong?

| Risk | Impact on margin |
|---|---|
| Avg storage per user = 200 GB instead of 60 GB | Gross margin drops to **~65%** (still healthy) |
| Egress moves to AWS S3 ($0.09/GB) | Margin drops **15–25 points** — avoid |
| Paid face-recognition API at $1/1K images | −**₹2,100/user/year** on Pro → margin **~45%** |
| Churn 8% monthly instead of annual plans | LTV falls ~40%; need 2× acquisitions |

**Conclusion:** the model supports ~80% **gross** margin and a path to profitability
above ~50 paying users bootstrapped, ~300 with founder salaries. The pricing is defensible
against Indian competitors (FTPix ₹649–₹5,499/month, Picsora ₹4,499–₹7,999/year).
