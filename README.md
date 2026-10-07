# academic-certificate-platform

An application for issuing, storing, and verifying university certificates. Universities can create certificates from their own templates, students can access the certificates issued to them, and anyone can verify a certificate using its blockchain ID.

The project combines a React frontend, an Express API, MongoDB, IPFS, and a Solidity smart contract.

## What it includes

- Separate dashboards for administrators, universities, and students
- University registration and admin approval
- Certificate templates built with EJS
- PDF generation with Puppeteer
- Certificate files uploaded to IPFS through Pinata
- Certificate records stored on the Ethereum-compatible blockchain
- Public certificate verification without signing in
- JWT-based authentication and role-based access control
- QR codes and downloadable certificate PDFs

## Tech stack

- **Frontend:** React
- **API:** Node.js and Express
- **Database:** MongoDB with Mongoose
- **Smart contract:** Solidity 0.8.19 and Hardhat
- **File storage:** IPFS through Pinata
- **PDFs:** Puppeteer and EJS
- **Authentication:** JSON Web Tokens

## Repository layout

```text
academic-certificate-platform/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── templates/
│   ├── utils/
│   └── server.js
├── contracts/
│   ├── contracts/
│   ├── scripts/
│   └── hardhat.config.js
├── frontend/
│   └── certiport-frontend/
├── .gitignore
└── README.md
```

## Running the project locally

### Requirements

- Node.js 18 or newer
- MongoDB, either locally or through MongoDB Atlas
- A Pinata account if certificates should be uploaded to IPFS
- MetaMask or another Ethereum wallet for a test network deployment

### 1. Clone the repository

```bash
git clone https://github.com/BhumilNariya/academic-certificate-platform.git
cd academic-certificate-platform
```

### 2. Start the local blockchain

Open a terminal in `contracts` and install the dependencies:

```bash
cd contracts
npm install
npx hardhat node
```

Keep this terminal running. Hardhat will print test accounts and private keys for the local network.

### 3. Configure and deploy the contract

Copy the example environment file and add the private key of one of the local Hardhat accounts:

```bash
copy .env.example .env
```

The contract deployment uses the local network:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

Copy the deployed contract address into `backend/.env` as `CONTRACT_ADDRESS`.

### 4. Start the backend

Open another terminal:

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Update `backend/.env` with your MongoDB connection string, JWT secret, Pinata credentials, blockchain settings, and admin account details.

The API runs on `http://localhost:5000` by default.

### 5. Start the frontend

Open a third terminal:

```bash
cd frontend/certiport-frontend
npm install
copy .env.example .env
npm start
```

The frontend opens at `http://localhost:3000`.

## Environment variables

The repository contains `.env.example` files for the backend, contracts, and frontend. Create local `.env` files from those examples and replace the placeholder values.

Never commit `.env` files, private keys, JWT secrets, database credentials, or Pinata credentials. They are excluded by `.gitignore`.

## Main user flows

1. An administrator approves a university account.
2. The university creates or uploads a certificate template.
3. Certificate information is submitted for a student.
4. The backend renders the template as a PDF and uploads it to IPFS.
5. The IPFS hash and certificate ID are registered in the smart contract.
6. The student can view or download the certificate.
7. Anyone can check the certificate status through the public verification page.

## Notes

- The local Hardhat network is intended for development and testing.
- A deployed contract address is required before issuing certificates.
- MongoDB must be running before the backend can serve authenticated features.
- Uploaded files and local secrets are intentionally not tracked in Git.

