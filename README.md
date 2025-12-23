# Slack App integrado com Quickin
Aplicativo Slack que automatiza a análise e classificação de currículos do Quickin e gera uma planilha no Google Sheets a partir de um simples comando.

<br>

## 📜 Pré-requisitos

![Git](https://img.shields.io/badge/git-F05032?style=for-the-badge&logo=git&logoColor=white)
![Node.js](https://img.shields.io/badge/node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)

<br>

Antes de executar o projeto, certifique-se de que você possui:

- Um **workspace no Slack** com permissões para instalar aplicativos;
- Uma **conta no Quickin** com acesso válido à API;
- Uma **conta Google** com acesso habilitado à Google Sheets API.

<br>

## **🛠️ Tecnologias**

Tecnologias utilizadas: Node.js, JavaScript, Slack Bolt e Google Sheets API.

![Skills](https://skills.syvixor.com/api/icons?i=nodejs,js,slack,google-sheets)

<br>

## **🌐 Uso do ngrok (Ambiente de Desenvolvimento)**

Durante o desenvolvimento local, o Slack precisa conseguir enviar eventos e comandos para a sua aplicação, o que exige uma URL pública acessível pela internet.
Como o projeto roda localmente (localhost), uma solução prática é utilizar o ngrok.

O ngrok cria um túnel seguro que expõe sua aplicação local em uma URL pública temporária, permitindo que o Slack se comunique com ela sem necessidade de deploy.

Após iniciar o ngrok, utilize a URL pública gerada para configurar o Slack App.

<br>

## **🤖 Criação do Slack App**

Este projeto requer um Slack App configurado no workspace.

Siga o guia oficial do Slack (Bolt para Node.js) para criar o app, configurar permissões e obter os tokens:

👉 https://api.slack.com/start/building/bolt-js

<br>

## 🪛 Configurações Iniciais

Clone o repositório

```
git clone https://github.com/enzomurayama/slack-quickin-app.git
cd slack-quickin-app
```

<br>

Instale as dependências

```
npm install
```

<br>

Crie um arquivo .env na raiz do projeto com base no .env.example

```
cp .env.example .env
```

Preencha as variáveis com os seus valores.

<br>

> ⚠️ Certifique-se de que a Service Account tenha permissão de edição na planilha.

<br>

Após configurar o .env, inicie a aplicação com:

```
npm run dev
```

<br>

ou, em modo produção:
```
npm start
```
