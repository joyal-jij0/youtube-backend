import mongoose from "mongoose";
import {Like} from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(404, "Invalid Object Id");
    }

    const user = await User.findOne({
        refreshToken: req.cookies.refreshToken
    });

    if (!user) {
        throw new ApiError(404, "Invalid User");
    }

    let like = await Like.findOne({ likedBy: user._id });

    if (!like) {
        like = await Like.create({
            video: videoId,
            likedBy: user._id
        });

        return res
            .status(200)
            .json(new ApiResponse(200, like, "Created new like"));
    }

    if (like.video && like.video.equals(videoId)) {
        like.video = null;
    } else {
        like.video = videoId;
    }

    await like.save();

    return res
        .status(200)
        .json(new ApiResponse(200, like, "Toggle Liked Successfully"));
});

const toggleCommentLike = asyncHandler(async(req, res) => {
    const {commentId} = req.params

    if(!mongoose.isValidObjectId(commentId)){
        throw new ApiError(404, "Invalid object id")
    }

    const user = await User.findOne({
        refreshToken: req.cookies.refreshToken
    })

    if(!user){
        throw new ApiError(404, "Invalid user")
    }

    let like = await Like.findOne({likedBy: user._id})

    if(!like){
        like = await Like.create({
            comment: commentId,
            likedBy: user._id
        })

        return res
                .status(200)
                .json(new ApiResponse(200, like , "created new comment like successfully"))
    }

    if(like.comment && like.comment.equals(commentId)){
        like.comment = null
    }
    
    else{
        like.comment = commentId
    }

    await like.save()

    return res
            .status(200)
            .json(new ApiResponse(200, like, "Toggled Like Successfully"))



})

const toggleTweetLike = asyncHandler(async(req, res) => {
    const {tweetId} = req.params
    
    if(!mongoose.isValidObjectId(tweetId)){
        throw new ApiError(404, "Invalid Object id")
    }

    const user = await User.findOne({
        refreshToken : req.cookies.refreshToken
    })

    if(!user){
        throw new ApiError(404, "Invalid User")
    }

    let like = await Like.findOne({likedBy: user._id})

    if(!like){
        like = await Like.create({
            tweet: tweetId,
            likedBy: user._id
        })

        return res
                .status(200)
                .json(new ApiResponse(200, "Created new tweet like"))
    }

    if(like.tweet && like.tweet.equals(tweetId)){
        like.tweet = null
    }
    else{
        like.tweet = tweetId
    }

    await like.save()

    return res
            .status(200)
            .json(new ApiResponse(200, like, "Toggled tweet like successfully"))
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const user = await User.findOne({
        refreshToken: req.cookies.refreshToken
    })

    if(!user){
        throw new ApiError(404, "Invalid User")
    }

    const likes = await Like.find({likedBy: user._id, video: { $ne: null}}).populate("video");

    const likedVideos = likes.map(like => like.video);

    return res
            .status(200)
            .json(new ApiResponse(200, likedVideos, "Liked videos fetched Successfully"))

})

export {toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos}