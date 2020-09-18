function ContractEntry(key, value) {
    this.key = key;
    this.value = value;
}

ContractEntry.prototype.toQueryString = function() {
    return `${this.key}=${this.value}`;
}

module.exports = ContractEntry;

