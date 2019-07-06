const handler = (data, callback) => {
  callback(200, {
    ...data,
    name: "ping handler"
  });
};

module.exports = handler;
