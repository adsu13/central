module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      gateway: {
        type: String,
        unique: true,
      },
      route: String,
    },
    { timestamps: true }
  );

  const Gateways = mongoose.model("gateways", schema);
  return Gateways;
};
