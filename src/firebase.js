// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAWRqpBbQVnLUJDYMU8anHgzIqTTIUnfmM",
  authDomain: "nameun-jari.firebaseapp.com",
  projectId: "nameun-jari",
  storageBucket: "nameun-jari.firebasestorage.app",
  messagingSenderId: "835808257132",
  appId: "1:835808257132:web:fafbd9bccd4c02ceece449",
  measurementId: "G-VEPZ4XBK2G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics }; 