import axios from "axios";

const API = "http://192.168.0.201:8000/api";

export const loginUser = async (username: string, password: string) =>{
    const response = await axios.post (`${API}/token/`, {
    username,
    password,
  });

  return response.data;
}



