export interface User {
  id: number;
  username: string;
  password: string; // hashed
  role: "student" | "admin";
}

export const users: User[] = [
  {
    id: 1,
    username: "admin",
    password: "$2a$10$abcdefHashedPasswordHere", // placeholder
    role: "admin"
  }
];
