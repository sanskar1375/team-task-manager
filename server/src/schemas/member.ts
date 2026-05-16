import { z } from 'zod';

export const RoleSchema = z.enum(['ADMIN', 'MEMBER']);

export const AddMemberSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email'),
  role: RoleSchema.default('MEMBER'),
});

export const UpdateMemberRoleSchema = z.object({
  role: RoleSchema,
});

export type AddMemberInput = z.infer<typeof AddMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof UpdateMemberRoleSchema>;
