import 'babel-polyfill';
process.env.PIECEWISE_ADMIN_PASSWORD = 'areallylonggoodpassword';
process.env.PIECEWISE_SECRETS = 'secret1,secret2';

if (typeof window.URL.createObjectURL === 'undefined') {
  window.URL.createObjectURL = () => {
    // Do nothing
    // Mock this function for mapbox-gl to work
  };
}
