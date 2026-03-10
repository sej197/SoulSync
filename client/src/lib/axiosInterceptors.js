import axios from 'axios';

let navigateRef = null;

export function setNavigateRef(nav) {
  navigateRef = nav;
}


function attach429Interceptor(instance) {
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 429 && navigateRef) {
        navigateRef('/rate-limited');
      }
      return Promise.reject(error);
    }
  );
}


export function setupAllInterceptors(instances = []) {
  attach429Interceptor(axios);
  instances.forEach((instance) => attach429Interceptor(instance));
}
