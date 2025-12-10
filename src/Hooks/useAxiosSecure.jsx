import axios from 'axios'
import React, { useEffect } from 'react'
import useAuth from './useAuth';

const axiosSecure = axios.create({
  baseURL: 'http://localhost:3000', // Replace with your API base URL
});

const useAxiosSecure = () => {
    const {user} = useAuth();
    useEffect(() => {
        // You can set up interceptors or any other configurations here
        axiosSecure.interceptors.request.use(config=>{
            config.headers.Authorization = `Bearer ${user?.accessToken}`;
            return config;
        })
    },[user])
  return (
    axiosSecure
  )
}

export default useAxiosSecure