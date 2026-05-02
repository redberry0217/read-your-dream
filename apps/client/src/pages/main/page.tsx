import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { InputSection } from './main-input-section';
import { StorySection } from './main-story-section';
import { FlowSection } from './main-flow-section';

export function MainPage() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 50);
  }, [hash]);

  return (
    <>
      <InputSection />
      <StorySection />
      <FlowSection />
    </>
  );
}
