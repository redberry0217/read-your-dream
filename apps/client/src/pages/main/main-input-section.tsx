import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainBgImage from '@/assets/main.png';
import MainTitleImage from '@/assets/mjdr_title.png';
import { Textarea, Button } from '@/shared/ui';
import { useInterpret } from '@/hooks/interpret/use-interpret';
import { Sparkles, Loader2, Cloud } from 'lucide-react';

const MOOD_CLOUDS = [
  { id: 'career', label: '진로·시험', emoji: '🧭' },
  { id: 'anxiety', label: '불안·초조', emoji: '🌧️' },
  { id: 'relationship', label: '인간관계', emoji: '👥' },
  { id: 'burnout', label: '탈진·무기력', emoji: '🍂' },
  { id: 'love', label: '연애·이별', emoji: '🥀' },
  { id: 'money', label: '금전·재물', emoji: '🪙' },
  { id: 'hope', label: '설렘·새출발', emoji: '🌱' },
  { id: 'lonely', label: '공허·외로움', emoji: '🌙' },
];

export function InputSection() {
  const [dream, setDream] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const navigate = useNavigate();
  const { mutate: interpret, isPending } = useInterpret();

  const toggleTag = (id: string) => {
    setSelectedTags((prev) =>
      prev.includes(id)
        ? prev.filter((t) => t !== id)
        : prev.length < 3
        ? [...prev, id]
        : prev,
    );
  };

  const handleClear = () => {
    if (!dream.trim() && selectedTags.length === 0) return;
    const confirmed = window.confirm('작성 중인 꿈 내용과 선택한 고민을 정말로 모두 지우시겠습니까?');
    if (confirmed) {
      setDream('');
      setSelectedTags([]);
    }
  };

  const isGibberishOrTooShort = (text: string) => {
    const trimmed = text.trim();
    if (trimmed.length < 10) return true;
    // 자음 또는 모음만으로 이루어진 경우
    if (/^[ㄱ-ㅎㅏ-ㅣ\s]+$/.test(trimmed)) return true;
    // 동일 글자 4회 이상 연속 반복 (예: ㅋㅋㅋㅋ, 아아아아)
    if (/(.)\1{3,}/.test(trimmed)) return true;
    // 자음 비율이 전체의 50% 초과인 경우
    const consonantsOnly = trimmed.match(/[ㄱ-ㅎ]/g)?.length || 0;
    if (consonantsOnly / trimmed.length > 0.5) return true;
    return false;
  };

  const handleInterpret = (forcedContent?: string) => {
    const targetContent = forcedContent || dream;
    if (!targetContent.trim() || isPending) return;

    if (!forcedContent && isGibberishOrTooShort(dream)) {
      setShowNoticeModal(true);
      return;
    }

    setErrorMessage(null);
    setShowNoticeModal(false);

    const worryLabels = selectedTags
      .map((id) => MOOD_CLOUDS.find((c) => c.id === id)?.label)
      .filter((label): label is string => !!label);

    interpret(
      {
        content: targetContent,
        worryTags: worryLabels,
      },
      {
        onSuccess: (data) => {
          // 세션 스토리지에 결과 임시 보관 (새로고침 방어)
          try {
            sessionStorage.setItem('mjdr_last_result', JSON.stringify({
              ...data,
              dreamContent: forcedContent ? '오늘 하루의 운세를 점치며 내면의 길을 묻나이다.' : (data.dreamContent || dream),
              worryTags: worryLabels,
            }));
          } catch (e) {
            console.error('Failed to cache result in sessionStorage', e);
          }

          if (data.savedLog?.id) {
            navigate(`/result/${data.savedLog.id}`);
          } else {
            navigate('/result');
          }
        },
        onError: (error) => {
          console.error(error);
          setErrorMessage('해몽 도중 오류가 발생했습니다. 잠시 후 다시 시도해 주십시오.');
        },
      },
    );
  };

  return (
    <section
      id='input'
      className='bg-cover bg-center bg-no-repeat px-6 pb-20 relative overflow-hidden'
      style={{ backgroundImage: `url(${MainBgImage})` }}
    >
      {/* 배경 이미지 은은한 오버레이 (일러스트가 은은하고 시원하게 보이도록 톤 완화) */}
      <div className='absolute inset-0 bg-stone-950/35' />
      <div className='absolute inset-0 bg-gradient-to-b from-stone-950/50 via-transparent to-stone-950/80 pointer-events-none' />

      <div className='relative z-0 mx-auto flex max-w-2xl pt-20 flex-col items-center text-center'>
        {/* 타이틀 이미지 */}
        <img src={MainTitleImage} alt='Main Title' className='w-full h-auto drop-shadow-2xl' />

        {/* 서브 텍스트 */}
        <div className='flex flex-col py-5 items-center space-y-2'>
          <span className='text-lg sm:text-xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'>
            꿈 안에는 아직 가보지 못한 수많은 무의식의 길이 있습니다.
          </span>
          <span className='text-sm sm:text-base font-medium text-amber-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]'>
            어젯밤 꾼 꿈을 적어주시면, 16세기 조선 역술가가 타로와 오욕칠정으로 길을 비추어 드립니다.
          </span>
        </div>

        {/* 구름 감정/고민 태그 선택 영역 (선택사항) */}
        <div className='w-full mb-4 mt-2 p-4 rounded-xl border border-stone-800/90 bg-stone-950/80 backdrop-blur-md shadow-xl'>
          <div className='flex items-center justify-between mb-3 text-xs text-stone-300'>
            <span className='flex items-center gap-1.5 font-semibold text-amber-200'>
              <Cloud size={14} className='text-amber-400' />
              마음에 얹힌 고민이나 기분을 골라보시오 (선택, 최대 3개)
            </span>
            <span className='text-amber-300 font-mono font-bold'>{selectedTags.length}/3 선택됨</span>
          </div>
          <div className='flex flex-wrap gap-2.5 justify-center'>
            {MOOD_CLOUDS.map((tag) => {
              const isSelected = selectedTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type='button'
                  onClick={() => toggleTag(tag.id)}
                  disabled={isPending}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 border-2 border-yellow-200 text-stone-950 font-bold shadow-[0_0_15px_rgba(245,158,11,0.65)] scale-105 ring-2 ring-amber-300'
                      : 'bg-stone-900/85 border-stone-700 text-stone-200 hover:border-amber-400/70 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  <span className='text-sm'>{tag.emoji}</span>
                  <span>{tag.label}</span>
                  {isSelected && <span className='text-xs font-black text-stone-950 ml-0.5'>✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* 꿈 입력 영역 */}
        <div className='w-full relative shadow-2xl rounded-xl'>
          <Textarea
            value={dream}
            onChange={(e) => setDream(e.target.value)}
            rows={6}
            disabled={isPending}
            placeholder='어떤 꿈을 꾸었나요? 기억나는 장면, 물건, 감정을 편안하게 적어주십시오.'
            color='seokganju'
            className='w-full p-4 pb-10 resize-none bg-stone-900/90 text-stone-100 text-base leading-relaxed placeholder:text-stone-400 border border-stone-700/80 rounded-xl focus:border-seokganju-400 focus:bg-stone-900 focus:ring-2 focus:ring-seokganju-500/30'
          />
          <div className='absolute bottom-3 right-4 text-xs font-mono text-stone-400 pointer-events-none'>
            {dream.length}자
          </div>
        </div>

        {errorMessage && (
          <p className='mt-2 text-sm text-red-400 bg-red-950/40 px-3 py-1 rounded border border-red-800/50'>
            {errorMessage}
          </p>
        )}

        {/* 버튼 영역 */}
        <div className='flex items-end gap-4 mt-4'>
          <Button
            variant='filled'
            color='seokganju'
            disabled={(!dream.trim() && selectedTags.length === 0) || isPending}
            onClick={handleClear}
          >
            글 지우기
          </Button>
          <Button
            variant='filled'
            color='yangrok'
            disabled={!dream.trim() || isPending}
            onClick={() => handleInterpret()}
            className='min-w-[120px] flex items-center justify-center gap-2'
          >
            {isPending ? (
              <>
                <Loader2 size={16} className='animate-spin' />
                <span>괘를 짚는 중...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>결과 보기</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 로딩 중 오버레이 모달 (신비로운 연출) */}
      {isPending && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md px-4'>
          <div className='max-w-md w-full p-8 rounded-2xl border border-seokganju-700/80 bg-stone-950/90 text-center shadow-2xl flex flex-col items-center animate-fade-in'>
            <div className='relative mb-6'>
              <div className='w-20 h-20 rounded-full border-2 border-seokganju-500/40 border-t-seokganju-300 animate-spin flex items-center justify-center' />
              <Sparkles className='absolute inset-0 m-auto text-yellow-300 animate-pulse' size={28} />
            </div>
            <h3 className='text-xl font-bold text-seokganju-100 mb-2'>
              역도사가 운명의 괘를 살피고 있소
            </h3>
            <p className='text-sm text-stone-300 leading-relaxed mb-4'>
              78장의 타로 패를 섞으며 그대의 무의식에 깃든<br />
              오욕칠정과 꿈의 상징을 풀이하는 중이오.
            </p>
            <span className='text-xs text-seokganju-300/80 animate-pulse'>
              잠시 마음을 가다듬고 기다려 주시오...
            </span>
          </div>
        </div>
      )}

      {/* 장난글 / 짧은 입력 안내 모달 */}
      {showNoticeModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 animate-fade-in'>
          <div className='max-w-md w-full p-7 rounded-2xl border border-seokganju-600/70 bg-stone-950 text-center shadow-2xl space-y-4'>
            <div className='w-12 h-12 mx-auto rounded-full bg-seokganju-500/20 text-seokganju-300 flex items-center justify-center text-2xl'>
              📜
            </div>
            <h3 className='text-lg font-bold text-stone-100'>
              몽중의 자취가 너무 희미하오
            </h3>
            <p className='text-xs sm:text-sm text-stone-300 leading-relaxed'>
              꿈속의 장면이나 감정을 <span className='text-amber-300 font-semibold'>10자 이상</span> 적어주셔야 무의식의 괘를 온전히 짚을 수 있소이다.
              <br /><br />
              혹 꾼 꿈이 잘 기억나지 않는다면, 꿈 풀이 대신 <span className='text-amber-300 font-semibold'>오늘의 운세 3패</span>만 바로 점쳐보시겠소?
            </p>
            <div className='pt-2 flex flex-col sm:flex-row justify-center gap-2.5'>
              <Button
                variant='outline'
                color='seokganju'
                className='flex-1 py-2 text-xs'
                onClick={() => setShowNoticeModal(false)}
              >
                ✏️ 꿈 다시 적기
              </Button>
              <Button
                variant='filled'
                color='yangrok'
                className='flex-1 py-2 text-xs font-bold'
                onClick={() => handleInterpret('오늘 하루의 운세를 점치며 내면의 길을 묻나이다.')}
              >
                🎴 오늘 운세 3패 뽑기
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
