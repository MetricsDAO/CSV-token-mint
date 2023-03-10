require("@nomicfoundation/hardhat-toolbox");
require('hardhat-deploy');
require("hardhat-abi-exporter");
require("@nomiclabs/hardhat-etherscan");

require("dotenv").config();

const fs = require("fs");
const getStream = require("get-stream");
const { parse } = require("csv-parse");
const BadgerABI = require("./build/abis/BadgerOrganization.json")

const RPC_PROVIDER = process.env.RPC_PROVIDER;
const PRIVATE_KEY = [`0x${process.env.PRIVATE_KEY}`];

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
    }
});

// npx hardhat issue --address20 <address> --address1155 <address> --amount 5 --filepath "./recipients.csv"

const readCSVData = async (filepath) => { 
    const parseStream = parse({ delimiter: ',', from_line: 2 })
    return await getStream.array(fs.createReadStream(filepath).pipe(parseStream))
}

task("issue", "Issues tokens to an address")
    .addParam("address20", "The address of 20 tokens being issued")
    .addParam("address1155", "The address of 1155 tokens being issued")
    .addParam("filepath", "The path of the CSV containing the addresses and amounts")
    .setAction(async (taskArgs, hre) => { 
        const [ signer ] = await ethers.getSigners();

        const MockToken = await ethers.getContractFactory("Mock20");
        const mockToken = await MockToken.attach(taskArgs.address20).connect(signer);
        
        const badger = new ethers.Contract(taskArgs.address1155, BadgerABI, signer)

        console.log('taskArgs', taskArgs)
        console.log('Issuing with signer:', signer.address)

        const data = await readCSVData(taskArgs.filepath)

        for (const row of data) {
            const address = row[1]
            const amount = row[2]
            const badgeId = row[3]
            const badgeAmount = row[4]

            if (badgeAmount > 0)
                await badger.leaderMint(address, badgeId, badgeAmount, "0x")
            
            if (amount > 0)
                await mockToken.mint(address, amount)
            
            console.table({
                "Recipient": address,
                "Amount": amount
            })
        }
    })

    

task("deploy", "Deploys the mock20")
  .addFlag("verify", "Verify the contract at Etherscan")
  .setAction(async (taskArgs, hre) => {
    const [deployer] = await ethers.getSigners();
    const chainId = await getChainId();

    console.table({
      "Deployer": deployer.address,
      "Chain ID": chainId,
    })

    const Mock20 = await ethers.getContractFactory("Mock20");
    const mock20 = await Mock20.deploy();
    const receipt = await mock20.deployed();
    console.log("✅ Contract Deployed.")

    console.table({
      "Mock20 Address": mock20.address,
      "Transaction Hash": receipt.deployTransaction.hash
    });

    if (taskArgs.verify) {
      await new Promise(r => setTimeout(r, 30000));
      await hre.run("verify:verify", {
        address: mock20.address,
        constructorArguments: [],
      });
      console.log("✅ Contract Verified.")
    }
  });


module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.8.17",
                settings: {
                    optimizer: { // Keeps the amount of gas used in check
                        enabled: true,
                        runs: 1000000
                    }
                }
            }
        ],
    },
    gasReporter: {
        currency: 'USD',
        gasPrice: 60,
        coinmarketcap: process.env.COINMARKETCAP_API_KEY,
        showMethodSig: true,
        showTimeSpent: true,
        noColors: true,
        outputFile: 'build/gas-report.txt'
    },
    watcher: {
        compilation: {
            tasks: ["compile"],
            files: ["./contracts"],
            verbose: true,
        },
        ci: {
            tasks: ["clean", { command: "compile", params: { quiet: true } }, { command: "test", params: { noCompile: true, testFiles: ["./test/"] } }],
        }
    },
    etherscan: {
        apiKey: {
            mainnet: process.env.ETHERSCAN_API_KEY,
            polygon: process.env.POLYGONSCAN_API_KEY
        }
    },
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 1337,
            gas: "auto",
            gasPrice: "auto",
            saveDeployments: false,
            mining: {
                auto: true
            }
        },
        mainnet: {
            url: RPC_PROVIDER,
            accounts: PRIVATE_KEY,
            gasPrice: 'auto', // 50 gwei
        },
        polygon: {
            url: RPC_PROVIDER,
            accounts: PRIVATE_KEY,
            gasPrice: 120000000000 //140 gwei
        },
    },
    // abiExporter: [{
    //     path: './abis/',
    //     runOnCompile: true,
    //     clear: true,
    //     flat: true,
    //     format: "json"
    // }]
};