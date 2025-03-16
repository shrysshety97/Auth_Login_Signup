const express = require("express");
const router = new express.Router();
const userdb = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const authenticate = require("../middleware/authenticate");

//for user registration
router.post("/register", async (req, res) => {

    const { fname, email, password, cpassword } = req.body;

    if (!fname || !email || !password || !cpassword) {
        res.status(422).json({ error: "fill all the details" })
    }

    try {
        const preuser = await userdb.findOne({ email: email });

        if (preuser) {
            res.status(422).json({ error: "This email is already Exist" });
        } else if (password !== cpassword) {
            res.status(422).json({ error: "Password and Confirm Password Not Match." })
        } else {
            const finalUser = new userdb({
                fname: fname,
                email: email,
                password: password,
                cpassword: cpassword
            });

            // here password hashing 
            const storeData = await finalUser.save();

            //console.log(storeData);
            res.status(201).json({ status: 201, storeData });
        }
    } catch (error) {
        res.status(422).json(error);
        console.log("catch block error");
    }
});

// User Login

router.post("/login", async (req, res) => {
    // console.log(req.body);

    const { email, password } = req.body;

    if (!email || !password) {
        res.status(422).json({ error: "fill all the details" })
    }

    try {
        const userValid = await userdb.findOne({email:email});

        if (userValid) {
            const isMatch = await bcrypt.compare(password,userValid.password);

            if (!isMatch) {
                res.status(422).json({error: "Invalid details."})
            } else {
                // token generate
                const token = await userValid.generateAuthtoken();

               // cookie Generate
                res.cookie("usercookie",token,{
                    expires: new Date(Date.now()+9000000),
                    httpOnly: true
                });

                const result = {
                    userValid,
                    token
                }
                res.status(401).json({status:201,result})
            }
        }
    } catch (error) {
        res.status(401).json(error);
        console.log("Catch Block");
    }
});

// user Valid
router.get("/validuser",authenticate, async(req,res)=>{
    try {
        const ValidUserOne = await userdb.findOne({_id:req.userId});
        res.status(201).json({status:201,ValidUserOne});
    } catch (error) {
        res.status(401).json({status:401,error});
    }
});


// User Logout

router.get("/logout",authenticate, async(req, res)=>{
   try {
    req.rootUser.tokens = req.rootUser.tokens.filter((curelem)=>{
        return curelem.token !== req.token
    });

    res.clearCookie("userCookie", {path:"/"});

    req.rootUser.save();

    res.status(201).json({status:201});
   } catch (error) {
    res.status(401).json({status:401,error})
    
   } 
})


module.exports = router;