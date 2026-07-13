import React from 'react'
import { useEffect } from 'react'
import Auth from '../pages/Auth'
import { useAuth } from '../context/authContext'

function AuthModel({onClose}) {
    const { user } = useAuth()

    useEffect(()=>{
        if(user){
            onClose()
        }
    },[user,onClose])

    return (
        <div className="fixed inset-0 z-[900] flex items-center justify-center bg-black/10 backdrop-blur-sm px-4">
            <div className="w-full max-w-md">
                <Auth isModel={true} onClose={onClose}/>
            </div>
        </div>
    )
}
export default AuthModel