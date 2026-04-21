import type { Metadata } from "next";
import { ProfileView } from "./Profile.view";

export const metadata: Metadata = {
  title: "Perfil — PkTracker",
};

export default function ProfilePage() {
  return <ProfileView />;
}
