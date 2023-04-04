document.getElementById('fees-form').addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const address = document.getElementById('address').value;
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
  
    const feesList = await getFeesList(address, from, to);
    const totalFees = feesList.reduce((acc, fee) => acc + fee, 0);
  
    document.getElementById('total-fees').textContent = totalFees.toFixed(8) + ' ETH';
  
    const feesListElement = document.getElementById('fees-list');
    feesListElement.innerHTML = '';
    feesList.forEach(fee => {
      const listItem = document.createElement('li');
      listItem.textContent = fee.toFixed(8) + ' ETH';
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
    const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`;
  
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
        const feeInEth = Number(feeInWei / BigInt(10 ** 18));
        return feeInEth;
      });
  
    return feesList;
  }
  