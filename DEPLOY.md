# WOJOB — Production Deployment Guide: cPanel Shared Hosting (netbondhu.com)

This guide documents the one-time manual setup on your domain registrar and cPanel (EbnHost, server `bdix14`), and how GitHub Actions automates all future deployments.

---

## Part 1: Owner's One-Time Manual Checklist

Follow these 6 steps in exact order. (Replace placeholders like `<nameserver-1>`, `<ftp-user>`, etc. with your real credentials — never commit real credentials into the repository).

### Step 1: Domain Registrar (APNCloud Panel)
1. Log into your domain management panel at APNCloud.
2. Select domain **`netbondhu.com`** ➔ **Manage Nameservers**.
3. Choose **Custom Nameservers** and enter the exact pair from your EbnHost welcome email:
   - Nameserver 1: `<ns1.ebnhost.com>`
   - Nameserver 2: `<ns2.ebnhost.com>`
4. Save changes and wait for DNS propagation (typically 10 minutes to 2 hours).

### Step 2: cPanel Domain & Dedicated FTP Account
1. Log into your EbnHost cPanel.
2. Go to **Domains** ➔ **Create A New Domain**:
   - Domain: `netbondhu.com`
   - Uncheck "Share document root with public_html".
   - Document Root: `netbondhu.com` (or your chosen subfolder, e.g. `public_html/netbondhu`).
3. Go to **FTP Accounts** ➔ **Add FTP Account**:
   - Login: `<ftp-user>`
   - Password: `<ftp-password>`
   - Directory: Restricted to your app directory (e.g., `netbondhu.com`).
4. Note the four connection parameters needed for GitHub Secrets:
   - `FTP_SERVER`: `<ftp.netbondhu.com>` or `<server-ip>`
   - `FTP_USERNAME`: `<ftp-user>@netbondhu.com`
   - `FTP_PASSWORD`: `<ftp-password>`
   - `FTP_SERVER_DIR`: `/` (or relative path inside FTP root)
   Provide these to Antigravity or paste them into GitHub: **Repo ➔ Settings ➔ Secrets and variables ➔ Actions**.

### Step 3: cPanel "Setup Node.js App" (Phusion Passenger)
1. In cPanel, search for and open **Setup Node.js App**.
2. Click **Create Application**:
   - **Node.js version:** Select `20.x` (or highest available >= `18.18`).  
     *(Note: If no Node 18+ version is available, STOP and contact hosting support to enable Node 18 or 20).*
   - **Application mode:** `Production`
   - **Application root:** `netbondhu.com` (matching the FTP target folder).
   - **Application URL:** `netbondhu.com`
   - **Application startup file:** `server.js`
3. Click **Create**. Passenger will generate a default virtual environment and default `server.js`.

### Step 4: Environment Variables (Node.js App Settings)
In the same Node.js application screen, scroll to **Environment variables** (or click "Add Variable") and add every variable listed in `.env.example`:
- `DATABASE_URL`: Your PostgreSQL connection string (copy from Vercel / Supabase / Prisma Postgres).
- `JWT_SECRET`: Secret key for JWT tokens.
- `NODE_ENV`: `production`
- `NEXT_PUBLIC_APP_URL`: `https://netbondhu.com`
- `UPLOAD_DIR`: `/home/<cpanel-username>/uploads_netbondhu` (a directory outside the app root so deployments never overwrite uploaded files).
- `SMTP_HOST`: e.g. `smtp.gmail.com`
- `SMTP_PORT`: `465`
- `SMTP_USER`: e.g. `<your-email@gmail.com>`
- `SMTP_PASS`: `<16-character-app-password>`
- `SMTP_FROM`: `"WOJOB" <support@netbondhu.com>`
- (Optional) `SMS_*` and `PAYMENT_*` variables as needed.
Click **Save**.

### Step 5: SSL Certificate & Force HTTPS
1. In cPanel, open **SSL/TLS Status** ➔ Select `netbondhu.com` ➔ Click **Run AutoSSL**.
2. Once the certificate is issued (lock icon turns green), go to **Domains** ➔ Toggle **Force HTTPS Redirect** to **ON**.

### Step 6: Notify Antigravity & First Deployment
1. Confirm to Antigravity in chat: *"The manual cPanel checklist is complete and FTP secrets are ready."*
2. Antigravity will check the Secrets, trigger the automated GitHub Actions deployment workflow, monitor the run, and run acceptance tests on `https://netbondhu.com`.
3. Keep the existing Vercel deployment (`job-portal-bd-six.vercel.app`) untouched as an active fallback.

---

## Part 2: How Auto-Deploy Works

Every time code is pushed to the `main` branch:
1. GitHub Actions runner checks out code and sets up Node 20.
2. Runs `npm ci` and `npm run build` (Next.js standalone build).
3. Injects the git commit SHA into `NEXT_PUBLIC_BUILD_SHA` for a visible footer stamp.
4. Assembles the standalone deployment package in `deploy/`:
   - Standalone server & node_modules at root
   - `.next/static` copied into `deploy/.next/static`
   - `public/` copied into `deploy/public`
5. Synchronizes files via FTP using `SamKirkland/FTP-Deploy-Action` (ignoring `.env`, `uploads/`, and server files).
6. Touches `tmp/restart.txt` to trigger Phusion Passenger zero-downtime application restart.

---

## Part 3: Emergency Rollback Procedure (At Most 5 Steps)

If an issue ever occurs on a new release, follow these simple steps to roll back immediately:

### Option A: Roll Back via GitHub Actions (Recommended)
1. Open GitHub repository ➔ **Actions** tab ➔ Select **Deploy to cPanel Hosting**.
2. Click on the **previous successful green workflow run**.
3. Under the run details, click **Re-run all jobs**.
4. GitHub Actions will rebuild the previous working commit and redeploy it to cPanel automatically within 3–4 minutes.

### Option B: Instant Fallback to Vercel
1. Log into your registrar (APNCloud).
2. Point your DNS records (A/CNAME) back to Vercel (`cname.vercel-dns.com` / `76.76.21.21`).
3. Your live portal continues running smoothly on Vercel without data loss since the PostgreSQL database is external.
