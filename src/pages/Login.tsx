import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { auth, db } = await import("@/integrations/firebase/client");
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      const { doc, getDoc } = await import("firebase/firestore");
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Fetch user profile from Firestore
      const profileRef = doc(db, "users", user.uid);
      const profileSnap = await getDoc(profileRef);
      let role = "user";
      let username = user.email;
      if (profileSnap.exists()) {
        const data = profileSnap.data();
        role = data.role || "user";
        username = data.username || user.email;
      }
      toast({ title: `Welcome, ${username} 🎵` });
      setLoading(false);
      navigate(role === "admin" ? "/admin-dashboard" : "/dashboard");
    } catch (err: any) {
      setLoading(false);
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero">
      <form
        onSubmit={handleLogin}
        className="glass-effect p-8 rounded-xl shadow-xl w-full max-w-md border border-border"
      >
        <div className="flex flex-col items-center mb-6">
          <span className="text-4xl font-bold gradient-primary bg-clip-text text-transparent mb-2">VibeStream</span>
          <span className="text-muted-foreground">Login to your account</span>
        </div>
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
        <Button type="submit" className="w-full gradient-primary font-bold" disabled={loading}>
          {loading ? <span className="loader mr-2"></span> : "Login"}
        </Button>
        <div className="mt-4 text-center">
          <span className="text-muted-foreground">Don't have an account?</span>
          <Button variant="link" onClick={() => navigate("/signup")}>Sign Up</Button>
        </div>
      </form>
    </div>
  );
};

export default Login;
