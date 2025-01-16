import { useState, useEffect } from "react";
import {
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Container,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { z } from "zod";
import "./App.css";

const clientSchema = z.object({
  id: z.number().optional(),
  cnpj: z
    .string()
    .length(14, "CNPJ deve ter 14 caracteres")
    .regex(/^\d+$/, "CNPJ deve conter apenas números"),
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

type Client = z.infer<typeof clientSchema>;

const App = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isFetchingCnpj, setIsFetchingCnpj] = useState(false);
  const [isFetchingCep, setIsFetchingCep] = useState(false);

  const fetchCnpjData = async (cnpj: string, retries = 3, delay = 1000) => {
    try {
      setIsFetchingCnpj(true);
      const response = await fetch(`https://publica.cnpj.ws/cnpj/${cnpj}`);
  
      if (!response.ok) {
        if (response.status === 429 && retries > 0) {
          // Espera antes de tentar novamente
          console.log(`Limite de requisições atingido. Tentando novamente em ${delay / 1000} segundos...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchCnpjData(cnpj, retries - 1, delay * 2); // Dobrar o delay em cada tentativa
        } else {
          throw new Error(`Erro na requisição: ${response.status}`);
        }
      }

      const data = await response.json();
      // console.log(data)
      // Coletar os dados através da api do cnpjws
      setSelectedClient((prev: any) => ({
        ...prev,
        nome: data.razao_social || "",
        nomeFantasia: data.nome_fantasia || "",
        cep: data.estabelecimento?.cep || "",
        logradouro: data.estabelecimento?.logradouro || "",
        bairro: data.estabelecimento?.bairro || "",
        cidade: typeof data.estabelecimento?.cidade === 'string' ? data.estabelecimento?.cidade : data.estabelecimento?.cidade?.nome || "",
        uf: typeof data.estabelecimento?.uf === 'string' ? data.estabelecimento?.uf :data.estabelecimento?.estado?.sigla|| "",
        complemento: data.estabelecimento?.complemento || "",
        email: data.estabelecimento?.email || "",
        telefone: data.estabelecimento.ddd1 && data.estabelecimento.telefone1
        ? `(${data.estabelecimento.ddd1}) ${data.estabelecimento.telefone1}`.replace(/\D/g, "")
        : "",
      }));
    } catch (error) {
      console.error("Erro ao buscar dados do CNPJ:", error);
      alert("Erro ao buscar dados do CNPJ.");
    } finally {
      setIsFetchingCnpj(false);
    }
  };

  const fetchCEPData = async (cep: string) => {
    try {
      setIsFetchingCep(true);
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

      if (!response.ok) {
        throw new Error(`Erro ao buscar CEP: ${response.status}`);
      }

      const data = await response.json();

      if (data.erro) {
        throw new Error("CEP não encontrado.");
      }
      
      // Coletar os dados através da api do viacepws
      setSelectedClient((prev: any) => ({
        ...prev,
        logradouro: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        uf: data.uf || "",
        complemento: data.complemento || "",
      }));
    } catch (error) {
      console.error("Erro ao buscar dados do CEP:", error);
      alert("Erro ao buscar dados do CEP. Verifique o valor inserido.");
    } finally {
      setIsFetchingCep(false);
    }
  };

  // Ao criar ou alterar um cliente, o usuário vai abrir o formulário podendo, ou não, receber um cliente, dependendo do método utilizado
  const handleOpen = (client?: any) => {
    setSelectedClient(
      client || {
        cnpj: "",
        nome: "",
        nomeFantasia: "",
        cep: "",
        logradouro: "",
        bairro: "",
        cidade: "",
        uf: "",
        complemento: "",
        email: "",
        telefone: "",
      }
    );
    setFormErrors({});
    setOpen(true);
  };

  const handleClose = () => {
    if (isFetchingCnpj || isFetchingCep) {
      alert("Aguarde o término das buscas antes de fechar o modal.");
      return;
    }
    setSelectedClient(null);
    setFormErrors({});
    setOpen(false);
  };

  const handleSave = async () => {
    try {
      // Valide os dados do cliente
      clientSchema.parse(selectedClient);
  
      if (selectedClient?.id) {
        // Se já existe um id, atualize o cliente
        setClients((prev) =>
          prev.map((client) =>
            client.id === selectedClient.id ? selectedClient : client
          )
        );
      } else {
        // Caso seja um novo cliente, faça a requisição para o backend
        const response = await fetch("http://localhost:3000/clients", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectedClient),
        });
  
        if (response.ok) {
          const newClient = await response.json();
          setClients((prev) => [...prev, newClient]);  // Adicione o novo cliente à lista
        } else {
          throw new Error("Erro ao criar o cliente.");
        }
      }
  
      handleClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) newErrors[err.path[0] as string] = err.message;
        });
        setFormErrors(newErrors);
      }
      console.error("Erro ao salvar cliente:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSelectedClient((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleDelete = (clientId: number) => {
    setClients((prev) => prev.filter((client) => client.id !== clientId));
  };

  useEffect(() => {
    if (selectedClient?.cnpj?.length === 14) {
      fetchCnpjData(selectedClient.cnpj);
    }

    if (selectedClient?.cep?.length === 8) {
      fetchCEPData(selectedClient.cep);
    }
  }, [selectedClient?.cnpj, selectedClient?.cep]);

  const fetchClients = async () => {
    try {
      const response = await fetch("http://localhost:3000/clients");
      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data.clients)) {
        setClients(data.clients);
      } else {
        console.error("A resposta da API não contém um array de clientes:", data);
      }
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <Container maxWidth="md" className="app">
      <header className="header">
        <img src="/aps.png" alt="Logo" />
        <Typography variant="h4" component="h1">
          Cadastro de Cliente
        </Typography>
      </header>
      <main className="main-content">
        <Box my={3}>
          <List>
            {clients.map((client) => (
              <ListItem key={client.id} divider>
                <ListItemText
                  primary={`${client.nome} - ${client.cnpj}`}
                  secondary={client.email}
                />
                <div className="actions">
                  <IconButton onClick={() => handleOpen(client)} color="secondary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(client.id!)} color="error">
                    <DeleteIcon />
                  </IconButton>
                  <IconButton color="primary">
                    <VisibilityIcon />
                  </IconButton>
                </div>
              </ListItem>
            ))}
          </List>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpen()}
          sx={{ marginTop: 2 }}
        >
          + Criar Cliente
        </Button>
      </main>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {selectedClient?.id ? "Editar Cliente" : "Criar Cliente"}
        </DialogTitle>
        <DialogContent>
          {isFetchingCnpj && <CircularProgress />}
          <TextField
            label="CNPJ"
            name="cnpj"
            value={selectedClient?.cnpj || ""}
            onChange={handleInputChange}
            error={!!formErrors.cnpj}
            helperText={formErrors.cnpj}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Nome"
            name="nome"
            value={selectedClient?.nome || ""}
            onChange={handleInputChange}
            error={!!formErrors.nome}
            helperText={formErrors.nome}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Nome Fantasia"
            name="nomeFantasia"
            value={selectedClient?.nomeFantasia || ""}
            onChange={handleInputChange}
            fullWidth
            margin="dense"
          />
          {isFetchingCep && <CircularProgress />}
          <TextField
            label="CEP"
            name="cep"
            value={selectedClient?.cep || ""}
            onChange={handleInputChange}
            error={!!formErrors.cep}
            helperText={formErrors.cep}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Logradouro"
            name="logradouro"
            value={selectedClient?.logradouro || ""}
            onChange={handleInputChange}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Bairro"
            name="bairro"
            value={selectedClient?.bairro || ""}
            onChange={handleInputChange}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Cidade"
            name="cidade"
            value={selectedClient?.cidade || ""}
            onChange={handleInputChange}
            fullWidth
            margin="dense"
          />
          <TextField
            label="UF"
            name="uf"
            value={selectedClient?.uf || ""}
            onChange={handleInputChange}
            error={!!formErrors.uf}
            helperText={formErrors.uf}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Complemento"
            name="complemento"
            value={selectedClient?.complemento || ""}
            onChange={handleInputChange}
            fullWidth
            margin="dense"
          />
          <TextField
            label="E-mail"
            name="email"
            value={selectedClient?.email || ""}
            onChange={handleInputChange}
            error={!!formErrors.email}
            helperText={formErrors.email}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Telefone"
            name="telefone"
            value={selectedClient?.telefone || ""}
            onChange={handleInputChange}
            error={!!formErrors.telefone}
            helperText={formErrors.telefone}
            fullWidth
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleSave} color="primary">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default App;