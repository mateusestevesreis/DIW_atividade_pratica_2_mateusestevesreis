[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/-0I6nrpC)
[![Open in Codespaces](https://classroom.github.com/assets/launch-codespace-2972f46106e565e64193e422d61a12cf1da4916b45550586e14ef0a7c637dd04.svg)](https://classroom.github.com/open-in-codespaces?assignment_repo_id=19619812)

# AERONAUTAS - Viagens & Turismo

## Informações do Aluno
- **Nome:** Mateus Esteves Reis
- **Matrícula:** 874659
- **Disciplina:** Desenvolvimento Web
- **Turma:** [Sua Turma]

## Sobre o Projeto
O AERONAUTAS é uma plataforma completa para planejamento de viagens, oferecendo:

- ✈️ Cadastro de destinos turísticos
- 🌎 Exploração de locais por categorias
- ❤️ Sistema de favoritos personalizado
- 📌 Criação de roteiros de viagem

## Estrutura do Banco de Dados
O sistema utiliza as seguintes entidades principais:

1. **Usuários** (autenticação e perfis)
2. **Destinos** (locais turísticos)
3. **Roteiros** (planejamentos de viagem)

## Testes da API

### Requisições via Postman
| Método | Endpoint | Descrição | Imagem |
|--------|----------|-----------|--------|
| GET | /destinos | Listar todos os destinos | ![GET](./prints/get_destinos.png) |
| POST | /destinos | Adicionar novo destino | ![POST](./prints/post_destino.png) |
| PUT | /destinos/:id | Atualizar destino | ![PUT](./prints/put_destino.png) |
| DELETE | /destinos/:id | Remover destino | ![DELETE](./prints/delete_destino.png) |

### Requisições Front-end
![Network](./prints/network_requests.png)

## Como Executar o Projeto

1. **Instalação das dependências**:
```bash
npm install
