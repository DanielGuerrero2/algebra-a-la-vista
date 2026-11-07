export function BrandIcon({ className = '' }) {
  return <img src={`${import.meta.env.BASE_URL}assets/brand/brand-icon-256.png`} class={`brand-icon ${className}`} width="36" height="36" alt="" aria-hidden="true"/>;
}
