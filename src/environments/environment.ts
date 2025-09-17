// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyBtvHyPefDjhWiWvcz2mJEL9EXZ7YqEb7A",
    authDomain: "woundapp-261e6.firebaseapp.com",
    projectId: "woundapp-261e6",
    storageBucket: "woundapp-261e6.firebasestorage.app",
    messagingSenderId: "43052843352",
    appId: "1:43052843352:web:ee55589f67c31750eca52d",
    measurementId: "G-HJZG1QZ6FW"
  },
  apiBase: 'https://us-central1-woundapp-261e6.cloudfunctions.net/api'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
