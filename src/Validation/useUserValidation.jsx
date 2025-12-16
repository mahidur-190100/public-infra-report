// Hooks/useUserValidation.js
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const useUserValidation = () => {
  const [isValid, setIsValid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  const validateUser = useCallback(async (forceCheck = false) => {
    // Skip if already validated and not forced
    if (isValid === true && !forceCheck) return true;

    setLoading(true);
    setError(null);

    try {
      // Get user data from localStorage
      const adminData = localStorage.getItem('admin');
      const userData = localStorage.getItem('user');

      let email = null;
      let uid = null;
      let role = null;

      if (adminData) {
        try {
          const admin = JSON.parse(adminData);
          email = admin.email;
          uid = admin.uid;
          role = 'admin';
        } catch (e) {
          console.error('Error parsing admin data:', e);
        }
      } else if (userData) {
        try {
          const user = JSON.parse(userData);
          email = user.email;
          uid = user.uid;
          role = 'user';
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }

      if (!email) {
        console.log('❌ No user found in localStorage');
        setIsValid(false);
        setUserData(null);
        localStorage.removeItem('admin');
        localStorage.removeItem('user');
        return false;
      }

      console.log(`🔍 Validating ${role} user: ${email}`);

      // Call validation endpoint
      const response = await axios.post('https://public-infra-report-server.vercel.app/validate-user', {
        email: email,
        uid: uid
      });

      console.log('✅ Validation response:', response.data);

      if (response.data.success) {
        if (response.data.valid === false) {
          if (response.data.blocked) {
            console.log('🚫 USER IS BLOCKED');
            // Clear localStorage for blocked users
            localStorage.removeItem('admin');
            localStorage.removeItem('user');
          }
          setIsValid(false);
          setUserData(null);
          return false;
        }

        // User is valid
        setIsValid(true);
        setUserData(response.data.user);
        return true;
      } else {
        setIsValid(false);
        return false;
      }

    } catch (error) {
      console.error('❌ Error validating user:', error);
      setError(error.message);
      setIsValid(false);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isValid]);

  // Auto-validate on mount
  useEffect(() => {
    validateUser();
  }, [validateUser]);

  // Auto-refresh validation every 30 seconds
  useEffect(() => {
    if (isValid === true) {
      const interval = setInterval(() => {
        console.log('🔄 Auto-refreshing user validation');
        validateUser(true);
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [isValid, validateUser]);

  return {
    isValid,
    loading,
    userData,
    error,
    validateUser,
    refreshValidation: () => validateUser(true)
  };
};

export default useUserValidation;