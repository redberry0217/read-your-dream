import { useState } from 'react';
import MainBgImage from '@/assets/main.png';
import MainTitleImage from '@/assets/mjdr_title.png';

export function HeroSection() {
  const [dream, setDream] = useState('');

  return (
    <section
      className='bg-cover bg-center bg-no-repeat px-6 pb-20'
      style={{ backgroundImage: `url(${MainBgImage})` }}
    >
      <div className='mx-auto flex max-w-2xl pt-20 flex-col items-center text-center'>
        {/* 타이틀 이미지 */}
        <img src={MainTitleImage} alt='Main Title' className='w-full h-auto' />

        {/* 서브 텍스트 */}
        <div className='flex flex-col py-5 items-center text-ink-light'>
          <span>꿈 안에는 아직 가보지 못한 수많은 길이 있습니다.</span>
        </div>

        {/* 꿈 입력 영역 */}
        <textarea
          value={dream}
          onChange={(e) => setDream(e.target.value)}
          rows={7}
          placeholder='어떤 꿈을 꾸었나요? 기억나는 장면과 감정을 상세히 적을수록 좋습니다.'
          className='mt-3 w-full resize-none rounded-lg border border-stroke-default bg-white px-4 py-3 text-sm leading-relaxed text-ink-body placeholder:text-ink-disabled transition focus:border-seokganju-500 focus:outline-none focus:ring-2 focus:ring-seokganju-100'
        />
        <button
          type='button'
          disabled={!dream.trim()}
          className='mt-6 rounded-md bg-seokganju-500 px-8 py-3 text-sm font-medium text-white transition hover:bg-seokganju-700 disabled:cursor-not-allowed disabled:opacity-40'
        >
          결과보기
        </button>
      </div>
    </section>
  );
}
