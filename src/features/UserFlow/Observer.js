import {useEffect, useRef} from 'react';

function Observer({ setScrollBottom }) {
  /* 채팅영역 스크롤 최하단인지 아닌지 감지하는 옵저버 */
  const trigger = useRef();
  const observer = useRef();
  useEffect(() => {
    observer.current = new IntersectionObserver((entries) => {
      setScrollBottom(entries[0].isIntersecting);
    }, {
      root: null,
      threshold: 0,
    })
    observer.current.observe(trigger.current);
    return () => {
      observer.current.disconnect();
    }
  });
  return <div ref={ trigger } style={{ height: '1px' }}></div>;
}

export default Observer;
