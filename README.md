# Just Buy It Web

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> A Language Model-based Financial Automation Assistant

**A financial automation web interface**

This project is a web application that leverages AI language models to automate various financial tasks such as retrieving financial information, checking stock prices, and monitoring markets. Through a user-friendly interface, users can easily perform complex financial operations like stock information lookups.

## Key Features

- Stock information lookup and real-time price monitoring
- Account information monitoring
- Financial market trend analysis
- Workflow visualization and progress tracking

## Getting Started

### Prerequisites

- [Just Buy It!](https://github.com/just-buy-meme/just-buy-it) server
- Node.js (v22.14.0+)
- pnpm (v10.6.2+) as package manager

### Configuration

Create a `.env` file in the project root and configure the following environment variables:

- `NEXT_PUBLIC_API_URL`: LangManus API URL

It's best to start with the example file:

```bash
cp .env.example .env
```

### Installation and Running

```bash
# Clone the repository
git clone https://github.com/just-buy-meme/just-buy-it-web.git
cd just-buy-it-web

# Install dependencies
pnpm install

# Run in development mode
pnpm dev
```

Open your browser and navigate to http://localhost:3000

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Zustand (state management)
- LangManus framework

## Contributing

Contributions of all kinds are welcome! Whether you're fixing a typo, improving documentation, or adding a new feature, your help is appreciated.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

Special thanks to all the open source projects and contributors that make LangManus and this project possible.
