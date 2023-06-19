import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/storage';

const firebaseConfig = {
    apiKey: "AIzaSyAW9LPJUQQB59t-nT6091pQ_xmxiMQypMM",
    authDomain: "boochat-6a8d1.firebaseapp.com",
    databaseURL: "https://boochat-6a8d1-default-rtdb.europe-west1.firebasedatabase.app/",
    projectId: "boochat-6a8d1",
    storageBucket: "boochat-6a8d1.appspot.com",
    messagingSenderId: "725230703382",
    appId: "1:725230703382:web:77d87005a392008ef17637",
    measurementId: "G-KDG5X89HMC"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export default firebase;
