const express = require("express");
const router = express.Router();
const {register, login, forgotpassword, resetpassword, getbooks, viewbooks, checkoutbooks,history,getborrowdate, getreturndate, getoverduefine} = require("../controllers/auth")

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/forgotpassword").post(forgotpassword);
router.route("/resetpassword/:resetToken").put(resetpassword);
router.route("/getbooks").get(getbooks);
router.route("/getborrowdate").get(getborrowdate);
router.route("/getreturndate").get(getreturndate);
router.route("/getoverduefine").get(getoverduefine);
router.route("/viewbooks").post(viewbooks);
router.route("/checkoutbooks").post(checkoutbooks)
router.route("/history").get(history)
//router.route("/getusername").get(getusername)


module.exports = router;