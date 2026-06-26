# StayWave Maldives - Premium Diving & Travel Website

A premium, fully responsive HTML/CSS/JavaScript travel website for StayWave Maldives, featuring world-class diving packages and marine adventures.

## 🌊 Features

### 1. **Responsive Navigation**
   - Sticky navbar with smooth scrolling
   - Mobile-friendly hamburger menu
   - Active link highlighting
   - Brand logo and navigation links

### 2. **Hero Section**
   - Full-screen hero with background image
   - Animated text and call-to-action button
   - Parallax scrolling effect
   - Professional gradient overlay

### 3. **Featured Packages**
   - Three dive packages (Beginner, Intermediate, Advanced)
   - "Most Popular" badge on featured package
   - Package features and pricing
   - Hover animations and responsive grid
   - Quick booking buttons

### 4. **Marine Life Gallery**
   - 6 marine species cards
   - Scientific names and descriptions
   - Hover effects with overlays
   - Responsive image gallery

### 5. **Dive Sites Preview**
   - 3 featured dive locations
   - Detailed site information (depth, difficulty)
   - Site highlights with tags
   - Alternating layout design
   - Professional imagery

### 6. **Testimonials**
   - Guest reviews with ratings
   - User avatars and professional photos
   - Glass-morphism design with backdrop blur
   - Dark theme with accent colors

### 7. **FAQ Section**
   - Interactive expandable questions
   - Smooth animations on expand/collapse
   - 6 common questions covered
   - Clean accordion-style design

### 8. **Booking CTA**
   - Strong call-to-action section
   - Dual button options (Book Now, Contact)
   - Gradient background
   - Mobile-responsive button layout

### 9. **Footer**
   - 4-column footer layout
   - About, Quick Links, Safety Guidelines, Contact Info
   - Social media links
   - Copyright and legal links

## 📁 Project Structure

```
staywave-maldives/
├── index.html                    # Main homepage
├── assets/
│   ├── styles/
│   │   ├── reset.css            # CSS reset and normalize
│   │   ├── global.css           # Global styles and variables
│   │   ├── navigation.css       # Navigation bar styles
│   │   ├── hero.css             # Hero section styles
│   │   ├── packages.css         # Package cards styles
│   │   ├── marine-life.css      # Marine life grid styles
│   │   ├── dive-sites.css       # Dive sites layout styles
│   │   ├── testimonials.css     # Testimonials section styles
│   │   ├── faq.css              # FAQ accordion styles
│   │   ├── booking-cta.css      # Booking CTA styles
│   │   └── footer.css           # Footer styles
│   ├── scripts/
│   │   ├── navigation.js        # Navigation menu logic
│   │   ├── hero.js              # Hero section interactions
│   │   ├── packages.js          # Package booking logic
│   │   ├── faq.js               # FAQ accordion functionality
│   │   ├── booking-modal.js     # Booking modal handling
│   │   └── main.js              # Global JS initialization
│   └── images/
│       ├── logo.png             # Brand logo
│       ├── hero-bg.jpg          # Hero background image
│       ├── package-*.jpg        # Package images
│       ├── marine-life images   # Species photos
│       ├── dive-sites images    # Location photos
│       └── avatars/             # User testimonial avatars
└── README.md
```

## 🎨 Design Features

### Color Scheme
- **Primary Blue**: #0066cc
- **Cyan Accent**: #00d4ff
- **Dark Background**: #0a1929
- **Light Background**: #f5f7fa
- **Success Green**: #4caf50

### Typography
- **Font Family**: Segoe UI, Tahoma, Geneva, Verdana, sans-serif
- **Font Sizes**: Responsive scale from 0.75rem to 3rem
- **Font Weights**: 400, 500, 600, 700, 800

### Responsive Breakpoints
- **Desktop**: 1200px and above
- **Tablet**: 768px to 1199px
- **Mobile**: Below 768px
- **Small Mobile**: Below 480px

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Text editor or IDE
- Local web server (optional, for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/araazy/staywave-maldives.git
   cd staywave-maldives
   ```

2. **Open in browser**
   - Simply open `index.html` in your web browser
   - Or serve with a local web server:
   ```bash
   python -m http.server 8000
   # Then visit http://localhost:8000
   ```

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## ♿ Accessibility

- Semantic HTML5 structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Color contrast compliance
- Reduced motion preferences supported

## 🔧 Customization

### Adding Images
1. Place images in `assets/images/` directory
2. Update image paths in `index.html`
3. Recommended image dimensions:
   - Hero background: 1920x1080px
   - Package cards: 400x250px
   - Marine life: 400x300px
   - Dive sites: 600x400px

### Modifying Colors
Edit CSS variables in `assets/styles/global.css`:
```css
:root {
    --primary-color: #0066cc;
    --secondary-color: #00d4ff;
    /* ... modify as needed ... */
}
```

### Adding New Sections
1. Create corresponding CSS file in `assets/styles/`
2. Create corresponding JS file in `assets/scripts/` (if needed)
3. Link in `index.html`
4. Follow the component-based architecture

## 📈 Performance Tips

- Images are optimized with `background-size: cover`
- CSS is organized and minifiable
- JavaScript is modular and lightweight
- Smooth scrolling behavior enabled
- Lazy loading ready for future optimization

## 🌐 Deployment

### GitHub Pages
1. Push code to GitHub repository
2. Go to Settings → Pages
3. Select main branch as source
4. Your site will be live at `https://username.github.io/staywave-maldives`

### Traditional Hosting
1. Upload all files to your web server
2. No build process required
3. Works with any hosting provider

## 📝 License

This project is created for StayWave Maldives.

## 🤝 Contributing

For feature requests or bug reports, please create an issue in the repository.

## 📧 Contact

For more information about StayWave Maldives:
- Email: info@staywavemaldives.com
- Phone: +960 123-4567
- Location: Male, Maldives

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Production Ready ✅

---

## 🚀 Sprint 7 — UX & Accessibility Release

### What's New in Sprint 7

| Area | Improvement |
|---|---|
| ♿ Accessibility | Skip-to-content link; `<main>` landmark; `aria-expanded` on hamburger; `aria-current` on active nav links; `aria-labelledby` on sections; proper carousel ARIA roles |
| 🎠 Testimonials Carousel | Static grid replaced with an auto-advancing, touch-friendly carousel with prev/next buttons, dot pagination, keyboard (← →) support, and `prefers-reduced-motion` respect |
| 📬 Contact / Enquiry Form | New `#contact` section with a validated form that pre-fills a WhatsApp message; replaces the previous broken `alert()` flow |
| 📜 Scroll-to-top Button | Floating button appears after scrolling 400 px; smooth-scrolls back to the top |
| 🔗 Navbar Enhancements | Active link highlighted as the user scrolls; shadow added to sticky navbar on scroll |
| 🛠 Bug Fixes | Removed broken `accommodation.css` `<link>` (file did not exist); fixed booking buttons to scroll to contact form instead of triggering `alert()` |

### Files Added / Modified

```
assets/styles/
├── contact.css       ← NEW: contact-section & form styles
├── sprint7.css       ← NEW: skip-link, scroll-to-top, navbar enhancements
├── global.css        ← UPDATED: added .sr-only utility class
└── testimonials.css  ← UPDATED: carousel layout

assets/scripts/
├── contact.js        ← NEW: form validation & WhatsApp integration
├── scroll-to-top.js  ← NEW: scroll-to-top button behaviour
├── navigation.js     ← UPDATED: active link highlighting, scroll shadow, aria-expanded
├── testimonials.js   ← UPDATED: full carousel implementation
└── booking-modal.js  ← UPDATED: removed alert(), scroll to #contact

index.html            ← UPDATED: skip link, <main> landmark, carousel markup,
                                  contact section, scroll-to-top button, fixed CSS links
README.md             ← UPDATED: this Sprint 7 section
```
