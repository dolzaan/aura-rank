# AuraRank

MVP de uma rede social competitiva para publicar vídeos, receber pontuação de aura por IA e disputar rankings e ligas privadas.

## Stack

- Next.js 16, React 19 e TypeScript
- Prisma + PostgreSQL
- Auth.js com Google preparado por variáveis de ambiente
- Gemini para análise multimodal
- Vercel Blob para vídeos

## Rodando localmente

```bash
cp .env.example .env.local
npm install
npm run db:generate
npm run dev
```

## Estado do MVP

A interface navegável, o schema do banco, os rankings, ligas, perfis e o contrato validado da análise estão implementados. O upload e a análise funcionam em modo demonstração até que as credenciais do Google, PostgreSQL, Gemini e Vercel Blob sejam configuradas.

## Próximas integrações de produção

1. Criar banco Postgres e executar `npm run db:push`.
2. Configurar Google OAuth e Auth.js.
3. Criar Vercel Blob e implementar upload direto.
4. Ligar `/api/analyze` ao Gemini com saída estruturada.
5. Adicionar fila assíncrona, moderação e deduplicação.
