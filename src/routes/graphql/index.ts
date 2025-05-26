import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, validate, parse } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import { schema } from './graphql-schema.js';
import { createLoaders } from './loaders.js';
import { HttpCompatibleError } from '../../plugins/handle-http-error.js';
import type { Context } from './types.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const context: Context = {
        prisma,
        loaders: createLoaders(prisma),
      };

      try {
        const document = parse(req.body.query);
        const validationErrors = validate(schema, document, [depthLimit(5)]);
        if (validationErrors.length > 0) {
          throw new HttpCompatibleError(400, validationErrors[0].message);
        }

        const result = await graphql({
          schema,
          source: req.body.query,
          contextValue: context,
          variableValues: req.body.variables,
        });

        return result;
      } catch (error) {
        if (error instanceof HttpCompatibleError) {
          return {
            data: null,
            errors: [
              {
                message: error.message,
              },
            ],
          };
        }
        throw new HttpCompatibleError(500, String(error));
      }
    },
  });
};

export default plugin;
