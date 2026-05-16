import { z } from 'zod';

export const PrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);
export const StatusSchema = z.enum(['TODO', 'IN_PROGRESS', 'DONE']);

export const CreateTaskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120),
  description: z.string().trim().max(2000).optional(),
  assigneeId: z.string().min(1).nullable().optional(),
  priority: PrioritySchema.optional(),
  dueDate: z.coerce.date().nullable().optional(),
});

export const UpdateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(120).optional(),
    description: z.string().trim().max(2000).nullable().optional(),
    assigneeId: z.string().min(1).nullable().optional(),
    status: StatusSchema.optional(),
    priority: PrioritySchema.optional(),
    dueDate: z.coerce.date().nullable().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: 'At least one field is required',
  });

export const ListTaskQuerySchema = z.object({
  status: StatusSchema.optional(),
  assigneeId: z.string().min(1).optional(),
  overdue: z
    .union([z.literal('true'), z.literal('false'), z.boolean()])
    .transform((v) => v === true || v === 'true')
    .optional(),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type ListTaskQuery = z.infer<typeof ListTaskQuerySchema>;
