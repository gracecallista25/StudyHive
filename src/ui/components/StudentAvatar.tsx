import type { Student } from '../../types/student';
const palette = {
  lin: { background: '#d6e6de', shirt: '#477762', hair: '#26372f', skin: '#e5b999' },
  maya: { background: '#f3e5c5', shirt: '#dfc88e', hair: '#533e2f', skin: '#f0cbaa' },
  alex: { background: '#e8e3cf', shirt: '#5a7373', hair: '#353c37', skin: '#d8ad87' },
  yuna: { background: '#dae4dd', shirt: '#a2b39b', hair: '#333d35', skin: '#f0c6a6' },
};
export function StudentAvatar({ variant, className = '' }: { variant: Student['avatar']; className?: string }) {
  const p = palette[variant], longHair = variant === 'maya' || variant === 'yuna';
  return <svg className={'avatar ' + className} viewBox="0 0 120 120" role="img" aria-label="Fictional illustrated student avatar">
    <circle cx="60" cy="60" r="60" fill={p.background}/>
    <path d="M0 95 24 79l26 10 28-15 42 17v29H0Z" fill="#fff" opacity=".3"/>
    {longHair && <path d="M30 94V49c0-41 61-42 61 0v45Z" fill={p.hair}/>}
    <path d="M19 120c1-29 17-39 41-39s40 10 41 39Z" fill={p.shirt}/>
    <path d="M49 73h22v17c-7 11-16 11-22 0Z" fill={p.skin}/>
    <ellipse cx="60" cy="53" rx="25" ry="31" fill={p.skin}/>
    <path d={longHair ? 'M34 58C21 26 45 12 64 17c28-2 31 25 22 44-1-19-10-25-18-29-10 13-24 17-34 16Z' : 'M34 55c-11-14-3-27 5-29-3-6 2-10 10-8 10-12 37-3 38 9 10 9 6 24-2 29l-4-19c-10 5-22 0-26-5-6 9-12 11-19 9Z'} fill={p.hair}/>
    <g fill="none" stroke={p.hair} strokeLinecap="round"><path d="M44 51h8m16 0h8" strokeWidth="1.7"/><path d="M59 57 57 66h4" opacity=".5"/><path d="M52 73q8 6 16-1" strokeWidth="1.8"/></g>
    <g fill={p.hair}><ellipse cx="49" cy="57" rx="1.7" ry="2"/><ellipse cx="72" cy="57" rx="1.7" ry="2"/></g>
    {variant === 'alex' && <g stroke="#33483d" strokeWidth="1.5" fill="none"><rect x="38" y="50" width="21" height="15" rx="5"/><rect x="64" y="50" width="21" height="15" rx="5"/><path d="M59 54h5"/></g>}
    <path d="m45 91 15 12 15-12m-15 12v17" fill="none" stroke="#fff" opacity=".5" strokeWidth="2"/>
  </svg>;
}
