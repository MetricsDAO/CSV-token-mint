# MetricsDAO Burner

This repository contains a set of test burners, a mock ERC20 and a script prepared to mint tokens to users based on a CSV provided. This script is extremely simple and not intended for public use. If you would like to make/need improvements, please feel free to submit a PR.

## Addresses

Here are the addresses you are likely going to need. You can use others, but if you're having an issue please try and chase it down before assuming something with the script is wrong.

### Polygon

* `Badger Organization`: 0x1ccb2945F1325e061b40Fe5b0B452f0E76fB7278
* `Mock20`: 0xCce422781e1818821f50226C14E6289a7144a898

## Issuing tokens

The `Mock20` is built with open minting. During the test phase of MDAO, if additional fake pToken is needed you can always navigate to the `Mock20` contract and call `mint` with the address of the user and the amount of tokens you would like to mint.

`Badges` are operating with Badger and all the logic is living within the already deployed Organizations onchain. The script included, issues the Badge in accordance to the csv that is provided. In order to mint Badges the private key provided in the .env must be for an account that has the permission to manage Badge ownership.

The shape of a CSV should be as follows, with the first row being the headers:

```csv
Label,Polygon Address,pToken Amount,Badge ID,Badge Amount
m,0x7c855e1bF411Ab5975235bC8C74E032615073044,100000,1,1
m,0x7c855e1bF411Ab5975235bC8C74E032615073044,0,2,1
j,0x19f471c40CD9270ceEA76CfdEaa85370D78157Ee,100000,1,1
tlm,0x9Ec949ee9494622d194311b704d730525d3693E5,100000,1,1
```

To ingest this csv, you can run the following command after configuring your `.env`:

```bash
npm i
npx hardhat issue --address1155 "0x0" --address20 "0x0" --filepath "./recipients.csv" 
```
