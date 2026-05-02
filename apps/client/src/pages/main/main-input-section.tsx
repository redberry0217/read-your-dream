import { useState } from 'react';
import MainBgImage from '@/assets/main.png';
import MainTitleImage from '@/assets/mjdr_title.png';
import { Textarea, Button } from '@/shared/ui';

export function InputSection() {
  const [dream, setDream] = useState('');

  return (
    <section
      id='input'
      className='bg-cover bg-center bg-no-repeat px-6 pb-20'
      style={{ backgroundImage: `url(${MainBgImage})` }}
    >
      <div className='mx-auto flex max-w-2xl pt-20 flex-col items-center text-center'>
        {/* 타이틀 이미지 */}
        <img src={MainTitleImage} alt='Main Title' className='w-full h-auto' />

        {/* 서브 텍스트 */}
        <div className='flex flex-col py-5 items-center text-ink-light'>
          <span>꿈 안에는 아직 가보지 못한 수많은 길이 있습니다.</span>
          <span>데헷 여기 무슨말을 더 넣어야 할까</span>
        </div>

        {/* 꿈 입력 영역 */}
        <Textarea
          value={dream}
          onChange={(e) => setDream(e.target.value)}
          rows={6}
          placeholder='어떤 꿈을 꾸었나요? 기억나는 장면과 감정을 상세히 적을수록 좋습니다.'
          color='seokganju'
          className='w-full pb-12 resize-none'
        />
        <div className='flex items-end gap-4 mt-4'>
          <Button
            variant='filled'
            color='yangrok'
            disabled={!dream.trim()}
            onClick={() => setDream('')}
          >
            글 지우기
          </Button>
          <Button variant='filled' color='seokganju' disabled={!dream.trim()}>
            결과 보기
          </Button>
        </div>
      </div>
    </section>
  );
}
