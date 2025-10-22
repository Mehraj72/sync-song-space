import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<'user' | 'admin'>("user");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error("Failed to create user");
      }

      // Assign role if admin (user role is automatically assigned by trigger)
      if (role === 'admin') {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ user_id: data.user.id, role: 'admin' });
        
        if (roleError) console.error('Role assignment error:', roleError);
      }

      toast({ 
        title: `Welcome, ${username} 🎵`,
        description: "Your account has been created successfully!"
      });
      setLoading(false);
      navigate(role === "admin" ? "/admin-dashboard" : "/dashboard");
    } catch (err: any) {
      setLoading(false);
      toast({ 
        title: "Signup failed", 
        description: err.message || "Unable to create account", 
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero relative">
      <div className="absolute top-8 right-8 flex gap-4">
        <Button variant="outline" onClick={() => navigate("/login")}>Login</Button>
        <Button variant="secondary" onClick={() => navigate("/signup")}>Sign Up</Button>
      </div>
      <form
        onSubmit={handleSignup}
        className="glass-effect p-8 rounded-xl shadow-xl w-full max-w-md border border-border"
      >
        <div className="flex flex-col items-center mb-6">
          <span className="text-4xl font-bold gradient-primary bg-clip-text text-transparent mb-2">VibeStream</span>
          <span className="text-muted-foreground">Create your account</span>
        </div>
        <Input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mb-4"
          required
        />
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4"
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6"
          required
        />
        <div className="mb-6">
          <label className="block mb-2 font-semibold">Account Type</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
            className="w-full p-2 rounded-lg bg-muted text-foreground"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <Button type="submit" className="w-full gradient-primary font-bold" disabled={loading}>
          {loading ? <span className="loader mr-2"></span> : "Sign Up"}
        </Button>
        <div className="mt-4 text-center">
          <span className="text-muted-foreground">Already have an account?</span>
          <Button variant="link" onClick={() => navigate("/login")}>Login</Button>
        </div>
      </form>
    </div>
  );
};

export default Signup;
