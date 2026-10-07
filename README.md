# Certiport — Blockchain-Based University Certificate Issuance & Verification System

A decentralized, multi-role web platform for issuing and verifying academic certificates. Universities issue certificates that are stored on IPFS and registered on the Ethereum blockchain — making them tamper-proof and publicly verifiable by anyone using a unique Blockchain ID.

---

## System Overview

| Layer | Technology |
|---|---|
| Frontend | React.js |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Blockchain | Solidity, Ethereum/Polygon, Hardhat |
| Decentralized Storage | IPFS via Pinata |
| PDF Generation | Puppeteer + EJS Templates |
| Authentication | JWT (JSON Web Tokens) |
| QR Code | Custom QR generation per certificate |

---

## How It Works

```
University issues certificate
        ↓
PDF generated from EJS template + student data
        ↓
PDF uploaded to IPFS via Pinata → returns IPFS Hash
        ↓
IPFS Hash registered on Ethereum blockchain → returns Blockchain ID
        ↓
Student receives certificate 
        ↓
Anyone can verify using Blockchain ID on public portal
```

---

## Roles & Features

### 🔐 Admin
- Approve or reject university registration requests
- Manage all users across the platform
- View platform-wide certificate activity

### 🏛️ University
- Register on the platform (subject to admin approval)
- Upload custom EJS certificate templates (marks card, transfer, migration, grade card)
- Issue certificates to students by filling dynamic form fields
- View all issued certificates and their blockchain status
- Revoke certificates if needed

### 🎓 Student
- Register under an approved university
- View all certificates issued to them
- Download certificates as PDF
- View IPFS-stored certificate and blockchain transaction details

### 🌐 Public (No Login Required)
- Verify any certificate using its Blockchain ID
- Instantly see if a certificate is valid, revoked, or non-existent
- View full certificate metadata and IPFS link

---

## Key Technical Features

**Tamper-Proof Certificates**
Each certificate's IPFS hash is stored on the Ethereum blockchain. Any tampering with the PDF would produce a different hash — making forgery detectable.

**Immutable Blockchain ID**
Every certificate gets a unique ID like `UN01-CERT-ABC123-20250101`. This ID is stored on-chain and in MongoDB. Anyone can verify using just this ID.

**Dynamic Certificate Templates**
Universities upload EJS templates. The backend renders them with student-specific data and generates a PDF using Puppeteer — no hardcoded certificate layouts.

**Role-Based Access Control**
JWT-based authentication with role checks on every protected route — Admin, University, and Student each see only what they're authorized to see.

**Duplicate Prevention**
Smart contract enforces that the same Blockchain ID cannot be issued twice — preventing duplicate certificates at the blockchain level.

---

## Project Structure

```
Certiport/
├── backend/
│   ├── controllers/          # Business logic per role
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── publicController.js
│   │   ├── studentController.js
│   │   ├── templateController.js
│   │   └── universityController.js
│   ├── middleware/
│   │   └── auth.js           # JWT verification middleware
│   ├── models/
│   │   ├── Certificate.js    # Certificate schema with blockchain fields
│   │   ├── Template.js       # EJS template schema
│   │   └── User.js           # Multi-role user schema
│   ├── routes/               # Express route definitions
│   ├── templates/            # EJS certificate templates
│   │   ├── un02/
│   │   └── un03/
│   ├── utils/
│   │   ├── pdfGenerator.js   # Puppeteer PDF rendering
│   │   ├── pinata.js         # IPFS upload via Pinata SDK
│   │   └── qr.js             # QR code generation
│   ├── .env.example
│   └── server.js
├── contracts/
│   ├── contracts/
│   │   └── CertificateRegistry.sol   # Solidity smart contract
│   ├── scripts/
│   │   └── deploy.js
│   ├── hardhat.config.js
│   └── .env.example
├── frontend/
│   └── certiport-frontend/
│       ├── src/
│       │   ├── pages/
│       │   │   ├── AdminDashboard.js
│       │   │   ├── UniversityDashboard.js
│       │   │   ├── StudentDashboard.js
│       │   │   ├── PublicVerify.js
│       │   │   ├── LandingPage.js
│       │   │   ├── Login.js
│       │   │   └── Register.js
│       │   ├── components/
│       │   ├── services/
│       │   ├── utils/
│       │   └── styles/
│       └── .env.example
└── Certiport-documentation.pdf
```

---

## Smart Contract

```solidity
// CertificateRegistry.sol
contract CertificateRegistry {
    struct Certificate {
        string certificateId;
        string ipfsHash;
        address issuer;
        uint256 issuedAt;
    }

    mapping(string => Certificate) public certificates;

    function issueCertificate(string memory certificateId, string memory ipfsHash) public {
        require(bytes(certificates[certificateId].certificateId).length == 0, "Already exists");
        // stores certificate on-chain with issuer address and timestamp
    }

    function getCertificate(string memory certificateId) public view returns (...) {
        // anyone can verify a certificate using its ID
    }
}
```

Deployed on: **Polygon / Local Hardhat Network**

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- MetaMask wallet + test ETH
- Pinata account (for IPFS)
- Hardhat (for smart contract deployment)

---

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/Certiport.git
cd Certiport
```

---

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# fill in your values
npm run dev
```

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/certiport
JWT_SECRET=your_jwt_secret_here
PINATA_API_KEY=your_pinata_api_key
PINATA_API_SECRET=your_pinata_api_secret
ETH_PRIVATE_KEY=your_eth_private_key
RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=0x...
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change_this
```

---

### 3. Deploy Smart Contract

```bash
cd contracts
npm install
cp .env.example .env
# fill in RPC_URL and PRIVATE_KEY

# Terminal 1 - run local node
npm run node

# Terminal 2 - deploy contract
npm run deploy:localhost
```

Copy the deployed contract address into `backend/.env` as `CONTRACT_ADDRESS`.

---

### 4. Setup Frontend

```bash
cd frontend/certiport-frontend
npm install
```

Create `.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_CONTRACT_ADDRESS=0x...
```

```bash
npm start
```

Open `http://localhost:3000`

---

## Screenshots

### Landing Page
<img width="1918" height="1078" alt="Certiport-landing page" src="https://github.com/user-attachments/assets/4566ff3f-5a1e-4933-a95a-19e234a958f3" />


### Public Certificate Verification
<img width="1917" height="1077" alt="certiport-publicverify" src="https://github.com/user-attachments/assets/de46d5a5-27bb-4d21-be1d-f1d5304608c0" />


### University Dashboard
<img width="1901" height="1073" alt="certiport-university" src="https://github.com/user-attachments/assets/0dcbaf67-3950-425c-b37c-0f8134d8ac04" />



### Student Dashboard
<img width="1912" height="1078" alt="certiport-student" src="https://github.com/user-attachments/assets/83ff638c-2f1e-4939-8f2c-78738f442913" />


### Admin Dashboard
<img width="1917" height="1078" alt="certiport-admin" src="https://github.com/user-attachments/assets/c149ccbe-38c2-4219-aed1-b7b81d93f083" />



### Login & Register
<img width="1915" height="1078" alt="Certiport-login " src="https://github.com/user-attachments/assets/cdf76fd2-4a3c-42f0-95f4-dab099cacc6e" />
<img width="1915" height="1077" alt="certiport-register" src="https://github.com/user-attachments/assets/97af88c7-5f21-430f-bd6a-e7a70cef4b0d" />


---

## Documentation

📄 [Full Project Documentation](./Certiport-documentation.pdf)

---

## API Routes

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/api/auth/login` | All | Login |
| POST | `/api/auth/register` | Public | Register |
| GET | `/api/public/verify/:blockchainId` | Public | Verify certificate |
| GET | `/api/public/download/:blockchainId` | Public | Download certificate PDF |
| POST | `/api/university/issue` | University | Issue a certificate |
| GET | `/api/university/certificates` | University | View issued certificates |
| POST | `/api/template/upload` | University | Upload EJS template |
| GET | `/api/student/certificates` | Student | View my certificates |
| GET | `/api/admin/universities` | Admin | View all universities |
| PUT | `/api/admin/approve/:id` | Admin | Approve university |

---

## Known Limitations & Future Improvements

- Email notifications to students upon certificate issuance (planned)
- Currently runs on local Hardhat or Polygon testnet — mainnet deployment pending
- Template editor UI for universities (currently requires manual EJS upload)
- Bulk certificate issuance via CSV upload (planned)
- Mobile-responsive UI improvements

---

## Built With

- [React.js](https://react.dev/)
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Hardhat](https://hardhat.org/)
- [Solidity](https://soliditylang.org/)
- [Pinata (IPFS)](https://www.pinata.cloud/)
- [Puppeteer](https://pptr.dev/)
- [Ethers.js](https://docs.ethers.org/)

---

## License

This project is licensed under the MIT License.
