
import { useEffect, RefObject } from 'react';

type RefType = RefObject<HTMLElement>;

export function useClickOutside(refs: RefType | RefType[], callback: () => void) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const refsArray = Array.isArray(refs) ? refs : [refs];
      
      const clickedOutside = refsArray.every(ref => {
        return !ref.current || !ref.current.contains(event.target as Node);
      });
      
      if (clickedOutside) {
        callback();
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [refs, callback]);
}