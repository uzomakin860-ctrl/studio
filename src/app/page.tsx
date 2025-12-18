import { Header } from "@/components/header";
import { EchoCanvas } from "@/components/echo-canvas";

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <EchoCanvas />
      </main>
    </div>
  );
}
