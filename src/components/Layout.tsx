import { ReactNode } from "react";
import Navigation from "./Navigation";
import MusicPlayer from "./MusicPlayer";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="ml-20 lg:ml-64 p-6">
        {children}
      </main>
      <MusicPlayer />
    </div>
  );
};

export default Layout;
