const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'DZD',
    }).format(Number(value));
};

export default formatCurrency;