
const { z } = require('zod');

const createProjectSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    description: z.string().trim().max(500).optional().default(''),
  }),
  params: z.object({}),
  query: z.object({}),
});

const projectIdSchema = z.object({
  body: z.object({}),
  params: z.object({
    projectId: z.string().min(1),
  }),
  query: z.object({}),
});

module.exports = {
  createProjectSchema,
  projectIdSchema,
};
