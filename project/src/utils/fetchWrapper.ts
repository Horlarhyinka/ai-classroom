import axios from "axios";

// /util/fetchWrapper.js
const fetchWrapper = {
  post,
  get,
  put,
  del,
  patch,
  drop,
};

function handleRedirect(res: any) {
  if (res?.status === 401) {
    window.location.assign('/auth/signin');
    return;
  }
  return res;
}

function getHeaders(body: any) {
  if (body instanceof FormData) {
    return {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true,
    };
  }
  return {
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  };
}

async function post(url: string, body: any) {
  try{
  const res = await axios.post(url, body, getHeaders(body));
  return handleRedirect(res);
    }catch(err: any){
      if (err?.response?.status === 401) {
        window.location.assign('/auth/signin');
        return;
      }
  }
}

async function put(url: string, body: any) {
  try{
  const res = await axios.put(url, body, getHeaders(body));
  return handleRedirect(res);
    }catch(err: any){
      if (err?.response?.status === 401) {
        window.location.assign('/auth/signin');
        return;
      }
  }
}

async function patch(url: string, body: any) {
  try{
  const res = await axios.patch(url, body, getHeaders(body));
  return handleRedirect(res);
    }catch(err: any){
      if (err?.response?.status === 401) {
        window.location.assign('/auth/signin');
        return;
      }
  }
}

async function get(url: string) {
  try{

  const res = await axios.get(url, { withCredentials: true });
  console.log('lets see your status...', res.status)
  return handleRedirect(res);
  }catch(err: any){
      if (err?.response?.status === 401) {
        window.location.assign('/auth/signin');
        return;
      }
  }
}

async function drop(url: string) {
  try{
  const res = await axios.delete(url, { withCredentials: true });
  return handleRedirect(res);
    }catch(err: any){
      if (err?.response?.status === 401) {
        window.location.assign('/auth/signin');
        return;
      }
  }
}

async function del(url: string) {
  try{
  const res = await axios.delete(url, { withCredentials: true });
  return handleRedirect(res);
    }catch(err: any){
      if (err?.response?.status === 401) {
        window.location.assign('/auth/signin');
        return;
      }
  }
}

export default fetchWrapper;
