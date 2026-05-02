const blocks = [
  {
    heading: '꿈은 헛된 환상이 아니라, "마음이 남긴 흔적"입니다.',
    points: [
      '기쁨, 분노, 슬픔, 사랑. 꿈은 오욕칠정의 흔적을 품고 있습니다.',
      '낮에 숨겨두었던 아주 작은 감정들도 밤에 꿈의 모습으로 찾아옵니다.',
      '몽중다로는 꿈속 수많은 길 가운데, 지금 당신의 마음이 향한 방향을 읽습니다.',
    ],
  },
  {
    heading: '오래 전부터 사람들은 꿈을 읽어왔습니다.',
    points: [
      "고려사, 삼국유사에도 '길몽'은 행운을 상징했습니다.",
      '조선 시대 사람들은 좋은 꿈을 사고팔기도 했으며, 최근에는 이를 증명하는 문서도 발견되었습니다. (한국국학진흥원)',
    ],
  },
  {
    heading: '이제 여러분의 꿈자취를 읽어보세요.',
    points: [
      '몽중다로는 동양의 오욕칠정과 서양의 타로 상징을 통해 당신의 꿈을 다각도로 해석합니다.',
      '대수롭지 않게 지나칠 수 있는 꿈속 이야기, 지금의 마음을 비추는 신호일 수 있습니다.',
    ],
  },
];

export function StorySection() {
  return (
    <section className="bg-surface-muted px-6 py-24">
      <div className="mx-auto flex max-w-2xl flex-col gap-16 text-center">
        {blocks.map((b) => (
          <div key={b.heading}>
            <h2 className="text-xl font-semibold leading-snug text-ink-primary">
              {b.heading}
            </h2>
            <ul className="mt-6 space-y-3">
              {b.points.map((p) => (
                <li key={p} className="text-sm leading-relaxed text-ink-body">
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
