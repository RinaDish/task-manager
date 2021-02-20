const isValidOperations = (updates, allowedProps) =>
  updates.every((update) => allowedProps.includes(update));

module.exports = isValidOperations;
