const router = require("express").Router();

router.use("/users", require("./user.routes"));
router.use("/auth", require("./auth.routes"));
router.use("/requests", require("./request.routes"));
router.use("/chats", require("./chat.routes"));

module.exports = router;
