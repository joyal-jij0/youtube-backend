import mongoose, {isValidObjectId} from "mongoose";
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const user = await User.findOne({
        refreshToken: req.cookies.refreshToken
    })

    if(!user){
        throw new ApiError(404, "User not found")
    }

    const {content} = req.body;

    if(!content){
        throw new ApiError(400, "Content not found")
    }

    const tweet = await Tweet.create({
        content,
        owner: user._id
    })

    if(!tweet){
        throw new ApiError(500, "Error in creating new tweet")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, tweet, "Tweet created succesfully"))

})

const getUserTweets = asyncHandler(async (req, res) => {
    const {userId} = req.params;

    if(!mongoose.isValidObjectId(userId)){
        throw new ApiError(400, "Invalid userId")
    }

    const user = await User.findOne({
        refreshToken: req.cookies.refreshToken
    })

    if(!user){
        throw new ApiError(404, "User not found")
    }

    const tweets = await Tweet.find({owner: userId})

    if(!tweets || !tweets.length === 0){
        throw new ApiError(400, "No tweets found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "Successfully fetched all tweets"));

    
})

const updateTweet = asyncHandler(async(req, res) => {
    const {tweetId} = req.params

    if(!mongoose.isValidObjectId(tweetId)){
        throw new ApiError(404, "Invalid tweet id")
    }

    const user = await User.findOne({
        refreshToken: req.cookies.refreshToken
    })

    if(!user){
        throw new ApiError(400, "Invalid User")
    }

    const {content} = req.body

    if(!content){
        throw new ApiError(400, "Content not found")
    }

    const tweet = await Tweet.findOneAndUpdate(
        {
            _id: tweetId,
            owner: user._id
        },
        {
            $set: {
                content
            }
        },
        {
            new: true
        }
    )

    if(!tweet){
        throw new ApiError(400, "Only the owner can update the tweet")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, tweet, "Succesfully updated tweet"))
})

const deleteTweet = asyncHandler(async(req, res) => {
    const {tweetId} = req.params
    
    if(!mongoose.isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet id")
    }

    const user = await User.findOne({
        refreshToken: req.cookies.refreshToken
    })

    if(!user){
        throw new ApiError(404, "Invalid user")
    }

    const tweet = await Tweet.findOneAndDelete(
        {
            _id: tweetId,
            owner: user._id
        },
        {
            new: true
        }
    )

    if(!tweet){
        throw new ApiError(400, "Only owner can Delete the tweet")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, tweet, "Successfully deleted Tweet"))
})

export{
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}