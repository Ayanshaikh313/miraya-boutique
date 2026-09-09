# MIRĀYA — Premium Indian Women's Fashion & AI Shopping Assistant

> A luxury, production-grade Indian women's haute couture e-commerce platform built with **Next.js 13 (App Router)**, **TypeScript**, **Tailwind CSS**, **Supabase (PostgreSQL, Auth, RLS, RPCs)**, and **Google Generative AI (Gemini)**.

🌐 **Live Deployed Application:** [https://miraya-boutique.vercel.app/](https://miraya-boutique.vercel.app/)

---

## 🌟 Executive Summary

**MIRĀYA** celebrates the artistry of traditional Indian women's couture — Sarees, Lehengas, Anarkalis, and Bridal Wear. Key features include:

- **Variant-Based Inventory System:** Stock and SKUs belong to specific **Color + Size** variant combinations (not generic product-level counts).
- **Atomic Race-Condition Protection:** Prevents overselling during high-concurrency checkout via PostgreSQL row-level locks.
- **Role-Based Admin Dashboard (`/admin`):** Full catalog management, SKU adjustments, strict order status lifecycle transitions, and idempotent inventory-restoring order cancellations.
- **Database-Grounded AI Shopping Assistant:** Connected directly to Supabase as source-of-truth. Never hallucinates non-existent products, prices, or stock quantities, and renders real interactive `ProductCard` components.

---

## 🚀 How to Use the Application

### 🛍️ 1. Storefront & Product Catalog
- **Browse Collections:** Explore Sarees, Lehengas, Anarkalis, and Bridal Couture.
- **Live Search & Filters:** Filter products by Category, Fabric, Collection, and Price range.
- **Sorting Options:** Sort products by *Featured*, *Price: Low to High*, *Price: High to Low*, and *Newest Arrivals*.

### 👚 2. Product Detail & Variant Selection
- Select **Color** (e.g. Maroon, Ivory) and **Size** (e.g. S, M, L).
- Out-of-stock size combinations display a **diagonal strikethrough** and cannot be selected.
- Quantity selector is bounded to actual available stock (`quantity <= stock_quantity`).
- Use the **"Ask Mirāya Assistant about this piece"** button to open the AI assistant pre-loaded with the current product context.

### 🛒 3. Shopping Bag & Checkout
- Open the Shopping Bag drawer to manage quantities or remove items.
- **Promo Coupons Available at Checkout:**
  - `WELCOME10`: 10% off (orders above ₹2,000)
  - `FESTIVE2000`: ₹2,000 flat discount (orders above ₹10,000)
  - `BRIDAL15`: 15% off (orders above ₹25,000)
- **Payment Simulations:**
  - Select **Success** → Simulates card authorization, creates an order, and atomically deducts stock in Supabase.
  - Select **Failure** → Simulates payment decline; shopping bag remains intact and inventory is **not** deducted.

### 🔐 4. Customer Account & Orders
- Click **"Sign In / Register"** in the top navbar to create a customer account.
- View your order receipts and status tracking at `/account`.
- Protected via Supabase Row Level Security (RLS).

### 👑 5. Admin Dashboard (`/admin`)

#### **Promoting a User to Admin:**
To grant Admin privileges to any registered account, run this SQL command in your Supabase SQL Editor:
```sql
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'your_email@example.com';
```

#### **Admin Capabilities:**
- **Product Catalog (`/admin/products`):** Add new products, edit descriptions, upload images, and toggle soft enable/disable.
- **Variant & Inventory Management:** Create Color/Size variants, assign custom SKUs, and update stock quantities.
- **Order Fulfillment (`/admin/orders`):**
  - Advance status (`PENDING` → `CONFIRMED` → `PROCESSING` → `SHIPPED` → `DELIVERED`).
  - **Cancel Order & Restore Stock:** Atomically cancels eligible orders and restores item quantities back into variant inventory.

### 🤖 6. AI Style Assistant
- Click the floating **Mirāya AI** button (bottom-right) or the navbar **"Mirāya AI"** pill.
- **Natural Language Shopping:** Ask queries like *"Find me a wedding outfit under ₹5,000"*, *"Show me pastel outfits"*, or *"Is size M available?"*.
- **Authoritative Data:** Answers store policies (Returns, Shipping, COD) and renders interactive product cards backed by Supabase data.

---

## ⚡ Local Development Setup

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Ayanshaikh313/miraya-boutique.git
cd miraya-boutique
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://riiifantmxoywjlqngcg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
# Optional: GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 4. Build & Typecheck
```bash
# Typecheck
npm run typecheck

# Production Build
npm run build
```

---

## 🔒 Tech Stack & Architecture

- **Framework:** Next.js 13.5 (App Router)
- **Styling:** Tailwind CSS, Radix UI Primitives, Lucide Icons
- **Database & Auth:** Supabase (PostgreSQL, Row Level Security, Triggers & Atomic RPCs)
- **AI Integration:** Google Generative AI (`@google/generative-ai`)
- **Deployment:** Vercel ([https://miraya-boutique.vercel.app/](https://miraya-boutique.vercel.app/))
