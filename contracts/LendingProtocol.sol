// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract LendingProtocol{
    
    address private constant ROUTER = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address private constant COMP = 0xc00e94Cb662C3520282E6f5717214004A7f26888;
    IUniswapV2Router02 public immutable uniswapV2Router;
    IERC20 public immutable compContract;

    constructor(){
        uniswapV2Router = IUniswapV2Router02(ROUTER);
        compContract = IERC20(COMP); 
    }
    
    function getRate() public view returns(uint256){
        address[] memory path = new address[](2);
        path[0] = uniswapV2Router.WETH(); //WETH
        path[1] = COMP; //COMP
        uint256 amount = 1000000000000000000; //1ETH

        uint256[] memory rate = uniswapV2Router.getAmountsOut(amount, path);
        return rate[1];
    }

    //calculates the rate and sends the appropriate COMP for the received ETH
    function LendCOMPforETH() public payable returns(bool){
        uint256 ratePerETH = getRate();
        //User sends ETH -> Give him COMP
        uint256 COMPToSend = (msg.value * ratePerETH)/10**18;
        compContract.transferFrom(address(this), msg.sender, COMPToSend);
        return true;
    }

    receive() external payable{}

}