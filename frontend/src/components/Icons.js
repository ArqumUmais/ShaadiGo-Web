// Shared SVG icon components — drop this file in /src/components/Icons.js

export function IconVenue({ size = 32, color = '#4D0D0D' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect x="4" y="20" width="40" height="24" rx="2" stroke={color} strokeWidth="2.5" fill="none"/>
      <path d="M4 20L24 6L44 20" stroke={color} strokeWidth="2.5" strokeLinejoin="round"/>
      <rect x="18" y="30" width="12" height="14" rx="1.5" stroke={color} strokeWidth="2" fill="none"/>
      <rect x="8" y="26" width="8" height="8" rx="1" stroke={color} strokeWidth="1.8" fill="none"/>
      <rect x="32" y="26" width="8" height="8" rx="1" stroke={color} strokeWidth="1.8" fill="none"/>
      <path d="M21 20v-4M24 20v-6M27 20v-4" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconGarden({ size = 32, color = '#4D0D0D' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M24 42V24" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M24 24C24 24 14 20 10 12c6 0 12 4 14 12z" stroke={color} strokeWidth="2" fill="none"/>
      <path d="M24 24C24 24 34 20 38 12c-6 0-12 4-14 12z" stroke={color} strokeWidth="2" fill="none"/>
      <path d="M24 30C24 30 16 27 13 20c5 0 9 4 11 10z" stroke={color} strokeWidth="2" fill="none"/>
      <ellipse cx="24" cy="42" rx="10" ry="2" stroke={color} strokeWidth="1.5"/>
    </svg>
  );
}

export function IconMarquee({ size = 32, color = '#4D0D0D' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M4 24L24 8L44 24V44H4V24Z" stroke={color} strokeWidth="2.5" fill="none"/>
      <path d="M4 24H44" stroke={color} strokeWidth="2"/>
      <path d="M4 24L14 16M44 24L34 16" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <rect x="18" y="30" width="12" height="14" rx="1" stroke={color} strokeWidth="2" fill="none"/>
      <circle cx="24" cy="24" r="3" stroke={color} strokeWidth="1.8" fill="none"/>
      <path d="M24 8V4M20 6l4-2 4 2" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

export function IconMosque({ size = 32, color = '#4D0D0D' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M8 44V28c0-4 3-8 8-8s8 4 8 8v16" stroke={color} strokeWidth="2.5" fill="none"/>
      <path d="M24 44V28c0-4 3-8 8-8s8 4 8 8v16" stroke={color} strokeWidth="2.5" fill="none"/>
      <path d="M4 44h40" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M16 20c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke={color} strokeWidth="2" fill="none"/>
      <path d="M20 12V8M28 12V8" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M24 8V4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="24" cy="4" r="1.5" fill={color}/>
    </svg>
  );
}

export function IconCastle({ size = 32, color = '#4D0D0D' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect x="8" y="18" width="32" height="26" rx="1" stroke={color} strokeWidth="2.5" fill="none"/>
      <path d="M8 18V10h6v4h4v-4h8v4h4v-4h6v8" stroke={color} strokeWidth="2.5" strokeLinejoin="round"/>
      <rect x="19" y="30" width="10" height="14" rx="1" stroke={color} strokeWidth="2" fill="none"/>
      <rect x="10" y="24" width="7" height="7" rx="1" stroke={color} strokeWidth="1.8" fill="none"/>
      <rect x="31" y="24" width="7" height="7" rx="1" stroke={color} strokeWidth="1.8" fill="none"/>
      <path d="M4 44h40" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconStar({ size = 32, color = '#4D0D0D' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M24 6l4.5 9 10 1.5-7.25 7 1.75 10L24 29l-9 4.5 1.75-10L9.5 16.5l10-1.5z"
        stroke={color} strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

export function IconCalendar({ size = 32, color = '#4D0D0D' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect x="6" y="10" width="36" height="32" rx="3" stroke={color} strokeWidth="2.5" fill="none"/>
      <path d="M6 20h36" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 6v8M32 6v8" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <rect x="13" y="26" width="6" height="5" rx="1" fill={color} opacity="0.6"/>
      <rect x="21" y="26" width="6" height="5" rx="1" fill={color} opacity="0.4"/>
      <rect x="29" y="26" width="6" height="5" rx="1" fill={color} opacity="0.2"/>
    </svg>
  );
}

export function IconChat({ size = 32, color = '#4D0D0D' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M6 8h36v26H28l-8 8v-8H6V8Z" stroke={color} strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
      <path d="M14 18h20M14 24h14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export function IconCheck({ size = 32, color = '#4D0D0D' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="18" stroke={color} strokeWidth="2.5" fill="none"/>
      <path d="M14 24l7 7 13-13" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconDashboard({ size = 32, color = '#4D0D0D' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect x="6" y="6" width="16" height="18" rx="2" stroke={color} strokeWidth="2.5" fill="none"/>
      <rect x="26" y="6" width="16" height="10" rx="2" stroke={color} strokeWidth="2.5" fill="none"/>
      <rect x="26" y="22" width="16" height="20" rx="2" stroke={color} strokeWidth="2.5" fill="none"/>
      <rect x="6" y="30" width="16" height="12" rx="2" stroke={color} strokeWidth="2.5" fill="none"/>
    </svg>
  );
}

export function IconLock({ size = 32, color = '#4D0D0D' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect x="10" y="22" width="28" height="20" rx="3" stroke={color} strokeWidth="2.5" fill="none"/>
      <path d="M16 22v-6a8 8 0 0 1 16 0v6" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="24" cy="32" r="3" fill={color}/>
      <path d="M24 35v4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export function IconPhone({ size = 24, color = '#4D0D0D' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M10 8h9l4 10-5 3a22 22 0 0 0 9 9l3-5 10 4v9C40 40 8 38 10 8Z"
        stroke={color} strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

export function IconEmail({ size = 24, color = '#4D0D0D' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect x="6" y="12" width="36" height="26" rx="3" stroke={color} strokeWidth="2.5" fill="none"/>
      <path d="M6 14l18 14L42 14" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconLocation({ size = 24, color = '#4D0D0D' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M24 44S10 30 10 20a14 14 0 0 1 28 0c0 10-14 24-14 24Z"
        stroke={color} strokeWidth="2.5" fill="none"/>
      <circle cx="24" cy="20" r="5" stroke={color} strokeWidth="2.5" fill="none"/>
    </svg>
  );
}

export function IconParking({ size = 32, color = '#4D0D0D' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect x="6" y="6" width="36" height="36" rx="4" stroke={color} strokeWidth="2.5" fill="none"/>
      <path d="M18 34V14h8a8 8 0 0 1 0 16h-8" stroke={color} strokeWidth="2.5" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconAC({ size = 32, color = '#4D0D0D' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect x="6" y="12" width="36" height="14" rx="3" stroke={color} strokeWidth="2.5" fill="none"/>
      <path d="M14 26v8M20 26v6M26 26v8M32 26v6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="36" cy="19" r="3" stroke={color} strokeWidth="2" fill="none"/>
    </svg>
  );
}

export function IconSound({ size = 32, color = '#4D0D0D' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M10 18H6v12h4l10 8V10L10 18Z" stroke={color} strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
      <path d="M32 16a10 10 0 0 1 0 16" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M27 20a5 5 0 0 1 0 8" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconCatering({ size = 32, color = '#4D0D0D' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="22" r="14" stroke={color} strokeWidth="2.5" fill="none"/>
      <path d="M10 22h28" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M24 8v4M32 11l-2 3M16 11l2 3" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M10 36h28" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M18 36v6M30 36v6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export function IconDecor({ size = 32, color = '#4D0D0D' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M24 6c0 0-14 10-14 22a14 14 0 0 0 28 0C38 16 24 6 24 6Z"
        stroke={color} strokeWidth="2.5" fill="none"/>
      <path d="M24 18v16M18 24l6-6 6 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconCamera({ size = 32, color = '#4D0D0D' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M6 16h8l4-6h12l4 6h8v24H6V16Z" stroke={color} strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
      <circle cx="24" cy="28" r="7" stroke={color} strokeWidth="2.5" fill="none"/>
      <circle cx="37" cy="21" r="2" fill={color}/>
    </svg>
  );
}

export function IconAccessibility({ size = 32, color = '#4D0D0D' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="8" r="4" stroke={color} strokeWidth="2.5" fill="none"/>
      <path d="M24 14v14l-6 12M24 28l6 10" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M14 18h20" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconSecurity({ size = 32, color = '#4D0D0D' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M24 6l16 6v12c0 10-8 18-16 20C16 42 8 34 8 24V12L24 6Z"
        stroke={color} strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
      <path d="M16 24l5 5 11-10" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconInquiry({ size = 32, color = '#4D0D0D' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="18" stroke={color} strokeWidth="2.5" fill="none"/>
      <path d="M20 20c0-2.2 1.8-4 4-4s4 1.8 4 4c0 2-1.5 3-3 4v2" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="24" cy="34" r="1.5" fill={color}/>
    </svg>
  );
}

export function IconAlert({ size = 32, color = '#4D0D0D' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M24 6L4 42h40L24 6Z" stroke={color} strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
      <path d="M24 20v10" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="24" cy="35" r="1.5" fill={color}/>
    </svg>
  );
}

export function IconFeedback({ size = 32, color = '#4D0D0D' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M24 8l4 8 9 1.5-6.5 6.5 1.5 9L24 29l-8 4 1.5-9L11 17.5 20 16z"
        stroke={color} strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

export function IconRing({ size = 32, color = '#4D0D0D' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="26" r="14" stroke={color} strokeWidth="2.5" fill="none"/>
      <circle cx="24" cy="26" r="8" stroke={color} strokeWidth="2" fill="none"/>
      <path d="M18 12l3-6h6l3 6" stroke={color} strokeWidth="2.5" strokeLinejoin="round"/>
      <path d="M15 14h18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}