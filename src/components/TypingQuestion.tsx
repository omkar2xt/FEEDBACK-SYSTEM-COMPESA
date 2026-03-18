import { useEffect, useMemo, useState } from "react";

interface TypingQuestionProps {
  text: string;
}

export function TypingQuestion({ text }: TypingQuestionProps) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    setVisibleCount(0);
    const timer = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= text.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 22);

    return () => clearInterval(timer);
  }, [text]);

  const rendered = useMemo(() => text.slice(0, visibleCount), [text, visibleCount]);

  return (
    <h2 className="text-2xl font-semibold leading-tight text-white sm:text-3xl">
      {rendered}
      <span className="ml-1 inline-block h-6 w-[2px] animate-pulse bg-cyan-300" aria-hidden />
    </h2>
  );
}
