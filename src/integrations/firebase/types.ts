export type UserProfile = {
  uid: string;
  username: string;
  email: string;
  role: "user" | "admin";
};
