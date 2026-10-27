import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { InterpretResult } from '@/types/dream';
import { Button, Textarea } from '@/shared/ui';
import { apiFetch } from '@/lib/api';
import { Sparkles, RotateCcw, ScrollText, Compass, ShieldAlert, ArrowLeft, Loader2, Send } from 'lucide-react';

const OH_YOK_LABELS: Record<string, string> = {
  food: '식욕 (생존)',
  wealth: '재욕 (성취)',
  sex: '색욕 (애정)',
  fame: '명예 (인정)',
  sleep: '수면 (안정)',
};

const CHIL_JUNG_LABELS: Record<string, string> = {
  joy: '환희 (喜)',
  anger: '분노 (怒)',
  sorrow: '비애 (哀)',
  fear: '경외 (懼)',
  love: '애착 (愛)',
  hate: '거부 (惡)',
  desire: '열망 (欲)',
};

export function ResultPage() {
  const [data, setData] = useState<InterpretResult | null>(null);
  const [questions, setQuestions] = useState<string[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finalReport, setFinalReport] = useState<string | null>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const navigate = useNavigate();
  const { logId } = useParams();

  useEffect(() => {
    // 1. 세션 스토리지에서 먼저 읽기 (방금 해몽한 결과)
    try {
      const cached = sessionStorage.getItem('mjdr_last_result');
      if (cached) {
        setData(JSON.parse(cached));
        return;
      }
    } catch (e) {
      console.error(e);
    }

    // 2. 만약 캐시가 없고 logId가 있으면 백엔드에서 조회 (추후 연동)
    if (!data && !logId) {
      // 결과 데이터가 없으면 메인으로 복귀
      navigate('/');
    }
  }, [logId, navigate]);

  if (!data) {
    return (
      <div className='min-h-[70vh] flex flex-col items-center justify-center p-6 text-center text-ink-light'>
        <p className='text-lg mb-4'>해몽 기록을 불러오는 중이거나 찾을 수 없소.</p>
        <Button
          variant='filled'
          color='seokganju'
          onClick={() => {
            navigate('/');
            window.scrollTo({ top: 0, behavior: 'instant' });
          }}
        >
          <RotateCcw size={16} className='mr-2' />
          다시 꿈 기록하러 가기
        </Button>
      </div>
    );
  }

  const { summary, analysis, tarotAnalysis, ohYok, chilJung, dreamContent, savedLog } = data;
  const userDream = dreamContent || savedLog?.content || (data as any).content || '';

  const handleStartDeepAnalysis = async () => {
    setIsLoadingQuestions(true);
    try {
      const json = await apiFetch<{ success: boolean; data?: { followUpQuestions: string[] } }>(
        '/api/dream/start-deep-analysis',
        {
          method: 'POST',
          body: JSON.stringify({
            logId: data?.savedLog?.id,
            dreamContent: userDream,
            analysis: data?.analysis,
          }),
        }
      );

      if (json.data?.followUpQuestions && Array.isArray(json.data.followUpQuestions)) {
        setQuestions(json.data.followUpQuestions);
        setTimeout(() => {
          document.getElementById('deep-questions-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        alert('도사의 문답 질문 데이터를 불러오지 못했습니다. 다시 시도해 주세요.');
      }
    } catch (e: any) {
      console.error(e);
      alert(`심층 문답 요청 오류: ${e.message || '네트워크 상태를 확인해 주세요.'}`);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleSubmitAnswers = async () => {
    const hasAnyAnswer = Object.values(answers).some((a) => a.trim().length > 0);
    if (!hasAnyAnswer) {
      alert('적어도 한 가지 질문에는 진솔한 답을 적어주셔야 처방전을 내릴 수 있소.');
      return;
    }

    setIsLoadingReport(true);
    try {
      const json = await apiFetch<{ success: boolean; data?: { finalReport: string } }>(
        '/api/dream/consolidate',
        {
          method: 'POST',
          body: JSON.stringify({
            logId: data?.savedLog?.id,
            answers,
            dreamContent: userDream,
            tarotAnalysis: data?.tarotAnalysis,
          }),
        }
      );

      if (json.data?.finalReport) {
        setFinalReport(json.data.finalReport);
        setTimeout(() => {
          document.getElementById('final-report-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        alert('대단원 처방전 데이터를 불러오지 못했습니다. 다시 시도해 주세요.');
      }
    } catch (e: any) {
      console.error(e);
      alert(`처방전 생성 오류: ${e.message || '네트워크 상태를 확인해 주세요.'}`);
    } finally {
      setIsLoadingReport(false);
    }
  };

  return (
    <div className='min-h-screen bg-stone-950 text-stone-100 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-4xl mx-auto space-y-10'>
        {/* 상단 네비게이션 */}
        <div className='flex items-center justify-between border-b border-stone-800 pb-4'>
          <button
            onClick={() => {
              navigate('/');
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            className='flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-100 transition'
          >
            <ArrowLeft size={16} />
            메인으로 돌아가기
          </button>
          <span className='text-xs font-mono tracking-widest text-seokganju-300 uppercase'>
            夢中茶路 · 1단계 기본 해몽
          </span>
        </div>

        {/* 사용자가 들려준 꿈 이야기 카드 */}
        {userDream && (
          <div className='p-6 sm:p-7 rounded-2xl border border-stone-800 bg-stone-900/60 backdrop-blur-md relative overflow-hidden shadow-xl'>
            <div className='flex flex-wrap items-center justify-between gap-2 mb-3.5 border-b border-stone-800/80 pb-3'>
              <div className='flex items-center gap-2'>
                <ScrollText size={18} className='text-amber-400' />
                <h3 className='text-sm sm:text-base font-semibold text-stone-200'>
                  그대가 들려준 꿈 이야기
                </h3>
              </div>
              {data.worryTags && data.worryTags.length > 0 && (
                <div className='flex flex-wrap items-center gap-1.5'>
                  {data.worryTags.map((tag, i) => (
                    <span
                      key={i}
                      className='text-xs px-2.5 py-0.5 rounded-full bg-stone-800 text-amber-300 border border-stone-700 font-medium'
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <p className='text-stone-200 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-normal italic bg-stone-950/40 p-4 rounded-xl border border-stone-800/60'>
              "{userDream}"
            </p>
          </div>
        )}

        {/* 한 줄 요약 헤더 카드 */}
        <div className='p-8 rounded-2xl border border-seokganju-700/60 bg-gradient-to-b from-stone-900 to-black text-center shadow-2xl relative overflow-hidden'>
          <div className='absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-seokganju-500/80 rounded-full blur-xs' />
          <div className='flex justify-center mb-4'>
            <Compass className='text-yellow-400 animate-pulse' size={32} />
          </div>
          <h2 className='text-xs tracking-widest uppercase text-seokganju-300 font-medium mb-3'>
            역도사의 한 줄 점사
          </h2>
          <p className='text-xl sm:text-2xl font-bold text-stone-100 leading-relaxed max-w-2xl mx-auto'>
            "{summary}"
          </p>
        </div>

        {/* 타로 3장 카드 섹션 */}
        <div>
          <div className='flex items-center justify-between mb-6'>
            <h3 className='text-lg font-bold text-seokganju-100 flex items-center gap-2'>
              <Sparkles size={20} className='text-yellow-300' />
              운명의 3패 (스프레드 시간축)
            </h3>
            <span className='text-xs text-stone-400'>과거 ➡️ 현재 ➡️ 미래의 흐름</span>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {tarotAnalysis.map((item, idx) => (
              <div
                key={idx}
                className='flex flex-col justify-between p-6 rounded-xl border border-stone-800 bg-stone-900/60 backdrop-blur-sm shadow-lg hover:border-seokganju-500/50 transition duration-300'
              >
                <div>
                  <div className='flex items-center justify-between mb-3'>
                    <span className='text-xs px-2.5 py-0.5 rounded-full font-medium bg-stone-800 text-seokganju-200 border border-stone-700'>
                      {item.position || `제 ${idx + 1} 패`}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        item.status.includes('역방향')
                          ? 'bg-red-950/70 text-red-300 border border-red-800/60'
                          : 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/60'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <h4 className='text-lg font-bold text-stone-100 mb-2'>{item.card}</h4>
                  <p className='text-sm text-stone-300 leading-relaxed mb-4'>{item.meaning}</p>
                </div>

                <div className='pt-4 border-t border-stone-800/80'>
                  <span className='block text-xs font-semibold text-seokganju-300 mb-1 flex items-center gap-1'>
                    <ShieldAlert size={12} />
                    도사의 현실 행동 처방
                  </span>
                  <p className='text-xs text-stone-400 leading-normal'>{item.advice}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 심층 무의식 분석 본문 */}
        <div className='p-8 rounded-2xl border border-stone-800 bg-stone-900/40 backdrop-blur-sm space-y-4'>
          <h3 className='text-lg font-bold text-seokganju-100 flex items-center gap-2'>
            <ScrollText size={20} className='text-seokganju-300' />
            도사의 심리 해석
          </h3>
          <p className='text-sm sm:text-base text-stone-300 leading-loose whitespace-pre-line'>
            {analysis}
          </p>
        </div>

        {/* 오욕칠정 수치화 섹션 */}
        <div className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* 오욕 (Five Desires) */}
            <div className='p-6 rounded-xl border border-stone-800 bg-stone-900/30'>
              <h4 className='text-sm font-bold text-seokganju-100 mb-4 flex items-center justify-between'>
                <span>오욕 (五欲) · 결핍과 욕망</span>
                <span className='text-xs font-normal text-stone-400'>0~100 수치</span>
              </h4>
              <div className='space-y-3'>
                {Object.entries(ohYok || {}).map(([key, val]) => (
                  <div key={key}>
                    <div className='flex justify-between text-xs text-stone-300 mb-1'>
                      <span>{OH_YOK_LABELS[key] || key}</span>
                      <span className='font-mono text-seokganju-300'>{val}점</span>
                    </div>
                    <div className='w-full h-2 rounded-full bg-stone-800 overflow-hidden'>
                      <div
                        className='h-full bg-gradient-to-r from-seokganju-700 to-seokganju-400 transition-all duration-500'
                        style={{ width: `${Math.min(100, Math.max(0, val))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 칠정 (Seven Emotions) */}
            <div className='p-6 rounded-xl border border-stone-800 bg-stone-900/30'>
              <h4 className='text-sm font-bold text-yangrok-100 mb-4 flex items-center justify-between'>
                <span>칠정 (七情) · 현재 감정 변동폭</span>
                <span className='text-xs font-normal text-stone-400'>0~100 수치</span>
              </h4>
              <div className='space-y-3'>
                {Object.entries(chilJung || {}).map(([key, val]) => (
                  <div key={key}>
                    <div className='flex justify-between text-xs text-stone-300 mb-1'>
                      <span>{CHIL_JUNG_LABELS[key] || key}</span>
                      <span className='font-mono text-yangrok-300'>{val}점</span>
                    </div>
                    <div className='w-full h-2 rounded-full bg-stone-800 overflow-hidden'>
                      <div
                        className='h-full bg-gradient-to-r from-yangrok-700 to-yangrok-400 transition-all duration-500'
                        style={{ width: `${Math.min(100, Math.max(0, val))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 오욕칠정 심리적 근거 노트 */}
          {data.emotionReasons && (
            <div className='p-5 rounded-xl border border-stone-800 bg-stone-900/40 text-xs text-stone-300 space-y-2'>
              <span className='font-bold text-seokganju-200 block mb-1'>
                📜 도사가 짚어낸 심리 수치의 근거
              </span>
              {data.emotionReasons.dominantDesire && (
                <p className='leading-relaxed text-stone-300'>
                  • <span className='text-seokganju-300 font-medium'>욕망의 징조:</span> {data.emotionReasons.dominantDesire}
                </p>
              )}
              {data.emotionReasons.dominantEmotion && (
                <p className='leading-relaxed text-stone-300'>
                  • <span className='text-yangrok-300 font-medium'>감정의 격동:</span> {data.emotionReasons.dominantEmotion}
                </p>
              )}
            </div>
          )}
        </div>

        {/* 2단계 심층 분석 섹션 */}
        {!questions && !finalReport && (
          <div className='p-8 rounded-2xl border border-yellow-600/40 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 text-center shadow-xl space-y-4'>
            <span className='text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30'>
              도사의 문답 · 2단계 심층 질문
            </span>
            <h3 className='text-xl font-bold text-stone-100'>
              더 깊은 무의식의 진실을 마주하시겠습니까?
            </h3>
            <p className='text-xs sm:text-sm text-stone-300 max-w-xl mx-auto leading-relaxed'>
              역도사가 그대의 허를 찌르는 3가지 심층 질문을 던집니다. 솔직한 고해를 바치면,
              오직 그대만을 위한 기품 있는 인생의 대단원 처방전을 내려드립니다.
              <br />
              <span className='text-xs text-amber-300 font-medium'>※ 테스트 기간: 금자 소모 없이 무료로 체험하실 수 있습니다.</span>
            </p>
            <div className='pt-2 flex justify-center gap-4'>
              <Button
                variant='filled'
                color='yangrok'
                disabled={isLoadingQuestions}
                className='px-6 py-2.5 font-bold shadow-lg shadow-yangrok-950/60 flex items-center gap-2'
                onClick={handleStartDeepAnalysis}
              >
                {isLoadingQuestions ? (
                  <>
                    <Loader2 size={16} className='animate-spin' />
                    <span>도사가 질문을 짓는 중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>금자 1냥으로 심층 문답 청하기 (체험 기간 무료)</span>
                  </>
                )}
              </Button>
              <Button
                variant='outline'
                color='seokganju'
                onClick={() => {
                  navigate('/');
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
              >
                새 꿈 적기
              </Button>
            </div>
          </div>
        )}

        {/* 2단계: 도사의 3가지 심층 질문 답변 작성 영역 */}
        {questions && !finalReport && (
          <div id='deep-questions-section' className='p-8 rounded-2xl border border-amber-600/60 bg-stone-900/80 backdrop-blur-md shadow-2xl space-y-6 animate-fade-in'>
            <div className='text-center space-y-2 border-b border-stone-800 pb-4'>
              <span className='text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30'>
                2단계 · 도사의 3가지 심층 문답
              </span>
              <h3 className='text-xl font-bold text-stone-100'>
                마음속 깊은 곳의 고해를 바치시오
              </h3>
              <p className='text-xs sm:text-sm text-stone-300 max-w-xl mx-auto'>
                도사가 던지는 세 가지 날카로운 질문에 솔직하게 답할수록, 무의식을 꿰뚫는 처방전이 더욱 명확해집니다.
              </p>
            </div>

            <div className='space-y-6'>
              {questions.map((q, idx) => (
                <div key={idx} className='p-5 rounded-xl border border-stone-800 bg-stone-950/70 space-y-3'>
                  <h4 className='text-sm sm:text-base font-bold text-amber-200 flex items-start gap-2'>
                    <span className='px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-xs font-mono font-bold mt-0.5'>
                      질문 {idx + 1}
                    </span>
                    <span className='leading-relaxed'>{q}</span>
                  </h4>
                  <Textarea
                    rows={3}
                    value={answers[`question_${idx}`] || ''}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [`question_${idx}`]: e.target.value }))}
                    placeholder='그대의 진솔한 생각이나 감정을 자유롭게 적어주시오...'
                    className='w-full p-3.5 bg-stone-900/90 text-stone-100 text-sm placeholder:text-stone-500 border border-stone-700/80 rounded-xl'
                  />
                </div>
              ))}
            </div>

            <div className='pt-4 flex justify-center gap-4'>
              <Button
                variant='filled'
                color='yangrok'
                disabled={isLoadingReport}
                className='px-8 py-3 font-bold shadow-xl shadow-yangrok-950/70 flex items-center gap-2 text-base'
                onClick={handleSubmitAnswers}
              >
                {isLoadingReport ? (
                  <>
                    <Loader2 size={18} className='animate-spin' />
                    <span>도사가 대단원 처방전을 짓는 중...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>도사에게 고해 바치고 대단원 처방전 받기</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* 3단계: 최종 대단원 심층 처방전 (완성 리포트) */}
        {finalReport && (
          <div id='final-report-section' className='p-8 rounded-2xl border-2 border-amber-500/60 bg-gradient-to-b from-stone-900 via-stone-950 to-stone-950 shadow-2xl space-y-6 animate-fade-in'>
            <div className='text-center space-y-2 border-b border-stone-800 pb-5'>
              <span className='text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40'>
                대단원 (大團圓) · 몽중다로 최종 처방전
              </span>
              <h3 className='text-2xl font-bold text-stone-100 tracking-tight'>
                도사의 대단원 심층 처방전
              </h3>
              <p className='text-xs text-stone-400'>
                초기 꿈의 상징, 운명의 3패, 그리고 그대의 고해를 엮어 완성된 최종 심리 분석입니다.
              </p>
            </div>

            <div className='p-6 sm:p-8 rounded-xl border border-stone-800 bg-stone-950/60 leading-relaxed text-stone-200 text-sm sm:text-base whitespace-pre-wrap font-normal'>
              {finalReport}
            </div>

            <div className='pt-4 flex justify-center gap-4'>
              <Button
                variant='filled'
                color='yangrok'
                onClick={() => {
                  navigate('/');
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                className='px-6 py-2.5 font-bold shadow-lg shadow-yangrok-950/60'
              >
                새로운 꿈 기록하러 가기
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
