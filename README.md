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
