const generateAccessCode = () => {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "";

  for (let i = 0; i < 6; i++) {
    const index =
      Math.floor(
        Math.random() *
          chars.length,
      );

    code += chars[index];
  }

  return code;
};

export default generateAccessCode;