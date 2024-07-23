import mongoose from "mongoose";
import {User} from "../models/user.model.js"
import {Subscription} from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if(!mongoose.isValidObjectId(channelId)){
        throw new ApiError(404, "Invalid channel Id")
    }

    const user = await User.findOne({
        refreshToken : req.cookies.refreshToken
    })

    if(!user){
        throw new ApiError(404, "Invalid User")
    }

    const subscription = await Subscription.findOne({
        subscriber: user._id,
        channel : channelId,
    })

    try {
        if(subscription){
            await Subscription.findByIdAndDelete(subscription._id)
    
            return res
                .status(200)
                .json(new ApiResponse(200, null, "Unsubscribed Successfully"))
        } else {
            const newSubscription = new Subscription({
                subscriber: user._id,
                channel: channelId
            });
            
            await newSubscription.save();
            
            return res
                    .status(200)
                    .json( new ApiResponse(200, newSubscription, "Subscribed Successfully"))
        }
    } catch (error) {
        throw new ApiError(500, "Something wen wrong in toggling subscription", error)
    }
})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if(!mongoose.isValidObjectId(channelId)){
        throw new ApiError(404, "Invalid channel Id")
    }

    const user = await User.findOne({
        refreshToken: req.cookies.refreshToken
    })

    if(!user){
        throw new ApiError(404, "Invalid user")
    }


    const subscribers = await Subscription.find({ channel: channelId }).populate('subscriber');

    const subscriberCount=await Subscription.countDocuments({
        channel: channelId
    })

    if(!subscribers){
        return new ApiError(400, "No subscribers found")
    }

    return(
        res
        .status(200)
        .json(new ApiResponse(200,{subscriberCount, subscribers},"Subscribed channels fetched successfully"))
    )
})


const getSubscribedChannels = asyncHandler(async(req, res) => {
    const {subscriberId} = req.params;

    if(!mongoose.isValidObjectId(subscriberId)){
        throw new ApiError(404, "Invalid subscriber Id")
    }

    const user = await User.findOne({
        refreshToken: req.cookies.refreshToken
    })

    if(!user){
        throw new ApiError(404, "User doesn't exists")
    }

    const channels = await Subscription.find({subscriber: subscriberId}).populate('channel')

    const channelCount = await Subscription.countDocuments({subscriber: subscriberId})

    if(!channels){
        throw new ApiError(400, "No channels found")
    }

    return res 
            .status(200)
            .json(new ApiResponse(200, {channelCount, channels}, "Channels fetched Successfully "))

})


export {
    toggleSubscription,
    getSubscribedChannels,
    getUserChannelSubscribers
}