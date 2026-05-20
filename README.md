# Nexus 🚀

Nexus é uma aplicação de comunicação em tempo real inspirada no Discord, focada em entregar uma experiência Premium com Dark Mode nativo, Glassmorphism e canais de áudio e texto.

## Stack Tecnológica

- **Frontend:** Next.js (App Router), React, CSS Modules
- **Backend:** Next.js API Routes, Node.js, Prisma ORM
- **Banco de Dados:** PostgreSQL
- **Real-time (Planejado):** WebSockets / LiveKit

---

## Como Fazer o Deploy no Easypanel

O projeto está configurado com um `Dockerfile` otimizado (Next.js Standalone), pronto para rodar perfeitamente em infraestruturas baseadas em Docker como o **Easypanel**. Siga o passo a passo abaixo para colocar sua aplicação no ar:

### Passo 1: Criar o Banco de Dados
1. No painel do seu Easypanel, clique em **Create Service**.
2. Escolha **PostgreSQL**.
3. Dê um nome ao serviço (ex: `nexus-db`) e clique em **Create**.
4. Entre no serviço de banco de dados recém criado e copie a URL de conexão (deverá ser algo parecido com `postgresql://postgres:senha_gerada@nexus-db:5432/postgres`).

### Passo 2: Criar o Aplicativo (Nexus)
1. No painel do Easypanel, clique em **Create Service**.
2. Escolha **App**.
3. Dê um nome ao aplicativo (ex: `nexus-app`) e clique em **Create**.

### Passo 3: Configurar o Repositório do App
1. Dentro do serviço `nexus-app`, vá na aba **Source**.
2. Selecione a opção **GitHub** e conecte seu repositório `GuilhermeAzespo/Nexus`.
3. Escolha a branch `main`.
4. Em **Build Method**, selecione **Dockerfile**.

### Passo 4: Configurar as Variáveis de Ambiente
1. Vá até a aba **Environment** do serviço `nexus-app`.
2. Adicione as seguintes variáveis:
   ```env
   DATABASE_URL=Sua URL de conexão copiada no Passo 1
   JWT_SECRET=Uma_Senha_Secreta_Muito_Segura_Sua
   ```
3. Salve as variáveis.

### Passo 5: Deploy e Migração Inicial
1. Vá até a aba **Deploy** e clique em **Deploy**. Aguarde a finalização do processo.
2. Como esta é a primeira vez que você roda a aplicação, é necessário criar as tabelas no banco de dados. Para isso, vá até a aba **Console** dentro do seu serviço `nexus-app`.
3. No console que abrirá, digite o seguinte comando e aperte Enter:
   ```bash
   npx prisma migrate deploy
   ```
   *(Isso criará automaticamente a estrutura do banco de dados).*

Pronto! Sua aplicação já estará rodando e disponível através do Domínio configurado no Easypanel.

---

## Rodando Localmente (Para Desenvolvimento)

```bash
# 1. Instale as dependências
npm install

# 2. Configure as variáveis em um arquivo .env
# DATABASE_URL=postgresql://user:pass@localhost:5432/nexus
# JWT_SECRET=secret

# 3. Rode as migrações (caso tenha um BD local)
npx prisma db push

# 4. Inicie o servidor
npm run dev
```
