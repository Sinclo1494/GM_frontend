const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
};

export default formatDate;