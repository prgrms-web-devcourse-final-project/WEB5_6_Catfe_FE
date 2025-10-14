import { useCallback, useRef, useState } from 'react';

/**
 * 이 훅의 유일한 역할은 사용자의 카메라와 마이크에 최초로 접근하여
 * MediaStream 객체를 생성하는 것입니다.
 */
export function useMediaStream() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const startedRef = useRef(false);

  const initMedia = useCallback(async () => {
    // 중복 호출 방지
    if (startedRef.current || localStream) return localStream;
    startedRef.current = true;

    try {
      dlog('[media] getUserMedia start');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      dlog('[media] getUserMedia OK');
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error('[media] getUserMedia failed:', err);
      startedRef.current = false; // 실패 시 재시도 가능하도록
      return null;
    }
  }, [localStream]);
 
  return { localStream, initMedia };
}

// dlog 헬퍼 함수 (디버깅용)
const dlog = (...a: unknown[]) => {
  if (process.env.NODE_ENV === 'production') return;
  console.log('[media]', ...a);
};
