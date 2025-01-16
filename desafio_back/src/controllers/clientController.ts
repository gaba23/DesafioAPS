import { Request, Response } from "express";
import { AppDataSource } from "../database/data-source";
import { Client } from "../entities/client";

const clientRepository = AppDataSource.getRepository(Client);

// Busca a lista de clientes
export const getClients = async (req: Request, res: Response): Promise<void> => {
  const { page = 1, limit = 10, nome, cnpj } = req.query;

  const [clients, total] = await clientRepository.findAndCount({
    where: [
      nome ? { nome: nome as string } : {},
      cnpj ? { cnpj: cnpj as string } : {},
    ],
    take: Number(limit),
    skip: (Number(page) - 1) * Number(limit),
  });

  res.json({ total, clients });
};

// Criação de um novo cliente
export const createClient = async (req: Request, res: Response): Promise<void> => {
  const { cnpj } = req.body;

  const existingClient = await clientRepository.findOneBy({ cnpj });
  if (existingClient) {
    res.status(400).json({ error: "CNPJ já cadastrado" });
    return;
  }

  const client = clientRepository.create(req.body);
  await clientRepository.save(client);
  res.status(201).json(client);
};

// Atualização de um cliente
export const updateClient = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const client = await clientRepository.findOneBy({ id: Number(id) });
  if (!client) {
    res.status(404).json({ error: "Cliente não encontrado" });
    return;
  }

  if (req.body.cnpj && req.body.cnpj !== client.cnpj) {
    const existingClient = await clientRepository.findOneBy({ cnpj: req.body.cnpj });
    if (existingClient) {
      res.status(400).json({ error: "CNPJ já cadastrado para outro cliente" });
      return;
    }
  }

  clientRepository.merge(client, req.body);
  const updatedClient = await clientRepository.save(client);
  res.json(updatedClient);
};

// Remoção do cliente
export const deleteClient = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const result = await clientRepository.delete(id);

  if (result.affected === 0) {
    res.status(404).json({ error: "Cliente não encontrado" });
    return;
  }

  res.status(204).send();
};
