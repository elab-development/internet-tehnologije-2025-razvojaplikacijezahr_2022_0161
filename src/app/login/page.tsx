import Card from "@/src/components/ui/Card";
import AuthForm from "@/src/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="login-page">
      <Card title="Prijava na aplikaciju" className="card--sm">
        <AuthForm />
      </Card>
    </div>
  );
}
