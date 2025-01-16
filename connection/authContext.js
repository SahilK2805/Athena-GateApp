import * as SecureStore from 'expo-secure-store';
import client from './connectApi';
import React from 'react';
import getError from './getError';

const AuthContext = React.createContext();

export const useAuth = () => React.useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    
    const [authState, setAuthState] = React.useState({token: null, authtenticated: null,user_id: null});
    React.useEffect(() => {
        const getToken = async () => {
            try {
                const token = await SecureStore.getItemAsync('token');
                client.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                const user_id = await SecureStore.getItemAsync('user_id');
                const type = await SecureStore.getItemAsync('type');
                if (token) {
                    setAuthState({
                        token: token,
                        authtenticated: true,
                        user_id: user_id,
                        type: type
                    });
                }
            }
            catch (error) {
                getError(error);
                console.log('Error:', error);
            }
        }
        getToken();
    }, []);

    const login = async ({username,password}) => {
        console.log('Username:', username);
        console.log('Password:', password);
        try {
            const response = await client.post('/auth/login', {
                email: username,
                password: password
            })

            if (response.status === 200) {
            console.log('Response: at login', response.data);

            let uid = response.data.id.toString();
            let utype = response.data.userType.toString();
            console.log('id:', uid, 'token:', response.data.token, 'type:', utype);
            if (response.data.token) {
                client.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                await SecureStore.setItemAsync('token', response.data.token);
                await SecureStore.setItemAsync('user_id', uid);
                await SecureStore.setItemAsync('type', utype);
                setAuthState({
                    token: response.data.token,
                    user_id: uid,
                    type: utype,
                    authtenticated: true
                });
            }
            }
        }
        catch (error) {
            getError(error);
        }
    }
    const register = async ({userType,email,username,password,confirmPassword}) => {
        console.log(userType,":",email,":",username,":",password,":",confirmPassword);
        try {
            const response = await client.post(`/auth/signup`, {
                userType: userType,
                firstName: username,
                email: email,
                password: password,
                confirmPassword: confirmPassword,
              });
            console.log('Response at register: ', response);
            if (response.status === 201) {
                console.log('User added successfully');
                return true;
            } else {
                throw new Error('Sign-up failed. Please check your details.');
            }
        }
            catch (error) {
                getError(error);
            }
    }
    const forgotpass = async({email, password, confirmPassword})=>{
        try{
            console.log(email,password,confirmPassword);
            const response = await client.post('/auth/resetPassword', { email, password, confirmPassword });
            if (response.status === 200){
                return true
            }
        }
        catch(error){
            getError(error);
        }
    }
    
    const logout = async () => {
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('user_id');
        await SecureStore.deleteItemAsync('type');
        setAuthState({
            token: null,
            authtenticated: false,
            user_id:null,
            type: null
        });
        client.defaults.headers.common['Authorization'] = '';
    }
    const value = {login,logout,register,forgotpass,authState};

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}


