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
      threads: {
        type: Number,
        default: 1,
        min: 1,
        max: 10
      }
    },
    { timestamps: true }
  );
  const Users = mongoose.model("users", schema);
  return Users;
};