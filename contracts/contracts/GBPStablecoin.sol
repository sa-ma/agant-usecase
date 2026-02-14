// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract GBPStablecoin is ERC20, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant FREEZER_ROLE = keccak256("FREEZER_ROLE");

    mapping(address => bool) public frozen;

    event Minted(address indexed to, uint256 amount);
    event Burned(address indexed from, uint256 amount);
    event AddressFrozen(address indexed user);
    event AddressUnfrozen(address indexed user);

    constructor(address admin) ERC20("Agant GBP", "aGBP") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(BURNER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        _grantRole(FREEZER_ROLE, admin);
    }

    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
        emit Minted(to, amount);
    }

    function burn(address from, uint256 amount) external onlyRole(BURNER_ROLE) {
        _burn(from, amount);
        emit Burned(from, amount);
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function freeze(address user) external onlyRole(FREEZER_ROLE) {
        frozen[user] = true;
        emit AddressFrozen(user);
    }

    function unfreeze(address user) external onlyRole(FREEZER_ROLE) {
        frozen[user] = false;
        emit AddressUnfrozen(user);
    }

    function _update(address from, address to, uint256 value) internal override whenNotPaused {
        if (from != address(0)) {
            require(!frozen[from], "Frozen: sender");
        }
        if (to != address(0)) {
            require(!frozen[to], "Frozen: recipient");
        }
        super._update(from, to, value);
    }
}
