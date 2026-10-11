
const { z } = require('zod');

const createFlagSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2)
      .max(100)
      .regex(
        /^[a-zA-Z0-9]+(?:[_-][a-zA-Z0-9]+)*$/,
        'Use letters, numbers, underscores or hyphens'
      ),
    description: z.string().trim().max(500).optional().default(''),
    enabled: z.boolean().optional().default(false),
    rolloutPercentage: z.number().min(0).max(100).optional().default(100),
  }),
  params: z.object({
    projectId: z.string().min(1),
    environmentId: z.string().min(1),
  }),
  query: z.object({}),
});

const updateFlagSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2)
        .max(100)
        .regex(
          /^[a-zA-Z0-9]+(?:[_-][a-zA-Z0-9]+)*$/,
          'Use letters, numbers, underscores or hyphens'
        )
        .optional(),
      description: z.string().trim().max(500).optional(),
      enabled: z.boolean().optional(),
      rolloutPercentage: z.number().min(0).max(100).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Provide at least one field to update',
    }),
  params: z.object({
    projectId: z.string().min(1),
    environmentId: z.string().min(1),
    flagId: z.string().min(1),
  }),
  query: z.object({}),
});

const flagParamsSchema = z.object({
  body: z.object({}),
  params: z.object({
    projectId: z.string().min(1),
    environmentId: z.string().min(1),
  }),
  query: z.object({}),
});

const flagIdParamsSchema = z.object({
  body: z.object({}),
  params: z.object({
    projectId: z.string().min(1),
    environmentId: z.string().min(1),
    flagId: z.string().min(1),
  }),
  query: z.object({}),
});

module.exports = {
  createFlagSchema,
  updateFlagSchema,
  flagParamsSchema,
  flagIdParamsSchema,
};
