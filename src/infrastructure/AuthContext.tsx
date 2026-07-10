import React, {createContext, useContext, useReducer, useState, type ReactNode} from 'react';

type AuthUser = {
  identificador: string;
  email: string;
  password?: string;
  nombre?: string;
  telefono?: string;
  direccion?: string;
};

type AuthState = {
  isAuthenticated: boolean;
  user: AuthUser | null;
};

type AuthAction = {type: 'LOGIN'; payload: AuthUser} | {type: 'LOGOUT'};

type AuthContextValue = AuthState & {
  login: (identificador: string, password: string) => boolean;
  logout: () => void;
  register: (userData: Omit<AuthUser, 'identificador'>) => boolean;
  recoverPassword: (email: string) => boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const initialUsers: AuthUser[] = [
  { identificador: 'admin', email: 'admin@lasoleil.com', password: '123', nombre: 'Administrador' }
];

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN': return {isAuthenticated: true, user: action.payload};
    case 'LOGOUT': return {isAuthenticated: false, user: null};
    default: return state;
  }
}

export function AuthProvider({children}: {children: ReactNode}) {
  const [state, dispatch] = useReducer(authReducer, { isAuthenticated: false, user: null });
  const [users, setUsers] = useState<AuthUser[]>(initialUsers);

  const login = (identificador: string, password: string) => {
    const normalizedInput = identificador.trim().toLowerCase();
    const foundUser = users.find(u => 
      (u.identificador.toLowerCase() === normalizedInput || u.email.toLowerCase() === normalizedInput) && 
      u.password === password
    );

    if (foundUser) {
      dispatch({type: 'LOGIN', payload: foundUser});
      return true;
    }
    return false;
  };

  const register = (userData: Omit<AuthUser, 'identificador'>) => {
    const normalizedEmail = userData.email.trim().toLowerCase();
    if (users.find(u => u.email.toLowerCase() === normalizedEmail)) {
      return false; 
    }
    const newUser = { 
      ...userData,
      identificador: normalizedEmail.split('@')[0], 
      email: normalizedEmail 
    };
    setUsers([...users, newUser]);
    return true;
  };

  const recoverPassword = (email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    return users.some(u => u.email.toLowerCase() === normalizedEmail);
  };

  const logout = () => {
    dispatch({type: 'LOGOUT'});
  };

  return (
    <AuthContext.Provider value={{...state, login, logout, register, recoverPassword}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}