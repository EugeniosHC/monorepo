# NestJS + Clerk Authentication

Uma implementação completa de autenticação usando Clerk com NestJS, seguindo as melhores práticas de segurança e organização de código.

## 🚀 Recursos

- ✅ Validação de JWT tokens usando `@clerk/backend`
- ✅ AuthGuard para proteger rotas
- ✅ Sistema de roles (admin, user, moderator)
- ✅ RolesGuard para controle de acesso baseado em roles
- ✅ Decorators `@CurrentUser()` e `@Roles()`
- ✅ Tipagem completa com TypeScript
- ✅ Configuração pronta para produção
- ✅ Logs estruturados
- ✅ Tratamento de erros robusto

## 📋 Pré-requisitos

1. Conta no [Clerk](https://clerk.com)
2. Node.js (18+)
3. pnpm (recomendado)

## ⚙️ Configuração

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Configure as variáveis no arquivo `.env`:

```env
CLERK_SECRET_KEY=sk_test_your_secret_key_here
CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_JWT_KEY=your_jwt_key_here
PORT=3000
NODE_ENV=development
```

### 3. Configurar JWT Template no Clerk

**Passo 1: Criar o Template**

1. Acesse o [Clerk Dashboard](https://dashboard.clerk.com)
2. Vá para **JWT Templates**
3. Clique em **"New template"**
4. Escolha **"Custom"**
5. Nome: `NestJS Auth Template`

**Passo 2: Configuração JSON do Template**
Use esta configuração no template:

```json
{
  "aud": "{{audience}}",
  "exp": "{{exp}}",
  "iat": "{{iat}}",
  "iss": "{{issuer}}",
  "nbf": "{{nbf}}",
  "sub": "{{user.id}}",
  "email": "{{user.primary_email_address.email_address}}",
  "first_name": "{{user.first_name}}",
  "last_name": "{{user.last_name}}",
  "public_metadata": "{{user.public_metadata}}",
  "private_metadata": "{{user.private_metadata}}"
}
```

**Passo 3: Obter as Chaves**

1. **API Keys** → Copie:
   - **Secret Key** → `CLERK_SECRET_KEY`
   - **Publishable Key** → `CLERK_PUBLISHABLE_KEY`
2. **JWT Templates** → Selecione seu template → Copie a **Signing Key** → `CLERK_JWT_KEY`

**Passo 4: Configurar Roles dos Usuários**

1. Vá para **Users**
2. Selecione um usuário
3. Em **Private Metadata** (recomendado), adicione:

```json
{
  "role": "admin"
}
```

**Passo 5: Testar a Configuração**

```bash
# Criar um arquivo .env baseado no .env.example
cp .env.example .env

# Preencher as variáveis no .env
# Testar a configuração
pnpm run test:auth
```

## 🏗️ Estrutura do Projeto

```
src/
├── auth/
│   ├── config/
│   │   └── clerk.config.ts         # Configuração do Clerk
│   ├── decorators/
│   │   ├── current-user.decorator.ts  # @CurrentUser()
│   │   └── roles.decorator.ts         # @Roles()
│   ├── guards/
│   │   ├── auth.guard.ts           # Validação de autenticação
│   │   └── roles.guard.ts          # Validação de roles
│   ├── services/
│   │   └── auth.service.ts         # Serviço de autenticação
│   ├── types/
│   │   └── auth.types.ts           # Tipos TypeScript
│   ├── auth.module.ts              # Módulo de autenticação
│   └── index.ts                    # Exports centralizados
├── controllers/
│   └── protected.controller.ts     # Exemplo de controller protegido
├── app.module.ts
└── main.ts
```

## 🔐 Como Usar

### Proteger uma rota

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard, CurrentUser, ClerkUser } from '../auth';

@Controller('api')
@UseGuards(AuthGuard)
export class ApiController {
  @Get('profile')
  getProfile(@CurrentUser() user: ClerkUser) {
    return {
      userId: user.userId,
      email: user.email,
      role: user.role,
    };
  }
}
```

### Proteger com roles específicos

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  AuthGuard,
  RolesGuard,
  Roles,
  UserRole,
  CurrentUser,
  ClerkUser,
} from '../auth';

@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
export class AdminController {
  @Get('users')
  @Roles(UserRole.ADMIN)
  getUsers(@CurrentUser() user: ClerkUser) {
    return { message: 'Admin only data' };
  }

  @Get('moderator')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  getModeratorData(@CurrentUser() user: ClerkUser) {
    return { message: 'Admin or Moderator data' };
  }
}
```

### Aplicar autenticação globalmente (opcional)

No `auth.module.ts`, uncomment as linhas:

```typescript
{
  provide: APP_GUARD,
  useClass: AuthGuard,
},
```

## 🏷️ Sistema de Roles

Os roles são configurados nos metadados do usuário no Clerk:

### Configurar roles no Clerk

1. Vá para **Users** no Clerk Dashboard
2. Selecione um usuário
3. Em **Metadata**, adicione:

**Public Metadata:**

```json
{
  "role": "admin"
}
```

**Private Metadata (mais seguro):**

```json
{
  "role": "admin"
}
```

### Roles disponíveis

```typescript
enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
}
```

## 📡 Testando a API

### 1. Iniciar o servidor

```bash
pnpm run start:dev
```

### 2. Testar rotas protegidas

```bash
# Rota protegida - requer token
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:3000/protected/profile

# Rota admin - requer token + role admin
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:3000/protected/admin
```

### 3. Obter token JWT

**No frontend, use o template criado:**

```javascript
// React/Next.js com @clerk/nextjs
import { useAuth } from '@clerk/nextjs';

function MyComponent() {
  const { getToken } = useAuth();

  const callAPI = async () => {
    // Use o nome do template que você criou
    const token = await getToken({ template: 'NestJS Auth Template' });

    const response = await fetch('/api/protected/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log(data);
  };

  return <button onClick={callAPI}>Call Protected API</button>;
}
```

**Vanilla JavaScript:**

```javascript
// Se você não está usando React
import { Clerk } from '@clerk/clerk-js';

const clerk = new Clerk('your_publishable_key');

async function callAPI() {
  const token = await clerk.session.getToken({
    template: 'NestJS Auth Template',
  });

  const response = await fetch('/api/protected/profile', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
```

## 🔧 Configurações Avançadas

### Customizar extração de roles

No `auth.service.ts`, modifique o método `extractUserRole()`:

```typescript
private extractUserRole(payload: ClerkTokenPayload): UserRole {
  // Sua lógica customizada aqui
  const role = payload.private_metadata?.role || UserRole.USER;
  return role;
}
```

### Adicionar validações customizadas

```typescript
// No AuthGuard ou RolesGuard
if (someCustomCondition) {
  throw new UnauthorizedException('Custom validation failed');
}
```

## 📊 Logs e Debugging

O sistema inclui logs estruturados para facilitar o debugging:

### Ativar Logs Detalhados

```env
NODE_ENV=development
```

### Logs Disponíveis

- ✅ Token verification success/failure
- ✅ User authentication details
- ✅ Role validation checks
- ✅ Error stack traces
- ✅ Request context information

### Debugging Comum

**Problema: "Invalid or expired token"**

```bash
# Verifique se o JWT Template está configurado corretamente
# Verifique se CLERK_JWT_KEY está correto
# Verifique se o token não expirou

# Teste a configuração:
pnpm run test:auth
```

**Problema: "Insufficient permissions"**

```bash
# Verifique se o usuário tem role configurado no metadata
# Verifique se o role está sendo extraído corretamente
# Verifique se o @Roles() decorator está com os roles corretos
```

**Problema: "User not found in request"**

```bash
# Certifique-se que AuthGuard está sendo executado antes do RolesGuard
# UseGuards(AuthGuard, RolesGuard) - ordem importa
```

### Testar Payload JWT

Use [jwt.io](https://jwt.io) para decodificar seu token e verificar se os dados estão corretos:

```json
{
  "sub": "user_2abc123def456",
  "email": "user@example.com",
  "private_metadata": {
    "role": "admin"
  }
}
```

## 🚀 Deploy para Produção

1. Configure as variáveis de ambiente de produção
2. Use `NODE_ENV=production`
3. Configure logs para produção
4. Use HTTPS sempre
5. Configure CORS adequadamente

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma feature branch
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

## 🆘 Suporte

- [Documentação do Clerk](https://clerk.com/docs)
- [Documentação do NestJS](https://docs.nestjs.com)
- [Issues do GitHub](https://github.com/seu-repo/issues)

---

**Feito com ❤️ usando NestJS + Clerk**
