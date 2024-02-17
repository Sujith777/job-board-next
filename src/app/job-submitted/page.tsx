import H1 from "@/components/ui/h1";

export default function Page() {
  return (
    <main className="m-auto max-w-5xl space-y-5 p-3 text-center">
      <H1>Your job submission is successful</H1>
      <p className="m-auto max-w-md text-muted-foreground">
        Your job posting has been successfully completed and is awaiting
        approval from the admin
      </p>
    </main>
  );
}
