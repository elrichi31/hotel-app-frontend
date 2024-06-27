"use client"
import React, { ReactNode, useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import SessionAuthProvider from '../context/SessionAuthProvider';
import Loading from '@/components/Loading';
import { useSession, signOut } from 'next-auth/react';
import axios from '../../lib/axios';
import { message } from 'antd';
type LayoutProps = {
    children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
    const [user, setUser] = useState(null);
    const { data: session } = useSession();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                if (session?.user?.token?.token) {
                    const token = session.user.token.token;
                    const response = await axios.get('/api/user', {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    setUser(response.data);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };

        fetchUser();
    }, [session]);

    const logout = async () => {
        try {
            if (session?.user?.token?.token) {
                const token = session.user.token.token;
                console.log(token);
                const response = await axios.post('/logout', {}, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log('Logout response:', response.data);
                message.success('Logged out successfully');
                signOut();
            } else {
                console.log('No token found for logout');
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };


    if (!session?.user) {
        return <Loading />;
    }

    return (
        <div>
            <SessionAuthProvider>
                <Navbar user={user} logout={logout}>
                    {children}
                </Navbar>
            </SessionAuthProvider>
        </div>
    );
};

export default Layout;
