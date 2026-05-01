import { useState } from 'react';

export function HeroSection() {
  const [dream, setDream] = useState('');

  return (
    <section className="bg-white px-6 pt-24 pb-20">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <h1 className="text-5xl font-semibold tracking-tight text-ink-primary">
          몽중다로
        </h1>
        <p className="mt-4 text-base text-ink-secondary">
          꿈 안에는 아직 가보지 못한 수많은 길이 있습니다.
        </p>

        <p className="mt-14 text-sm text-ink-tertiary">
          어떤 꿈을 꾸었나요? 기억나는 장면과 감정을 상세히 적을수록 좋습니다.
        </p>
        <textarea
          value={dream}
          onChange={(e) => setDream(e.target.value)}
          rows={10}
          placeholder="꿈을 적어보세요…"
          className="mt-3 w-full resize-none rounded-lg border border-stroke-default bg-white px-4 py-3 text-sm leading-relaxed text-ink-body placeholder:text-ink-disabled transition focus:border-seokganju-500 focus:outline-none focus:ring-2 focus:ring-seokganju-100"
        />
        <button
          type="button"
          disabled={!dream.trim()}
          className="mt-6 rounded-md bg-seokganju-500 px-8 py-3 text-sm font-medium text-white transition hover:bg-seokganju-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          결과보기
        </button>
      </div>
    </section>
  );
}
