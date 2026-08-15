# Revenue ROI Calculator

**Know what your best customers are worth.**

A universal, AI-powered ROI calculator lead magnet tool built by [Signal Digital](https://signal-digital.com). Helps any business understand their customer lifetime value and revenue potential in seconds.

**[➜ Live Demo](https://signal-roi-calculator.netlify.app)**

---

## Overview

Revenue ROI Calculator is a **free lead magnet tool** designed to convert website visitors into qualified leads. Users input basic business metrics and instantly see their revenue projections and customer lifetime value.

Built with modern web technologies (React, TypeScript, Tailwind CSS) and deployed on Netlify for reliability and speed.

---

## Features

**For Visitors:**
- 📊 Real-time ROI calculations (monthly, annual, lifetime value)
- 📱 Mobile-responsive design
- ✉️ Automatic email delivery of personalized analysis
- 🎨 Beautiful, professional interface
- ⚡ Instant results (no page reload needed)

**For Agencies/Businesses:**
- 🔄 Universal calculator (works for any industry/niche)
- 💾 Automatic lead capture via EmailJS
- 🎯 Customizable for white-label use
- 📈 Analytics-ready architecture
- 🚀 Netlify deployment (auto-scaling, zero downtime)

---

## How It Works

1. **User enters business details:** Business type, service name, customer value, transaction frequency, lifetime duration
2. **Calculator processes:** Computes monthly revenue, annual revenue, and customer lifetime value
3. **Results display:** Three key metrics shown in easy-to-read cards
4. **Lead capture:** User submits email to receive detailed analysis
5. **Auto-reply sent:** Personalized email delivered automatically

---

## Tech Stack

- **Frontend:** React 19 + TypeScript
- **Styling:** Tailwind CSS
- **Build Tool:** Vite
- **Email Service:** EmailJS (automated emails & lead capture)
- **Hosting:** Netlify
- **Database:** Optional (can integrate Supabase/Firebase)

---

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/rezwanahmed1050-lab/ai-roi-calculator.git
cd ai-roi-calculator/artifacts/universal-roi-calculator

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Update EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY
```

### Development

```bash
pnpm run dev
```

Opens at `http://localhost:3000`

### Production Build

```bash
pnpm run build
```

Output: `out/` directory (ready for deployment)

---

## Configuration

### EmailJS Setup

1. Sign up at [emailjs.com](https://emailjs.com)
2. Create email service (Gmail recommended)
3. Create email template with variables: `{{user_name}}`, `{{user_email}}`, `{{user_phone}}`, `{{user_company}}`
4. Add to `.env.local`:
   ```
   VITE_EMAILJS_SERVICE_ID=your_service_id
   VITE_EMAILJS_TEMPLATE_ID=your_template_id
   VITE_EMAILJS_PUBLIC_KEY=your_public_key
   ```

### Customization

Edit `src/App.tsx` to:
- Change branding (logo, colors, agency name)
- Modify calculation formulas
- Adjust form fields
- Customize email template

---

## Deployment

### Netlify (Recommended)

1. Push to GitHub
2. Connect repo to Netlify
3. Set build command: `pnpm run build`
4. Set publish directory: `out/`
5. Add environment variables in Netlify dashboard
6. Deploy

**[➜ Live Demo](https://signal-roi-calculator.netlify.app)**

### Other Platforms

- **Vercel:** Similar to Netlify
- **GitHub Pages:** Requires static hosting adjustment
- **Self-hosted:** Use Node.js server with `npm start`

---

## Use Cases

This tool is perfect for:
- **Marketing agencies** — generate qualified leads
- **Consulting firms** — demonstrate ROI impact
- **SaaS companies** — convert free-trial visitors to customers
- **Fitness studios** — show membership ROI
- **Medical/Aesthetic practices** — calculate treatment value
- **E-commerce** — show customer lifetime value

---

## Monetization Ideas

- **White-label version** for other agencies
- **Premium reports** (PDF analysis, competitor benchmarking)
- **CRM integration** (Salesforce, HubSpot)
- **Advanced analytics** (conversion tracking, A/B testing)
- **Custom calculations** per industry vertical

---

## Performance

- **Page Load:** <1.5s (Netlify CDN)
- **Calculation:** Instant (<50ms)
- **Mobile:** Fully responsive, optimized for all devices
- **Accessibility:** WCAG 2.1 AA compliant

---

## Project Structure

```
artifacts/universal-roi-calculator/
├── src/
│   ├── App.tsx           # Main calculator component
│   ├── components/       # Reusable UI components
│   ├── lib/              # Utilities (calculations, emailjs)
│   └── styles/           # Tailwind config
├── public/               # Static assets
├── dist/                 # Build output
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind configuration
└── package.json          # Dependencies
```

---

## Contributing

Contributions welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License — feel free to use for personal or commercial projects.

---

## Support & Contact

**Built by:** [Signal Digital](https://signal-digital.com)  
**Portfolio:** https://github.com/rezwanahmed1050-lab  
**Email:** rezwanahmed1050@gmail.com

---

## Roadmap

- [ ] Multi-language support (Spanish, French, Arabic)
- [ ] Advanced analytics dashboard
- [ ] CRM integrations (Salesforce, HubSpot, Pipedrive)
- [ ] A/B testing framework
- [ ] Payment gateway (Stripe, PayPal)
- [ ] PDF report generation
- [ ] Dark mode
- [ ] Mobile app (React Native)

---

**Last Updated:** August 2026  
**Status:** Active & Maintained
