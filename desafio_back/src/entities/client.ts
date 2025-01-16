import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

// Criação da entidade cliente, determinando id, cnpj, nome e dados da localização como obrigatórios
@Entity()
export class Client {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("varchar", { length: 14 })
  cnpj!: string;

  @Column("varchar")
  nome!: string;

  @Column("varchar", { nullable: true })
  nomeFantasia?: string;

  @Column("varchar", { nullable: true })
  cep!: string;

  @Column("varchar", { nullable: true })
  logradouro!: string;

  @Column("varchar", { nullable: true })
  bairro!: string;

  @Column("varchar", { nullable: true })
  cidade!: string;

  @Column("varchar", { nullable: true })
  uf!: string;

  @Column("varchar", { nullable: true })
  complemento?: string;

  @Column("varchar", { nullable: true })
  email?: string;

  @Column("varchar", { nullable: true })
  telefone?: string;
}
