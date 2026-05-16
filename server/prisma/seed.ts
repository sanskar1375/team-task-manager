import { PrismaClient, Status, Priority, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const DEMO_PASSWORD = 'Demo1234!';

interface SeedUser {
  email: string;
  name: string;
}

interface SeedProject {
  name: string;
  description: string;
}

interface SeedMembership {
  email: string;
  project: string;
  role: Role;
}

interface SeedTask {
  project: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  dueDays: number;
  assignee: string | null;
}

const USERS: SeedUser[] = [
  { email: 'admin@demo.com', name: 'Demo Admin' },
  { email: 'member@demo.com', name: 'Demo Member' },
  { email: 'priya.sharma@demo.com', name: 'Priya Sharma' },
  { email: 'arjun.singh@demo.com', name: 'Arjun Singh' },
  { email: 'kavita.reddy@demo.com', name: 'Kavita Reddy' },
  { email: 'vikram.joshi@demo.com', name: 'Vikram Joshi' },
  { email: 'sneha.verma@demo.com', name: 'Sneha Verma' },
];

const PROJECTS: SeedProject[] = [
  {
    name: 'Launch Q3 Website',
    description: 'Cross-functional launch project for the Q3 marketing site refresh.',
  },
  {
    name: 'Mobile App v2',
    description: 'Redesign and ship the next generation of our iOS and Android client.',
  },
  {
    name: 'Customer Analytics Dashboard',
    description: 'Internal tool: real-time customer KPIs with drill-down per segment.',
  },
  {
    name: 'Internal Onboarding Portal',
    description: 'Self-serve hub for new hires: docs, accounts, and gear requests.',
  },
];

const MEMBERSHIPS: SeedMembership[] = [
  { email: 'admin@demo.com', project: 'Launch Q3 Website', role: 'ADMIN' },
  { email: 'member@demo.com', project: 'Launch Q3 Website', role: 'MEMBER' },
  { email: 'priya.sharma@demo.com', project: 'Launch Q3 Website', role: 'MEMBER' },
  { email: 'kavita.reddy@demo.com', project: 'Launch Q3 Website', role: 'MEMBER' },

  { email: 'admin@demo.com', project: 'Mobile App v2', role: 'ADMIN' },
  { email: 'arjun.singh@demo.com', project: 'Mobile App v2', role: 'MEMBER' },
  { email: 'sneha.verma@demo.com', project: 'Mobile App v2', role: 'MEMBER' },
  { email: 'member@demo.com', project: 'Mobile App v2', role: 'MEMBER' },

  { email: 'priya.sharma@demo.com', project: 'Customer Analytics Dashboard', role: 'ADMIN' },
  { email: 'admin@demo.com', project: 'Customer Analytics Dashboard', role: 'MEMBER' },
  { email: 'vikram.joshi@demo.com', project: 'Customer Analytics Dashboard', role: 'MEMBER' },
  { email: 'member@demo.com', project: 'Customer Analytics Dashboard', role: 'MEMBER' },

  { email: 'admin@demo.com', project: 'Internal Onboarding Portal', role: 'ADMIN' },
  { email: 'kavita.reddy@demo.com', project: 'Internal Onboarding Portal', role: 'MEMBER' },
  { email: 'vikram.joshi@demo.com', project: 'Internal Onboarding Portal', role: 'MEMBER' },
];

const TASKS: SeedTask[] = [
  {
    project: 'Launch Q3 Website',
    title: 'Finalize homepage copy',
    description: 'Marketing draft v3 needs sign-off from product.',
    status: Status.TODO,
    priority: Priority.HIGH,
    dueDays: -2,
    assignee: 'member@demo.com',
  },
  {
    project: 'Launch Q3 Website',
    title: 'Wire up signup analytics',
    description: 'Send signup events to the analytics pipeline.',
    status: Status.IN_PROGRESS,
    priority: Priority.MEDIUM,
    dueDays: 3,
    assignee: 'member@demo.com',
  },
  {
    project: 'Launch Q3 Website',
    title: 'Set up CDN cache rules',
    description: 'Configure stale-while-revalidate for marketing pages.',
    status: Status.TODO,
    priority: Priority.MEDIUM,
    dueDays: 7,
    assignee: 'admin@demo.com',
  },
  {
    project: 'Launch Q3 Website',
    title: 'Design hero illustration',
    description: 'New hero artwork to match the rebrand.',
    status: Status.IN_PROGRESS,
    priority: Priority.LOW,
    dueDays: 5,
    assignee: 'kavita.reddy@demo.com',
  },
  {
    project: 'Launch Q3 Website',
    title: 'Audit Lighthouse scores',
    description: 'Baseline performance metrics before launch.',
    status: Status.DONE,
    priority: Priority.MEDIUM,
    dueDays: -5,
    assignee: 'admin@demo.com',
  },
  {
    project: 'Launch Q3 Website',
    title: 'Approve final visual designs',
    description: 'Stakeholder review meeting completed.',
    status: Status.DONE,
    priority: Priority.HIGH,
    dueDays: -7,
    assignee: 'priya.sharma@demo.com',
  },
  {
    project: 'Launch Q3 Website',
    title: 'Publish blog launch post',
    description: 'Coordinate with content team for go-live announcement.',
    status: Status.TODO,
    priority: Priority.MEDIUM,
    dueDays: 10,
    assignee: 'priya.sharma@demo.com',
  },

  {
    project: 'Mobile App v2',
    title: 'Implement push notifications',
    description: 'Add APNs + FCM integration with topic subscriptions.',
    status: Status.IN_PROGRESS,
    priority: Priority.HIGH,
    dueDays: 4,
    assignee: 'arjun.singh@demo.com',
  },
  {
    project: 'Mobile App v2',
    title: 'Add biometric authentication',
    description: 'Face ID / Touch ID gating on login.',
    status: Status.TODO,
    priority: Priority.HIGH,
    dueDays: 8,
    assignee: 'arjun.singh@demo.com',
  },
  {
    project: 'Mobile App v2',
    title: 'Redesigned home screen',
    description: 'New tabbed layout with personalized feed.',
    status: Status.IN_PROGRESS,
    priority: Priority.MEDIUM,
    dueDays: 6,
    assignee: 'sneha.verma@demo.com',
  },
  {
    project: 'Mobile App v2',
    title: 'Offline mode for core flows',
    description: 'Cache the most-used screens for offline access.',
    status: Status.TODO,
    priority: Priority.MEDIUM,
    dueDays: 14,
    assignee: 'sneha.verma@demo.com',
  },
  {
    project: 'Mobile App v2',
    title: 'Fix crash on iOS 17 launch',
    description: 'Sentry reports a 3% crash rate on cold start.',
    status: Status.TODO,
    priority: Priority.HIGH,
    dueDays: -1,
    assignee: 'arjun.singh@demo.com',
  },
  {
    project: 'Mobile App v2',
    title: 'Update app store screenshots',
    description: 'Replace old screenshots with the new design.',
    status: Status.TODO,
    priority: Priority.LOW,
    dueDays: 12,
    assignee: 'kavita.reddy@demo.com',
  },
  {
    project: 'Mobile App v2',
    title: 'Beta TestFlight rollout',
    description: 'Distribute to 50 beta testers and collect feedback.',
    status: Status.DONE,
    priority: Priority.MEDIUM,
    dueDays: -3,
    assignee: 'admin@demo.com',
  },
  {
    project: 'Mobile App v2',
    title: 'Migrate to React Native 0.76',
    description: 'Pin to latest stable, update native modules.',
    status: Status.DONE,
    priority: Priority.MEDIUM,
    dueDays: -10,
    assignee: 'arjun.singh@demo.com',
  },

  {
    project: 'Customer Analytics Dashboard',
    title: 'Set up ClickHouse ingest pipeline',
    description: 'Daily ingest job for customer events.',
    status: Status.DONE,
    priority: Priority.HIGH,
    dueDays: -4,
    assignee: 'priya.sharma@demo.com',
  },
  {
    project: 'Customer Analytics Dashboard',
    title: 'Build cohort retention chart',
    description: 'Weekly cohorts with 30 / 60 / 90 day retention curves.',
    status: Status.IN_PROGRESS,
    priority: Priority.HIGH,
    dueDays: 2,
    assignee: 'vikram.joshi@demo.com',
  },
  {
    project: 'Customer Analytics Dashboard',
    title: 'Add CSV export per chart',
    description: 'Download button next to each visualization.',
    status: Status.TODO,
    priority: Priority.MEDIUM,
    dueDays: 6,
    assignee: 'vikram.joshi@demo.com',
  },
  {
    project: 'Customer Analytics Dashboard',
    title: 'Role-based metric visibility',
    description: 'Only admins should see revenue figures.',
    status: Status.IN_PROGRESS,
    priority: Priority.HIGH,
    dueDays: 5,
    assignee: 'priya.sharma@demo.com',
  },
  {
    project: 'Customer Analytics Dashboard',
    title: 'Real-time updates via SSE',
    description: 'Server-sent events for live dashboard refresh.',
    status: Status.TODO,
    priority: Priority.LOW,
    dueDays: 15,
    assignee: 'member@demo.com',
  },
  {
    project: 'Customer Analytics Dashboard',
    title: 'Responsive mobile layout',
    description: 'Charts should adapt to phone-sized screens.',
    status: Status.TODO,
    priority: Priority.MEDIUM,
    dueDays: -2,
    assignee: 'member@demo.com',
  },
  {
    project: 'Customer Analytics Dashboard',
    title: 'Stakeholder demo prep',
    description: 'Walk-through deck for the leadership review.',
    status: Status.DONE,
    priority: Priority.HIGH,
    dueDays: -6,
    assignee: 'priya.sharma@demo.com',
  },

  {
    project: 'Internal Onboarding Portal',
    title: 'Hook up Okta SSO',
    description: 'SAML integration for staff accounts.',
    status: Status.IN_PROGRESS,
    priority: Priority.HIGH,
    dueDays: 3,
    assignee: 'admin@demo.com',
  },
  {
    project: 'Internal Onboarding Portal',
    title: 'New-hire welcome tour',
    description: 'Interactive walkthrough on first sign-in.',
    status: Status.TODO,
    priority: Priority.MEDIUM,
    dueDays: 9,
    assignee: 'kavita.reddy@demo.com',
  },
  {
    project: 'Internal Onboarding Portal',
    title: 'Gear request form',
    description: 'Standard equipment ordering integrated with IT.',
    status: Status.TODO,
    priority: Priority.LOW,
    dueDays: 12,
    assignee: 'vikram.joshi@demo.com',
  },
  {
    project: 'Internal Onboarding Portal',
    title: 'Centralized docs hub',
    description: 'Link directory for HR, IT, and team-specific docs.',
    status: Status.DONE,
    priority: Priority.MEDIUM,
    dueDays: -8,
    assignee: 'admin@demo.com',
  },
  {
    project: 'Internal Onboarding Portal',
    title: 'First-week checklist generator',
    description: 'Auto-generated tasks for each new hire.',
    status: Status.TODO,
    priority: Priority.MEDIUM,
    dueDays: 6,
    assignee: 'kavita.reddy@demo.com',
  },
];

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  for (const u of USERS) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name },
      create: { email: u.email, name: u.name, password: passwordHash },
    });
  }

  const allUsers = await prisma.user.findMany({
    where: { email: { in: USERS.map((u) => u.email) } },
    select: { id: true, email: true },
  });
  const userIdByEmail = new Map(allUsers.map((u) => [u.email, u.id]));

  const projectIdByName = new Map<string, string>();
  for (const p of PROJECTS) {
    let project = await prisma.project.findFirst({ where: { name: p.name } });
    if (!project) {
      project = await prisma.project.create({ data: p });
    } else if (project.description !== p.description) {
      project = await prisma.project.update({
        where: { id: project.id },
        data: { description: p.description },
      });
    }
    projectIdByName.set(p.name, project.id);
  }

  for (const m of MEMBERSHIPS) {
    const userId = userIdByEmail.get(m.email);
    const projectId = projectIdByName.get(m.project);
    if (!userId || !projectId) continue;
    await prisma.membership.upsert({
      where: { userId_projectId: { userId, projectId } },
      update: { role: m.role },
      create: { userId, projectId, role: m.role },
    });
  }

  await prisma.task.deleteMany({
    where: { projectId: { in: Array.from(projectIdByName.values()) } },
  });

  const now = Date.now();
  const inDays = (n: number): Date => new Date(now + n * 24 * 60 * 60 * 1000);

  for (const t of TASKS) {
    const projectId = projectIdByName.get(t.project);
    const assigneeId = t.assignee ? userIdByEmail.get(t.assignee) : null;
    if (!projectId) continue;
    await prisma.task.create({
      data: {
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        dueDate: inDays(t.dueDays),
        projectId,
        assigneeId: assigneeId ?? null,
      },
    });
  }

  // eslint-disable-next-line no-console
  console.log('Seed complete.');
  // eslint-disable-next-line no-console
  console.log(`  ${USERS.length} users · ${PROJECTS.length} projects · ${TASKS.length} tasks`);
  // eslint-disable-next-line no-console
  console.log(`  Password for every demo account: ${DEMO_PASSWORD}`);
  // eslint-disable-next-line no-console
  console.log(`  Try: admin@demo.com  (admin of 4 projects)`);
  // eslint-disable-next-line no-console
  console.log(`  Or:  member@demo.com (member across 3 projects)`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
