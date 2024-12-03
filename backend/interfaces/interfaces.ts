interface UserRequestBody {
    name: string;
    username: string;
    password: string;
}



interface LoginRequestBody {
    username: string;
    password: string;
}

interface User {
    id_user: number | null;
    name: string;
    username: string;
    password: string;
    id_role: number;
}

export {
    UserRequestBody,
    LoginRequestBody,
    User
}