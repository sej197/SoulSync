import axios from 'axios';

// Navigation ref — set by the NavigationSetter component inside <Router>
let navigateRef = null;

export function setNavigateRef(nav) {
  navigateRef = nav;
}

/**
 * Attach a 429 response interceptor to an axios instance.
 * On a 429 response, the user is redirected to /rate-limited.
 */
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

/**
 * Call once at app startup to register interceptors on the
 * global axios default AND all custom axios instances used in the app.
 */
export function setupAllInterceptors(instances = []) {
  // Global axios default
  attach429Interceptor(axios);

  // Each custom instance (authapi, chatbotapi, etc.)
  instances.forEach((instance) => attach429Interceptor(instance));
}
