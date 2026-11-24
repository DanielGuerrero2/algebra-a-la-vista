import { Icon } from './ui.jsx';

export function PanelHeading({ icon, title, titleId, children }) {
  return <header class="panel-heading">
    <span class="panel-symbol"><Icon name={icon} size={18}/></span>
    <h2 id={titleId} class="min-w-0 flex-1 break-words">{title}</h2>
    {children}
  </header>;
}

export function WorkspaceNotice({ notice, id }) {
  return <div id={id} class="workspace-notice" role="status" data-kind={notice?.kind}>
    {notice && <><Icon name={notice.kind === 'success' ? 'check' : 'help'}/><span>{notice.text}</span></>}
  </div>;
}
