import { BrandIcon } from './BrandIcon.jsx';
import { SiteNavigation } from './SiteNavigation.jsx';

export function SiteHeader({ current, className = '', beforeBrand, afterBrand, mainId, inert }) {
  return <>
    <a class="site-skip" href={`#${mainId}`} inert={inert || undefined}>Ir al contenido</a>
    <header inert={inert || undefined} class={`site-header ${className}`}>
      <div class="site-header-identity">
        {beforeBrand}
        <a href="#inicio" class="site-brand" aria-label="Álgebra a la vista, inicio">
          <BrandIcon/>
          <span>Álgebra a la vista</span>
        </a>
        {afterBrand}
      </div>
      <SiteNavigation current={current}/>
    </header>
  </>;
}
