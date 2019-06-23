const handler = (data, callback) => {
  callback(200, {
    ...data,
    name: "sample handler"
  });
};

module.exports = handler;
