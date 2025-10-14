import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

const AdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // TODO: Fetch admin data, songs, and users from Firestore
    toast({ title: "Welcome Admin 🎵" });
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">Admin Dashboard</h1>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Manage Songs</h2>
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full bg-background rounded-xl">
            <thead>
              <tr className="bg-muted">
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Artist</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3">Starlight</td>
                <td className="p-3">Cosmic Dream</td>
                <td className="p-3"><button className="text-accent">Edit</button> | <button className="text-destructive">Delete</button></td>
              </tr>
              <tr>
                <td className="p-3">Neon Nights</td>
                <td className="p-3">Cyber Wave</td>
                <td className="p-3"><button className="text-accent">Edit</button> | <button className="text-destructive">Delete</button></td>
              </tr>
            </tbody>
          </table>
        </div>
        <h2 className="text-xl font-semibold mb-4">Manage Users</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-background rounded-xl">
            <thead>
              <tr className="bg-muted">
                <th className="p-3 text-left">Username</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3">Mehraj</td>
                <td className="p-3">mehraj@example.com</td>
                <td className="p-3">Admin</td>
                <td className="p-3"><button className="text-accent">Edit</button> | <button className="text-destructive">Delete</button></td>
              </tr>
              <tr>
                <td className="p-3">User1</td>
                <td className="p-3">user1@example.com</td>
                <td className="p-3">User</td>
                <td className="p-3"><button className="text-accent">Edit</button> | <button className="text-destructive">Delete</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
