import React, { useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../Firebase/firebase.init';
;


const googleProvider = new GoogleAuthProvider();
const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const registerUser = (email, password) => {
        setLoading(true);
        // Registration logic here
        return createUserWithEmailAndPassword(auth, email, password);
    }
    const loginUser = (email, password) => {
        // Login logic here
        setLoading(true);
        return signInWithEmailAndPassword(auth, email, password);
    }

    const signInWithGoogle = () => {
        setLoading(true);
        return signInWithPopup(auth, googleProvider);
    }

    const logout=()=>{
        setLoading(true);
        return signOut(auth);
    }
// observe userstae change
    useEffect(() => { 
        const unsubscribe = onAuthStateChanged(auth,(currentUser)=> {
            setUser(currentUser) 
            setLoading(false);
    });
        return ()=> {unsubscribe();}

    },[])



    const authInfo = {
        registerUser,
        loginUser,
        signInWithGoogle,
        user,
        setUser,
        loading,
        setLoading,
        logout

    }
    return (
        <AuthContext value={authInfo}>
            {children}

        </AuthContext>
    )
}

export default AuthProvider