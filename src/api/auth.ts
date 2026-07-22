import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL;

export const loginUser = async (username: string, password: string) =>{
    const response = await axios.post (`${API}/token/`, {
    username,
    password,
  });

  return response.data;
}



