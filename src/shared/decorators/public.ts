import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key that marks a handler or controller as reachable without a
 * bearer token. It is a code constant on purpose: it used to be read from
 * `process.env.PUBLIC_KEY`, so a missing variable silently changed which routes
 * the guard considered public.
 */
export const IS_PUBLIC_KEY = 'isPublic';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
