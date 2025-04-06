const express = require("express");
const { Chat } = require("../models/chat");
const { userAuth } = require("../middleware/auth");

const chatRouter = express.Router();

chatRouter.get('/chat/:targetUserId',userAuth,async(req,res)=>{
   const {targetUserId} = req.params;
   const userID = req.user._id;

   console.log("Here")
   console.log("targetUserId",targetUserId)
   console.log("userID",userID)

   try {
    let chat = await Chat.findOne({
        participants:{$all:[userID.toString(), targetUserId]}
    }).populate({
        path:"messages.senderId",
        select:"firstName lastName emailId"
    })

    if(!chat){
        chat = new Chat({
            participants:{$all:[userID, targetUserId]},
            messages:[]
        });

        await chat.save();

    
    }
    res.json(chat);

   } catch (error) {
    console.log("Error in get chat",error)
   }
})

module.exports = chatRouter