import api from "@eugenios/services/axios";
import { User } from "@eugenios/types";

export async function getUser(): Promise<User> {
  return await api.get("/auth/me").then((res) => {
    if (res.status !== 200) {
      throw new Error("Erro ao obter utilizador");
    }
    return res.data as User;
  });
}
