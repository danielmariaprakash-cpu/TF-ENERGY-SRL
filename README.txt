# TF ENERGY SRL – Website Production Package
## Version: Production Final
## Date: September 2026

### File Structure
- index.html       – Homepage (Italian/English toggle)
- about.html       – Chi Siamo (About Us)
- products.html    – Prodotti (Products)
- projects.html    – Progetti (Projects Gallery)
- contact.html     – Contatti (Contact)
- admin.html       – Admin Panel (credentials below)
- main.js          – Main JavaScript
- style.css        – Stylesheet (Royal Blue + Lavender theme)
- contact.php      – Contact form email handler
- admin-api.php    – Admin data API (optional)
- .htaccess        – Hostinger server config
- vercel.json      – Vercel deployment config (alternative)
- api/submit.js    – Vercel serverless function

### Admin Credentials
- Username: admin      | Password: TFAdmin2024!
- Username: marketing  | Password: TFMkt2024!
- Username: developer  | Password: TFDev2024!

### Deployment (Hostinger)
1. Upload all files to public_html/ via File Manager or FTP
2. Point domain to public_html/
3. Enable SSL (Let's Encrypt) in Hostinger hPanel
4. Uncomment HTTPS redirect in .htaccess after SSL is active
5. Test contact.php with your email address

### Deployment (Vercel)
1. `vercel deploy` or connect GitHub repo to Vercel
2. Contact form uses api/submit.js serverless function
3. Set RESEND_API_KEY env var in Vercel dashboard

### Technologies
- Vanilla HTML5 / CSS3 / JavaScript (ES6+)
- Lucide Icons (cdnjs.cloudflare.com)
- Royal Blue #2540a0 + Lavender #8d7fe8 brand palette
- localStorage for admin data persistence
