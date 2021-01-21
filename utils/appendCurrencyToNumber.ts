const appendCurrencyToNumber = (currencyCode: string, amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    currencyDisplay: 'symbol',
  }).format(amount);
};

export default appendCurrencyToNumber;
