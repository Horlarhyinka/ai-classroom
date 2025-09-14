// utils/useSession.ts
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

let cachedSession: {user?: any; token?: string} = {};

export function useSession() {
  const [session, setSession] = useState<any>(cachedSession);
  const [loading, setLoading] = useState(!cachedSession);
  const router = useRouter()
  const pathName = usePathname()
  useEffect(() => {
    if (!cachedSession?.token || !cachedSession?.user) {
      fetch(process.env.NEXT_PUBLIC_API_BASE_URL! + '/auth/session', { 
        credentials: 'include',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
        .then(async (res) => {
          if (res.status == 200) {
            const data = await res.json();
            cachedSession = {user: data.user, token: data.token} as {user: any, token: string};
            setSession(cachedSession);
          } else {
            cachedSession = {};
            setSession({});
            if(pathName !== '/'){
             router.push('/auth/signin')
             }
          }
        })
        .catch((error) =>{
             console.error('Session fetch error:', error);
             setSession({})
             if(pathName !== '/'){
             router.push('/auth/signin')
             }
            })
        .finally(() => setLoading(false));
    }
  }, []);

  return { session, loading };
}

export function logout(){
    cachedSession = {}
}