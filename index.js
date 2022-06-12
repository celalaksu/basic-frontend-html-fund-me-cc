import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const getBanceButton = document.getElementById("balanceButton")
getBanceButton.onclick = getBalance
const withdrawButton = document.getElementById("withdrawButton")
withdrawButton.onclick = withdraw
connectButton.onclick = connect
fundButton.onclick = fund

console.log(ethers)

async function connect() {
    console.log("Hi!")
    if (typeof window.ethereum !== "undefined") {
        console.log("I see a metamask")
        await window.ethereum.request({ method: "eth_requestAccounts" })
        console.log("Connected")
        connectButton.innerHTML = "Connected"
    } else {
        console.log("No metamask")
        connectButton.innerHTML = "Install Metamask"
    }
}

async function getBalance() {
    if (typeof window.ethereum != "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}....`)
    if (typeof window.ethereum !== "undefined") {
        // takes rpc_url from connected account on metamask
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        // connected metamask account is the signer
        const signer = provider.getSigner()
        console.log(signer)
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            // hey, wait for this TX to finish
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done!")
        } catch (error) {
            console.log(error)
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)
    // return new Promise()
    // listen for this transaction to finish
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmation.`
            )
            resolve()
        })
    })
}

async function withdraw() {
    if (typeof window.ethereum != "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }
    }
}
