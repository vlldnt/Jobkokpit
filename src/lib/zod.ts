import { z } from "zod";

/**
 * Reusable Zod field builders for form input coming from FormData, where empty
 * fields arrive as "" and must become `undefined`. Keep this module free of
 * server-only / Prisma imports so schemas can be imported anywhere.
 */
const blankToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

export const requiredText = (message: string, max = 200) =>
  z.string().trim().min(1, message).max(max);

export const optionalText = (max = 1000) =>
  z.preprocess(blankToUndefined, z.string().trim().max(max).optional());

export const optionalUrl = (max = 2048) =>
  z.preprocess(
    blankToUndefined,
    z.string().trim().url("URL invalide.").max(max).optional(),
  );

export const optionalEmail = () =>
  z.preprocess(
    blankToUndefined,
    z.string().trim().email("E-mail invalide.").max(320).optional(),
  );

export const optionalInt = (max = 100_000_000) =>
  z.preprocess(
    blankToUndefined,
    z.coerce.number().int().min(0).max(max).optional(),
  );

export const optionalDate = () =>
  z.preprocess(blankToUndefined, z.coerce.date().optional());
