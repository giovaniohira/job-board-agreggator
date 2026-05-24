import { Vercel } from "@vercel/sdk";

const token = process.env.VERCEL_TOKEN;
const teamId = "team_2N1w1Yzmb2CUZ6mwbMxRbQlo";

if (!token) {
  console.error("VERCEL_TOKEN is required");
  process.exit(1);
}

const vercel = new Vercel({ bearerToken: token });

const envVars = [
  {
    key: "NEXT_PUBLIC_SUPABASE_URL",
    value: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    type: "plain" as const,
    target: ["production", "preview", "development"] as const,
  },
  {
    key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    type: "encrypted" as const,
    target: ["production", "preview", "development"] as const,
  },
  {
    key: "ALLOWED_USER_EMAIL",
    value: process.env.ALLOWED_USER_EMAIL ?? "giovaniohira@gmail.com",
    type: "plain" as const,
    target: ["production", "preview", "development"] as const,
  },
  {
    key: "CRON_SECRET",
    value: process.env.CRON_SECRET!,
    type: "encrypted" as const,
    target: ["production", "preview", "development"] as const,
  },
];

async function main() {
  const project = await vercel.projects.createProject({
    teamId,
    requestBody: {
      name: "job-board-agreggator",
      framework: "nextjs",
      gitRepository: {
        type: "github",
        repo: "giovaniohira/job-board-agreggator",
      },
    },
  });

  console.log(`Project created: ${project.id}`);

  await vercel.projects.createProjectEnv({
    idOrName: project.id,
    teamId,
    upsert: "true",
    requestBody: envVars,
  });

  console.log("Environment variables configured");

  const deployment = await vercel.deployments.createDeployment({
    teamId,
    requestBody: {
      name: "job-board-agreggator",
      target: "production",
      gitSource: {
        type: "github",
        org: "giovaniohira",
        repo: "job-board-agreggator",
        ref: "master",
      },
    },
  });

  console.log(`Deployment: ${deployment.id} (${deployment.url})`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
