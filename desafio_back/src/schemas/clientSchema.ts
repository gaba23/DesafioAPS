import { z } from "zod";

export const clientSchema = z.object({
  id: z.number().optional(),
  cnpj: z.string().length(14, "CNPJ deve ter 14 caracteres").regex(/^\d+$/, "CNPJ deve conter apenas números"),
  nome: z.string().min(1, "Nome é obrigatório"),
  nomeFantasia: z.string().optional(),
  cep: z.string().regex(/^\d{8}$/, "CEP deve conter exatamente 8 números"),
  logradouro: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  uf: z.string().length(2, "UF deve conter exatamente 2 caracteres").optional(),
  complemento: z.string().optional(),
  email: z.string().email("E-mail inválido").optional(),
  telefone: z.string().regex(/^\d{10,15}$/, "Telefone inválido").optional(),
});
