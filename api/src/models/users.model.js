module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      token: {
        type: String,
        unique: true
      },
      nickname: String,
      balance: Number,
      admin: Boolean,
    },
    { timestamps: true }
  );

  const Users = mongoose.model("users", schema);
  return Users;
};
