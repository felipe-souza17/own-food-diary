import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Informe o email." })
    .min(1, "Informe o email.")
    .email("Informe um email válido."),
  password: z.string({ required_error: "Informe a senha." }).min(1, "Informe a senha."),
});

export type LoginValues = z.infer<typeof loginSchema>;
