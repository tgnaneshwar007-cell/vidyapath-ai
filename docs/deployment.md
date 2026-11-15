# VidyaPath AI - Production Deployment Guide

## 1. Vercel Deployment (Frontend)

1. Connect your GitHub repository to Vercel.
2. Select **Vite** as the framework preset.
3. Configure the following environment variables in the Vercel dashboard:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_AI_PROVIDER=openrouter
   VITE_OPENROUTER_API_KEY=your-openrouter-key
   VITE_AI_MODEL=meta-llama/llama-3.1-8b-instruct:free
   VITE_ADMIN_SECRET=your-chosen-admin-passphrase
   ```
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Deploy.

---

## 2. Supabase Backend Setup

1. Create a new Supabase project in the `ap-south-1` (Mumbai) region for minimal latency to Indian users.
2. Open the Supabase **SQL Editor**.
3. Run the migration script located at:
   `supabase/migrations/20261115000000_initial_schema.sql`
4. Confirm in **Table Editor** that `profiles`, `scholarships`, `scholarship_sources`, `applications`, and `admin_audit_logs` have Row Level Security enabled.
5. In **Authentication -> URL Configuration**, set the Site URL to your production domain and add `http://localhost:3000` to Redirect URLs for local development.

---

## 3. Custom Domain & DNS Instructions

1. In Vercel Project Settings -> Domains, add your domain (e.g., `vidyapath.ai`).
2. Add the following DNS records with your registrar:
   - `CNAME` for `www.vidyapath.ai` -> `cname.vercel-dns.com`
   - `A` record for `vidyapath.ai` -> `76.76.21.21`
3. Verify automatic SSL/TLS certificate issuance.
