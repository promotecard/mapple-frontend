import { Button } from "@/components/ui/Button";
import { useTranslation } from "react-i18next";

export const LandingPage: React.FC = () => {
  const { t } = useTranslation("common");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-white">
        <h1 className="text-xl font-bold text-slate-800">
          Mapple School
        </h1>

        <Button>
          {t("actions.create", "Solicitar demo")}
        </Button>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-4xl font-bold text-slate-900 mb-4">
          Plataforma educativa inteligente
        </h2>

        <p className="text-lg text-slate-600 max-w-xl mb-8">
          Conectamos escuelas, familias y proveedores en un solo ecosistema digital.
        </p>

        <div className="flex gap-4">
          <Button size="lg">
            Comenzar ahora
          </Button>

          <Button size="lg" variant="secondary">
            Ver demo
          </Button>
        </div>
      </main>
    </div>
  );
};
