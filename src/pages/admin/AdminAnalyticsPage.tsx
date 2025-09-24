import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";

const AdminAnalyticsPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar isAdmin={true} />
      
      <main className="container px-4 py-8 flex-1">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Track event performance and customer engagement metrics
            </p>
          </div>
        </div>
        
        <AnalyticsDashboard />
      </main>
    </div>
  );
};

export default AdminAnalyticsPage;
