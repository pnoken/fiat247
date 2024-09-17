# fsWallet: Web5 Wallet for Cross-Border Transfers in Africa

![fsWallet Logo](./public//favicon.ico)

## Overview

fsWallet is a Web5 wallet designed for cross-border transfers in Africa, developed as part of the TBDex challenge. The wallet leverages decentralized technologies to facilitate secure, fast, and low-cost financial transactions across borders within the African continent.

## Design Considerations

### Profitability
fsWallet generates revenue through:
- Small transaction fees on successful transfers

### Optionality
- Implements a matching algorithm to compare offerings from multiple PFIs
- Allows users to sort and filter PFI offerings based on various criteria
- Provides a comparison view of top matches for user selection

### Customer Management
- Utilizes Web5 DID protocols for secure identity management
- Implements a user-friendly interface for DID creation, import, and export
- Stores Verifiable Credentials securely within the wallet

### Customer Satisfaction
- Implements a rating system for users to review PFIs after transactions
- Aggregates and displays PFI ratings to help users make informed decisions
- Provides a feedback mechanism for continuous improvement

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features

- **Decentralized Identity (DID) Integration:** Ensures secure and private user authentication using Web5 DID protocols.
- **Cross-Border Transfers:** Enables seamless transfers between different African countries using TBDex protocol.
- **Low Transaction Fees:** Built to minimize transaction costs, making it accessible to a wider audience.
- **Multi-Currency Support:** Supports multiple African currencies (e.g., GHS) and digital currencies (e.g., USDC) to facilitate local and international transactions.
- **User-Friendly Interface:** Designed with simplicity and ease of use in mind, catering to users of all technical levels.
- **Portable DID Management:** Allows users to create, export, and manage their Decentralized Identifiers.
- **PFI Comparison:** Allows users to compare offerings from multiple PFIs.
- **Rating System:** Enables users to rate and review PFIs based on their experience.
- **Secure Credential Storage:** Safely stores and manages users' Verifiable Credentials.

## Technology Stack

- **Frontend:** React, TypeScript, Next.js
- **State Management:** Redux Toolkit
- **Blockchain:** TBDex SDK, Web5 Protocols
- **DID Management:** @web5/dids
- **Styling:** Tailwind CSS
- **Build Tools:** Next.js built-in tooling
- **Package Management:** npm

## Installation & Usage

To run this project locally, follow these steps:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/fiatsend/web-wallet.git
   cd fswallet
   ```

2. **Install dependencies:**

   ```bash
   yarn install
   ```

3. **Run the development server:**

   ```bash
   yarn run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `src/app`: Contains the main application pages and routing logic.
- `src/components`: Reusable React components.
- `src/lib`: Redux slices and other utility functions.
- `public`: Static assets.

## Key Components

- `wallet-slice.ts`: Manages wallet creation and DID operations.
- `offering-slice.ts`: Handles fetching and filtering of TBDex offerings.
- `exchange-slice.ts`: Manages the creation of exchanges using TBDex protocol.

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [Web5 DID Documentation](https://developer.tbd.website/docs/web5/learn/decentralized-identifiers)
- [TBDex Documentation](https://developer.tbd.website/docs/tbdex/)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Contact

For any queries or suggestions, please open an issue in the GitHub repository.
