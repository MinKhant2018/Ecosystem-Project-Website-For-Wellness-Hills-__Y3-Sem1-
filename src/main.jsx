import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const formUrl =
  'https://docs.google.com/forms/d/e/1FAIpQLSfGxoM7y86Rai24IogK-MPe87YdB84LnKrZMqSK7nTMkxZCgg/viewform?usp=header';

const photoSizes =
  '(max-width: 560px) calc(100vw - 40px), ' +
  '(max-width: 1100px) calc((100vw - 72px) / 2), ' +
  '(max-width: 1280px) calc((100vw - 144px) / 3), 379px';

const partners = [
  {
    id: 'insda',
    photoWidth: 753,
    name: 'Insda Wellness Resort',
    tagline: 'Rest, retreat, peace, comfort, and Lanna hospitality.',
    description:
      'A wellness resort blending Lanna heritage with holistic rest and well-being.',
    alt: 'Traditional Lanna resort cottages surrounded by lush mountain greenery',
  },
  {
    id: 'origan',
    photoWidth: 752,
    name: 'Origan Spa',
    tagline: 'Healing, Thai, Lanna, Ayurveda, balance.',
    description:
      'A spa blending Thai, Lanna, and Ayurvedic wisdom for holistic healing and balance.',
    alt: 'A therapist providing a spa treatment in a warm wooden room overlooking a garden',
  },
  {
    id: 'earth',
    photoWidth: 753,
    name: 'X On Earth',
    tagline:
      'Healthy food, local ingredients, community, vegetarian, earth friendly.',
    description:
      'A restaurant focused on local ingredients, healthy food, and community support with an earth-friendly approach.',
    alt: 'Friends sharing a meal of fresh local food at X On Earth',
  },
  {
    id: 'shambhu',
    photoWidth: 753,
    name: 'Shambhu Cafe',
    tagline: 'Happiness, cacao, connection, creativity, relaxation.',
    description:
      'A cafe of happiness connecting people through cacao, creativity, and relaxation in a warm atmosphere.',
    alt: 'Two guests enjoying drinks and conversation at Shambhu Cafe',
  },
  {
    id: 'calush',
    photoWidth: 752,
    name: 'CaLush Shop',
    tagline:
      'Community products, curated goods, friendly, playful, local pride.',
    description:
      'A shop curating quality community and local products, with a friendly mascot character bringing fun and local pride.',
    alt: 'Shelves of local community crafts and products at CaLush Shop',
  },
  {
    id: 'hills',
    photoWidth: 753,
    name: 'Wellness Hills 1269+',
    tagline: 'Nature, journey, community, discovery, fresh.',
    description:
      'A destination network connecting wellness routes, communities, and nature across Northern Thailand.',
    alt: 'A winding road through misty green hills and a mountain village',
  },
];

const navigationItems = [
  'Home',
  'Stay',
  'Wellness',
  'Retreats',
  'Pet Friendly',
  'Facilities',
  'Promotions',
  'Events',
  'About',
  'Contact',
];

const quickLinks = [
  'About',
  'Five Commitments',
  'Impact',
  'Events',
  'Reports',
  'Trust & Transparency',
  'Ways to Participate',
  'News',
];

function Icon({ type, ...props }) {
  const paths = {
    phone: (
      <path d="M5 3h3l1 5-2 1a13 13 0 0 0 8 8l1-2 5 1v3c0 2-2 3-4 2C9 19 5 15 3 7c-1-2 0-4 2-4Z" />
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="1" />
        <path d="m3 6 9 7 9-7" />
      </>
    ),
    pin: (
      <>
        <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    external: <path d="M14 3h7v7m0-7L11 13M10 5H4v15h15v-6" />,
    chat: (
      <path d="M20 11a8 8 0 0 1-8 8H4l-1 2 1-7a8 8 0 1 1 16-3Z" />
    ),
    facebook: (
      <path d="M14 21v-9h3l1-4h-4V6c0-2 1-2 4-2V1h-3c-4 0-5 2-5 5v2H7v4h3v9" />
    ),
    instagram: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <path d="M17 7h.01" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {paths[type]}
    </svg>
  );
}

function Inactive({ children, className = '', label }) {
  return (
    <button
      type="button"
      disabled
      aria-disabled="true"
      className={`inactive ${className}`.trim()}
      aria-label={label}
    >
      {children}
    </button>
  );
}

function Header() {
  return (
    <header>
      <div className="contact-bar">
        <div className="contact-items">
          <span>
            <Icon type="phone" />
            +66 98 858 8656
          </span>
          <span>
            <Icon type="mail" />
            insdawellness@chiangmaiwellbeing.com
          </span>
          <span className="header-address">
            <Icon type="pin" />
            44 Moo 3, Ban Pong Subdistrict, Hang Dong District, Chiang Mai 50230,
            Thailand
          </span>
        </div>
        <div className="contact-social">
          <Inactive label="Facebook">
            <Icon type="facebook" />
          </Inactive>
          <Inactive label="Instagram">
            <Icon type="instagram" />
          </Inactive>
          <span className="language">🌐 EN</span>
        </div>
      </div>

      <div className="navigation">
        <a
          href="/"
          className="brand"
          aria-label="Insda Wellness Resort — Promotions"
        >
          <img
            src="/assets/insda-logo.webp"
            alt=""
            width="44"
            height="44"
            decoding="async"
          />
          <span>
            <strong>Insda Wellness Resort</strong>
            <small>
              REST DEEPLY. AWAKEN
              <br />
              NATURALLY.
            </small>
          </span>
        </a>

        <nav aria-label="Main navigation">
          {navigationItems.map((item) =>
            item === 'Promotions' ? (
              <a key={item} href="/" aria-current="page">
                Promotions
              </a>
            ) : (
              <Inactive key={item}>
                {item}
                {item === 'About' && <span aria-hidden="true">⌄</span>}
              </Inactive>
            ),
          )}
        </nav>

        <div className="nav-actions">
          <Inactive className="gold-button">
            Check Live Rates &amp;
            <br />
            Book <Icon type="external" />
          </Inactive>
          <a
            className="gold-button submit"
            href={formUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Submit video here (opens in a new tab)"
          >
            Submit video
            <br />
            here <Icon type="external" />
          </a>
        </div>
      </div>
    </header>
  );
}

function PartnerCard({ partner, priority }) {
  return (
    <article className="partner-card">
      <img
        className="partner-photo"
        src={`/assets/${partner.id}-photo.webp`}
        srcSet={`/assets/${partner.id}-photo-small.webp 400w, /assets/${partner.id}-photo.webp ${partner.photoWidth}w`}
        sizes={photoSizes}
        alt={partner.alt}
        width={partner.photoWidth}
        height="565"
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
      />
      <div className="card-body">
        <div className="partner-logo">
          <img
            src={`/assets/${partner.id}-logo.webp`}
            alt={`${partner.name} logo`}
            width="160"
            height="160"
            decoding="async"
          />
        </div>
        <h2>{partner.name}</h2>
        <p className="tagline">{partner.tagline}</p>
        <p className="description">{partner.description}</p>
        <div className="card-actions">
          <Inactive label={`Learn more about ${partner.name}`}>
            Learn more
          </Inactive>
          <Inactive
            className="visit"
            label={`Visit ${partner.name} website`}
          >
            Visit website <Icon type="external" />
          </Inactive>
        </div>
      </div>
    </article>
  );
}

function Footer() {
  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-about">
          <img
            src="/assets/footer-logo.webp"
            alt="Chiang Mai Wellbeing Social Enterprise logo"
            width="64"
            height="64"
            decoding="async"
          />
          <p>
            Chiang Mai Wellbeing Social Enterprise builds a connected wellness
            ecosystem where business, people, communities, culture and the
            environment grow together.
          </p>
          <div className="footer-social">
            <Inactive label="Facebook">
              <Icon type="facebook" />
            </Inactive>
            <Inactive label="Email">
              <Icon type="mail" />
            </Inactive>
          </div>
        </div>

        <div>
          <h2>Quick Links</h2>
          <ul>
            {quickLinks.map((link) => (
              <li key={link}>
                <Inactive>{link}</Inactive>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-ecosystem">
          <h2>Ecosystem</h2>
          <ul>
            {partners.map((partner) => (
              <li key={partner.id}>
                <Inactive>
                  {partner.name} <Icon type="external" />
                </Inactive>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-contact">
          <h2>Contact</h2>
          <ul>
            <li>
              <Icon type="pin" />
              <span>
                326/25 Moo 7, Outer Ring Road (Route 121), Nong Khwai
                Subdistrict, Hang Dong District, Chiang Mai 50230, Thailand
              </span>
            </li>
            <li>
              <Icon type="mail" />
              <span>socialenterprise@chiangmaiwellbeing.com</span>
            </li>
            <li>
              <Icon type="phone" />
              <span>+66 98 858 8656</span>
            </li>
            <li>
              <Icon type="chat" />
              <span>LINE: @254ktdhe</span>
            </li>
          </ul>
          <h2 className="policies">Policies</h2>
          <ul>
            {['Privacy Policy', 'Cookie Policy', 'Consent'].map((policy) => (
              <li key={policy}>
                <Inactive>{policy}</Inactive>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>
          © 2026 Chiang Mai Wellbeing Social Enterprise Co., Ltd. — All rights
          reserved
        </span>
        <span>Managed by Chiang Mai Wellbeing Social Enterprise</span>
      </div>
    </footer>
  );
}

function App() {
  return (
    <div className="page">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        <section className="hero" aria-labelledby="page-title">
          <div>
            <p className="eyebrow">Wellness Ecosystem</p>
            <h1 id="page-title">Promotions</h1>
            <p className="hero-description">
              Present this to Wellness Hill Resort Management to receive your
              custom
              <br className="desktop-break" /> partner activity reward.
            </p>
          </div>
        </section>
        <section
          className="partners"
          aria-label="Wellness ecosystem partners"
        >
          <div className="partner-grid">
            {partners.map((partner, index) => (
              <PartnerCard
                key={partner.id}
                partner={partner}
                priority={index === 0}
              />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
