import { useEffect, useState } from 'react';

export default function useUserActivity() {
  const [activeUser, setActiveUser] = useState(true);

  useEffect(() => {
    let timeout: any;

    const resetTimer = () => {
      setActiveUser(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setActiveUser(false);
      }, 10000);
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('mousedown', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    window.addEventListener('scroll', resetTimer);

    resetTimer();

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('mousedown', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
      window.removeEventListener('scroll', resetTimer);
    };
  }, []);

  return activeUser;
}
