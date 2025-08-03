import { useAuth } from "@/hooks/useAuth";
import { KrishiSakhaApp } from "@/components/KrishiSakhaApp";
import { AuthForm } from "@/components/AuthForm";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return <KrishiSakhaApp />;
};

export default Index;
