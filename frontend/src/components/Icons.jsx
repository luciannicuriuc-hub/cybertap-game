function IconBase({ className = '', children, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {children}
    </svg>
  );
}

export function LogoIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M12 2.5 19.5 7v10L12 21.5 4.5 17V7L12 2.5Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="m8.2 11.2 3.2-3.2 4.4 4.4-3.2 3.2-4.4-4.4Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 6.2v11.6" stroke="currentColor" strokeWidth="1.2" opacity="0.65" />
    </IconBase>
  );
}

export function TapIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M7 4.5 17.5 10.5 13 11l1.4 5.2-2.2.7L10.9 11 7.9 14.1 7 4.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M18.4 5.8h1.8M18.9 4.3l1.2-1.2M20.1 6.5l1.2 1.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="17.8" cy="12.1" r="1.4" stroke="currentColor" strokeWidth="1.4" />
    </IconBase>
  );
}

export function ShopIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M5 7.5h14l-1 5H6L5 7.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M6.5 12.5V18h11v-5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 7.5V6.3c0-1.2.8-2.3 2-2.6M15 7.5V6.3c0-1.2-.8-2.3-2-2.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </IconBase>
  );
}

export function TrophyIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M7 4.5h10V7c0 3-2.2 5.4-5 5.4S7 10 7 7V4.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 12.4V14c0 1.6 1.2 2.8 3 2.8s3-1.2 3-2.8v-1.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9.2 17.5h5.6M10 20h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M7 6H4.5A2 2 0 0 0 6 8.9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M17 6h2.5A2 2 0 0 1 18 8.9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </IconBase>
  );
}

export function GiftIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M4.5 8h15v4h-15V8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M6 12v8h12v-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 8v12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8.5 8c-1.2 0-2-.8-2-2s.8-2 2-2c1.6 0 2.9 1.5 3.5 4M15.5 8c1.2 0 2-.8 2-2s-.8-2-2-2c-1.6 0-2.9 1.5-3.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

export function DailyIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M7 4.5h10v3H7v-3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M6 6.5h12A1.5 1.5 0 0 1 19.5 8v8A3.5 3.5 0 0 1 16 19.5H8A3.5 3.5 0 0 1 4.5 16V8A1.5 1.5 0 0 1 6 6.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9.2 12.2 11 14l3.8-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

export function BoltIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M13.2 2.5 6.5 13h4.1L10 21.5 17.5 11H13.4L13.2 2.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </IconBase>
  );
}

export function CoinIcon(props) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8.2v7.6M10.2 9.8h2.3c1 0 1.8.6 1.8 1.5S13.5 13 12.4 13h-1.9c-1 0-1.8.7-1.8 1.5s.8 1.5 1.8 1.5h2.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

export function CopyIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M8.5 8h7A1.5 1.5 0 0 1 17 9.5v7A1.5 1.5 0 0 1 15.5 18h-7A1.5 1.5 0 0 1 7 16.5v-7A1.5 1.5 0 0 1 8.5 8Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6.5 16A1.5 1.5 0 0 1 5 14.5v-7A1.5 1.5 0 0 1 6.5 6h7A1.5 1.5 0 0 1 15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </IconBase>
  );
}

export function ExternalIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M10 7h7v7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 7 8 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6.5 6.5v11h11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.85" />
    </IconBase>
  );
}

export function BadgeIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M12 3 5 7v5c0 4.4 2.7 7.7 7 9 4.3-1.3 7-4.6 7-9V7l-7-4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9.2 12.2 11 14l3.9-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}
