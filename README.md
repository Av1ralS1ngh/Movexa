# **Velmora: Aptos NFT Gaming Platform**

## 🚀 Overview

This is an **Aptos-based NFT Game** where players can:
- **Select characters** and **mint NFTs**  
- **Interact with NPCs** for **trading and battles**  
- **Engage in multiplayer interactions** (trade, chat, battle)  
- **Use an in-game economy** powered by **Aptos Coin (APT)**  
- **Access a marketplace** for NFT trading  
- **Earn Soulbound Tokens** as achievements  

## 🎮 **Gameplay Features**

### **Game Flow**  
1️⃣ **User Launches Game** → Connects wallet via **Aptos Wallet Adapter**  
2️⃣ **Character Selection & NFT Minting** → Players select a character, input a location, and mint **5 pseudo-random NFTs**  
3️⃣ **NPC Interaction**  
   - **Trade NFTs**: NPC offers an NFT for a price in **APT tokens**  
   - **Battle NPC**: Users can challenge NPCs to **negotiate discounts**  
     - Winner is determined based on NFT **rarity & skill level**  
4️⃣ **Multiplayer Mode**  
   - Players can **trade, chat, and battle** other players **in real-time**  

---

### 🛒 **In-Game Economy & Marketplace**
- **NFT Inventory** → View & manage owned NFTs using **Aptos Token Standard**  
- **Marketplace** → Buy/sell NFTs using **APT tokens**  
- **Wallet** → Displays **APT token balance**  
- **Achievements & Soulbound Tokens** → Earn **Soulbound Tokens** for completing milestones  

---

### 🔀 **Aptos NFT Management**
- **Native Aptos Integration** → Seamless NFT minting, transferring, and burning on **Aptos blockchain**  
- **Move-based Smart Contracts** → Secure and efficient game logic powered by **Move programming language**  

---

## 📌 **User Flowchart**  
![Game Flowchart](https://drive.google.com/file/d/1jvLgq9u0Pqw4CxZEQWVZGSGPndXBSH1-/view?usp=sharing)  

---

## 🛠️ **Tech Stack**
### **Frontend**  
- **Next.js, Phaser.js** → Game Interface  
- **TailwindCSS, Shadcn** → UI Styling  
- **Three.js** → 3D Interactions  
- **Aptos Wallet Adapter** → Authentication & Wallet Connection  

### **Backend & Smart Contracts**  
- **Move Language** → Smart Contracts (NFTs, APT tokens, and Soulbound Tokens)  
- **Aptos CLI** → Development & Deployment Tools  
- **IPFS, Pinata** → Decentralized Storage for NFT Metadata  
- **Socket.io** → WebSocket-based Multiplayer Communication  

---

## ⚙️ **Setup Instructions**
### **📦 Installation**  
```sh
# Clone the repository
git clone https://github.com/Av1ralS1ngh/Aura-Land.git
cd Aura-Land/game-client

# Install dependencies
npm install

# Install Aptos CLI
curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
```

### **🏗️ Running the Project**  
```sh
# Start the frontend
npm run dev

# Initialize Aptos account (if needed)
aptos init

# Compile and deploy Move contracts
aptos move compile
aptos move publish
```

---

## 🔮 **Future Improvements**
- 🔹 **Enhanced Move Contracts** → Implement advanced **game mechanics** using **Move modules**  
- 🤖 **Integrate AI Agents** → AI can **play and earn NFTs** for the user on **Aptos**  
- 🔑 **Account Abstraction** → AI Agents will have **dedicated Aptos accounts** to **earn NFTs** and transfer them to players  
- 🎲 **True Randomness** → Use **Aptos Randomness API** for **truly random NFT minting**  
- 🌐 **Aptos Ecosystem Integration** → Connect with other **Aptos-based DeFi protocols** for enhanced gameplay
