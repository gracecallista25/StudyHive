import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function LeafMark() {
  return <svg viewBox="0 0 44 46" aria-hidden="true"><path fill="#ffdc67" d="M21 43C5 43 0 33 3 22c14-1 22 7 18 21Z"/><path fill="#dce6b6" d="M23 41c0-15 8-24 20-22 2 14-6 23-20 22Z"/><path fill="#e4d885" d="M21 22C8 20 6 9 13 1c11 4 14 12 8 21Z"/><path fill="#90aa70" d="M26 17c-2-10 4-15 13-14 1 8-3 14-13 14Z"/></svg>;
}

export function AcademicArt() {
  return <svg viewBox="0 0 400 220" className="academic-art" aria-hidden="true">
    <path d="M24 192c-13-44 44-39 73-72 24-26 31-63 75-50s72-31 112-16 38 65 57 81 44 33 26 57Z" fill="#f6ecd1"/>
    <g stroke="#4b6650" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M108 191c19-62 27-111 4-174M119 109c29-31 33-56 42-75M119 90C80 62 75 43 66 31M124 146c26-7 43-21 62-40" fill="none"/><path d="M111 48C90 38 88 12 92 3c25 9 30 24 19 45Z" fill="#8b9d73"/><path d="M119 85c-6-23 17-52 41-51-2 23-19 42-41 51Z" fill="#5d7959"/><path d="M104 90c-29 0-45-20-46-43 24 8 42 21 46 43Z" fill="#a4b28b"/><path d="M126 136c8-26 32-35 54-31-12 20-29 30-54 31Z" fill="#7b9267"/><path d="M110 155c-28-3-42-20-40-42 21 5 39 20 40 42Z" fill="#b1bd91"/><path d="m149 172 124-11 66 17-131 15Z" fill="#6d8360"/><path d="m150 173 1 24 57 16 131-13v-22l-130 14Z" fill="#fffcf1"/><path d="m149 101 128 3 48 18-130-4Z" fill="#a5ad88"/><path d="M150 102c-5 11-5 24 1 34l43 16 131-4v-26l-130-4Z" fill="#fffcf3"/><path d="m154 108 35 12m-35-5 35 12m-35-5 35 12m49-6 80 2m-80 4 80 2m-80 4 80 2" fill="none"/><path d="M29 215h340M83 209h266" opacity=".45"/></g>
    <text x="257" y="40" fill="#395442" fontSize="16" fontFamily="Georgia, serif" fontStyle="italic" transform="rotate(-9 257 40)">Good people.</text><text x="268" y="61" fill="#395442" fontSize="16" fontFamily="Georgia, serif" fontStyle="italic" transform="rotate(-9 268 61)">Great progress.</text>
  </svg>;
}

export function CampusArt() {
  return <svg viewBox="0 0 220 120" aria-hidden="true"><g fill="none" stroke="currentColor" strokeWidth=".9" opacity=".8"><path d="M3 112h214M61 112V25l33 6v80m-28-1V31m9-3v84m9-83v83m9-71-31-4m31 15-31-4m31 15-31-4m31 15-31-4m31 15-31-4M95 112V71l71-24 39 15v50M103 111V77l61-20 33 11v44m-91-24 58-20 32 12m-91 18 59-20 32 12m-91 18 59-20 32 12m-31-45v62m-13-59v59m-15-54v54m-14-48v48m61-55v55M34 112V59m0 11C15 46 9 61 8 65c12-4 17 0 26 5Zm0 0c6-29 20-19 21-13-12-1-15 5-21 13Zm0 0C18 55 18 45 26 46c-1 9 4 14 8 24Zm0 0c17-14 21-4 21 3-10-7-15-6-21-3ZM17 112V93m0 5C4 84 1 95 4 98m13 0c8-14 14-6 12-2"/></g></svg>;
}

export function Badge({ children }: { children: ReactNode }) {
  return <span className="badge">{children}</span>;
}

export function Button({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={'button ' + className} {...props} />;
}

const studentAvatarPalette = {
  lin: { background: '#d6e6de', shirt: '#477762', hair: '#26372f', skin: '#e5b999' },
  maya: { background: '#f3e5c5', shirt: '#dfc88e', hair: '#533e2f', skin: '#f0cbaa' },
  alex: { background: '#e8e3cf', shirt: '#5a7373', hair: '#353c37', skin: '#d8ad87' },
  yuna: { background: '#dae4dd', shirt: '#a2b39b', hair: '#333d35', skin: '#f0c6a6' },
};

export function StudentAvatar({ variant, className = '' }: { variant: keyof typeof studentAvatarPalette; className?: string }) {
  const palette = studentAvatarPalette[variant];
  const longHair = variant === 'maya' || variant === 'yuna';
  return <svg className={'avatar ' + className} viewBox="0 0 120 120" role="img" aria-label="Fictional illustrated student avatar">
    <circle cx="60" cy="60" r="60" fill={palette.background}/><path d="M0 95 24 79l26 10 28-15 42 17v29H0Z" fill="#fff" opacity=".3"/>
    {longHair && <path d="M30 94V49c0-41 61-42 61 0v45Z" fill={palette.hair}/>}<path d="M19 120c1-29 17-39 41-39s40 10 41 39Z" fill={palette.shirt}/>
    <path d="M49 73h22v17c-7 11-16 11-22 0Z" fill={palette.skin}/><ellipse cx="60" cy="53" rx="25" ry="31" fill={palette.skin}/>
    <path d={longHair ? 'M34 58C21 26 45 12 64 17c28-2 31 25 22 44-1-19-10-25-18-29-10 13-24 17-34 16Z' : 'M34 55c-11-14-3-27 5-29-3-6 2-10 10-8 10-12 37-3 38 9 10 9 6 24-2 29l-4-19c-10 5-22 0-26-5-6 9-12 11-19 9Z'} fill={palette.hair}/>
    <g fill="none" stroke={palette.hair} strokeLinecap="round"><path d="M44 51h8m16 0h8" strokeWidth="1.7"/><path d="M59 57 57 66h4" opacity=".5"/><path d="M52 73q8 6 16-1" strokeWidth="1.8"/></g>
    <g fill={palette.hair}><ellipse cx="49" cy="57" rx="1.7" ry="2"/><ellipse cx="72" cy="57" rx="1.7" ry="2"/></g>
    {variant === 'alex' && <g stroke="#33483d" strokeWidth="1.5" fill="none"><rect x="38" y="50" width="21" height="15" rx="5"/><rect x="64" y="50" width="21" height="15" rx="5"/><path d="M59 54h5"/></g>}
    <path d="m45 91 15 12 15-12m-15 12v17" fill="none" stroke="#fff" opacity=".5" strokeWidth="2"/>
  </svg>;
}

