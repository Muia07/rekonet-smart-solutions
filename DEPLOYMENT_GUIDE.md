# Rekonet Systems - Deployment Guide

## 🚀 Quick Deployment Options

### Option 1: Netlify (Recommended)

#### Method A: GitHub Integration (Easiest)
1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Market-ready website v2.0"
   git remote add origin https://github.com/yourusername/rekonet-systems.git
   git push -u origin main
   ```

2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Choose GitHub and select your repository
   - Set build command: `echo 'Static site'`
   - Set publish directory: `.` (root)
   - Click "Deploy site"

3. **Configure Custom Domain (Optional)**
   - Go to Site settings > Domain management
   - Add your custom domain
   - Configure DNS settings

#### Method B: Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

### Option 2: Vercel

#### Method A: GitHub Integration
1. **Push to GitHub** (same as above)

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Framework preset: Other
   - Click "Deploy"

#### Method B: Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Option 3: GitHub Pages

1. **Push to GitHub** (same as above)

2. **Enable GitHub Pages**
   - Go to repository Settings
   - Navigate to "Pages" section
   - Source: Deploy from a branch
   - Branch: main, folder: / (root)
   - Click "Save"

3. **Access Your Site**
   - URL: `https://yourusername.github.io/rekonet-systems/`

### Option 4: Traditional Web Hosting

1. **Build for Production**
   ```bash
   # No build step required for static site
   # Just ensure all files are ready
   ```

2. **Upload Files**
   - Upload all files to your web server
   - Maintain the directory structure
   - Ensure proper file permissions

3. **Configure Server**
   - Enable HTTPS
   - Set up redirects if needed
   - Configure caching headers

## 🔧 Pre-Deployment Checklist

### ✅ Code Quality
- [ ] All files are properly formatted
- [ ] No console errors in browser
- [ ] All links work correctly
- [ ] Images load properly
- [ ] Forms submit successfully

### ✅ Performance
- [ ] Page loads in <3 seconds
- [ ] Images are optimized
- [ ] CSS/JS are minified (if applicable)
- [ ] Caching headers are set
- [ ] Gzip compression enabled

### ✅ SEO
- [ ] Meta tags are complete
- [ ] Sitemap.xml is accessible
- [ ] Robots.txt is configured
- [ ] Structured data is valid
- [ ] Canonical URLs are set

### ✅ Security
- [ ] HTTPS is enabled
- [ ] Security headers are set
- [ ] No mixed content warnings
- [ ] Forms are protected
- [ ] No sensitive data exposed

### ✅ Accessibility
- [ ] Skip links are present
- [ ] Focus styles are visible
- [ ] Color contrast is sufficient
- [ ] Alt text is provided
- [ ] Keyboard navigation works

### ✅ Legal Compliance
- [ ] Privacy policy is accessible
- [ ] Terms of service are accessible
- [ ] Cookie consent is implemented
- [ ] Data collection is disclosed
- [ ] Contact information is provided

## 📊 Post-Deployment Tasks

### 1. Analytics Setup
```bash
# Google Analytics 4
# Replace GA_MEASUREMENT_ID in index.html with your actual ID

# Google Search Console
# Verify ownership and submit sitemap

# Hotjar (optional)
# Replace YOUR_HOTJAR_ID in index.html
```

### 2. Performance Monitoring
- [ ] Set up Google PageSpeed Insights monitoring
- [ ] Configure Lighthouse CI
- [ ] Set up uptime monitoring
- [ ] Monitor Core Web Vitals

### 3. SEO Monitoring
- [ ] Submit sitemap to Google Search Console
- [ ] Monitor search rankings
- [ ] Track organic traffic
- [ ] Monitor backlinks

### 4. Security Monitoring
- [ ] Set up SSL certificate monitoring
- [ ] Configure security scanning
- [ ] Monitor for vulnerabilities
- [ ] Set up backup procedures

## 🛠️ Troubleshooting

### Issue: CSS/JS not loading
**Solution:** Check file paths in HTML
```html
<!-- Update paths if needed -->
<link rel="stylesheet" href="./src/css/rekonet.css">
<script src="./src/js/rekonet.js"></script>
```

### Issue: Images not loading
**Solution:** Check image paths and ensure images exist
```html
<!-- Update image paths if needed -->
<img src="./src/images/logo.png" alt="Rekonet Logo">
```

### Issue: Fonts not loading
**Solution:** Check Google Fonts link
```html
<!-- Ensure this is in <head> -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
```

### Issue: Service worker not registering
**Solution:** Check service worker path and HTTPS
```javascript
// Ensure service worker is in root directory
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
}
```

### Issue: Forms not submitting
**Solution:** Check form action and method
```html
<!-- Update form action if needed -->
<form action="/api/contact" method="POST">
```

## 📈 Performance Optimization

### 1. Enable Compression
```apache
# Apache (.htaccess)
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css application/javascript
</IfModule>
```

```nginx
# Nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

### 2. Set Cache Headers
```apache
# Apache (.htaccess)
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>
```

### 3. Enable HTTPS
```apache
# Apache (.htaccess)
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

## 🔒 Security Configuration

### 1. Security Headers
```apache
# Apache (.htaccess)
Header always set X-Frame-Options "DENY"
Header always set X-XSS-Protection "1; mode=block"
Header always set X-Content-Type-Options "nosniff"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
```

### 2. Content Security Policy
```html
<!-- Add to <head> -->
<meta http-equiv="Content-Security-Policy" content="default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com">
```

## 📱 Mobile Optimization

### 1. Viewport Configuration
```html
<!-- Already included in index.html -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### 2. Touch Icons
```html
<!-- Add to <head> -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
```

## 🎯 Conversion Optimization

### 1. A/B Testing Setup
```html
<!-- Google Optimize -->
<script src="https://www.googleoptimize.com/optimize.js?id=OPT_CONTAINER_ID"></script>
```

### 2. Heatmap Tracking
```html
<!-- Hotjar -->
<script>
    (function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:YOUR_HOTJAR_ID,hjsv:6};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
</script>
```

## 📞 Support

### Technical Support
- **Email**: rekonetsystems@outlook.com
- **Phone**: +254 745 522 104
- **Hours**: Mon-Fri, 8:00 AM - 6:00 PM EAT

### Documentation
- **Improvements**: See `REKONET_IMPROVEMENTS.md`
- **Checklist**: See `IMPLEMENTATION_CHECKLIST.md`
- **Recovery**: See `RECOVERY_GUIDE.md`

---

*Deployment Guide Version: 1.0*
*Created: August 25, 2026*
*Last Updated: August 25, 2026*