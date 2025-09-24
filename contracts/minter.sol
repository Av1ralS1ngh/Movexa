// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../contracts/node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract AuraCoins is ERC20 {
    constructor() ERC20("AuraCoins", "CoA") {
        // Mint 5,000 tokens to the deployer.
        // Note: ERC20 uses 18 decimals by default.
        _mint(msg.sender, 5000 * 10**decimals());
    }
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
    function burn(address account, uint256 amount) public {
        _burn(account, amount);
    }
}
