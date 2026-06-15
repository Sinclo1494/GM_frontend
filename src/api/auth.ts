import axios from "axios";

const API = "http://127.0.0.1:8000/api";

export const loginUser = async (username: string, password: string) =>{
    const response = await axios.post (`${API}/token/`, {
    username,
    password,
  });

  return response.data;
}