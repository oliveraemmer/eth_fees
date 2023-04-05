document.getElementById('fees-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const address = document.getElementById('address').value;
  const from = document.getElementById('from').value;
  const to = document.getElementById('to').value;

  const feesList = await getFeesList(address, from, to);
  const totalFees = feesList.reduce((acc, feeObj) => acc + feeObj.fee, 0);

  const ethPriceInUsd = await getEthPriceInUsd();
  const totalFeesInUsd = totalFees * ethPriceInUsd;

  document.getElementById('total-fees').textContent = `${totalFees.toFixed(8)} ETH (${totalFeesInUsd.toFixed(2)} USD)`;

  const feesListElement = document.getElementById('fees-list');
  feesListElement.innerHTML = '';
  feesList.forEach(({ fee, hash, date }) => {
    const listItem = document.createElement("li");
    const etherscanLink = `https://etherscan.io/tx/${hash}`;
    const formattedDate = date.toLocaleDateString();
    const feeInUsd = fee * ethPriceInUsd;

    listItem.innerHTML = `<span>${fee.toFixed(8)} ETH (${feeInUsd.toFixed(2)} USD) - ${formattedDate}</span>`;
    const viewTransactionBtn = document.createElement("button");
    viewTransactionBtn.classList.add("view-transaction");
    viewTransactionBtn.textContent = "View transaction";
    viewTransactionBtn.addEventListener('click', () => {
      window.open(etherscanLink, '_blank');
    });

    listItem.appendChild(viewTransactionBtn);
    feesListElement.appendChild(listItem);
  });

});
  
  async function getFeesList(address, from, to) {
    // You'll need an API to fetch transaction data for the given address
    // For example, you can use Etherscan API (https://etherscan.io/apis)
    // Note: You'll need an API key to access Etherscan API
  
    const apiKey = 'DS5983Y8362MRU9MFW241574BBZJWXI5PU';
    const fromTimestamp = new Date(from).getTime() / 1000;
    const toTimestamp = new Date(to).getTime() / 1000;
    const url = `https://api.etherscan.io/api?module=account&action=txlist&address=0x9DD6C0DbFabC41E1002a66534736718b1db66040&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`;
    //const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();
  
    if (data.status !== '1' || !Array.isArray(data.result)) {
      throw new Error('Failed to fetch transaction data');
    }

    const feesList = data.result
    .filter(tx => tx.timeStamp >= fromTimestamp && tx.timeStamp <= toTimestamp)
    .map(tx => {
      const gasUsed = BigInt(tx.gasUsed);
      const gasPrice = BigInt(tx.gasPrice);
      const feeInWei = gasUsed * gasPrice;
      const weiPerEth = BigInt(10 ** 18);
      const feeInEth = Number(feeInWei / weiPerEth) + Number(feeInWei % weiPerEth) / 10 ** 18;
      const date = new Date(tx.timeStamp * 1000);
      return {
        fee: feeInEth,
        hash: tx.hash,
        date
      };
    });
  

  
    return feesList;
  }

  async function getEthPriceInUsd() {
    const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
    const data = await response.json();
    return data.ethereum.usd;
  }
  

  // Temporary solution
  window.addEventListener('DOMContentLoaded', (event) => {
    const fromDateInput = document.getElementById('from');
    const toDateInput = document.getElementById('to');
  
    const currentDate = new Date();
    const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
    const thirtyDaysInMilliseconds = 30 * oneDayInMilliseconds;
  
    const defaultFromDate = new Date(currentDate.getTime() - thirtyDaysInMilliseconds);
    const defaultToDate = currentDate;
  
    fromDateInput.valueAsDate = defaultFromDate;
    toDateInput.valueAsDate = defaultToDate;
  });
  
  