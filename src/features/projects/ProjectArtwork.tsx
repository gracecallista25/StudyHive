import type { ProjectArt } from './projectData';

// Small native illustrations follow the same palette as the shared campus artwork.
export function ProjectArtwork({ variant }: { variant: ProjectArt }) {
  return (
    <svg className="project-artwork" viewBox="0 0 150 130" fill="none" aria-hidden="true">
      {variant === 'connect' && <>
        <path d="M30 45 98 22 86 85 30 45 125 62 86 85 46 114" stroke="#557967" strokeWidth="2" />
        <circle cx="30" cy="45" r="23" fill="#d7e5d5" />
        <circle cx="98" cy="22" r="15" fill="#173d30" />
        <circle cx="86" cy="85" r="25" fill="#173d30" />
        <circle cx="125" cy="62" r="12" fill="#ffdc67" />
        <circle cx="46" cy="114" r="9" fill="#ffdc67" />
        <g fill="#173d30"><circle cx="30" cy="39" r="6" /><path d="M19 56c0-14 22-14 22 0Z" /></g>
        <g fill="#faf9f3"><circle cx="98" cy="18" r="4" /><path d="M91 29c0-10 14-10 14 0Z" /></g>
        <g fill="#ffdc67"><circle cx="86" cy="78" r="7" /><path d="M74 98c0-17 24-17 24 0Z" /></g>
      </>}
      {variant === 'planner' && <>
        <rect x="19" y="22" width="94" height="91" rx="9" fill="#faf9f3" stroke="#173d30" strokeWidth="2" />
        <path d="M19 31a9 9 0 0 1 9-9h76a9 9 0 0 1 9 9v18H19Z" fill="#173d30" />
        <path d="M39 14v20m53-20v20" stroke="#faf9f3" strokeWidth="6" strokeLinecap="round" />
        {[0, 1, 2].map(row => [0, 1, 2, 3].map(column => (
          <rect key={`${row}-${column}`} x={31 + column * 19} y={60 + row * 16} width="12" height="10" rx="2" fill={row === column ? '#ffdc67' : '#dbe6d6'} />
        )))}
        <path d="M107 106c-8-26 3-44 31-48-2 28-12 42-31 48Z" fill="#87ab8d" />
        <path d="m108 112 22-42" stroke="#173d30" strokeWidth="2" />
      </>}
      {variant === 'leaf' && <>
        <path d="M70 117C40 70 61 26 122 16c8 49-17 80-52 101Z" fill="#8eaf92" />
        <path d="M68 119C31 111 14 87 14 57c37 4 56 22 54 62Z" fill="#bed1b6" />
        <path d="M68 122 103 39M69 120 31 76" stroke="#173d30" strokeWidth="2.5" strokeLinecap="round" />
        <path d="m29 24 7 15m91 51 14-5m-9 23 12 3" stroke="#ffdc67" strokeWidth="5" strokeLinecap="round" />
      </>}
      {variant === 'code' && <>
        <rect x="15" y="23" width="112" height="88" rx="8" fill="#faf9f3" stroke="#173d30" strokeWidth="2" />
        <path d="M15 31a8 8 0 0 1 8-8h96a8 8 0 0 1 8 8v17H15Z" fill="#173d30" />
        <circle cx="29" cy="36" r="3" fill="#ffdc67" /><circle cx="40" cy="36" r="3" fill="#bed1b6" /><circle cx="51" cy="36" r="3" fill="#faf9f3" />
        <path d="m48 64-13 14 13 13m44-27 13 14-13 13M80 58 64 98" stroke="#173d30" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="127" cy="110" r="18" fill="#ffdc67" />
      </>}
    </svg>
  );
}
