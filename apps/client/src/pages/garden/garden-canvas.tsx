import { useState } from 'react';
import CanvasBgImage from '@/assets/garden.png';
import Cloud1Image from '@/assets/cloud_1.png';
import Cloud2Image from '@/assets/cloud_2.png';
import Cloud3Image from '@/assets/cloud_3.png';
import MoonImage from '@/assets/garden_moon.png';
import { Sparkle } from 'lucide-react';

const cloudStyle = {
  position: 'absolute' as const,
  pointerEvents: 'none' as const,
};

// 구름 높이를 랜덤으로 지정
const randomTop = (min = 5, max = 35) =>
  `${Math.floor(Math.random() * (max - min + 1)) + min}%`;

// 별 위치를 랜덤으로 지정하여 캔버스에 뿌림
const sparkles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  top: `${Math.random() * 90}%`,
  left: `${Math.random() * 95}%`,
  size: Math.floor(Math.random() * 12) + 10,
  delay: `${(Math.random() * 4).toFixed(1)}s`,
  duration: `${(Math.random() * 2 + 2).toFixed(1)}s`,
}));

export function GardenCanvas() {
  const [tops, setTops] = useState({ c1: '8%', c2: '18%', c3: '12%' });

  const nextTop = (key: keyof typeof tops) =>
    setTops((prev) => ({ ...prev, [key]: randomTop() }));

  return (
    <div className='relative overflow-hidden h-screen'>
      <img
        src={CanvasBgImage}
        alt=''
        className='absolute inset-0 w-full h-full object-cover'
      />
      {/* 별 */}
      {sparkles.map(({ id, top, left, size, delay, duration }) => (
        <Sparkle
          key={id}
          size={size}
          className='absolute pointer-events-none text-yellow-300'
          style={{
            top,
            left,
            animation: `sparkle-twinkle ${duration} ease-in-out ${delay} infinite`,
          }}
        />
      ))}
      {/* 구름1 */}
      <img
        src={Cloud1Image}
        alt=''
        style={{
          ...cloudStyle,
          top: tops.c1,
          width: '150px',
          animation: 'cloud-ltr 60s linear infinite',
        }}
        onAnimationIteration={() => nextTop('c1')}
      />
      {/* 구름2 */}
      <img
        src={Cloud2Image}
        alt=''
        style={{
          ...cloudStyle,
          top: tops.c2,
          width: '200px',
          animation: 'cloud-ltr 80s linear infinite',
          animationDelay: '-12s',
        }}
        onAnimationIteration={() => nextTop('c2')}
      />
      {/* 구름3 */}
      <img
        src={Cloud3Image}
        alt=''
        style={{
          ...cloudStyle,
          top: tops.c3,
          width: '180px',
          animation: 'cloud-rtl 70s linear infinite',
          animationDelay: '-8s',
        }}
        onAnimationIteration={() => nextTop('c3')}
      />
      {/* 달 */}
      <img
        src={MoonImage}
        alt=''
        className='absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-[250px]'
      />
      <style>{`
        @keyframes cloud-ltr {
          from { transform: translateX(-100%); }
          to   { transform: translateX(100vw); }
        }
        @keyframes cloud-rtl {
          from { transform: translateX(100vw); }
          to   { transform: translateX(-100%); }
        }
        @keyframes sparkle-twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.3); }
          50%       { opacity: 1;   transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
