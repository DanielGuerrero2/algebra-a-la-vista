import { BrandIcon } from './BrandIcon.jsx';
import { SiteNavigation } from './SiteNavigation.jsx';

export function SiteHeader({ current, className = '', beforeBrand, afterBrand, beforeNavigation, inert }) {
  return <header inert={inert || undefined} class={`site-header ${className}`}>
    <div class="site-header-identity">
      {beforeBrand}
      <a href="/" class="site-brand" aria-label="Álgebra a la vista, inicio">
        <BrandIcon/>
        <span>Álgebra a la vista<span class="landing-dot">.</span><small>APRENDE HACIENDO</small></span>
      </a>
      {afterBrand}
    </div>
    <div class="site-header-actions">
      {beforeNavigation}
      <SiteNavigation current={current}/>
    </div>
  </header>;
}
