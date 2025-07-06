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
        default: 1,  // Valor padrão
        min: 1,      // Mínimo de threads
        max: 10      // Máximo de threads (ajuste conforme necessário)
      }
    },
    { timestamps: true }
  );

  const Users = mongoose.model("users", schema);
  return Users;
};