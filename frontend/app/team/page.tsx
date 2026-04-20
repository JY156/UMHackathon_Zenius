import { AppShell } from "../_components/app-shell";

const members = [
  { name: "Lena Chong", role: "Backend Engineer", status: "Available", color: "bg-blue-400" },
  { name: "Amir Rahman", role: "Platform Engineer", status: "Busy", color: "bg-green-600" },
];

export default function TeamPage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Team</h1>

        <div className="flex gap-2">
          <span className="font-caption rounded-[4px] bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
            Engineering
          </span>
          <span className="font-caption rounded-[4px] bg-secondary px-3 py-2 text-xs text-muted-foreground">
            Product & Design
          </span>
          <span className="font-caption rounded-[4px] bg-secondary px-3 py-2 text-xs text-muted-foreground">
            Operations
          </span>
        </div>

        <h2 className="text-xl font-semibold">Engineering Department</h2>

        <section className="space-y-2">
          {members.map((member) => (
            <article
              key={member.name}
              className="flex items-center justify-between rounded-[6px] border border-border bg-card px-3 py-2 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full ${member.color}`} />
                <div>
                  <p className="text-sm font-semibold">{member.name}</p>
                  <p className="font-caption text-xs text-muted-foreground">{member.role}</p>
                </div>
              </div>
              <span className="font-caption rounded-[4px] bg-muted px-3 py-1 text-xs font-semibold">
                {member.status}
              </span>
            </article>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
