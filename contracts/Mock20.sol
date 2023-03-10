// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Mock20 is ERC20 {
    constructor() ERC20("MockERC20", "M20") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
