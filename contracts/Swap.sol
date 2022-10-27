// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Swap{
    address private constant ROUTER = 0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F;
    address private constant uROUTER = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address private constant COMP = 0xc00e94Cb662C3520282E6f5717214004A7f26888;

    IUniswapV2Router02 public immutable sushiswapV2Router;
    IUniswapV2Router02 public immutable uniswapV2Router;
    IERC20 public immutable compContract;


    constructor(){
        sushiswapV2Router = IUniswapV2Router02(ROUTER);
        uniswapV2Router = IUniswapV2Router02(uROUTER);
        compContract = IERC20(COMP); 

    }


    function getRateUni() public view returns(uint256){
        address[] memory path = new address[](2);
        path[0] = uniswapV2Router.WETH(); //WETH
        path[1] = 0xc00e94Cb662C3520282E6f5717214004A7f26888; //COMP
        uint256 amount = 1000000000000000000; //1ETH

        uint256[] memory rate = uniswapV2Router.getAmountsOut(amount, path);
        return rate[1];
    }

    //buying COMP by Giving ETH on Uniswap
    function swapETHForCOMP(uint256 _amount) public{
        address[] memory path = new address[](2);
        path[0] = 0xc00e94Cb662C3520282E6f5717214004A7f26888; //COMP 
        path[1] = uniswapV2Router.WETH();//WETH

        compContract.approve(address(uniswapV2Router), _amount);

        uniswapV2Router.swapExactTokensForETHSupportingFeeOnTransferTokens(_amount, 0, path, msg.sender, block.timestamp);
    }

    //buying COMP by Giving ETH on Sushiswap
    function swapETHForCOMPSushi(uint256 _amount) public{
        address[] memory path = new address[](2);
        path[0] = 0xc00e94Cb662C3520282E6f5717214004A7f26888; //COMP 
        path[1] = sushiswapV2Router.WETH();//WETH

        compContract.approve(address(sushiswapV2Router), _amount);

        sushiswapV2Router.swapExactTokensForETHSupportingFeeOnTransferTokens(_amount, 0, path, msg.sender, block.timestamp);
    }

    receive() external payable{}
}