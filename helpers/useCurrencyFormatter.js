const CURRENCIES = {
    EUR: {
        country: "de-DE",
        currency: "EUR"
    },
    USD: {
        country: "en-US",
        currency: "USD"
    }
}

/**
 * 
 * @param {*} currency 
 * @returns 
 */
const useCurrencyFormatter = (currency) => new Intl.NumberFormat(CURRENCIES[currency].country, {
    style: 'currency',
    currency: CURRENCIES[currency].currency,
});

export default useCurrencyFormatter;