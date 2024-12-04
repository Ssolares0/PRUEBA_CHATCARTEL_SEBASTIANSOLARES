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

interface Project{
    id_project: number;
    name_project: string;
    created_time: string;
    id_user: number;
}

export {
    UserRequestBody,
    LoginRequestBody,
    User,
    Project
}