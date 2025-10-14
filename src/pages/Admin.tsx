import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Users, Music, BarChart3 } from "lucide-react";

const Admin = () => {
  const stats = [
    { label: "Total Users", value: "1,234", icon: Users, color: "text-blue-500" },
    { label: "Total Songs", value: "5,678", icon: Music, color: "text-purple-500" },
    { label: "Active Playlists", value: "892", icon: BarChart3, color: "text-green-500" },
    { label: "Popular Songs", value: "345", icon: TrendingUp, color: "text-pink-500" },
  ];

  return (
    <div className="min-h-screen pb-32">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your music platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="gradient-card p-6 card-shadow">
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-8 h-8 ${stat.color}`} />
                <span className="text-3xl font-bold">{stat.value}</span>
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </Card>
          );
        })}
      </div>

      {/* Management Tabs */}
      <Tabs defaultValue="songs" className="w-full">
        <TabsList className="glass-effect mb-6">
          <TabsTrigger value="songs">Songs</TabsTrigger>
          <TabsTrigger value="artists">Artists</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="songs">
          <Card className="gradient-card p-6 card-shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Manage Songs</h2>
              <Button className="gradient-primary glow-effect gap-2">
                <Plus className="w-4 h-4" />
                Add Song
              </Button>
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 glass-effect rounded-lg">
                  <div className="w-12 h-12 rounded bg-gradient-to-br from-purple-500 to-pink-500"></div>
                  <div className="flex-1">
                    <p className="font-semibold">Song Title {i}</p>
                    <p className="text-sm text-muted-foreground">Artist Name • 3:45</p>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="destructive" size="sm">Delete</Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="artists">
          <Card className="gradient-card p-6 card-shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Manage Artists</h2>
              <Button className="gradient-primary glow-effect gap-2">
                <Plus className="w-4 h-4" />
                Add Artist
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass-effect rounded-lg p-4 text-center">
                  <div className="w-20 h-20 rounded-full gradient-primary mx-auto mb-3"></div>
                  <p className="font-semibold">Artist {i}</p>
                  <p className="text-sm text-muted-foreground">12 songs</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="gradient-card p-6 card-shadow">
            <h2 className="text-2xl font-bold mb-6">User Management</h2>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 glass-effect rounded-lg">
                  <div className="w-10 h-10 rounded-full gradient-primary"></div>
                  <div className="flex-1">
                    <p className="font-semibold">User {i}</p>
                    <p className="text-sm text-muted-foreground">user{i}@example.com</p>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="gradient-card p-6 card-shadow">
              <h2 className="text-2xl font-bold mb-4">Top Songs</h2>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-primary">#{i}</span>
                    <div className="flex-1">
                      <p className="font-semibold">Song Title {i}</p>
                      <p className="text-sm text-muted-foreground">1,234 plays</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="gradient-card p-6 card-shadow">
              <h2 className="text-2xl font-bold mb-4">Popular Lyrics</h2>
              <div className="space-y-4">
                {['love', 'night', 'dream', 'heart', 'time'].map((word, i) => (
                  <div key={word} className="glass-effect rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold capitalize">{word}</span>
                      <span className="text-sm text-muted-foreground">{Math.floor(Math.random() * 500) + 100} times</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
